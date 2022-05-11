# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui depot methods
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Request
from opsiconfd.application.utils import get_configserver_id
from opsiconfd.backend import get_mysql
from opsiconfd.logging import logger
from opsiconfd.rest import common_query_parameters, order_by, pagination, rest_api
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, or_, select, text

from .utils import (
	depot_access_configured,
	filter_depot_access,
	get_allowd_depots,
	get_allowd_host_groups,
	get_allowed_objects,
	get_username,
	host_group_access_configured,
	mysql,
	parse_depot_list,
	parse_selected_list,
	user_register,
)

depot_router = APIRouter()


class Depot(BaseModel):  # pylint: disable=too-few-public-methods
	depotId: str
	ident: str
	type: str
	ip: str
	description: str


def get_depots(username: str = None):
	with mysql.session() as session:
		query = (
			"SELECT hostId FROM HOST "
			"WHERE `type` IN ('OpsiConfigserver', 'OpsiDepotserver') "
			"ORDER BY hostId"
		)
		result = session.execute(query).fetchall()
		result = [row[0] for row in result if row is not None]

		if username and user_register() and depot_access_configured(username):
			allowed_depots = get_allowd_depots(username)
			for depot in result.copy():
				logger.devel(depot)
				if depot not in allowed_depots:
					result.remove(depot)
		return result


@depot_router.get("/api/opsidata/depot_ids", response_model=List[str])
@rest_api
def depot_ids(request: Request):
	"""
	Get all depotIds.
	"""

	username = request.scope.get("session").user_store.username
	depots = get_depots(username)

	return {"data": depots}


@depot_router.get("/api/opsidata/depots", response_model=List[Depot])
@rest_api
def depots(request: Request, commons: dict = Depends(common_query_parameters), selected: Optional[List[str]] = Depends(parse_selected_list)):
	"""
	Get all depots with depotId, ident, type, ip and description.
	"""
	params = {}
	if selected:
		params["selected"] = selected
	else:
		params["selected"] = [""]

	with mysql.session() as session:
		where = text("h.type IN ('OpsiConfigserver', 'OpsiDepotserver')")

		if commons.get("filterQuery"):
			where = and_(
				where,
				text("(h.hostId LIKE :search OR h.description LIKE :search)")
			)
			params["search"] = f"%{commons['filterQuery']}%"

		query = select(text("""
				h.hostId AS depotId,
				h.hostId AS ident,
				h.type,
				h.ipAddress AS ip,
				h.description,
				IF(
					h.hostId IN :selected,
					TRUE,
					FALSE
				) AS selected
			"""))\
			.select_from(text("HOST AS h"))\
			.where(where)
		query = order_by(query, commons)
		query = pagination(query, commons)

		result = session.execute(query, params)
		result = result.fetchall()

		total = session.execute(
			select(text("COUNT(*)"))\
			.select_from(text("HOST AS h"))\
			.where(where),
			params
		).fetchone()[0]

		depot_list = []
		username = request.scope.get("session").user_store.username
		if user_register() and depot_access_configured(username):
			allowed_depots = get_allowd_depots(username)
			for row in result:
				if row is not None:
					depot_data = dict(row)
					if depot_data.get("depotId") in allowed_depots:
						depot_list.append(depot_data)
		else:
			depot_list =  [dict(row) for row in result if row is not None]

		return {
				"data": depot_list,
				"total": total
			}


@depot_router.get("/api/opsidata/depots/clients", response_model=List[str])
@rest_api
@filter_depot_access
def clients_on_depots(request: Request, selectedDepots: List[str] = Depends(parse_depot_list)): # pylint: disable=invalid-name
	"""
	Get all client ids on selected depots.
	"""

	if selectedDepots == []:
		return {"data": []}

	params = {}
	if selectedDepots is None:
		username = request.scope.get("session").user_store.username
		params["depots"] = get_depots(username)
	else:
		params["depots"] = selectedDepots

	with mysql.session() as session:
		where = text("h.type='OpsiClient'")
		where_depots = None
		for idx, depot in enumerate(params["depots"]):
			if idx > 0:
				where_depots = or_(where_depots, text(f"cs.values LIKE '%{depot}%'"))
			else:
				where_depots = text(f"cs.values LIKE '%{depot}%'")
		if get_configserver_id() in params["depots"]:
			where_depots = or_(where_depots, text("cs.values IS NULL"))

		where = and_(where, where_depots)
		query = select(text("h.hostId AS client"))\
			.select_from(text("HOST AS h"))\
			.join(text("CONFIG_STATE AS cs"), text("h.hostId = cs.objectId AND cs.configId = 'clientconfig.depot.id'"), isouter=True)\
			.where(where)

		result = session.execute(query, params)
		result = result.fetchall()

		clients = [] # pylint: disable=redefined-outer-name
		username = get_username()
		if user_register() and host_group_access_configured(username):

			allowed_groups = get_allowd_host_groups(username)
			allowed_clients = []
			for group in allowed_groups:
				query = select(text("otg.objectId AS client"))\
					.select_from(text("OBJECT_TO_GROUP AS otg"))\
					.where(text(f"otg.groupId='{group}'"))
				otg_result = session.execute(query, params)
				otg_result = otg_result.fetchall()
				for otg_row in otg_result:
					if otg_row is not None:
						allowed_clients.append(dict(otg_row).get("client"))

			for row in result:
				if row is not None:

					if dict(row).get("client") and dict(row).get("client") in allowed_clients:
						clients.append(dict(row).get("client"))
		else:
			for row in result:
				if row is not None:
					if dict(row).get("client"):
						clients.append( dict(row).get("client"))

		return {"data": clients}
