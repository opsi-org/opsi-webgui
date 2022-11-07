# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui host methods
"""

import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, column, or_, select, table, text, union, update
from sqlalchemy.exc import IntegrityError

from OPSI.Exceptions import BackendBadValueError
from opsiconfd.application.utils import get_configserver_id
from opsiconfd.backend import get_client_backend
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
	build_tree,
	get_allowed_clients,
	get_allowed_objects,
	get_username,
	host_group_access_configured,
	mysql,
	parse_client_list,
	parse_depot_list,
	parse_hosts_list,
	parse_server_list,
	read_only_check,
	user_register,
)

host_router = APIRouter()


class Host(BaseModel):  # pylint: disable=too-few-public-methods
	hostId: str
	type: str
	description: str
	notes: str
	hardwareAddress: str
	ipAddress: str
	inventoryNumber: str
	created: str
	lastSeen: str
	opsiHostKey: str
	oneTimePassword: str


@host_router.get("/api/opsidata/hosts", response_model=List[Host])
@rest_api
def get_host_data(
	commons: dict = Depends(common_query_parameters),
	hosts: List[str] = Depends(parse_hosts_list),
	host_type: Optional[str] = None,
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get host data.
	"""
	params = {"hosts": [], "search": "", "type": ""}
	where = text("")
	if commons.get("filterQuery"):
		params["search"] = f"%{commons.get('filterQuery')}%"
		where = text("h.hostId LIKE :search OR h.description LIKE :search")
	if hosts:
		params["hosts"] = hosts
		where = and_(text("h.hostId in :hosts"))  # type: ignore
	if host_type:
		params["type"] = host_type
		where = and_(where, text("h.type = :type"))  # type: ignore

	# IF ( "efi" IN
	# 				,
	# 				TRUE,
	# 				FALSE
	# 			) AS uefi

	with mysql.session() as session:
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
			.where(where)
		)  # pylint: disable=redefined-outer-name

		query = order_by(query, commons)  # type: ignore[assignment,arg-type]
		query = pagination(query, commons)  # type: ignore[assignment,arg-type]

		result = session.execute(query, params)
		result = result.fetchall()
		host_data = []
		for row in result:
			if row is not None:
				row_dict = dict(row)
				for key in row_dict.keys():

					if isinstance(row_dict.get(key), (datetime.date, datetime.datetime)):
						row_dict[key] = row_dict.get(key, datetime.datetime(2000, 1, 1, 0, 0)).isoformat()
				row_dict["uefi"] = bool(row_dict["uefi"])
				host_data.append(row_dict)
		return RESTResponse(data=host_data)


@host_router.get("/api/opsidata/hosts/groups")
@rest_api
def get_host_groups(  # pylint: disable=invalid-name
	selectedDepots: List[str] = Depends(parse_depot_list),
	parentGroup: Optional[str] = None,
	selectedClients: List[str] = Depends(parse_client_list),
) -> RESTResponse:
	"""
	Get host groups as tree.
	If a parent group (parentGroup) is given only child groups will be returned.
	"""
	allowed = get_allowed_objects()

	params = {"parent": "", "depots": []}
	if selectedDepots == [] or selectedDepots is None:
		params["depots"] = [get_configserver_id()]
	else:
		params["depots"] = selectedDepots

	root_group = {"id": "groups", "type": "HostGroup", "text": "groups", "parent": None}

	where = text("g.`type` = 'HostGroup'")
	where_depots = text("")
	if parentGroup:
		if parentGroup == "groups":
			where = and_(where, text("g.parentGroupId IS NULL AND g.groupId != 'clientdirectory'"))  # type: ignore
			where_hosts = text("og.groupId IS NULL")
		elif parentGroup == "root":
			where = and_(where, text("g.parentGroupId IS NULL AND g.groupId = 'clientdirectory'"))  # type: ignore
			where_hosts = text("og.groupId IS NULL")
			root_group = {"id": None, "type": "HostGroup", "text": None, "parent": None}
		else:
			params["parent"] = parentGroup
			where = and_(where, text("g.parentGroupId = :parent"))  # type: ignore
			where_hosts = text("og.groupId = :parent")  # type: ignore
			root_group = {"id": parentGroup, "type": "HostGroup", "text": parentGroup, "parent": None}
	else:
		parentGroup = ""

	for idx, depot in enumerate(params["depots"]):
		if idx > 0:
			where_depots = or_(where_depots, text(f"cs.values LIKE '%{depot}%'"))  # type: ignore[assignment]
		else:
			where_depots = text(f"cs.values LIKE '%{depot}%'")
		if depot == get_configserver_id():
			where_depots = or_(where_depots, text("cs.values IS NULL"))  # type: ignore[assignment]

	with mysql.session() as session:

		if parentGroup and parentGroup != "root":
			query = union(
				select(
					text(  # type: ignore[arg-type]
						"""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id,
				NULL AS object_id
			"""
					)
				)
				.select_from(table("GROUP").alias("g"))
				.where(where),
				select(  # type: ignore[attr-defined]
					text(  # type: ignore[arg-type]
						"""
				og.groupId AS group_id,
				og.groupId AS parent_Id,
				og.objectId AS object_id
			"""
					)
				)
				.select_from(table("OBJECT_TO_GROUP").alias("og"))
				.join(
					text("CONFIG_STATE AS cs"),  # type: ignore[arg-type]
					and_(
						text("og.objectId = cs.objectId"),
						text("cs.configId = 'clientconfig.depot.id'"),
					),
					isouter=True,
				)
				.where(and_(where_hosts, where_depots)),
			)
			result = session.execute(query, params)
			result = result.fetchall()

			all_groups = read_groups(result, root_group, selectedClients)

		elif parentGroup == "root":
			all_groups = {
				"groups": {"id": "groups", "type": "HostGroup", "text": "groups", "parent": None},
				"clientdirectory": {
					"id": "clientdirectory",
					"type": "HostGroup",
					"text": "clientdirectory",
					"parent": None,
				},
				"clientlist": {
					"id": "clientlist",
					"type": "HostGroup",
					"text": "clientlist",
					"parent": None,
				},
			}
			if selectedClients:
				all_groups["clientlist"]["hasAnySelection"] = True
		else:
			query = (
				select(  # type: ignore[arg-type,attr-defined]
					text(  # type: ignore[arg-type]
						"""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id,
				og.objectId AS object_id,
				TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`)) AS depot_id
			"""
					)
				)
				.select_from(table("GROUP").alias("g"))
				.join(table("OBJECT_TO_GROUP").alias("og"), text("og.groupType = g.`type` AND og.groupId = g.groupId"), isouter=True)
				.join(
					table("CONFIG_STATE").alias("cs"),
					and_(
						text("og.objectId = cs.objectId"),
						or_(text("cs.configId = 'clientconfig.depot.id'"), text("cs.values IS NULL")),
						where_depots,
					),
					isouter=True,
				)
				.where(where)
			)
			result = session.execute(query, params)
			result = result.fetchall()

			all_groups = read_groups(result, root_group, selectedClients)

		if selectedClients:
			params = {}
			where = text("og.objectId in :clients")
			params = {"clients": selectedClients}
			query = (
				select(  # type: ignore[assignment]
					text(  # type: ignore[arg-type]
						"""
				og.groupId AS group_id,
				og.groupId AS parent_Id,
				og.objectId AS object_id
			"""
					)
				)
				.select_from(table("OBJECT_TO_GROUP").alias("og"))
				.where(where)
			)

			result = session.execute(query, params)
			result = result.fetchall()

			groups_to_mark = []
			for row in result:
				groups_to_mark.append(row["group_id"])

			for parent_group in groups_to_mark:
				while parent_group not in all_groups and parent_group is not None:
					parent_group = find_parent(parent_group)
				if parent_group:
					all_groups[parent_group]["hasAnySelection"] = True
				elif "groups" in all_groups:
					all_groups["groups"]["hasAnySelection"] = True
			host_groups = build_tree(root_group, list(all_groups.values()), allowed["host_groups"], default_expanded=True)
		else:
			host_groups = build_tree(root_group, list(all_groups.values()), allowed["host_groups"])

		if parentGroup == "clientdirectory":
			not_assigned = {
				"not_assigned": {
					"id": "not_assigned",
					"type": "HostGroup",
					"text": "not_assigned",
					"parent": None,
					"children": None,
				}
			}
			host_groups["children"] = {**not_assigned, **host_groups["children"]}

		if parentGroup == "not_assigned":
			clients = group_get_all_clients("clientdirectory", selectedDepots)
			host_groups["children"] = {}
			for client in clients:
				host_groups["children"][client] = {
					"id": f"{client};not_assigned",
					"type": "ObjectToGroup",
					"text": client,
					"parent": "not_assigned",
					"allowed": True,
				}

		if parentGroup == "root":
			return RESTResponse(data={"groups": host_groups.get("children")})
		return RESTResponse(data={"groups": host_groups})


def group_get_all_clients(group: str, depots: List = [get_configserver_id]) -> List:
	clients = set()
	all_clients = set()
	groups = {group}

	with mysql.session() as session:

		while groups:
			for group in groups.copy():
				groups.remove(group)
				query = select(text("g.groupId AS group_id, g.type AS group_type")).select_from(table("GROUP").alias("g")).where(text(f"g.parentGroupId='{group}'"))  # type: ignore[arg-type,attr-defined]
				result = session.execute(query)
				result = result.fetchall()

				for row in result:
					if row:
						groups.add(dict(row).get("group_id"))
				query = select(text("objectId")).select_from(table("OBJECT_TO_GROUP")).where(text(f"groupId='{group}'"))
				result2 = session.execute(query)
				result2 = result2.fetchall()
				for row in result2:
					if row:
						clients.add(dict(row).get("objectId"))

		username = get_username()
		allowed_clients = None
		if user_register() and host_group_access_configured(username):
			allowed_clients = get_allowed_clients(username)
		where = and_(text("h.type = 'OpsiClient'"))
		params = {"depot_ids": []}
		if allowed_clients:
			params["allowed_clients"] = allowed_clients
			where = and_(where, text("(h.hostId in :allowed_clients)"))
		if depots:
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
			params["depot_ids"] = depots
		query = select(text("h.hostId AS clientId")).select_from(table("HOST").alias("h")).where(where)

		result = session.execute(query, params)
		result = result.fetchall()
		for row in result:
			if row:
				all_clients.add(dict(row).get("clientId"))

	return list(all_clients - clients)


@host_router.get("/api/opsidata/hosts/groups/id")
@rest_api
def get_host_group_ids() -> RESTResponse:
	"""
	Get ids of all host groups
	"""
	groups = []
	with mysql.session() as session:
		query = select(text("g.groupId AS group_id")).select_from(table("GROUP").alias("g"))  # type: ignore[arg-type,attr-defined]
		result = session.execute(query)
		result = result.fetchall()

		for row in result:
			if row:
				groups.append(dict(row).get("group_id"))
	return RESTResponse(data=groups)


def find_parent(group: str) -> str:
	with mysql.session() as session:
		query = (
			select(
				text(  # type: ignore[arg-type]
					"""
			g.parentGroupId AS parent_id,
			g.groupId AS group_id
		"""
				)
			)
			.select_from(table("GROUP").alias("g"))
			.where(text(f"g.groupId = '{group}'"))
		)  # pylint: disable=redefined-outer-name
		result = session.execute(query)
		parent_id = result.fetchone()["parent_id"]
		return parent_id


def read_groups(raw_groups: List, root_group: dict, selectedClients: List) -> dict:  # pylint: disable=invalid-name
	if not isinstance(selectedClients, list):
		selectedClients = []
	all_groups = {}
	for row in raw_groups:
		if not row["group_id"] in all_groups:
			all_groups[row["group_id"]] = {
				"id": row["group_id"],
				"type": "HostGroup",
				"text": row["group_id"],
				"parent": row["parent_id"] or root_group["id"],
			}
		if row["object_id"]:
			if row["object_id"] in selectedClients:
				all_groups[row["group_id"]]["hasAnySelection"] = True
			if "children" not in all_groups[row["group_id"]]:
				all_groups[row["group_id"]]["children"] = {}
			if row.group_id == row.parent_id:
				if not row["object_id"] in all_groups:
					all_groups[row["object_id"]] = {
						"id": row["object_id"],
						"type": "ObjectToGroup",
						"text": row["object_id"],
						"parent": row["parent_id"] or root_group["id"],
					}
			else:
				all_groups[row["group_id"]]["children"][row["object_id"]] = {
					"id": row["object_id"],
					"type": "ObjectToGroup",
					"text": row["object_id"],
					"parent": row["group_id"],
				}
	return all_groups


# "description": "text1",
# "notes": "abc",
# "id": "bonifax.uib.local",
# "hardwareAddress": "7a:1c:65:aa:98:ea",
# "ipAddress": "192.168.1.14",
# "inventoryNumber": "123456",
# "opsiHostKey": "432721195f1ab54a990ab4148bda53ff",
# "depotLocalUrl": "file:///var/lib/opsi/depot",
# "depotRemoteUrl": "smb://192.168.1.14/opsi_depot",
# "depotWebdavUrl": "webdavs://bonifax.uib.local:4447/depot",
# "repositoryLocalUrl": "file:///var/lib/opsi/repository",
# "repositoryRemoteUrl": "webdavs://bonifax.uib.local:4447/repository",
# "networkAddress": "192.168.1.0/24",
# "maxBandwidth": 0,
# "isMasterDepot": true,
# "masterDepotId": null,
# "workbenchLocalUrl": "file:///var/lib/opsi/workbench/",
# "workbenchRemoteUrl": "smb://192.168.1.14/opsi_workbench",
# "type": "OpsiConfigserver",
# "ident": "bonifax.uib.local"


class Server(BaseModel):
	hostId: str
	description: Optional[str]
	notes: Optional[str]
	hardwareAddress: Optional[str]
	ipAddress: Optional[str]
	inventoryNumber: Optional[str]
	opsiHostKey: Optional[str]
	depotLocalUrl: Optional[str]
	depotRemoteUrl: Optional[str]
	depotWebdavUrl: Optional[str]
	repositoryLocalUrl: Optional[str]
	repositoryRemoteUrl: Optional[str]
	workbenchLocalUrl: Optional[str]
	workbenchRemoteUrl: Optional[str]
	networkAddress: Optional[str]
	maxBandwidth: Optional[str]
	isMasterDepot: Optional[str]
	masterDepotId: Optional[str]
	type: Optional[str]


@host_router.get("/api/opsidata/servers", response_model=List[Host])
@rest_api
def get_server_data(
	commons: dict = Depends(common_query_parameters),
	servers: List[str] = Depends(parse_server_list),
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get server data.
	"""
	params = {"servers": [], "search": ""}
	where = text("")
	if commons.get("filterQuery"):
		params["search"] = f"%{commons.get('filterQuery')}%"
		where = text("h.hostId LIKE :search OR h.description LIKE :search")
	if servers:
		params["servers"] = servers
		where = and_(text("h.hostId in :servers"))  # type: ignore

	with mysql.session() as session:
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
			h.created AS created,
			h.lastSeen AS lastSeen,
			h.opsiHostKey AS opsiHostKey,
			h.oneTimePassword AS oneTimePassword,
			h.depotLocalUrl AS depotLocalUrl,
			h.depotRemoteUrl AS depotRemoteUrl,
			h.depotWebdavUrl AS depotWebdavUrl,
			h.repositoryLocalUrl AS repositoryLocalUrl,
			h.repositoryRemoteUrl AS repositoryRemoteUrl,
			h.workbenchLocalUrl AS workbenchLocalUrl,
			h.workbenchRemoteUrl AS workbenchRemoteUrl,
			h.networkAddress AS networkAddress,
			h.maxBandwidth AS maxBandwidth,
			h.isMasterDepot AS isMasterDepot,
			h.masterDepotId AS masterDepotId

		"""
				)
			)
			.select_from(table("HOST").alias("h"))
			.where(and_(where, text("h.type IN ('OpsiDepotserver','OpsiConfigserver') ")))
		)  # pylint: disable=redefined-outer-name

		query = order_by(query, commons)  # type: ignore[assignment,arg-type]
		query = pagination(query, commons)  # type: ignore[assignment,arg-type]
		result = session.execute(query, params)
		result = result.fetchall()
		host_data = []
		for row in result:
			if row is not None:
				row_dict = dict(row)
				for key in row_dict.keys():

					if isinstance(row_dict.get(key), (datetime.date, datetime.datetime)):
						row_dict[key] = row_dict.get(key, datetime.datetime(2000, 1, 1, 0, 0)).isoformat()

				host_data.append(row_dict)
		return RESTResponse(data=host_data)


@host_router.put("/api/opsidata/servers/{server_id}")
@rest_api
@read_only_check
def update_client(request: Request, server_id: str, server: Server) -> RESTResponse:  # pylint: disable=too-many-locals
	"""
	Update OPSI-Server (Config and Depot).
	"""

	values = vars(server)
	# values["type"] = ("Opsidepotserver", "OpsiConfigserver")
	values = {k: v for k, v in values.items() if v is not None}

	with mysql.session() as session:

		try:
			host_check_duplicates(server, session)
			query = (
				update(
					table(
						"HOST",
						*[column(key) for key in vars(server).keys()],  # pylint: disable=consider-iterating-dictionary
					)
				)
				.where(text(f"hostId='{server_id}'"))
				.values(values)
			)
			session.execute(query)

			headers = {"Location": f"{request.url}/{server.hostId}"}

			if values.get("ipAddress"):
				values["ipAddress"] = str(values["ipAddress"])
			return RESTResponse(data=values, http_status=status.HTTP_201_CREATED, headers=headers)

		except IntegrityError as err:
			logger.error("Could not update client object.")
			logger.error(err)
			session.rollback()
			return RESTErrorResponse(
				message=f"Could not update client '{server.hostId}' object.",
				http_status=status.HTTP_409_CONFLICT,
				details=err,
			)

		except Exception as err:  # pylint: disable=broad-except
			logger.error("Could not update client object.")
			logger.error(err)
			raise OpsiApiException(
				message="Could not update client object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err


# TODO merege with client check duplicates
def host_check_duplicates(host: Host, session: Any) -> None:
	if backend.unique_hardware_addresses and host.hardwareAddress and not host.hardwareAddress.startswith("00:00:00"):
		select_query = (
			select(text("h.hostId AS hostId"))  # type: ignore
			.select_from(table("HOST").alias("h"))
			.where(text(f"h.hostId != '{host.hostId}' AND hardwareAddress = '{host.hardwareAddress}'"))
		)  # pylint: disable=redefined-outer-name

		result = session.execute(select_query)
		result = result.fetchone()
		if result:
			raise BackendBadValueError(f"Hardware address {host.hardwareAddress!r} is already used by host {result}")
