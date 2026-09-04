# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui host methods
"""

import datetime
from typing import Any

from fastapi import APIRouter, Body, Depends, Request, status
from opsi.exception import BackendBadValueError
from opsiconfd.config import get_configserver_id

# from opsiconfd.logging import logger
from opsiconfd.rest import (
	OpsiApiException,
	RESTErrorResponse,
	RESTResponse,
	common_query_parameters,
	order_by,
	pagination,
	rest_api,
)
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import (  # type: ignore[import]
	and_,
	column,
	insert,
	or_,
	select,
	table,
	text,
	union,
	update,
)
from sqlalchemy.exc import IntegrityError  # type: ignore[import]

from ..logger import get_logger
from ..utils import (
	backend,
	build_tree,
	depot_access_configured,
	expand_allowed_groups,
	filter_depot_access,
	get_all_children_groupids,
	get_allowed_depots,
	get_allowed_host_groups,
	get_allowed_sql,
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
from .utils_groups import (  # pylint: disable=import-error
	build_nested_group,
	read_groups,
)

logger = get_logger()
api_router = APIRouter()


class Host(BaseModel):  # pylint: disable=too-few-public-methods
	hostId: str
	opsiHostKey: str | None = None
	type: str | None = None
	inventoryNumber: str | None = None
	systemUUID: str | None = None
	description: str | None = None
	notes: str | None = None
	hardwareAddress: str | None = None
	ipAddress: str | None = None


class Server(Host):  # pylint: disable=too-few-public-methods
	depotLocalUrl: str | None = None
	depotRemoteUrl: str | None = None
	depotWebdavUrl: str | None = None
	repositoryLocalUrl: str | None = None
	repositoryRemoteUrl: str | None = None
	workbenchLocalUrl: str | None = None
	workbenchRemoteUrl: str | None = None
	networkAddress: str | None = None
	maxBandwidth: int | None = None
	isMasterDepot: bool | None = None
	masterDepotId: str | None = None


class Client(Host):  # pylint: disable=too-few-public-methods
	created: str
	lastSeen: str
	oneTimePassword: str


@api_router.get("/api/opsidata/hosts", response_model=list[Client])
@rest_api
def get_host_data(
	commons: dict = Depends(common_query_parameters),
	hosts: list[str] = Depends(parse_hosts_list),
	host_type: str | None = None,
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get host data.
	"""
	allowed_clients = None
	username = get_username()
	configured = host_group_access_configured(username)

	if user_register() and configured:
		allowed_clients = get_allowed_sql(username)
		if not allowed_clients:
			logger.warning("No clients found for user '%s'.", username)
			return RESTResponse(data=[], total=0)

	params = {"hosts": [], "search": "", "type": ""}
	where = text("1=1")
	if commons.get("filterQuery"):
		params["search"] = f"%{commons.get('filterQuery')}%"
		where = text("h.hostId LIKE :search OR h.description LIKE :search")
	if hosts:
		params["hosts"] = hosts
		where = and_(text("h.hostId in :hosts"))  # type: ignore
	if host_type:
		params["type"] = host_type
		where = and_(where, text("h.type = :type"))  # type: ignore
	if allowed_clients:
		params["allowed_clients"] = allowed_clients
		where = and_(where, text("h.hostId in :allowed_clients"))  # type: ignore

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
				for key in row_dict:
					if isinstance(row_dict.get(key), (datetime.date, datetime.datetime)):
						row_dict[key] = row_dict.get(key, datetime.datetime(2000, 1, 1, 0, 0)).isoformat()
				row_dict["uefi"] = bool(row_dict["uefi"])
				host_data.append(row_dict)
		return RESTResponse(data=host_data)


class HostGroup(BaseModel):  # pylint: disable=too-few-public-methods
	groupId: str
	parentGroupId: str | None = None
	description: str | None = None
	notes: str | None = None


@api_router.post("/api/opsidata/hosts/groups")
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
					"GROUP",
					column("type"),
					*[column(key) for key in vars(group).keys()],
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
				message="Could not create group object.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err


@api_router.post("/api/opsidata/hosts/groups/{group}/clients")
@rest_api
@read_only_check
def add_clients_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,  # pylint: disable=unused-argument
	group: str,
	clients: list[str] = Body(default=None),
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

			rows = [{**values, "objectId": client} for client in clients]
			if rows:
				query = insert(
					table(
						"OBJECT_TO_GROUP",
						column("groupType"),
						column("groupId"),
						column("objectId"),
					)
				).values(rows)
				session.execute(query)

			return RESTResponse(data=clients, http_status=status.HTTP_201_CREATED)

		except Exception as err:  # pylint: disable=broad-except
			logger.error("Could not add clients %s to group object.", clients)
			logger.error(err)
			session.rollback()
			raise OpsiApiException(
				message=f"Could not add clients {clients} to group object.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err


@api_router.delete("/api/opsidata/hosts/groups/{group}/clients")
@rest_api
@read_only_check
def rm_clients_from_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,
	group: str,  # pylint: disable=unused-argument
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


@api_router.delete("/api/opsidata/hosts/groups/{group}")
@rest_api
@read_only_check
def delete_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,
	group: str,  # pylint: disable=unused-argument
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


@api_router.put("/api/opsidata/hosts/groups/{group}")
@rest_api
@read_only_check
def update_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	group: str,
	parent: str = Body(default=None),
	description: str = Body(default=None),
	note: str = Body(default=None),
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


@api_router.get("/api/opsidata/hosts/groups")
@rest_api
@filter_depot_access
def get_host_groups(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	selectedDepots: list[str] = Depends(parse_depot_list),
	withClients: bool = True,
) -> RESTResponse:
	"""
	Get host groups as tree.
	withClients=false returns only the group structure (no client members) for fast initial load.
	Client members can be lazy-loaded afterwards via hosts/groups-dynamic?parentGroup=<id>.
	"""
	username = get_username()
	configured = host_group_access_configured(username)
	restricted = user_register() and configured
	allowed = None if not restricted else get_allowed_host_groups(username)

	if selectedDepots == []:
		# Depot-restricted user without any accessible depot in the selection:
		# return an empty tree instead of falling back to the configserver depot.
		empty_clientdirectory = {
			"id": "clientdirectory",
			"type": "HostGroup",
			"text": "clientdirectory",
			"parent": None,
			"children": {
				"not_assigned": {
					"id": "not_assigned",
					"type": "HostGroup",
					"text": "not_assigned",
					"parent": "clientdirectory",
					"children": {},
				}
			},
		}
		empty_groups = {
			"id": "groups",
			"type": "HostGroup",
			"text": "groups",
			"parent": None,
			"children": {},
		}
		return RESTResponse(data={"groups": empty_groups, "clientdirectory": empty_clientdirectory})

	params = {"parent": "", "depots": []}
	if selectedDepots is None:
		params["depots"] = [get_configserver_id()]
	else:
		params["depots"] = selectedDepots

	where = text("g.`type` = 'HostGroup'")
	where_depots = text("")

	for idx, depot in enumerate(params["depots"]):
		params[f"depot{idx}"] = f"%{depot}%"
		if idx > 0:
			where_depots = or_(where_depots, text(f"cs.values LIKE :depot{idx}"))  # type: ignore[assignment]
		else:
			where_depots = text(f"cs.values LIKE :depot{idx}")
		if depot == get_configserver_id():
			where_depots = or_(where_depots, text("cs.values IS NULL"))  # type: ignore[assignment]

	with mysql.session() as session:
		if withClients:
			query = (
				select(  # type: ignore[arg-type,attr-defined]
					text(  # type: ignore[arg-type]
						"""
			g.groupId AS group_id,
			g.parentGroupId AS parent_id,
			og.objectId AS object_id,
			TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`)) AS depot_id
		"""
					)
				)
				.select_from(table("GROUP").alias("g"))
				.join(
					table("OBJECT_TO_GROUP").alias("og"),
					text("g.`type` = og.groupType AND g.groupId = og.groupId"),
					isouter=True,
				)
				.join(
					table("CONFIG_STATE").alias("cs"),
					and_(
						text("og.objectId = cs.objectId"),
						or_(
							text("cs.configId = 'clientconfig.depot.id'"),
							text("cs.values IS NULL"),
						),
						where_depots,
					),
					isouter=True,
				)
				.where(where)
			)
		else:
			# Fetch only group structure, no client member IDs (fast path for lazy loading)
			# Still include member counts so the UI can show expand chevrons
			query = (
				select(  # type: ignore[arg-type,attr-defined]
					text(  # type: ignore[arg-type]
						"""
			g.groupId AS group_id,
			g.parentGroupId AS parent_id,
			NULL AS object_id,
			NULL AS depot_id,
			(SELECT COUNT(*) FROM OBJECT_TO_GROUP og WHERE og.groupId = g.groupId AND og.groupType = 'HostGroup') AS member_count
		"""
					)
				)
				.select_from(table("GROUP").alias("g"))
				.where(where)
			)
		result = session.execute(query, params)
		result = result.fetchall()
	all_groups: dict = {}
	root_group = {"id": "groups", "type": "HostGroup", "text": "groups", "parent": None}

	# When withClients=False, capture member counts from the query before passing to read_groups
	member_counts: dict = {}
	if not withClients:
		for row in result:
			row_dict = dict(row)
			gid = row_dict.get("group_id")
			cnt = row_dict.get("member_count", 0) or 0
			if gid:
				member_counts[gid] = int(cnt)

	all_groups = read_groups(
		result,
		root_group,
		selected_object_ids=[],
		allowed=allowed,
		withClients=withClients,
		gtype="HostGroup",
	)

	# Attach member counts to group nodes when withClients=False
	# so the frontend knows which groups have expandable children
	if not withClients and member_counts:
		for gid, cnt in member_counts.items():
			if gid in all_groups and cnt > 0:
				all_groups[gid]["member_count"] = cnt
				# Set a placeholder children dict so build_nested_group treats it as expandable
				if all_groups[gid].get("children") is None:
					all_groups[gid]["children"] = {}

	host_groups = build_nested_group(root_group, all_groups)

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

	if withClients:
		clients = group_get_all_clients("clientdirectory", params["depots"])

		for client in clients:
			clientdirectory["children"]["not_assigned"]["children"][client] = {
				"id": client,
				"type": "ObjectToGroup",
				"text": client,
				"parent": "not_assigned",
			}

	del host_groups["children"]["clientdirectory"]
	return RESTResponse(data={"groups": host_groups, "clientdirectory": clientdirectory})


@api_router.get("/api/opsidata/hosts/groups-dynamic")
@rest_api
@filter_depot_access
def get_host_groups_dynamic(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	selectedDepots: list[str] = Depends(parse_depot_list),
	parentGroup: str | None = None,
	selectedClients: list[str] = Depends(parse_client_list),
	withClients: bool = True,
	recursiveMembers: bool = False,
) -> RESTResponse:
	"""
	Get host groups as tree.
	If a parent group (parentGroup) is given only child groups will be returned.
	"""
	username = get_username()
	configured = host_group_access_configured(username)
	restricted = user_register() and configured
	allowed = None if not restricted else get_allowed_host_groups(username)
	# Configed semantics: children of an allowed group are allowed as well.
	allowed_children = expand_allowed_groups(allowed, "HostGroup")

	if selectedDepots == []:
		# Depot-restricted user without any accessible depot in the selection:
		# return an empty tree instead of falling back to the configserver depot.
		if parentGroup == "root" or not parentGroup:
			return RESTResponse(data={"groups": {}})
		empty_node: dict[str, Any] = {
			"id": parentGroup,
			"type": "HostGroup",
			"text": parentGroup,
			"parent": None,
			"children": {},
		}
		if recursiveMembers:
			return RESTResponse(data={"groups": empty_node, "members": []})
		return RESTResponse(data={"groups": empty_node})

	params = {"parent": "", "depots": []}
	if selectedDepots is None:
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
		root_group = {
			"id": "groups",
			"type": "HostGroup",
			"text": "groups",
			"parent": None,
		}
	else:
		params["parent"] = parentGroup
		where = and_(where, text("g.parentGroupId = :parent"))  # type: ignore
		where_hosts = text("og.groupId = :parent")  # type: ignore
		root_group = {
			"id": parentGroup,
			"type": "HostGroup",
			"text": parentGroup,
			"parent": None,
		}

	for idx, depot in enumerate(params["depots"]):
		params[f"depot{idx}"] = f"%{depot}%"
		if idx > 0:
			where_depots = or_(where_depots, text(f"cs.values LIKE :depot{idx}"))  # type: ignore[assignment]
		else:
			where_depots = text(f"cs.values LIKE :depot{idx}")
		if depot == get_configserver_id():
			where_depots = or_(where_depots, text("cs.values IS NULL"))  # type: ignore[assignment]

	with mysql.session() as session:
		if recursiveMembers and parentGroup and parentGroup not in ("root", "not_assigned"):
			group_rows = session.execute(
				select(
					text(
						"""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id
			"""
					)
				)
				.select_from(table("GROUP").alias("g"))
				.where(text("g.`type` = 'HostGroup'"))
			).fetchall()

			raw_group_rows = [dict(row) for row in group_rows if row]
			if restricted and parentGroup.lower() not in (allowed_children or set()) and parentGroup != "clientdirectory":
				return RESTResponse(
					data={
						"groups": {
							"id": parentGroup,
							"type": "HostGroup",
							"text": parentGroup,
							"parent": None,
							"children": {},
						},
						"members": [],
					}
				)

			descendant_group_ids = get_all_children_groupids(raw_group_rows, [parentGroup.lower()])
			normalized_to_actual = {str(row["group_id"]).lower(): str(row["group_id"]) for row in raw_group_rows if row.get("group_id")}
			actual_group_ids = [normalized_to_actual[group_id] for group_id in descendant_group_ids if group_id in normalized_to_actual]
			if parentGroup not in actual_group_ids:
				actual_group_ids.append(parentGroup)

			if restricted:
				actual_group_ids = [
					group_id
					for group_id in actual_group_ids
					if group_id == "clientdirectory" or group_id.lower() in (allowed_children or set())
				]

			object_where = [text("og.groupType = 'HostGroup'")]
			recursive_params: dict[str, Any] = dict(params)
			group_conditions = []
			for idx, group_id in enumerate(actual_group_ids):
				param_name = f"group_{idx}"
				recursive_params[param_name] = group_id
				group_conditions.append(text(f"og.groupId = :{param_name}"))

			if not group_conditions:
				return RESTResponse(
					data={
						"groups": {
							"id": parentGroup,
							"type": "HostGroup",
							"text": parentGroup,
							"parent": None,
							"children": {},
						},
						"members": [],
					}
				)

			object_query = (
				select(text("DISTINCT og.objectId AS object_id"))
				.select_from(table("OBJECT_TO_GROUP").alias("og"))
				.join(
					table("CONFIG_STATE").alias("cs"),
					and_(
						text("og.objectId = cs.objectId"),
						or_(
							text("cs.configId = 'clientconfig.depot.id'"),
							text("cs.values IS NULL"),
						),
						where_depots,
					),
					isouter=True,
				)
				.where(and_(*object_where, or_(*group_conditions), where_depots))
			)
			member_rows = session.execute(object_query, recursive_params).fetchall()
			members = sorted({str(row["object_id"]) for row in member_rows if row and row["object_id"]})
			if parentGroup == "clientdirectory":
				# Include clients that are not assigned to any subgroup.
				# Otherwise selecting "clientdirectory" would miss the synthetic
				# "not_assigned" branch members.
				members = sorted(set(members).union(group_get_all_clients("clientdirectory", params["depots"])))
			return RESTResponse(
				data={
					"groups": {
						"id": parentGroup,
						"type": "HostGroup",
						"text": parentGroup,
						"parent": None,
						"children": {},
					},
					"members": members,
				}
			)

		if parentGroup and parentGroup not in ("root", "not_assigned"):
			child_groups_query = (
				select(
					text(  # type: ignore[arg-type]
						"""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id
			"""
					)
				)
				.select_from(table("GROUP").alias("g"))
				.where(where)
			)
			child_group_rows = session.execute(child_groups_query, params).fetchall()

			child_group_ids = [row["group_id"] for row in child_group_rows if row and row["group_id"]]
			member_counts: dict[str, int] = {}
			if child_group_ids:
				count_params = {**params, "group_ids": child_group_ids}
				count_query = (
					select(
						text(  # type: ignore[arg-type]
							"""
					og.groupId AS group_id,
					COUNT(*) AS member_count
				"""
						)
					)
					.select_from(table("OBJECT_TO_GROUP").alias("og"))
					.where(
						and_(
							text("og.groupType = 'HostGroup'"),
							text("og.groupId IN :group_ids"),
						)
					)
					.group_by(text("og.groupId"))
				)
				count_result = session.execute(count_query, count_params).fetchall()
				member_counts = {row["group_id"]: int(row["member_count"] or 0) for row in count_result if row is not None}

			member_rows = []
			if withClients:
				member_query = (
					select(
						text(  # type: ignore[arg-type]
							"""
					og.objectId AS object_id
				"""
						)
					)
					.select_from(table("OBJECT_TO_GROUP").alias("og"))
					.where(text("og.groupId = :parent"))
				)
				member_rows = session.execute(member_query, params).fetchall()

			host_groups: dict[str, Any] = {
				"id": parentGroup,
				"type": "HostGroup",
				"text": parentGroup,
				"parent": None,
				"children": {},
			}

			if restricted and parentGroup.lower() not in (allowed_children or set()) and parentGroup != "clientdirectory":
				return RESTResponse(data={"groups": host_groups})

			for row in child_group_rows:
				group_id = row["group_id"]
				if not group_id:
					continue
				if restricted and group_id.lower() not in (allowed_children or set()) and group_id != "clientdirectory":
					continue
				host_groups["children"][group_id] = {
					"id": f"{group_id};{parentGroup.lower()}",
					"type": "HostGroup",
					"text": group_id,
					"parent": parentGroup,
					"children": None,
					"member_count": member_counts.get(group_id, 0),
				}

			if withClients:
				for row in member_rows:
					object_id = row["object_id"]
					if not object_id:
						continue
					if object_id == parentGroup or object_id in host_groups["children"]:
						continue
					host_groups["children"][object_id] = {
						"id": f"{object_id};{parentGroup.lower()}",
						"type": "ObjectToGroup",
						"text": object_id,
						"parent": parentGroup,
						"allowed": True,
					}

			return RESTResponse(data={"groups": host_groups})

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
				"groups": {
					"id": "groups",
					"type": "HostGroup",
					"text": "groups",
					"parent": None,
					"children": None,
				},
				"clientdirectory": {
					"id": "clientdirectory",
					"type": "HostGroup",
					"text": "clientdirectory",
					"parent": None,
					"children": None,
				},
				"clientlist": {
					"id": "clientlist",
					"type": "HostGroup",
					"text": "clientlist",
					"parent": None,
					"children": None,
				},
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
			clients = group_get_all_clients("clientdirectory", params["depots"])
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


def group_get_all_clients(group: str, depots: list | None = None) -> list:
	clients = set()
	all_clients = set()

	username = get_username()
	restricted = user_register() and host_group_access_configured(username)
	allowed_clients = None
	if restricted:
		allowed_clients = get_allowed_sql(username)
		if not allowed_clients:
			return []

	with mysql.session() as session:
		# Fetch the whole group hierarchy and all group memberships once, instead of
		# issuing 2 queries per group node while walking the tree.
		group_rows = session.execute(
			select(text("g.groupId AS group_id, g.parentGroupId AS parent_id")).select_from(table("GROUP").alias("g"))
		).fetchall()
		children_by_parent: dict[str, list[str]] = {}
		for row in group_rows:
			if row:
				row_dict = dict(row)
				children_by_parent.setdefault(row_dict.get("parent_id"), []).append(row_dict.get("group_id"))

		groups: set = set()
		to_visit = [group]
		while to_visit:
			group_id = to_visit.pop()
			if group_id in groups:
				continue
			groups.add(group_id)
			to_visit.extend(children_by_parent.get(group_id, []))

		member_rows = session.execute(
			select(text("objectId")).select_from(table("OBJECT_TO_GROUP")).where(text("groupId IN :group_ids")),
			{"group_ids": list(groups)},
		).fetchall()
		for row in member_rows:
			if row:
				object_id = dict(row).get("objectId")
				if object_id:
					clients.add(object_id)

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


@api_router.get("/api/opsidata/hosts/groups/id")
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
			.where(text("g.groupId = :group"))
		)  # pylint: disable=redefined-outer-name
		result = session.execute(query, {"group": group})
		parent_id = result.fetchone()
		if parent_id:
			return parent_id["parent_id"]
		return None


@api_router.get("/api/opsidata/servers", response_model=list[Server])
@rest_api
def get_server_data(
	commons: dict = Depends(common_query_parameters),
	servers: list[str] = Depends(parse_server_list),
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get server data.
	"""
	params = {"servers": [], "search": ""}
	where = text("1=1")
	if commons.get("filterQuery"):
		params["search"] = f"%{commons.get('filterQuery')}%"
		where = text("h.hostId LIKE :search OR h.description LIKE :search")
	if servers:
		params["servers"] = servers
		where = and_(text("h.hostId in :servers"))  # type: ignore

	username = get_username()
	if user_register() and depot_access_configured(username):
		allowed_depots = get_allowed_depots(username)
		if not allowed_depots:
			return RESTResponse(data=[])
		params["allowed_depots"] = allowed_depots
		where = and_(where, text("h.hostId IN :allowed_depots"))  # type: ignore

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
				for key in row_dict:
					if key == "isMasterDepot":
						row_dict[key] = bool(row_dict.get(key, 0))
					if isinstance(row_dict.get(key), (datetime.date, datetime.datetime)):
						row_dict[key] = row_dict.get(key, datetime.datetime(2000, 1, 1, 0, 0)).isoformat()

				host_data.append(row_dict)
		return RESTResponse(data=host_data)


@api_router.put("/api/opsidata/servers/{server_id}")
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
				.where(text("hostId = :server_id"))
				.values(values)
			)
			session.execute(query, {"server_id": server_id})

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
				message="Could not update client object.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
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
