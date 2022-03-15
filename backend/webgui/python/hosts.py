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

from pydantic import BaseModel # pylint: disable=no-name-in-module
from sqlalchemy import select, union, text, and_, or_

from fastapi import APIRouter, Depends


# from opsiconfd.logging import logger
from opsiconfd.backend import get_mysql
from opsiconfd.rest import order_by, pagination, common_query_parameters, rest_api
from opsiconfd.application.utils import get_configserver_id, get_allowed_objects
from opsiconfd.logging import logger

from .utils import (
	parse_depot_list,
	parse_hosts_list,
	parse_client_list,
	build_tree
)

from .utils import mysql

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
	type: Optional[str] = None,
): # pylint: disable=redefined-builtin
	"""
	Get host data.
	"""
	params = {}
	where = text("")
	if commons.get("filterQuery"):
		params["search"] = f"%{commons.get('filterQuery')}%"
		where = text("h.hostId LIKE :search OR h.description LIKE :search")
	if hosts:
		params["hosts"] = hosts
		where = and_(text("h.hostId in :hosts"))
	if type:
		params["type"] = type
		where = and_(where, text("h.type = :type"))

	with mysql.session() as session:
		query = select(text("""
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
			h.oneTimePassword AS oneTimePassword
		"""))\
		.select_from(text("`HOST` AS h"))\
		.where(where) # pylint: disable=redefined-outer-name

		query = order_by(query, commons)
		query = pagination(query, commons)

		result = session.execute(query, params)
		result = result.fetchall()

		host_data = []
		for row in result:
			if row is not None:
				row_dict = dict(row)
				for key in row_dict.keys():
					if isinstance(row_dict.get(key), (datetime.date, datetime.datetime)):
						row_dict[key] = row_dict.get(key).isoformat()
				host_data.append(row_dict)

		return { "data": host_data }


@host_router.get("/api/opsidata/hosts/groups")
@rest_api
def get_host_groups(selectedDepots: List[str] = Depends(parse_depot_list), parentGroup: Optional[str] = [], selectedClients: List[str] = Depends(parse_client_list)): # pylint: disable=too-many-locals, too-many-branches, invalid-name, dangerous-default-value
	"""
	Get host groups as tree.
	If a parent group (parentGroup) is given only child groups will be returned.
	"""
	allowed = get_allowed_objects()

	params = {}
	if selectedDepots == [] or selectedDepots is None:
		params["depots"] = [get_configserver_id()]
	else:
		params["depots"] = selectedDepots

	root_group = {
		"id": "groups",
		"type": "HostGroup",
		"text": "groups",
		"parent": None
	}

	where = text("g.`type` = 'HostGroup'")

	if parentGroup:
		if parentGroup == "groups" :
			where = and_(where, text("g.parentGroupId IS NULL AND g.groupId != 'clientdirectory'"))
			where_hosts = text("og.groupId IS NULL")
		elif parentGroup== "root" :
			where = and_(where, text("g.parentGroupId IS NULL AND g.groupId = 'clientdirectory'"))
			where_hosts = text("og.groupId IS NULL")
			root_group = {
				"id": None,
				"type": "HostGroup",
				"text": None,
				"parent": None
			}
		else:
			params["parent"] = parentGroup
			where = and_(where, text("g.parentGroupId = :parent"))
			where_hosts = text("og.groupId = :parent")
			root_group = {
				"id": parentGroup,
				"type": "HostGroup",
				"text": parentGroup,
				"parent": None
			}

	for idx, depot in enumerate(params["depots"]):
		if idx > 0:
			where_depots = or_(where_depots,text(f"cs.values LIKE '%{depot}%'"))#
		else:
			where_depots = text(f"cs.values LIKE '%{depot}%'")

	with mysql.session() as session:

		if parentGroup and parentGroup != "root":
			query = union(select(text("""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id,
				NULL AS object_id
			"""))\
			.select_from(text("`GROUP` AS g"))\
			.where(where),
			select(text("""
				og.groupId AS group_id,
				og.groupId AS parent_Id,
				og.objectId AS object_id
			"""))\
			.select_from(text("OBJECT_TO_GROUP AS og"))\
			.where(where_hosts)
			)
			result = session.execute(query, params)
			result = result.fetchall()

			all_groups = read_groups(result, root_group, selectedClients)

		elif parentGroup == "root":
			all_groups = {
				'groups': 
					{'id': 'groups', 'type': 'HostGroup', 'text': 'groups', 'parent': None}, 
				'clientdirectory': 
					{'id': 'clientdirectory', 'type': 'HostGroup', 'text': 'clientdirectory', 'parent': None,}, 
				'clientlist': 
					{'id': 'clientlist', 'type': 'HostGroup', 'text': 'clientlist', 'parent': None,}
				}
			if selectedClients:
				all_groups["clientlist"]["hasAnySelection"] = True
		else:
			query = select(text("""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id,
				og.objectId AS object_id,
				TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`)) AS depot_id
			"""))\
			.select_from(text("`GROUP` AS g"))\
			.join(text("OBJECT_TO_GROUP AS og"), text("og.groupType = g.`type` AND og.groupId = g.groupId"), isouter=True)\
			.join(
				text("CONFIG_STATE AS cs"),
				and_(text("og.objectId = cs.objectId"), or_(text("cs.configId = 'clientconfig.depot.id'"),text("cs.values IS NULL")), where_depots),
				isouter=True)\
			.where(where)
			result = session.execute(query, params)
			result = result.fetchall()

			all_groups = read_groups(result, root_group, selectedClients)

		if selectedClients is not None:
			params = {}
			for idx, client in enumerate(selectedClients):
				if idx > 0:
					where = or_(where,text(f"og.objectId = '{client}'"))#
				else:
					where = text(f"og.objectId = '{client}'")
			query = select(text("""
				og.groupId AS group_id,
				og.groupId AS parent_Id,
				og.objectId AS object_id
			"""))\
			.select_from(text("`OBJECT_TO_GROUP` AS og"))\
			.where(where)

			result = session.execute(query)
			result = result.fetchall()

			groups_to_mark = []
			for row in result:
				groups_to_mark.append(row["group_id"])

			for parent_group in groups_to_mark: 
				while parent_group not in all_groups.keys() and parent_group is not None:
					parent_group = find_parent(parent_group)
				if parent_group:
					all_groups[parent_group]["hasAnySelection"] = True
				elif "groups" in all_groups.keys():
					all_groups["groups"]["hasAnySelection"] = True
			host_groups = build_tree(root_group, list(all_groups.values()), allowed["host_groups"], default_expanded=True)
		else:
			host_groups = build_tree(root_group, list(all_groups.values()), allowed["host_groups"])

		if parentGroup == "root":
			return {"data": {"groups": host_groups.get("children")}}
		return {"data": {"groups": host_groups}}


def find_parent(group):
	with mysql.session() as session:
		query = select(text("""
			g.parentGroupId AS parent_id,
			g.groupId AS group_id
		"""))\
		.select_from(text("`GROUP` AS g"))\
		.where(text(f"g.groupId = '{group}'")) # pylint: disable=redefined-outer-name
		result = session.execute(query)
		parent_id = result.fetchone()["parent_id"]
		return parent_id

def read_groups(raw_groups, root_group, selectedClients):
	all_groups = {}
	for row in raw_groups:
		if not row["group_id"] in all_groups:
			all_groups[row["group_id"]] = {
				"id": row["group_id"],
				"type": "HostGroup",
				"text": row["group_id"],
				"parent": row["parent_id"] or root_group["id"]
			}
		if row["object_id"]:
			if row["object_id"] in selectedClients:
				all_groups[row["group_id"]]["hasAnySelection"] = True
			if not "children" in all_groups[row["group_id"]]:
				all_groups[row["group_id"]]["children"] = {}
			if row.group_id == row.parent_id:
				if not row["object_id"] in all_groups:
					all_groups[row["object_id"]] = {
						"id": row["object_id"],
						"type": "ObjectToGroup",
						"text": row["object_id"],
						"parent": row["parent_id"] or root_group["id"]
					}
			else:
				all_groups[row["group_id"]]["children"][row["object_id"]] = {
					"id": row["object_id"],
					"type": "ObjectToGroup",
					"text": row["object_id"],
					"parent": row["group_id"]
				}
	return all_groups