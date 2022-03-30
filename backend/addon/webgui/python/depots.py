# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui depot methods
"""

from typing import List, Optional
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import select, text, and_, or_

from fastapi import APIRouter, Depends

from opsiconfd.backend import get_mysql
from opsiconfd.rest import order_by, pagination, common_query_parameters, rest_api
from opsiconfd.application.utils import get_configserver_id

from .utils import (
	parse_depot_list,
	parse_selected_list
)

from .utils import mysql

depot_router = APIRouter()

class Depot(BaseModel):  # pylint: disable=too-few-public-methods
	depotId: str
	ident: str
	type: str
	ip: str
	description: str


@depot_router.get("/api/opsidata/depot_ids", response_model=List[str])
@rest_api
def depot_ids():
	"""
	Get all depotIds.
	"""
	with mysql.session() as session:
		query = (
			"SELECT hostId FROM HOST "
			"WHERE `type` IN ('OpsiConfigserver', 'OpsiDepotserver') "
			"ORDER BY hostId"
		)
		result = session.execute(query).fetchall()
		result = [ row[0] for row in result if row is not None ]
		return {"data": result}


@depot_router.get("/api/opsidata/depots", response_model=List[Depot])
@rest_api
def depots(commons: dict = Depends(common_query_parameters), selected: Optional[List[str]] = Depends(parse_selected_list)):
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

		return {
				"data": [ dict(row) for row in result if row is not None ],
				"total": total
			}


@depot_router.get("/api/opsidata/depots/clients", response_model=List[str])
@rest_api
def clients_on_depots(selectedDepots: List[str] = Depends(parse_depot_list)): # pylint: disable=invalid-name
	"""
	Get all client ids on selected depots.
	"""

	params = {}
	if selectedDepots == [] or selectedDepots is None:
		params["depots"] = [get_configserver_id()]
	else:
		params["depots"] = selectedDepots

	with mysql.session() as session:
		where = text("h.type='OpsiClient'")
		for idx, depot in enumerate(params["depots"]):
			if idx > 0:
				where_depots = or_(where_depots,text(f"cs.values LIKE '%{depot}%'"))#
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
		for row in result:
			if row is not None:
				if dict(row).get("client"):
					clients.append( dict(row).get("client"))

		return { "data": clients }
