# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui client methods
"""

from opsiconfd.redis import ip_address_from_redis_key, redis_client
from packaging import version
import os
import subprocess
from datetime import date, datetime
from ipaddress import IPv4Address, IPv6Address
from typing import Any, Dict, List, Literal, Optional, Union
from packaging.version import InvalidVersion
from fastapi import APIRouter, Body, Depends, Request, status
from pydantic import BaseModel, Field  # pylint: disable=no-name-in-module
from sqlalchemy import alias, and_, column, delete, select, text, update  # type: ignore[import]
from sqlalchemy.dialects.mysql import insert  # type: ignore[import]
from sqlalchemy.exc import IntegrityError  # type: ignore[import]
from sqlalchemy.sql.expression import table  # type: ignore[import]
from starlette.concurrency import run_in_threadpool
from opsicommon.objects import ProductOnClient
from opsicommon.exceptions import BackendBadValueError
from opsiconfd.config import get_configserver_id, config
from opsiconfd.logging import logger
from opsiconfd.application.admininterface import _unblock_client, _unblock_all_clients
from opsiconfd.rest import (
	OpsiApiException,
	RESTErrorResponse,
	RESTResponse,
	common_query_parameters,
	order_by,
	pagination,
	rest_api,
)

from .utils import (
	backend,
	check_client_creation_rights,
	filter_depot_access,
	get_allowed_clients,
	get_username,
	host_group_access_configured,
	mysql,
	parse_client_list,
	parse_depot_list,
	parse_selected_list,
	read_only_check,
	user_register,
)

client_router = APIRouter()


class ClientList(BaseModel):  # pylint: disable=too-few-public-methods
	clientId: str
	ident: str
	macAddress: str
	description: str
	notes: str
	version_outdated: int
	installationStatus_unknown: int
	installationStatus_installed: int
	actionResult_failed: int
	actionResult_successful: int


class Client(BaseModel):  # pylint: disable=too-few-public-methods
	hostId: str
	type: Literal["OpsiClient"] = "OpsiClient"
	opsiHostKey: Optional[str]
	description: Optional[str]
	notes: Optional[str]
	hardwareAddress: Optional[str]
	ipAddress: Optional[Union[IPv4Address, IPv6Address]]
	inventoryNumber: Optional[str] = ""
	systemUUID: Optional[str] = ""
	oneTimePassword: Optional[str]
	created: Optional[datetime]
	lastSeen: Optional[datetime]


@client_router.get("/api/opsidata/clients", response_model=List[ClientList])
@rest_api
@filter_depot_access
async def clients(  # pylint: disable=too-many-branches, dangerous-default-value, invalid-name, unused-argument, too-many-locals
	request: Request,
	commons: dict = Depends(common_query_parameters),
	selectedDepots: List[str] = Depends(parse_depot_list),
	selected: Optional[List[str]] = Depends(parse_selected_list),
) -> RESTResponse:
	"""
	Get Clients on selected depots with infos on the client.
	"""
	if selectedDepots == []:
		return RESTResponse(data=[], total=0)

	username = get_username()
	allowed_clients = None
	if user_register() and host_group_access_configured(username):
		allowed_clients = get_allowed_clients(username)
	with mysql.session() as session:
		where = and_(text("h.type = 'OpsiClient'"))
		params: Dict[str, Union[List[Any], str]] = {"depot_ids": [], "search": []}
		if commons.get("filterQuery"):
			where = and_(where, text("(h.hostId LIKE :search OR h.description LIKE :search)"))
			params["search"] = f"%{commons.get('filterQuery')}%"
		if selectedDepots:
			where = and_(
				where,
				text(
					"""
				COALESCE(
					(
						SELECT TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`)) FROM CONFIG_STATE AS cs
						WHERE cs.objectId = h.hostId AND cs.configId = 'clientconfig.depot.id'
					),
					(SELECT cv.value FROM CONFIG_VALUE AS cv WHERE cv.configId = 'clientconfig.depot.id' AND cv.isDefault = 1 LIMIT 1)
				) IN :depot_ids
				"""
				),
			)
			params["depot_ids"] = selectedDepots
		if allowed_clients:
			params["allowed_clients"] = allowed_clients
			where = and_(where, text("(h.hostId in :allowed_clients)"))
		if selected:
			params["selected"] = selected
		else:
			params["selected"] = [""]

		client_with_depot = alias(
			select(  # type: ignore
				text(  # type: ignore
					"""
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
					(SELECT cv.value FROM CONFIG_VALUE AS cv WHERE cv.configId = 'clientconfig.depot.id' AND cv.isDefault = 1 LIMIT 1)
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
				) AS uefi_value
			"""
				)
			)
			.select_from(table("HOST").alias("h"))
			.where(where)
			.subquery(),
			name="hd",
		)
		client_select = select(
			text(  # type: ignore
				"""
			hd.clientId,
			hd.ident,
			hd.macAddress,
			hd.ipAddress,
			hd.description,
			hd.notes,
			DATE_FORMAT(hd.lastSeen, '%Y-%m-%dT%TZ') AS lastSeen,
			hd.uefi,
			hd.uefi_value,
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
					pod.depotId = hd.depotId
			) AS version_outdated,
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
				WHERE poc.clientId = hd.clientId AND poc.actionResult = 'failed'
			) AS actionResult_failed,
			(
				SELECT COUNT(*) FROM PRODUCT_ON_CLIENT AS poc
				WHERE poc.clientId = hd.clientId AND poc.actionResult = 'successful'
			) AS actionResult_successful,
			IF(
				hd.clientId IN :selected,
				TRUE,
				FALSE
			) AS selected
		"""
			)
		).select_from(client_with_depot)

		query = order_by(client_select, commons)  # type: ignore
		query = pagination(query, commons)

		result = session.execute(query, params)
		result = result.fetchall()

		total = session.execute(select(text("COUNT(*)")).select_from(client_with_depot), params).fetchone()[0]  # type: ignore
		if backend._host_control_use_messagebus is True:
			reachable_clients = await backend.hostControl_reachable([], 20)  # pylint: disable=protected-access
		data = []
		for row in result:
			if row is not None:
				client = dict(row)
				client["uefi"] = bool(client["uefi"])
				if backend._host_control_use_messagebus is not True:
					client["reachable"] = None
				elif reachable_clients.get(client["clientId"], False):
					client["reachable"] = True
				else:
					client["reachable"] = False
				data.append(client)

		return RESTResponse(data=data, total=total)


@client_router.get("/api/opsidata/clients/reachable", response_model=List[ClientList])
@rest_api
@filter_depot_access
async def reachable_clients(  # pylint: disable=too-many-branches, dangerous-default-value, invalid-name, unused-argument, too-many-locals
	request: Request,
	selectedClients: List[str] = Depends(parse_client_list),
) -> RESTResponse:
	"""
	Get List of reachable Clients. Only test "clients".
	"""
	result = await backend.hostControl_reachable(selectedClients, 20)
	return RESTResponse(data=result, total=len(result))




def _depots_of_clients(clients: list[str] | None) -> dict:
	# TODO check if clients of config server always work
	response = {}
	with mysql.session() as session:
		where = text("h.type = 'OpsiClient'")
		params = {}
		if clients not in (None, [], [""]):
			where = text("h.type = 'OpsiClient' AND h.hostId IN :clients")
			params["clients"] = clients

		query = select(text("h.hostId")).select_from(table("HOST").alias("h")).where(where)  # type: ignore
		clients = [ dict(row)["hostId"] for row in session.execute(query, params).fetchall() ]

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

@client_router.get("/api/opsidata/clientsdepots", response_model=Dict[str, str])
@rest_api
def depots_of_clients(  # pylint: disable=too-many-branches, redefined-builtin, dangerous-default-value, invalid-name
	selectedClients: List[str] = Depends(parse_client_list),
) -> RESTResponse:
	"""
	Get a mapping of clients to depots.
	"""

	return RESTResponse(data=_depots_of_clients(selectedClients))


@client_router.post("/api/opsidata/clients")
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

		return RESTResponse(data=client.__dict__, http_status=status.HTTP_201_CREATED, headers=headers)

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
			message="Could not create client object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
		) from err


@client_router.put("/api/opsidata/clients/{client_id}")
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
			message="Could not update client object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
		) from err


@client_router.get("/api/opsidata/clients/{clientid}", response_model=Client)
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
				.where(text(f"h.hostId = '{clientid}' and h.type = 'OpsiClient'"))
			)  # pylint: disable=redefined-outer-name

			result = session.execute(query)
			result = result.fetchone()
			if result:
				data = dict(result)
				for key in data.keys():
					if isinstance(data.get(key), (date, datetime)):
						data[key] = data.get(key, "").strftime("%Y-%m-%d %H:%M:%S")
				data["uefi"] = bool(data["uefi"])
				return RESTResponse(data=data)
			logger.error("Client with id '%s' not found.", clientid)
			return RESTErrorResponse(message=f"Client with id '{clientid}' not found.", http_status=status.HTTP_404_NOT_FOUND)

		except Exception as err:  # pylint: disable=broad-except
			if isinstance(err, OpsiApiException):
				raise err
			logger.error("Could not get client object.")
			logger.error(err)
			raise OpsiApiException(
				message="Could not get client object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err


@client_router.delete("/api/opsidata/clients/{clientid}")
@rest_api
@read_only_check
def delete_client(request: Request, clientid: str) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Delete Client with ID.
	"""
	try:
		servers = backend.host_getIdents(type="*server")
		if clientid in servers:
			raise OpsiApiException(message="Can not delete server object.", http_status=status.HTTP_403_FORBIDDEN)
		backend.host_delete(clientid)

		return RESTResponse()

	except Exception as err:  # pylint: disable=broad-except
		if isinstance(err, OpsiApiException):
			raise err
		logger.error("Could not delete client object.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not delete client object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
		) from err


@client_router.post("/api/opsidata/clients/{clientid}/uefi")
def set_uefi(request: Request, clientid: str, uefi: bool = Body(default=True)) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Set uefi config of client
	"""

	if uefi:
		config_value = ["linux/pxelinux.cfg/shimx64.efi.signed"]
	else:
		config_value = [""]

	backend.configState_create("clientconfig.dhcpd.filename", clientid, config_value)

	return RESTResponse(http_status=200, data={"configId": "clientconfig.dhcpd.filename", "objectId": clientid, "values": config_value})


class OpsiclientdRPC(BaseModel):  # pylint: disable=too-few-public-methods
	client_ids: List[str]
	method: str
	params: Optional[List[Any]]


@client_router.post("/api/command/opsiclientd_rpc", response_model=Dict[str, Dict[str, Any]])
@rest_api
async def opsiclientd_rpc(request: Request, data: OpsiclientdRPC) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Run RPC on opsiclientd
	"""
	try:
		result = await backend.hostControl_opsiclientdRpc(
			method=data.method, params=data.params or [], hostIds=data.client_ids
		)  # pylint: disable=no-member
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Failed to execute opsiclientd rpc: %s", err)
		raise OpsiApiException(message="Failed to execute opsiclientd rpc.", http_status=status.HTTP_400_BAD_REQUEST, error=err) from err
	return RESTResponse(http_status=status.HTTP_200_OK, data=result)


class ClientDeployData(BaseModel):  # pylint: disable=too-few-public-methods
	clients: List[str]
	username: str
	password: str
	type: str = Field("windows", pattern="^(windows)$|^(linux)$|^(macos)$")


@client_router.post("/api/opsidata/clients/deploy")
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
			[deploy_script, "--username", clientDeployData.username, "--password", clientDeployData.password, *clientDeployData.clients],
			capture_output=True,
		)

		logger.notice(result.returncode)
		logger.notice(result)
		if result.returncode == 1:
			return RESTErrorResponse(
				http_status=status.HTTP_400_BAD_REQUEST, message=f"{result.returncode}{result.stderr} - {result.stdout}"
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


@client_router.post("/api/opsidata/clients/{clientid}/groups")
@rest_api
@read_only_check
def add_client_to_groups(
	request: Request, clientid: str, groups: List[str] = Body(default=None)  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Add client to a list of groups.
	"""
	try:
		for group in groups:
			backend.objectToGroup_create("HostGroup", group, clientid)
		return RESTResponse(http_status=200, data=f"Client '{clientid}' is now a member of: {', '.join(groups)}.")

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not add client %s to groups: %s.", clientid, groups)
		logger.error(err)
		raise OpsiApiException(
			message=f"Could not add client '{clientid}' to groups {groups}.\nLast group was: {group}.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@client_router.delete("/api/opsidata/clients/{clientid}/groups")
@rest_api
@read_only_check
def rm_client_from_groups(
	request: Request, clientid: str, groups: List[str] = Body(default=None)  # pylint: disable=unused-argument
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
		return RESTResponse(http_status=200, data=f"Client '{clientid}' was removed from: {', '.join(groups)}.")
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not remove client %s from groups: %s.", clientid, groups)
		logger.error(err)
		raise OpsiApiException(
			message=f"Could not remove client '{clientid}' from groups {groups}.\nLast group was: {group}.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@client_router.post("/api/opsidata/clients/{client}/unblock")
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


@client_router.get("/api/opsidata/blocked-clients")
@rest_api
@read_only_check
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


@client_router.post("/api/opsidata/clients/unblock")
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
				for base_key in (f"{config.redis_key('stats')}:client:failed_auth", f"{config.redis_key('stats')}:client:blocked"):
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


@client_router.post("/api/opsidata/clients/action")
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
		hosts = []

		if product_action.selectedClients:
			hosts = product_action.selectedClients

		if product_action.installation_status or product_action.action_result:
			poc_list = set(
				backend.productOnClient_getObjects(
					installationStatus=product_action.installation_status, actionResult=product_action.action_result, clientId=hosts
				)
			)

		depots = list(_depots_of_clients(hosts).values())
		if product_action.outdated:
			depot_versions: dict = {}
			for pod in backend.productOnDepot_getObjects(depotId=depots):
				if not depot_versions.get(pod.depotId):
					depot_versions[pod.depotId] = {}
				depot_versions[pod.depotId][pod.productId] = f"{pod.productVersion}-{pod.packageVersion}"
			result = set(backend.productOnClient_getObjects(installationStatus="installed", clientId=hosts))
			for poc in result.difference(poc_list):
				# print(poc)
				depot = _depots_of_clients([poc.clientId])[poc.clientId]
				if poc.installationStatus != "installed" or not depot_versions.get(depot, {}).get(poc.productId):
					continue
				try:
					if version.parse(f"{poc.productVersion}-{poc.packageVersion}") < version.parse(depot_versions[depot][poc.productId]):
						logger.info(
							"Product %s is outeded on client %s (depot is %s)",
							poc.productId,
							poc.clientId,
							_depots_of_clients([poc.clientId])[poc.clientId],
						)
						if poc not in poc_list:
							poc_list.add(poc)
				except InvalidVersion:
					continue
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
				depot = _depots_of_clients([host])[host]
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
