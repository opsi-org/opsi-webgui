# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui client methods
"""

import os
import subprocess
from datetime import date, datetime
from typing import Any, Literal

from fastapi import APIRouter, Body, Depends, Request, status

try:
	from opsi.opsi.service.model.object import ProductOnClient
except ImportError:  # pragma: no cover - legacy opsi fallback
	from opsi_legacy.Object import ProductOnClient  # type: ignore

from opsiconfd.application.admininterface import _unblock_client
from opsiconfd.config import config, get_configserver_id
from opsiconfd.messagebus.redis import get_websocket_connected_users
from opsiconfd.redis import ip_address_from_redis_key, redis_client
from opsiconfd.rest import (
	OpsiApiException,
	RESTErrorResponse,
	RESTResponse,
	common_query_parameters,
	order_by,
	pagination,
	rest_api,
)
from packaging import version
from packaging.version import InvalidVersion
from pydantic import BaseModel, Field  # pylint: disable=no-name-in-module
from sqlalchemy import alias, and_, select, text  # type: ignore[import]
from sqlalchemy.exc import IntegrityError  # type: ignore[import]
from sqlalchemy.sql.expression import table  # type: ignore[import]
from starlette.concurrency import run_in_threadpool

from ..logger import get_logger
from ..utils import (
	backend,
	check_client_creation_rights,
	filter_depot_access,
	get_allowed_group_objects,
	get_objects_of_group,
	get_username,
	host_group_access_configured,
	mysql,
	parse_client_list,
	parse_depot_list,
	parse_group_list,
	parse_selected_list,
	read_only_check,
	user_register,
)

api_router = APIRouter()
logger = get_logger()


class ClientList(BaseModel):  # pylint: disable=too-few-public-methods
	clientId: str
	ident: str
	macAddress: str
	description: str
	notes: str
	version_outdated: int
	installationStatus_unknown: int
	installationStatus_installed: int
	actionRequest_set: int
	actionResult_failed: int
	actionResult_successful: int


class Client(BaseModel):  # pylint: disable=too-few-public-methods
	hostId: str
	type: Literal["OpsiClient"] | None = "OpsiClient"
	opsiHostKey: str | None = None
	description: str | None = None
	notes: str | None = None
	hardwareAddress: str | None = None
	ipAddress: str | None = None
	inventoryNumber: str | None = ""
	systemUUID: str | None = ""
	oneTimePassword: str | None = None
	created: datetime | None = None
	lastSeen: datetime | None = None


@api_router.get("/api/opsidata/clients", response_model=list[ClientList])
@rest_api
@filter_depot_access
async def clients(  # pylint: disable=too-many-branches, dangerous-default-value, invalid-name, unused-argument, too-many-locals
	request: Request,
	commons: dict = Depends(common_query_parameters),
	selectedDepots: list[str] = Depends(parse_depot_list),
	selected: list[str] | None = Depends(parse_selected_list),
	filteredGroups: list[str] | None = Depends(parse_group_list),
) -> RESTResponse:
	"""
	Get Clients on selected depots with infos on the client.
	"""
	if selectedDepots == []:
		return RESTResponse(data=[], total=0)

	allowed_clients = None
	username = get_username()
	configured = host_group_access_configured(username)

	if user_register() and configured:
		allowed_clients = get_allowed_group_objects(username, "HostGroup")

		if not allowed_clients:
			logger.warning("No clients found for user '%s'.", username)
			return RESTResponse(data=[], total=0)

	with mysql.session() as session:
		where = and_(text("h.type = 'OpsiClient'"))
		params: dict[str, list[Any] | str] = {
			"depot_ids": [],
			"search": [],
			"configserver_id": get_configserver_id(),
		}

		if filteredGroups:
			where = and_(where, text("(h.hostId IN :filtered_groups)"))
			params["filtered_groups"] = get_objects_of_group(filteredGroups, "HostGroup")
		if commons.get("filterQuery"):
			where = and_(where, text("(h.hostId LIKE :search OR h.description LIKE :search)"))
			params["search"] = f"%{commons.get('filterQuery')}%"
		if selectedDepots:
			normalized_depots: list[str] = []
			for depot in selectedDepots:
				dep = str(depot).strip().strip('"').strip("'")
				if dep and dep not in normalized_depots:
					normalized_depots.append(dep)

			if len(normalized_depots) == 1 and normalized_depots[0].startswith("[") and normalized_depots[0].endswith("]"):
				raw = normalized_depots[0][1:-1]
				normalized_depots = []
				for item in raw.split(","):
					dep = item.strip().strip('"').strip("'")
					if dep and dep not in normalized_depots:
						normalized_depots.append(dep)

			depot_filters = []
			for idx, depot in enumerate(normalized_depots):
				key = f"depot_id_{idx}"
				params[key] = depot
				depot_filters.append(
					f"""
					COALESCE(
						(
							SELECT TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`))
							FROM CONFIG_STATE AS cs
							WHERE cs.objectId = h.hostId AND cs.configId = 'clientconfig.depot.id'
						),
						:configserver_id
					) = :{key}
					"""
				)

			if depot_filters:
				where = and_(where, text("(" + " OR ".join(depot_filters) + ")"))
		if allowed_clients:
			params["allowed_clients"] = allowed_clients
			where = and_(where, text("(h.hostId in :allowed_clients)"))
		if selected:
			params["selected"] = selected
		else:
			params["selected"] = [""]

		sort_by = commons.get("sortBy") or []
		sort_by_reachable = "reachable" in sort_by
		connected_clients: list[str] | None = None
		if backend._host_control_use_messagebus:
			try:
				# Fast redis-only lookup of messagebus connected clients (no per-host TCP
				# probing). This is the reachability snapshot for the whole page; afterwards
				# the client only follows host_connected/host_disconnected messagebus events.
				connected_clients = await get_websocket_connected_users(user_type="client")
			except Exception as err:  # pylint: disable=broad-except
				logger.warning("Failed to resolve messagebus connected clients: %s", err)
				connected_clients = []

		if connected_clients is None:
			is_reachable_sql = "NULL AS reachable"
		elif not connected_clients:
			is_reachable_sql = "FALSE AS reachable"
		else:
			params["connected_clients"] = connected_clients
			is_reachable_sql = "IF(h.hostId IN :connected_clients, TRUE, FALSE) AS reachable"

		base_select = (
			select(  # type: ignore
				text(  # type: ignore
					f"""
				h.hostId AS clientId,
				h.hostId AS ident,
				h.hardwareAddress AS macAddress,
				h.systemUUID AS systemUUID,
				h.ipAddress AS  ipAddress,
				h.description AS description,
				h.notes AS notes,
				h.lastSeen AS lastSeen,
				COALESCE(
					(
						SELECT TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`)) FROM CONFIG_STATE AS cs
						WHERE cs.objectId = h.hostId AND cs.configId = 'clientconfig.depot.id'
					),
                    :configserver_id
				) AS depotId,
				IF(
					(COALESCE(
						(SELECT cs.values FROM CONFIG_STATE as cs WHERE cs.objectId = h.hostId AND cs.configId = 'clientconfig.dhcpd.filename'),
						(SELECT cv.value FROM CONFIG_VALUE AS cv WHERE cv.configId = 'clientconfig.dhcpd.filename' AND cv.isDefault))
					) LIKE '%efi%',
					TRUE,
					FALSE
				) AS uefi,
				COALESCE(
					(SELECT cs.values FROM CONFIG_STATE AS cs WHERE cs.objectId = h.hostId AND cs.configId = "clientconfig.dhcpd.filename"),
					(SELECT cv.value FROM CONFIG_VALUE AS cv WHERE cv.configId = 'clientconfig.dhcpd.filename' AND cv.isDefault)
				) AS uefi_value,
				{is_reachable_sql},
				IF(h.hostId IN :selected, TRUE, FALSE) AS selected
			"""
				)
			)
			.select_from(table("HOST").alias("h"))
			.where(where)
		)

		client_columns = """
			hd.clientId,
			hd.ident,
			hd.macAddress,
			hd.ipAddress,
			hd.description,
			hd.notes,
			DATE_FORMAT(hd.lastSeen, '%Y-%m-%dT%TZ') AS lastSeen,
			hd.uefi,
			hd.uefi_value,
			hd.reachable,
			(
				SELECT
					COUNT(*)
				FROM
					PRODUCT_ON_DEPOT AS pod
				JOIN
					PRODUCT_ON_CLIENT AS poc ON
						pod.productId = poc.productId AND
						CONCAT(poc.productVersion, '-', poc.packageVersion) != CONCAT(pod.productVersion, '-', pod.packageVersion)
				WHERE
					poc.clientId = hd.clientId AND
					pod.depotId = hd.depotId AND
					pod.productType = 'LocalbootProduct' AND
					NOT poc.installationStatus = 'not_installed'
			) AS version_outdated,
			(
				SELECT
					COUNT(*)
				FROM
					PRODUCT_ON_DEPOT AS pod
				JOIN
					PRODUCT_ON_CLIENT AS poc ON
						pod.productId = poc.productId AND
						CONCAT(poc.productVersion, '-', poc.packageVersion) != CONCAT(pod.productVersion, '-', pod.packageVersion)
				WHERE
					poc.clientId = hd.clientId AND
					pod.depotId = hd.depotId AND
					pod.productType = 'NetbootProduct' AND
					NOT poc.installationStatus = 'not_installed'
			) AS version_outdated_netboot,
			(
				SELECT COUNT(*) FROM PRODUCT_ON_CLIENT AS poc
				WHERE poc.clientId = hd.clientId AND poc.installationStatus = 'unknown'
			) AS installationStatus_unknown,
			(
				SELECT COUNT(*) FROM PRODUCT_ON_CLIENT AS poc
				WHERE poc.clientId = hd.clientId AND poc.installationStatus = 'installed'
			) AS installationStatus_installed,
            (
                SELECT COUNT(*) FROM PRODUCT_ON_CLIENT AS poc
                WHERE poc.clientId = hd.clientId AND IFNULL(poc.actionRequest, 'none') <> 'none'
            ) AS actionRequest_set,
			(
				SELECT COUNT(*) FROM PRODUCT_ON_CLIENT AS poc
				WHERE poc.clientId = hd.clientId AND poc.actionResult = 'failed'
			) AS actionResult_failed,
			(
				SELECT COUNT(*) FROM PRODUCT_ON_CLIENT AS poc
				WHERE poc.clientId = hd.clientId AND poc.actionResult = 'successful'
			) AS actionResult_successful,
			hd.selected
		"""

		def apply_ordering(query: Any) -> Any:
			# Sort selected items first when a selection is active
			if selected and selected != [""]:
				query = query.order_by(text("selected DESC"))
			# "reachable" is a boolean column (FALSE=0/TRUE=1): a plain ASC/DESC order_by would
			# list unreachable clients first when ascending. Invert direction so the first
			# click on the column groups the connected clients at the top.
			if sort_by_reachable:
				reachable_direction = "ASC" if commons.get("sortDesc") else "DESC"
				query = query.order_by(text(f"reachable {reachable_direction}"))
			remaining_sort_by = [col for col in sort_by if col != "reachable"]
			if remaining_sort_by:
				query = order_by(query, {**commons, "sortBy": remaining_sort_by})
			# Rows with equal sort values must keep a stable order across pages,
			# otherwise infinite scroll drops and duplicates rows.
			if not remaining_sort_by or not {"clientId", "ident"} & set(remaining_sort_by):
				query = query.order_by(text("clientId ASC"))
			return query

		# Ordering and pagination are pushed into the inner query whenever possible so
		# that the expensive per-row count subqueries only run for the returned page.
		sortable_base_columns = {"clientId", "ident", "macAddress", "ipAddress", "description", "notes", "lastSeen", "uefi", "reachable"}
		if all(col in sortable_base_columns for col in sort_by):
			paged_clients = alias(pagination(apply_ordering(base_select), commons).subquery(), name="hd")
			query = apply_ordering(select(text(client_columns)).select_from(paged_clients))  # type: ignore
		else:
			client_with_depot = alias(base_select.subquery(), name="hd")
			client_select = select(text(client_columns)).select_from(client_with_depot)  # type: ignore
			query = pagination(apply_ordering(client_select), commons)
		result = session.execute(query, params)
		result = result.fetchall()

		total = session.execute(
			select(text("COUNT(*)")).select_from(table("HOST").alias("h")).where(where),  # type: ignore
			params,
		).fetchone()[0]  # type: ignore
		data = []
		for row in result:
			if row is not None:
				client: dict[str, Any] = dict(row)
				client["uefi"] = bool(client["uefi"])
				client["reachable"] = bool(client["reachable"]) if client["reachable"] is not None else None
				client["selected"] = bool(client["selected"]) if client["selected"] is not None else None
				data.append(client)
		return RESTResponse(data=data, total=total)


def _depots_of_clients(clients: list[str] | None) -> dict:
	# TODO check if clients of config server always work
	response: dict[str, str] = {}
	with mysql.session() as session:
		where = text("h.type = 'OpsiClient'")
		params = {}
		if clients not in (None, [], [""]):
			where = text("h.type = 'OpsiClient' AND h.hostId IN :clients")
			params["clients"] = clients

		query = select(text("h.hostId")).select_from(table("HOST").alias("h")).where(where)  # type: ignore
		clients = [dict(row)["hostId"] for row in session.execute(query, params).fetchall()]

		if not clients:
			return response

		configserver_id = get_configserver_id()
		response = {c: configserver_id for c in clients}

		where = text("cs.configId='clientconfig.depot.id' AND cs.objectId IN :clients")
		query = select(text("cs.objectId AS client, cs.values")).select_from(table("CONFIG_STATE").alias("cs")).where(where)  # type: ignore
		result = session.execute(query, {"clients": clients}).fetchall()

		for row in result:
			row_dict = dict(row)
			val = (row_dict["values"] or "").strip('[]"')
			if val and row_dict["client"] in response:
				response[row_dict["client"]] = val

		return response


def _clients_of_depots(depots: list[str] | None) -> list[str]:
	if not depots:
		return []

	normalized_depots: list[str] = []
	for depot in depots:
		dep = str(depot).strip().strip('"').strip("'")
		if dep and dep not in normalized_depots:
			normalized_depots.append(dep)

	if not normalized_depots:
		return []

	with mysql.session() as session:
		params: dict[str, list[Any] | str] = {
			"configserver_id": get_configserver_id(),
		}
		depot_filters = []
		for idx, depot in enumerate(normalized_depots):
			key = f"depot_id_{idx}"
			params[key] = depot
			depot_filters.append(
				f"""
                COALESCE(
                    (
                        SELECT TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`))
                        FROM CONFIG_STATE AS cs
                        WHERE cs.objectId = h.hostId AND cs.configId = 'clientconfig.depot.id'
                    ),
                    :configserver_id
                ) = :{key}
                """
			)

		where = text("h.type = 'OpsiClient'" + (f" AND ({' OR '.join(depot_filters)})" if depot_filters else ""))
		query = select(text("h.hostId")).select_from(table("HOST").alias("h")).where(where)
		result = session.execute(query, params).fetchall()
		return [dict(row)["hostId"] for row in result if row is not None]


@api_router.get("/api/opsidata/clientsdepots", response_model=dict[str, str])
@rest_api
def depots_of_clients(  # pylint: disable=too-many-branches, redefined-builtin, dangerous-default-value, invalid-name
	selectedClients: list[str] = Depends(parse_client_list),
) -> RESTResponse:
	"""
	Get a mapping of clients to depots.
	"""

	return RESTResponse(data=_depots_of_clients(selectedClients))


@api_router.post("/api/opsidata/clients")
@rest_api
@read_only_check
@check_client_creation_rights
def create_client(request: Request, client: Client, depot: str = Body(default="")) -> RESTResponse:  # pylint: disable=too-many-locals
	"""
	Create OPSI-Client.
	"""

	try:
		client_ids = backend.host_getIdents()
		if client.hostId in client_ids:
			logger.error("Could not create client object.")
			raise OpsiApiException(
				message=f"Could not create client object. Client '{client.hostId}' already exists",
				http_status=status.HTTP_409_CONFLICT,
			)
		backend.host_createOpsiClient(
			client.hostId,
			client.opsiHostKey,
			client.description,
			client.notes,
			client.hardwareAddress,
			client.ipAddress,
			client.inventoryNumber,
			client.oneTimePassword,
			datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
			datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
			client.systemUUID,
		)
		headers = {"Location": f"{request.url}/{client.hostId}"}

		if depot:
			backend.configState_create(configId="clientconfig.depot.id", objectId=client.hostId, values=[depot])

		return RESTResponse(
			data=client.model_dump(mode="json"),
			http_status=status.HTTP_201_CREATED,
			headers=headers,
		)

	except IntegrityError as err:
		logger.error("Could not create client object.")
		logger.error(err)
		return RESTErrorResponse(
			message=f"Could not create client object. Client '{client.hostId}' already exists",
			http_status=status.HTTP_409_CONFLICT,
			details=err,
		)

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not create client object.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not create client object.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@api_router.put("/api/opsidata/clients/{client_id}")
@rest_api
@read_only_check
def update_client(request: Request, client_id: str, client: Client) -> RESTResponse:  # pylint: disable=too-many-locals
	"""
	Update OPSI-Client.
	"""

	try:
		if client_id != client.hostId:
			logger.notice("Renaming Client %s to %s.", client_id, client.hostId)
			backend.host_renameOpsiClient(client_id, client.hostId)
		backend.host_createOpsiClient(
			client.hostId,
			client.opsiHostKey,
			client.description,
			client.notes,
			client.hardwareAddress,
			client.ipAddress,
			client.inventoryNumber,
			client.oneTimePassword,
			datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
			datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
			client.systemUUID,
		)
		headers = {"Location": f"{request.url}/{client.hostId}"}

		return RESTResponse(data=client.__dict__, http_status=status.HTTP_201_CREATED, headers=headers)

	except IntegrityError as err:
		logger.error("Could not update client object.")
		logger.error(err)
		return RESTErrorResponse(
			message=f"Could not update client '{client.hostId}' object.",
			http_status=status.HTTP_409_CONFLICT,
			details=err,
		)

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not update client object.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not update client object.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@api_router.get("/api/opsidata/clients/{clientid}", response_model=Client)
@rest_api
def get_client(clientid: str) -> RESTResponse:  # pylint: disable=too-many-branches, dangerous-default-value, invalid-name
	"""
	Get Clients on selected depots with infos on the client.
	"""

	with mysql.session() as session:
		try:
			query = (
				select(
					text(  # type: ignore
						"""
				h.hostId AS hostId,
				h.type AS type,
				h.description AS description,
				h.notes AS notes,
				h.hardwareAddress AS hardwareAddress,
				h.ipAddress AS ipAddress,
				h.inventoryNumber AS inventoryNumber,
				h.systemUUID AS systemUUID,
				h.created AS created,
				h.lastSeen AS lastSeen,
				h.opsiHostKey AS opsiHostKey,
				h.oneTimePassword AS oneTimePassword,
				IF(
					(COALESCE(
						(SELECT cs.values FROM CONFIG_STATE as cs WHERE cs.objectId = h.hostId AND cs.configId = 'clientconfig.dhcpd.filename'),
						(SELECT cv.value FROM CONFIG_VALUE AS cv WHERE cv.configId = 'clientconfig.dhcpd.filename' AND cv.isDefault))
					) LIKE '%efi%',
					TRUE,
					FALSE
				) AS uefi
			"""
					)
				)
				.select_from(table("HOST").alias("h"))
				.where(text("h.hostId = :clientid and h.type = 'OpsiClient'"))
			)  # pylint: disable=redefined-outer-name

			result = session.execute(query, {"clientid": clientid})
			result = result.fetchone()
			if result:
				data = dict(result)
				for key in data:
					if isinstance(data.get(key), (date, datetime)):
						data[key] = data.get(key, "").strftime("%Y-%m-%d %H:%M:%S")
				data["uefi"] = bool(data["uefi"])
				return RESTResponse(data=data)
			logger.error("Client with id '%s' not found.", clientid)
			return RESTErrorResponse(
				message=f"Client with id '{clientid}' not found.",
				http_status=status.HTTP_404_NOT_FOUND,
			)

		except Exception as err:  # pylint: disable=broad-except
			if isinstance(err, OpsiApiException):
				raise err
			logger.error("Could not get client object.")
			logger.error(err)
			raise OpsiApiException(
				message="Could not get client object.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err


@api_router.delete("/api/opsidata/clients/{clientid}")
@rest_api
@read_only_check
def delete_client(request: Request, clientid: str) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Delete Client with ID.
	"""
	try:
		servers = backend.host_getIdents(type="*server")
		if clientid in servers:
			raise OpsiApiException(
				message="Can not delete server object.",
				http_status=status.HTTP_403_FORBIDDEN,
			)
		backend.host_delete(clientid)

		return RESTResponse()

	except Exception as err:  # pylint: disable=broad-except
		if isinstance(err, OpsiApiException):
			raise err
		logger.error("Could not delete client object.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not delete client object.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@api_router.post("/api/opsidata/clients/{clientid}/uefi")
def set_uefi(request: Request, clientid: str, uefi: bool = Body(default=True)) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Set uefi config of client
	"""

	if uefi:
		config_value = ["linux/pxelinux.cfg/shimx64.efi.signed"]
	else:
		config_value = [""]

	backend.configState_create("clientconfig.dhcpd.filename", clientid, config_value)

	return RESTResponse(
		http_status=200,
		data={
			"configId": "clientconfig.dhcpd.filename",
			"objectId": clientid,
			"values": config_value,
		},
	)


class ProcessActionRPC(BaseModel):  # pylint: disable=too-few-public-methods
	client_ids: list[str]
	product_ids: list[str] | None = None
	visibility: Literal["", "visible", "hidden"] | None = ""


@api_router.post("/api/command/process_action", response_model=dict[str, dict[str, Any]])
@rest_api
async def host_control_process_action(request: Request, data: ProcessActionRPC) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Run process action on clients
	"""
	try:
		result = await backend.hostControl_processActionRequests(
			hostIds=data.client_ids,
			productIds=data.product_ids or [],
			visibility=data.visibility or "",
		)
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Failed to execute process actions: %s", err)
		raise OpsiApiException(
			message="Failed to execute process actions.",
			http_status=status.HTTP_400_BAD_REQUEST,
			error=err,
		) from err
	return RESTResponse(http_status=status.HTTP_200_OK, data=result)


class OpsiclientdRPC(BaseModel):  # pylint: disable=too-few-public-methods
	client_ids: list[str]
	method: str
	params: list[Any] | None = None


@api_router.post("/api/command/opsiclientd_rpc", response_model=dict[str, dict[str, Any]])
@rest_api
async def opsiclientd_rpc(request: Request, data: OpsiclientdRPC) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Run RPC on opsiclientd
	"""
	try:
		result = await backend.hostControl_opsiclientdRpc(method=data.method, params=data.params or [], hostIds=data.client_ids)  # pylint: disable=no-member
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Failed to execute opsiclientd rpc: %s", err)
		raise OpsiApiException(
			message="Failed to execute opsiclientd rpc.",
			http_status=status.HTTP_400_BAD_REQUEST,
			error=err,
		) from err
	return RESTResponse(http_status=status.HTTP_200_OK, data=result)


class ClientDeployData(BaseModel):  # pylint: disable=too-few-public-methods
	clients: list[str]
	username: str
	password: str
	type: str = Field("windows", pattern="^(windows)$|^(linux)$|^(macos)$")


@api_router.post("/api/opsidata/clients/deploy")
@rest_api
async def deploy_client_agent(clientDeployData: ClientDeployData) -> RESTResponse:  # pylint: disable=invalid-name
	logger.debug(clientDeployData)

	deploy_script = "/var/lib/opsi/depot/opsi-client-agent/opsi-deploy-client-agent"
	if clientDeployData.type == "linux":
		deploy_script = "/var/lib/opsi/depot/opsi-linux-client-agent/opsi-deploy-client-agent"
	if clientDeployData.type == "macos":
		deploy_script = "/var/lib/opsi/depot/opsi-mac-client-agent/opsi-deploy-client-agent"

	logger.debug(clientDeployData.clients)

	if os.path.isfile(deploy_script):
		logger.notice("Running opsi-deploy-client-agent script...")
		result = await run_in_threadpool(  # type: ignore[call-arg]
			subprocess.run,
			[
				deploy_script,
				"--username",
				clientDeployData.username,
				"--password",
				clientDeployData.password,
				*clientDeployData.clients,
			],
			capture_output=True,
		)

		logger.notice(result.returncode)
		logger.notice(result)
		if result.returncode == 1:
			return RESTErrorResponse(
				http_status=status.HTTP_400_BAD_REQUEST,
				message=f"{result.returncode}{result.stderr} - {result.stdout}",
			)
		return RESTResponse(http_status=status.HTTP_200_OK, data=result.stdout)

	logger.warning("It looks like the client agent (%s) is not installed.", clientDeployData.type)
	logger.warning("Could not find opsi-deploy-client-agent script.")
	return RESTErrorResponse(
		http_status=status.HTTP_400_BAD_REQUEST,
		message=f"""
			It looks like the client agent ({clientDeployData.type}) is not installed.\n
			Could not find opsi-deploy-client-agent script.
		""",
	)


def set_depot(client: str, depot: str) -> None:
	"""
	Set depot of client.
	"""
	backend.configState_create("clientconfig.depot.id", client, f'["{depot}"]')


@api_router.post("/api/opsidata/clients/{clientid}/groups")
@rest_api
@read_only_check
def add_client_to_groups(
	request: Request,
	clientid: str,
	groups: list[str] = Body(default=None),  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Add client to a list of groups.
	"""
	if not groups:
		logger.error("No groups given.")
		return RESTErrorResponse(http_status=status.HTTP_400_BAD_REQUEST, message="No groups given.")

	try:
		for group in groups:
			backend.objectToGroup_create("HostGroup", group, clientid)
		return RESTResponse(
			http_status=200,
			data=f"Client '{clientid}' is now a member of: {', '.join(groups)}.",
		)

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not add client %s to groups: %s.", clientid, groups)
		logger.error(err)
		raise OpsiApiException(
			message=f"Could not add client '{clientid}' to groups {groups}.\nLast group was: {group}.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@api_router.delete("/api/opsidata/clients/{clientid}/groups")
@rest_api
@read_only_check
def rm_client_from_groups(
	request: Request,
	clientid: str,
	groups: list[str] = Body(default=None),  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Remove client from a list of groups.
	"""

	if not groups:
		logger.error("No group given.")
		return RESTErrorResponse(http_status=status.HTTP_400_BAD_REQUEST, message="No group given.")

	try:
		for group in groups:
			backend.objectToGroup_delete(groupType="HostGroup", groupId=group, objectId=clientid)
		return RESTResponse(
			http_status=200,
			data=f"Client '{clientid}' was removed from: {', '.join(groups)}.",
		)
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not remove client %s from groups: %s.", clientid, groups)
		logger.error(err)
		raise OpsiApiException(
			message=f"Could not remove client '{clientid}' from groups {groups}.\nLast group was: {group}.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@api_router.post("/api/opsidata/clients/{client}/unblock")
@rest_api
@read_only_check
def unblock_client(request: Request, client: str) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Unblock client with id <client>.
	"""

	try:
		_unblock_client(client)
		return RESTResponse(http_status=200, data=f"Client '{client}' was unblocked.")
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could unblock client %s", client)
		logger.error(err)
		raise OpsiApiException(
			message=f"Could not unblock client '{client}'.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@api_router.get("/api/opsidata/blocked-clients")
@rest_api
def blocked_clients(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	blocked clients
	"""

	with redis_client() as redis:
		redis_keys = redis.scan_iter(f"{config.redis_key('stats')}:client:blocked:*")

		blocked_client_list = []
		for key in redis_keys:
			blocked_client_list.append(ip_address_from_redis_key(key.decode("utf8").split(":")[-1]))
	return RESTResponse(data=blocked_client_list, total=len(blocked_client_list))


@api_router.post("/api/opsidata/clients/unblock")
@rest_api
@read_only_check
def unblock_all_clients(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Unblock client with id <client>.
	"""

	try:
		with redis_client() as redis:
			client_set = set()
			deleted_keys = set()
			with redis.pipeline(transaction=False) as pipe:
				for base_key in (
					f"{config.redis_key('stats')}:client:failed_auth",
					f"{config.redis_key('stats')}:client:blocked",
				):
					for key in redis.scan_iter(f"{base_key}:*"):
						key_str = key.decode("utf8")
						deleted_keys.add(key_str)
						client = ip_address_from_redis_key(key_str.split(":")[-1])
						client_set.add(client)
						logger.debug("redis key to delete: %s", key_str)
						pipe.delete(key)  # type: ignore[attr-defined]
				pipe.execute()  # type: ignore[attr-defined]
			return RESTResponse({"clients": list(client_set), "redis-keys": list(deleted_keys)})
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could unblock clients.")
		logger.error(err)
		raise OpsiApiException(
			message="Could unblock clients.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


class ProductAction(BaseModel):  # pylint: disable=too-few-public-methods
	action: str
	outdated: bool = False
	demoMode: bool = False
	installation_status: str | None
	action_result: str | None
	selectedClients: list | None
	selectedDepots: list | None


@api_router.post("/api/opsidata/clients/action")
@rest_api
@read_only_check
def set_product_action(  # pylint: disable=unused-argument, too-many-branches
	request: Request, product_action: ProductAction
) -> RESTResponse:
	"""
	Set product action where condition
	"""

	try:  # pylint: disable=too-many-nested-blocks
		updates: dict = {}
		poc_list = set()
		hosts: list[str] = []

		if product_action.selectedClients:
			hosts.extend(product_action.selectedClients)

		if product_action.selectedDepots:
			hosts.extend(_clients_of_depots(product_action.selectedDepots))

		# Keep order stable while removing duplicates.
		hosts = list(dict.fromkeys(hosts))

		if not hosts:
			return RESTResponse(http_status=200, data={})

		if product_action.installation_status or product_action.action_result:
			poc_list = set(
				backend.productOnClient_getObjects(
					installationStatus=product_action.installation_status,
					actionResult=product_action.action_result,
					clientId=hosts,
				)
			)

		clients_to_depots = _depots_of_clients(hosts)
		depots = list(clients_to_depots.values())
		result: set[Any] = set()
		if product_action.outdated:
			depot_versions: dict = {}
			for pod in backend.productOnDepot_getObjects(depotId=depots):
				if not depot_versions.get(pod.depotId):
					depot_versions[pod.depotId] = {}
				depot_versions[pod.depotId][pod.productId] = f"{pod.productVersion}-{pod.packageVersion}"
			result = set(backend.productOnClient_getObjects(installationStatus="installed", clientId=hosts))
			for poc in result.difference(poc_list):
				depot = clients_to_depots.get(poc.clientId)
				if not depot:
					continue
				if poc.installationStatus != "installed" or not depot_versions.get(depot, {}).get(poc.productId):
					continue
				try:
					if version.parse(f"{poc.productVersion}-{poc.packageVersion}") < version.parse(depot_versions[depot][poc.productId]):
						logger.info(
							"Product %s is outeded on client %s (depot is %s)",
							poc.productId,
							poc.clientId,
							depot,
						)
						if poc not in poc_list:
							poc_list.add(poc)
				except InvalidVersion:
					continue
		else:
			result = set(backend.productOnClient_getObjects(clientId=hosts))
			if not product_action.installation_status and not product_action.action_result:
				poc_list = result
		for poc in poc_list:
			poc.actionRequest = product_action.action
			if poc.clientId not in updates:
				updates[poc.clientId] = []
			updates[poc.clientId].append(
				{
					"productId": poc.productId,
					"clientId": poc.clientId,
					"productType": poc.productType,
					"productVersion": poc.productVersion,
					"packageVersion": poc.packageVersion,
					"actionRequest": poc.actionRequest,
				}
			)

		if product_action.installation_status == "not_installed":
			for host in hosts:
				depot = clients_to_depots.get(host)
				if not depot:
					continue
				for prod in result.union(set(backend.productOnDepot_getObjects(depotId=depot))):
					if host not in updates:
						updates[host] = []
					poc_list.add(
						ProductOnClient(
							productId=prod.productId,
							productType=prod.productType,
							clientId=host,
							productVersion=prod.productVersion,
							packageVersion=prod.packageVersion,
							actionRequest=product_action.action,
						)
					)
					updates[host].append(
						{
							"productId": prod.productId,
							"productType": prod.productType,
							"clientId": host,
							"productVersion": prod.productVersion,
							"packageVersion": prod.packageVersion,
							"actionRequest": product_action.action,
						}
					)

		if not product_action.demoMode:
			result = backend.productOnClient_updateObjects(poc_list)

		return RESTResponse(http_status=200, data=updates)
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not set product action.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not set product action.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


class Target(BaseModel):  # pylint: disable=too-few-public-methods
	hostId: str
	ipAddress: str | None = None
	hardwareAddress: str | None = None
	systemUUID: str | None = None


class CloneOptions(BaseModel):  # pylint: disable=too-few-public-methods
	configs: bool = False
	products: bool = False
	productPropeties: bool = False


@api_router.post("/api/opsidata/clients/{client_id}/clone")
@rest_api
@read_only_check
@check_client_creation_rights
def clone_client(request: Request, client_id: str, target: Target, options: CloneOptions) -> RESTResponse:  # pylint: disable=too-many-locals
	"""
	Clone OPSI-Client.
	"""

	try:
		clients = backend.host_getObjects(id=client_id, type="OpsiClient")
		if not clients:
			logger.error("Could not clone client object.")
			raise OpsiApiException(
				message=f"Could not clone client object. Client '{client_id}' does not exist.",
				http_status=status.HTTP_404_NOT_FOUND,
			)

		if backend.host_getIdents(id=target.hostId, type="OpsiClient"):
			raise OpsiApiException(
				message=f"Could not clone client object. Client '{target.hostId}' already exists.",
				http_status=status.HTTP_409_CONFLICT,
			)

		client = clients[0]
		client.id = target.hostId
		client.ipAddress = target.ipAddress
		client.hardwareAddress = target.hardwareAddress
		client.systemUUID = target.systemUUID
		client.opsiHostKey = None

		backend.host_createObjects(client)

		if options.products:
			poc_list = backend.productOnClient_getObjects(clientId=client_id)
			for poc in poc_list:
				poc.clientId = target.hostId

			backend.productOnClient_createObjects(poc_list)

		if options.configs:
			configs = backend.configState_getObjects(objectId=client_id)
			for conf in configs:
				conf.objectId = target.hostId
			backend.configState_createObjects(configs)

		if options.productPropeties:
			pps_list = backend.productPropertyState_getObjects(objectId=client_id)
			for pps in pps_list:
				pps.objectId = target.hostId
			backend.productPropertyState_createObjects(pps_list)

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not clone client object.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not clone client object.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err
