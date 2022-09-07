# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui host methods
"""

import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, or_, select, table, text, union

from opsiconfd.application.utils import get_configserver_id
from opsiconfd.rest import (
	RESTResponse,
	common_query_parameters,
	order_by,
	pagination,
	rest_api,
)

from .utils import (
	build_tree,
	get_allowed_objects,
	mysql,
	parse_client_list,
	parse_depot_list,
	parse_hosts_list,
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
			for idx, client in enumerate(selectedClients):
				if idx > 0:
					where = or_(where, text(f"og.objectId = '{client}'"))  # type: ignore[assignment]
				else:
					where = text(f"og.objectId = '{client}'")
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

			result = session.execute(query)
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

		if parentGroup == "root":
			return RESTResponse(data={"groups": host_groups.get("children")})
		return RESTResponse(data={"groups": host_groups})


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
