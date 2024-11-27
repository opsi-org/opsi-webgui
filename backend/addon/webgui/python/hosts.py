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

from fastapi import APIRouter, Body, Depends, Request, status
from opsicommon.exceptions import BackendBadValueError
from opsiconfd.config import get_configserver_id
from opsiconfd.logging import logger
from opsiconfd.rest import OpsiApiException, RESTErrorResponse, RESTResponse, common_query_parameters, order_by, pagination, rest_api
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, column, insert, or_, select, table, text, union, update  # type: ignore[import]
from sqlalchemy.exc import IntegrityError  # type: ignore[import]

from .utils import (
	backend,
	build_tree,
	filter_depot_access,
	get_allowd_host_groups,
	get_allowed_clients,
	get_allowed_objects,
	get_groups_ids,
	get_sub_groups,
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
	opsiHostKey: Optional[str] = None
	type: Optional[str] = None
	inventoryNumber: Optional[str] = None
	systemUUID: Optional[str] = None
	description: Optional[str] = None
	notes: Optional[str] = None
	hardwareAddress: Optional[str] = None
	ipAddress: Optional[str] = None


class Server(Host):  # pylint: disable=too-few-public-methods
	depotLocalUrl: Optional[str] = None
	depotRemoteUrl: Optional[str] = None
	depotWebdavUrl: Optional[str] = None
	repositoryLocalUrl: Optional[str] = None
	repositoryRemoteUrl: Optional[str] = None
	workbenchLocalUrl: Optional[str] = None
	workbenchRemoteUrl: Optional[str] = None
	networkAddress: Optional[str] = None
	maxBandwidth: Optional[int] = None
	isMasterDepot: Optional[bool] = None
	masterDepotId: Optional[str] = None


class Client(Host):  # pylint: disable=too-few-public-methods
	created: str
	lastSeen: str
	oneTimePassword: str


@host_router.get("/api/opsidata/hosts", response_model=List[Client])
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


class HostGroup(BaseModel):  # pylint: disable=too-few-public-methods
	groupId: str
	parentGroupId: Optional[str] = None
	description: Optional[str] = None
	notes: Optional[str] = None


@host_router.post("/api/opsidata/hosts/groups")
@rest_api
@read_only_check
def create_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request, group: HostGroup
) -> RESTResponse:
	"""
	Create host groups
	"""

	values = vars(group)
	values["type"] = "HostGroup"

	if group.parentGroupId == "groups" or not group.parentGroupId:
		group.parentGroupId = None
	if group.parentGroupId:
		groups = get_groups_ids("HostGroup")
		if group.parentGroupId not in groups:
			return RESTErrorResponse(
				message=f"Could not create group... Parent group '{group.parentGroupId}' does not exist.",
				http_status=status.HTTP_400_BAD_REQUEST,
			)

	with mysql.session() as session:
		try:
			query = insert(
				table(
					"GROUP", column("type"), *[column(key) for key in vars(group).keys()]
				)  # pylint: disable=consider-iterating-dictionary
			).values(values)
			session.execute(query)

			headers = {"Location": f"{request.url}/{group.groupId}"}

			return RESTResponse(data=values, http_status=status.HTTP_201_CREATED, headers=headers)

		except IntegrityError as err:
			logger.error("Could not create group object.")
			logger.error(err)
			session.rollback()
			return RESTErrorResponse(
				message=f"Could not create group object. Group '{group.groupId}' already exists",
				http_status=status.HTTP_409_CONFLICT,
				details=err,
			)

		except Exception as err:  # pylint: disable=broad-except
			logger.error("Could not create group object.")
			logger.error(err)
			session.rollback()
			raise OpsiApiException(
				message="Could not create group object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err


@host_router.post("/api/opsidata/hosts/groups/{group}/clients")
@rest_api
@read_only_check
def add_clients_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,  # pylint: disable=unused-argument
	group: str,
	clients: List[str] = Body(default=None),
) -> RESTResponse:
	"""
	Add clients to host group
	"""
	with mysql.session() as session:
		try:
			values = {
				"groupType": "HostGroup",
				"groupId": group,
			}

			for client in clients:
				values["objectId"] = client
				query = insert(table("OBJECT_TO_GROUP", column("groupType"), column("groupId"), column("objectId"))).values(values)
				session.execute(query)

			return RESTResponse(data=clients, http_status=status.HTTP_201_CREATED)

		except Exception as err:  # pylint: disable=broad-except
			logger.error("Could not add client '%s' to group object.", client)
			logger.error(err)
			session.rollback()
			raise OpsiApiException(
				message=f"Could not add client '{client}'  to group object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err


@host_router.delete("/api/opsidata/hosts/groups/{group}/clients")
@rest_api
@read_only_check
def rm_clients_from_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request, group: str  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Remove clients from host group
	"""

	try:
		backend.objectToGroup_delete(groupType="HostGroup", objectId="*", groupId=group)
	except Exception as error:  # pylint: disable=broad-exception-caught
		logger.error(error)
		return RESTErrorResponse(message=f"Could not delete group {group}.", details=error)

	return RESTResponse(data=f"Removed all clients from {group}.")


@host_router.delete("/api/opsidata/hosts/groups/{group}")
@rest_api
@read_only_check
def delete_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request, group: str  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Delete host group
	"""
	try:
		subgroups = get_sub_groups(group)
		for grp in subgroups:
			backend.group_delete(grp)
		backend.group_delete(group)
	except Exception as error:  # pylint: disable=broad-exception-caught
		logger.error(error)
		return RESTErrorResponse(message=f"Could not delete group {group}.", details=error)

	return RESTResponse(data=f"Deleted group {group}.")


@host_router.put("/api/opsidata/hosts/groups/{group}")
@rest_api
@read_only_check
def update_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	group: str, parent: str = Body(default=None), description: str = Body(default=None), note: str = Body(default=None)
) -> RESTResponse:
	"""
	Update host group
	"""
	values = {"id": group, "type": "HostGroup"}
	if parent:
		values["parentGroupId"] = parent
	if description:
		values["description"] = description
	if note:
		values["note"] = note

	try:
		backend.group_updateObject(values)
	except Exception as error:  # pylint: disable=broad-exception-caught
		logger.error(error)
		return RESTErrorResponse(message=f"Could not update group {group}.", details=error)

	return RESTResponse(data=f"Updated group: {values}")


@host_router.get("/api/opsidata/hosts/groups")
@rest_api
def get_host_groups(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	selectedDepots: List[str] = Depends(parse_depot_list),
) -> RESTResponse:
	"""
	Get host groups as tree.
	"""

	allowed =  get_allowd_host_groups(get_username())

	params = {"parent": "", "depots": []}
	if selectedDepots == [] or selectedDepots is None:
		params["depots"] = [get_configserver_id()]
	else:
		params["depots"] = selectedDepots

	where = text("g.`type` = 'HostGroup'")
	where_depots = text("")

	for idx, depot in enumerate(params["depots"]):
		if idx > 0:
			where_depots = or_(where_depots, text(f"cs.values LIKE '%{depot}%'"))  # type: ignore[assignment]
		else:
			where_depots = text(f"cs.values LIKE '%{depot}%'")
		if depot == get_configserver_id():
			where_depots = or_(where_depots, text("cs.values IS NULL"))  # type: ignore[assignment]

	with mysql.session() as session:
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

	all_groups: dict = {}
	processed: list[str] = []
	root_group = {"id": "groups", "type": "HostGroup", "text": "groups", "parent": None}
	all_groups = read_groups(result, root_group, [], allowed, True)

	host_groups = build_group_tree(root_group, list(all_groups.values()), processed)

	clientdirectory = host_groups["children"]["clientdirectory"]
	clientdirectory["parent"] = None

	if not clientdirectory.get("children"):
		clientdirectory["children"] = {}

	children = {}
	children["not_assigned"] = {
		"id": "not_assigned",
		"type": "HostGroup",
		"text": "not_assigned",
		"parent": "clientdirectory",
		"children": {},
	}
	children.update(clientdirectory["children"])
	clientdirectory["children"] = children

	clients = group_get_all_clients("clientdirectory", selectedDepots)

	for client in clients:
		clientdirectory["children"]["not_assigned"]["children"][client] = {
			"id": client,
			"type": "ObjectToGroup",
			"text": client,
			"parent": "not_assigned",
		}

	del host_groups["children"]["clientdirectory"]
	return RESTResponse(data={"groups": host_groups, "clientdirectory": clientdirectory})


def build_group_tree(current_group: dict, groups: list[dict], processed: list) -> dict:
	if not processed:
		processed = []
	processed.append(current_group["id"])

	children = {}
	for group in groups:
		if group["parent"] == current_group["id"]:  # or (group["parent"] is None and current_group["id"] == "groups"):
			if group["id"] in processed:
				logger.error("Loop: %s %s", group["id"], processed)
			else:
				children[group["id"]] = build_group_tree(group, groups, processed)
	if children:
		if not current_group.get("children"):
			current_group["children"] = {}
		current_group["children"].update(children)

	if current_group.get("children"):
		for child in current_group["children"].values():
			# Correct id for webgui
			child["id"] = f'{child["id"]};{current_group["id"]}'

	return current_group


@host_router.get("/api/opsidata/hosts/groups-dynamic")
@rest_api
def get_host_groups_dynamic(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	selectedDepots: List[str] = Depends(parse_depot_list),
	parentGroup: Optional[str] = None,
	selectedClients: List[str] = Depends(parse_client_list),
	withClients: bool = True,
) -> RESTResponse:
	"""
	Get host groups as tree.
	If a parent group (parentGroup) is given only child groups will be returned.
	"""
	allowed =  get_allowd_host_groups(get_username())

	params = {"parent": "", "depots": []}
	if selectedDepots == [] or selectedDepots is None:
		params["depots"] = [get_configserver_id()]
	else:
		params["depots"] = selectedDepots

	where = text("g.`type` = 'HostGroup'")
	where_depots = text("")

	if parentGroup == "root" or not parentGroup:
		parentGroup = "root"
		where = and_(where, text("g.parentGroupId IS NULL AND g.groupId = 'clientdirectory'"))  # type: ignore
		where_hosts = text("og.groupId IS NULL")
		root_group = {"id": None, "type": "HostGroup", "text": None, "parent": None}
	elif parentGroup == "groups":
		where = and_(where, text("g.parentGroupId IS NULL AND g.groupId != 'clientdirectory'"))  # type: ignore
		where_hosts = text("og.groupId IS NULL")
		root_group = {"id": "groups", "type": "HostGroup", "text": "groups", "parent": None}
	else:
		params["parent"] = parentGroup
		where = and_(where, text("g.parentGroupId = :parent"))  # type: ignore
		where_hosts = text("og.groupId = :parent")  # type: ignore
		root_group = {"id": parentGroup, "type": "HostGroup", "text": parentGroup, "parent": None}

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

			all_groups = read_groups(result, root_group, selectedClients, allowed, withClients)

		elif parentGroup == "root":
			all_groups = {
				"groups": {"id": "groups", "type": "HostGroup", "text": "groups", "parent": None, "children": None},
				"clientdirectory": {
					"id": "clientdirectory",
					"type": "HostGroup",
					"text": "clientdirectory",
					"parent": None,
					"children": None,
				},
				"clientlist": {"id": "clientlist", "type": "HostGroup", "text": "clientlist", "parent": None, "children": None},
			}
			if selectedClients:
				all_groups["clientlist"]["hasAnySelection"] = True

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
			host_groups = build_tree(root_group, list(all_groups.values()), allowed, default_expanded=True)

		else:
			host_groups = build_tree(root_group, list(all_groups.values()), allowed, default_expanded=True)

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
			if host_groups.get("children"):
				host_groups["children"] = {**not_assigned, **host_groups["children"]}
			else:
				host_groups["children"] = {**not_assigned}

		if parentGroup == "not_assigned" and withClients:
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
		if not host_groups.get("children"):
			host_groups["children"] = []
		if parentGroup == "root":
			return RESTResponse(data={"groups": host_groups.get("children")})
		return RESTResponse(data={"groups": host_groups})


def group_get_all_clients(group: str, depots: List = [get_configserver_id]) -> List:  # pylint: disable=dangerous-default-value
	clients = set()
	all_clients = set()
	groups = {group}

	with mysql.session() as session:
		while groups:
			for group_id in groups.copy():
				query = (
					select(text("g.groupId AS group_id, g.type AS group_type"))
					.select_from(table("GROUP").alias("g"))
					.where(text(f"g.parentGroupId='{group_id}'"))
				)
				result = session.execute(query)
				result = result.fetchall()

				for row in result:
					if row:
						groups.add(dict(row).get("group_id", ""))
				query = select(text("objectId")).select_from(table("OBJECT_TO_GROUP")).where(text(f"groupId='{group_id}'"))
				result2 = session.execute(query)
				result2 = result2.fetchall()
				for row in result2:
					if row:
						clients.add(dict(row).get("objectId"))
				groups.remove(group_id)

		username = get_username()
		allowed_clients = None
		if user_register() and host_group_access_configured(username):
			allowed_clients = get_allowed_clients(username)
		where = and_(text("h.type = 'OpsiClient'"))
		params: dict = {"depot_ids": []}
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

	return sorted(list(all_clients - clients))


@host_router.get("/api/opsidata/hosts/groups/id")
@rest_api
def get_host_group_ids() -> RESTResponse:
	"""
	Get ids of all host groups
	"""
	groups = get_groups_ids("HostGroup")
	return RESTResponse(data=groups)


def find_parent(group: str) -> str | None:
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
		parent_id = result.fetchone()
		if parent_id:
			return parent_id["parent_id"]
		return None


def read_groups(
	raw_groups: List, root_group: dict, selectedClients: List,  allowed: List[str], withClients: bool = True  # pylint: disable=invalid-name
) -> dict:
	if not isinstance(selectedClients, list) and withClients:
		selectedClients = []
	all_groups = {}
	for row in raw_groups:
		if allowed and row["group_id"] not in allowed + ["clientdirectory"]:
			continue
		if row["group_id"] not in all_groups:
			all_groups[row["group_id"]] = {
				"id": row["group_id"],
				"type": "HostGroup",
				"text": row["group_id"],
				"parent": row["parent_id"] or root_group["id"],
				"children": None,
			}
		if row["object_id"] and withClients:
			if row["object_id"] in selectedClients:
				all_groups[row["group_id"]]["hasAnySelection"] = True
			if not all_groups[row["group_id"]].get("children"):
				all_groups[row["group_id"]]["children"] = {}
			if row.group_id == row.parent_id:
				if row["object_id"] not in all_groups:
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


@host_router.get("/api/opsidata/servers", response_model=List[Server])
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
			h.systemUUID AS systemUUID,
			h.opsiHostKey AS opsiHostKey,
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
					if key == "isMasterDepot":
						row_dict[key] = bool(row_dict.get(key, 0))
					if isinstance(row_dict.get(key), (datetime.date, datetime.datetime)):
						row_dict[key] = row_dict.get(key, datetime.datetime(2000, 1, 1, 0, 0)).isoformat()

				host_data.append(row_dict)
		return RESTResponse(data=host_data)


@host_router.put("/api/opsidata/servers/{server_id}")
@rest_api
@read_only_check
def update_server(request: Request, server_id: str, server: Server) -> RESTResponse:  # pylint: disable=too-many-locals
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
	if mysql.unique_hardware_addresses and host.hardwareAddress and not host.hardwareAddress.startswith("00:00:00"):
		select_query = (
			select(text("h.hostId AS hostId"))  # type: ignore
			.select_from(table("HOST").alias("h"))
			.where(text(f"h.hostId != '{host.hostId}' AND hardwareAddress = '{host.hardwareAddress}'"))
		)  # pylint: disable=redefined-outer-name

		result = session.execute(select_query)
		result = result.fetchone()
		if result:
			raise BackendBadValueError(f"Hardware address {host.hardwareAddress!r} is already used by host {result}")
