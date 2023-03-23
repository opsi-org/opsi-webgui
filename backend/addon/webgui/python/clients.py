# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui client methods
"""

import asyncio
import os
import subprocess
from datetime import date, datetime
from ipaddress import IPv4Address, IPv6Address
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Body, Depends, Request, status
from pydantic import BaseModel, Field  # pylint: disable=no-name-in-module
from sqlalchemy import alias, and_, column, delete, select, text, update  # type: ignore[import]
from sqlalchemy.dialects.mysql import insert  # type: ignore[import]
from sqlalchemy.exc import IntegrityError  # type: ignore[import]
from sqlalchemy.sql.expression import table  # type: ignore[import]
from starlette.concurrency import run_in_threadpool

from opsicommon.exceptions import BackendBadValueError
from opsiconfd.config import get_configserver_id
from opsiconfd.logging import logger
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
	type: str = Field("OpsiClient", const=True)
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


@client_router.get("/api/opsidata/clientsdepots", response_model=Dict[str, str])
@rest_api
def depots_of_clients(  # pylint: disable=too-many-branches, redefined-builtin, dangerous-default-value, invalid-name
	selectedClients: List[str] = Depends(parse_client_list),
) -> RESTResponse:
	"""
	Get a mapping of clients to depots.
	"""

	# TODO check if clients of config server always work
	params = {}
	if selectedClients != [""] and selectedClients is not None:
		params["clients"] = selectedClients

	with mysql.session() as session:
		where = text("cs.configId='clientconfig.depot.id' AND cs.objectId IN :clients")

		query = select(text("cs.objectId AS client, cs.values")).select_from(table("CONFIG_STATE").alias("cs")).where(where)  # type: ignore

		result = session.execute(query, params)
		result = result.fetchall()

		response = {}
		for row in result:
			tmp_dict = dict(row)
			response[tmp_dict.get("client")] = tmp_dict.get("values", [])[2:-2]
			params["clients"].remove(tmp_dict.get("client", ""))

		for client in params["clients"]:
			response[client] = get_configserver_id()

		return RESTResponse(data=response)


@client_router.post("/api/opsidata/clients")
@rest_api
@read_only_check
@check_client_creation_rights
def create_client(request: Request, client: Client, depot: str = Body(default="")) -> RESTResponse:  # pylint: disable=too-many-locals
	"""
	Create OPSI-Client.
	"""

	values = vars(client)
	values["type"] = "OpsiClient"
	if not values.get("created"):
		values["created"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
		values["lastSeen"] = values["created"]

	with mysql.session() as session:
		try:
			host_check_duplicates(client, session)
			query = insert(
				table(
					"HOST", column("type"), *[column(key) for key in vars(client).keys()]  # pylint: disable=consider-iterating-dictionary
				)
			).values(values)
			session.execute(query)

			headers = {"Location": f"{request.url}/{client.hostId}"}

			if depot:
				set_depot(client.hostId, depot)

			# IPv4Address/IPv6Address is not JSON serializable
			values["ipAddress"] = str(values["ipAddress"])
			backend._send_messagebus_event(  # pylint: disable=protected-access
				"host_created", data={"type": "OpsiClient", "id": client.hostId}
			)
			return RESTResponse(data=values, http_status=status.HTTP_201_CREATED, headers=headers)

		except IntegrityError as err:
			logger.error("Could not create client object.")
			logger.error(err)
			session.rollback()
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

	values = vars(client)
	values["type"] = "OpsiClient"
	values = {k: v for k, v in values.items() if v is not None}

	with mysql.session() as session:

		try:
			host_check_duplicates(client, session)
			query = (
				update(
					table(
						"HOST",
						column("type"),
						*[column(key) for key in vars(client).keys()],  # pylint: disable=consider-iterating-dictionary
					)
				)
				.where(text(f"hostId='{client_id}'"))
				.values(values)
			)
			session.execute(query)

			headers = {"Location": f"{request.url}/{client.hostId}"}

			if values.get("ipAddress"):
				# IPv4Address/IPv6Address is not JSON serializable
				values["ipAddress"] = str(values["ipAddress"])
			return RESTResponse(data=values, http_status=status.HTTP_201_CREATED, headers=headers)

		except IntegrityError as err:
			logger.error("Could not update client object.")
			logger.error(err)
			session.rollback()
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

	with mysql.session() as session:
		try:
			select_query = (
				select(text("h.hostId AS hostId"))  # type: ignore
				.select_from(table("HOST").alias("h"))
				.where(text(f"h.hostId = '{clientid}' and h.type = 'OpsiClient'"))
			)  # pylint: disable=redefined-outer-name

			result = session.execute(select_query)
			result = result.fetchone()

			if not result:
				logger.info("Client does not exist")
				logger.error("Client with id '%s' not found.", clientid)
				raise OpsiApiException(
					message=f"Client with id '{clientid}' not found.",
					http_status=status.HTTP_404_NOT_FOUND,
				)

			tables = ["OBJECT_TO_GROUP", "CONFIG_STATE", "PRODUCT_PROPERTY_STATE"]

			for table_name in tables:
				query = delete(table(table_name)).where(text(f"objectId = '{clientid}'"))
				session.execute(query)

			tables = ["PRODUCT_ON_CLIENT", "LICENSE_ON_CLIENT", "SOFTWARE_CONFIG"]

			for table_name in tables:
				query = delete(table(table_name)).where(text(f"clientId = '{clientid}'"))
				session.execute(query)

			tables = [
				"HARDWARE_CONFIG_1394_CONTROLLER",
				"HARDWARE_CONFIG_AUDIO_CONTROLLER",
				"HARDWARE_CONFIG_BASE_BOARD",
				"HARDWARE_CONFIG_BIOS",
				"HARDWARE_CONFIG_CACHE_MEMORY",
				"HARDWARE_CONFIG_CHASSIS",
				"HARDWARE_CONFIG_COMPUTER_SYSTEM",
				"HARDWARE_CONFIG_DISK_PARTITION",
				"HARDWARE_CONFIG_FLOPPY_CONTROLLER",
				"HARDWARE_CONFIG_FLOPPY_DRIVE",
				"HARDWARE_CONFIG_HARDDISK_DRIVE",
				"HARDWARE_CONFIG_HDAUDIO_DEVICE",
				"HARDWARE_CONFIG_IDE_CONTROLLER",
				"HARDWARE_CONFIG_KEYBOARD",
				"HARDWARE_CONFIG_MEMORY_BANK",
				"HARDWARE_CONFIG_MEMORY_MODULE",
				"HARDWARE_CONFIG_MONITOR",
				"HARDWARE_CONFIG_NETWORK_CONTROLLER",
				"HARDWARE_CONFIG_OPTICAL_DRIVE",
				"HARDWARE_CONFIG_PCI_DEVICE",
				"HARDWARE_CONFIG_PCMCIA_CONTROLLER",
				"HARDWARE_CONFIG_POINTING_DEVICE",
				"HARDWARE_CONFIG_PORT_CONNECTOR",
				"HARDWARE_CONFIG_PRINTER",
				"HARDWARE_CONFIG_PROCESSOR",
				"HARDWARE_CONFIG_SCSI_CONTROLLER",
				"HARDWARE_CONFIG_SYSTEM_SLOT",
				"HARDWARE_CONFIG_TAPE_DRIVE",
				"HARDWARE_CONFIG_TPM",
				"HARDWARE_CONFIG_USB_CONTROLLER",
				"HARDWARE_CONFIG_USB_DEVICE",
				"HARDWARE_CONFIG_VIDEO_CONTROLLER",
			]

			for table_name in tables:
				query = delete(table(table_name)).where(text(f"hostId = '{clientid}'"))
				session.execute(query)

			query = delete(table("HOST")).where(text(f"HOST.hostId = '{clientid}' and HOST.type = 'OpsiClient'"))
			session.execute(query)

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
@rest_api
@read_only_check
def set_uefi(request: Request, clientid: str, uefi: bool = Body(default=True)) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Set uefi config of client
	"""

	if uefi:
		config_value = '["linux/pxelinux.cfg/shimx64.efi.signed"]'
	else:
		config_value = '[""]'

	with mysql.session() as session:

		query = (
			select(text("cs.objectId AS objectId, cs.configId AS configId"))  # type: ignore
			.select_from(table("CONFIG_STATE").alias("cs"))
			.where(text(f"cs.objectId = '{clientid}' and cs.configId = 'clientconfig.dhcpd.filename'"))
		)  # pylint: disable=redefined-outer-name

		result = session.execute(query)
		result = result.fetchone()

		values = {"configId": "clientconfig.dhcpd.filename", "objectId": clientid, "values": config_value}

		if result:
			stmt = (
				update(table("CONFIG_STATE", *[column(name) for name in values]))
				.where(text(f"configId = 'clientconfig.dhcpd.filename' AND objectId = '{clientid}'"))
				.values(values=config_value)
			)
			session.execute(stmt)

		else:
			stmt = (
				insert(table("CONFIG_STATE", *[column(name) for name in values]))
				.values(**values)
				.on_duplicate_key_update(configId="clientconfig.dhcpd.filename", objectId=clientid)
			)
			session.execute(stmt)

	return RESTResponse(http_status=200, data=values)


class OpsiclientdRPC(BaseModel):  # pylint: disable=too-few-public-methods
	client_ids: List[str]
	method: str
	params: Optional[List[Any]]


@client_router.post("/api/command/opsiclientd_rpc", response_model=Dict[str, Dict[str, Any]])
@rest_api
def opsiclientd_rpc(request: Request, data: OpsiclientdRPC) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Run RPC on opsiclientd
	"""
	try:
		result = backend.hostControl_opsiclientdRpc(
			method=data.method, params=data.params or [], hostIds=data.client_ids
		)  # pylint: disable=no-member
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Failed to execute opsiclientd rpc: %s", err)
		raise OpsiApiException(message="Failed to execute opsiclientd rpc.", http_status=status.HTTP_400_BAD_REQUEST, error=err) from err
	return RESTResponse(http_status=status.HTTP_200_OK, data=result)


def host_check_duplicates(client: Client, session: Any) -> None:
	if (
		mysql.unique_hardware_addresses  # pylint: disable=protected-access
		and client.hardwareAddress
		and not client.hardwareAddress.startswith("00:00:00")
	):
		select_query = (
			select(text("h.hostId AS hostId"))  # type: ignore
			.select_from(table("HOST").alias("h"))
			.where(text(f"h.hostId != '{client.hostId}' AND hardwareAddress = '{client.hardwareAddress}'"))
		)  # pylint: disable=redefined-outer-name

		result = session.execute(select_query)
		result = result.fetchone()
		if result:
			raise BackendBadValueError(f"Hardware address {client.hardwareAddress!r} is already used by host {result}")


class ClientDeployData(BaseModel):  # pylint: disable=too-few-public-methods
	clients: List[str]
	username: str
	password: str
	type: str = Field("windows", regex="^(windows)$|^(linux)$|^(macos)$")


@client_router.post("/api/opsidata/clients/deploy")
@rest_api
async def deploy_client_agent(clientDeployData: ClientDeployData) -> RESTResponse:  # pylint: disable=invalid-name
	logger.devel(clientDeployData)

	deploy_script = "/var/lib/opsi/depot/opsi-client-agent/opsi-deploy-client-agent"
	if clientDeployData.type == "linux":
		deploy_script = "/var/lib/opsi/depot/opsi-linux-client-agent/opsi-deploy-client-agent"
	if clientDeployData.type == "macos":
		deploy_script = "/var/lib/opsi/depot/opsi-mac-client-agent/opsi-deploy-client-agent"

	logger.devel(clientDeployData.clients)

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

	values = {"objectId": client, "configId": "clientconfig.depot.id", "values": f'["{depot}"]'}

	with mysql.session() as session:
		stmt = (
			insert(table("CONFIG_STATE", *[column(name) for name in values.keys()]))  # pylint: disable=consider-iterating-dictionary
			.values(**values)
			.on_duplicate_key_update(**values)
		)
		session.execute(stmt, values)


@client_router.post("/api/opsidata/clients/{clientid}/groups")
@rest_api
@read_only_check
def add_client_to_groups(
	request: Request, clientid: str, groups: List[str] = Body(default=None)  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Add client to a list of groups.
	"""

	if not groups:
		logger.error("No group given.")
		return RESTErrorResponse(http_status=status.HTTP_400_BAD_REQUEST, message="No group given.")

	with mysql.session() as session:
		try:
			for group in groups:
				values = {"groupType": "HostGroup", "objectId": clientid, "groupId": group}

				with mysql.session() as session:
					stmt = (
						insert(
							table(
								"OBJECT_TO_GROUP", *[column(name) for name in values.keys()]
							)  # pylint: disable=consider-iterating-dictionary
						)
						.values(**values)
						.on_duplicate_key_update(**values)
					)
					session.execute(stmt, values)
		except IntegrityError as err:
			logger.error("Could not add client %s to groups: %s.", clientid, groups)
			logger.error(err)
			session.rollback()
			return RESTErrorResponse(
				message=f"Could not add client '{clientid}' to groups {groups}.\nLast group was: {group}.",
				http_status=status.HTTP_409_CONFLICT,
				details=err,
			)

		except Exception as err:  # pylint: disable=broad-except
			logger.error("Could not add client %s to groups: %s.", clientid, groups)
			logger.error(err)
			session.rollback()
			raise OpsiApiException(
				message=f"Could not add client '{clientid}' to groups {groups}.\nLast group was: {group}.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err

	return RESTResponse(http_status=200, data=f"Client '{clientid}' is now a member of: {', '.join(groups)}.")


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

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not remove client %s from groups: %s.", clientid, groups)
		logger.error(err)
		raise OpsiApiException(
			message=f"Could not remove client '{clientid}' from groups {groups}.\nLast group was: {group}.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err

	return RESTResponse(http_status=200, data=f"Client '{clientid}' was removed from: {', '.join(groups)}.")
