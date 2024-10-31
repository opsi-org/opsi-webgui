# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui depot methods
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, or_, select, table, text  # type: ignore[import]

from opsiconfd.config import get_configserver_id
from opsiconfd.rest import (
	RESTErrorResponse,
	RESTResponse,
	common_query_parameters,
	order_by,
	pagination,
	rest_api,
)
from opsiconfd.session import OPSISession

from .utils import (
	backend,
	depot_access_configured,
	filter_depot_access,
	get_allowed_depots,
	get_allowed_clients,
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


def get_depots(username: str | None = None) -> List[str]:
	with mysql.session() as session:
		query = "SELECT hostId FROM HOST WHERE `type` IN ('OpsiConfigserver', 'OpsiDepotserver') ORDER BY hostId"
		result = session.execute(query).fetchall()
		result = [row[0] for row in result if row is not None]

		if username and user_register() and depot_access_configured(username):
			allowed_depots = get_allowd_depots(username)
			for depot in result.copy():
				if depot not in allowed_depots:
					result.remove(depot)
		return result


@depot_router.get("/api/opsidata/depot_ids", response_model=List[str])
@rest_api
def depot_ids(request: Request) -> RESTResponse:
	"""
	Get all depotIds.
	"""
	# TODO Item "None" of "Optional[Any]" has no attribute "user_store"  [union-attr]mypy(error)
	username = request.scope.get("session", OPSISession("0.0.0.0", 4447)).username
	depot_list = get_depots(username)

	return RESTResponse(data=depot_list)


@depot_router.get("/api/opsidata/depots", response_model=List[Depot])
@rest_api
def depots(
	request: Request, commons: dict = Depends(common_query_parameters), selected: Optional[List[str]] = Depends(parse_selected_list)
) -> RESTResponse:
	"""
	Get all depots with depotId, ident, type, ip and description.
	"""
	params = {"selected": [""], "search": ""}
	if selected:
		params["selected"] = selected

	with mysql.session() as session:
		where = and_(text("h.type IN ('OpsiConfigserver', 'OpsiDepotserver')"))

		if commons.get("filterQuery"):
			where = and_(where, text("(h.hostId LIKE :search OR h.description LIKE :search)"))
			params["search"] = f"%{commons['filterQuery']}%"

		depot_select = (
			select(
				text(  # type: ignore
					"""
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
			"""
				)
			)
			.select_from(table("HOST").alias("h"))
			.where(where)
		)
		query = order_by(depot_select, commons)  # type: ignore
		query = pagination(query, commons)

		result = session.execute(query, params)
		result = result.fetchall()

		total = session.execute(select(text("COUNT(*)")).select_from(table("HOST").alias("h")).where(where), params).fetchone()[0]  # type: ignore

		depot_list = []
		# TODO Item "None" of "Optional[Any]" has no attribute "user_store"  [union-attr]mypy(error)
		username = request.scope.get("session").username  # type: ignore
		if user_register() and depot_access_configured(username):
			allowed_depots = get_allowd_depots(username)
			for row in result:
				if row is not None:
					depot_data = dict(row)
					if depot_data.get("depotId") in allowed_depots:
						depot_list.append(depot_data)
		else:
			depot_list = [dict(row) for row in result if row is not None]

		return RESTResponse(data=depot_list, total=total)


@depot_router.get("/api/opsidata/depots/clients", response_model=List[str])
@rest_api
@filter_depot_access
def clients_on_depots(
	request: Request, selectedDepots: List[str] = Depends(parse_depot_list)  # pylint: disable=invalid-name
) -> RESTResponse:
	"""
	Get all client ids on selected depots.
	"""

	if selectedDepots == []:
		return RESTResponse(data=[])

	params = {}
	if selectedDepots is None:
		username = request.scope.get("session").username
		params["depots"] = get_depots(username)
	else:
		params["depots"] = selectedDepots

	with mysql.session() as session:
		where = text("h.type='OpsiClient'")
		where_depots = None
		for idx, depot in enumerate(params["depots"]):
			if idx > 0:
				where_depots = or_(where_depots, text(f"cs.values LIKE '%{depot}%'"))  # type: ignore
			else:
				where_depots = text(f"cs.values LIKE '%{depot}%'")  # type: ignore
		if get_configserver_id() in params["depots"]:
			where_depots = or_(where_depots, text("cs.values IS NULL"))  # type: ignore

		where = and_(where, where_depots)  # type: ignore
		query = (
			select(text("h.hostId AS client"))  # type: ignore
			.select_from(table("HOST").alias("h"))
			.join(table("CONFIG_STATE").alias("cs"), text("h.hostId = cs.objectId AND cs.configId = 'clientconfig.depot.id'"), isouter=True)
			.where(where)
		)

		result = session.execute(query, params)
		result = result.fetchall()

		clients = []  # pylint: disable=redefined-outer-name
		username = get_username()
		if user_register() and host_group_access_configured(username):
			allowed_clients = get_allowed_clients(username)
			for row in result:
				if row is not None and dict(row).get("client") and dict(row).get("client") in allowed_clients:
					clients.append(dict(row).get("client"))
			return RESTResponse(data=clients)
		for row in result:
			if row is not None and dict(row).get("client"):
				clients.append(dict(row).get("client"))
		return RESTResponse(data=clients)


@depot_router.get("/api/opsidata/depots/products", response_model=List[str])
@rest_api
@filter_depot_access
def products_on_depots(
	request: Request,
	selectedDepots: List[str] = Depends(parse_depot_list),  # pylint: disable=invalid-name
	productType: str = "NetbootProduct",  # pylint: disable=invalid-name
) -> RESTResponse:
	"""
	Get all product ids on selected depots.
	"""

	if selectedDepots == []:
		return RESTResponse(data=[])

	if productType not in ("NetbootProduct", "LocalbootProduct"):
		return RESTErrorResponse(http_status=status.HTTP_400_BAD_REQUEST, message="Product type not recognised.")

	products = [pod.serialize() for pod in backend.productOnDepot_getObjects(depotId=selectedDepots, productType=productType)]
	return RESTResponse(data=products)
