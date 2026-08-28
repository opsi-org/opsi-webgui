# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui depot methods
"""

from typing import Any

from fastapi import APIRouter, Depends, Request, status
from opsiconfd.config import get_configserver_id
from opsiconfd.rest import (
	RESTErrorResponse,
	RESTResponse,
	common_query_parameters,
	order_by,
	pagination,
	rest_api,
)
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, or_, select, table, text  # type: ignore[import]

from ..utils import (
	backend,
	depot_access_configured,
	filter_depot_access,
	get_allowed_depots,
	get_allowed_group_objects,
	get_username,
	host_group_access_configured,
	mysql,
	parse_depot_list,
	parse_filter_query,
	parse_selected_list,
	user_register,
)

api_router = APIRouter()


class Depot(BaseModel):  # pylint: disable=too-few-public-methods
	depotId: str
	ident: str
	type: str
	ip: str
	description: str


class DepotClientCount(BaseModel):  # pylint: disable=too-few-public-methods
	depotId: str
	clientCount: int


def get_depots(username: str | None = None) -> list[str]:
	with mysql.session() as session:
		query = "SELECT hostId FROM HOST WHERE `type` IN ('OpsiConfigserver', 'OpsiDepotserver') ORDER BY hostId"
		result = session.execute(query).fetchall()
		result = [row[0] for row in result if row is not None]

		if username and user_register() and depot_access_configured(username):
			allowed_depots = get_allowed_depots(username)
			for depot in result.copy():
				if depot not in allowed_depots:
					result.remove(depot)
		return result


@api_router.get("/api/opsidata/depot_ids", response_model=list[str])
@rest_api
def depot_ids(request: Request) -> RESTResponse:
	"""
	Get all depotIds.
	"""
	# TODO Item "None" of "Optional[Any]" has no attribute "user_store"  [union-attr]mypy(error)
	# username = request.scope.get("session", OPSISession("0.0.0.0", 4447)).username
	username = get_username()
	depot_list = get_depots(username)

	return RESTResponse(data=depot_list)


@api_router.get("/api/opsidata/depots", response_model=list[Depot])
@rest_api
def depots(
	request: Request,
	commons: dict = Depends(common_query_parameters),
	selected: list[str] | None = Depends(parse_selected_list),
	onlySelected: bool = False,
	serverTypeFilter: str | None = None,
) -> RESTResponse:
	"""
	Get all depots with depotId, ident, type, ip and description.
	"""
	params = {"selected": [""], "search": ""}
	if selected:
		params["selected"] = selected

	with mysql.session() as session:
		where = and_(text("h.type IN ('OpsiConfigserver', 'OpsiDepotserver')"))

		filter_query = parse_filter_query(commons.get("filterQuery"))
		if isinstance(filter_query, dict):
			for field, column in (("id", "h.hostId"), ("description", "h.description")):
				value = filter_query.get(field)
				if isinstance(value, list):
					params[f"filter_{field}"] = value
					where = and_(where, text(f"{column} IN :filter_{field}"))
				elif value:
					params[f"filter_{field}"] = f"%{value}%"
					where = and_(where, text(f"{column} LIKE :filter_{field}"))
		elif filter_query:
			# Free text search covers every column the server table can display.
			where = and_(
				where,
				text(
					"(h.hostId LIKE :search OR h.description LIKE :search OR h.notes LIKE :search "
					"OR h.ipAddress LIKE :search OR h.hardwareAddress LIKE :search OR h.inventoryNumber LIKE :search)"
				),
			)
			params["search"] = f"%{filter_query}%"
		if serverTypeFilter in ("OpsiConfigserver", "OpsiDepotserver"):
			where = and_(where, text("h.type = :server_type"))
			params["server_type"] = serverTypeFilter
		if onlySelected and selected:
			where = and_(where, text("h.hostId IN :selected"))

		# Restrict rows for users with limited depot access BEFORE pagination,
		# so paginated data and total stay consistent (otherwise the frontend
		# infinite scroll keeps requesting pages that come back empty).
		username = get_username()
		if user_register() and depot_access_configured(username):
			where = and_(where, text("h.hostId IN :allowed_depots"))
			params["allowed_depots"] = get_allowed_depots(username) or [""]

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
		if selected and selected != [""]:
			depot_select = depot_select.order_by(text("selected DESC"))
		query = order_by(depot_select, commons)  # type: ignore
		query = pagination(query, commons)

		result = session.execute(query, params)
		result = result.fetchall()

		total = session.execute(
			select(text("COUNT(*)")).select_from(table("HOST").alias("h")).where(where),
			params,
		).fetchone()[0]  # type: ignore

		depot_list = [dict(row) for row in result if row is not None]

		return RESTResponse(data=depot_list, total=total)


@api_router.get("/api/opsidata/depots/clients", response_model=list[str])
@rest_api
@filter_depot_access
def clients_on_depots(
	request: Request,
	selectedDepots: list[str] = Depends(parse_depot_list),  # pylint: disable=invalid-name
) -> RESTResponse:
	"""
	Get all client ids on selected depots.
	"""

	if selectedDepots == []:
		return RESTResponse(data=[])

	params: dict[str, Any] = {}
	if selectedDepots is None:
		username = request.scope.get("session").username
		depots_raw = get_depots(username)
	else:
		depots_raw = selectedDepots

	depots: list[str] = []
	for depot in depots_raw or []:
		dep = str(depot).strip().strip('"').strip("'")
		if dep and dep not in depots:
			depots.append(dep)

	if len(depots) == 1 and depots[0].startswith("[") and depots[0].endswith("]"):
		raw = depots[0][1:-1]
		depots = []
		for item in raw.split(","):
			dep = item.strip().strip('"').strip("'")
			if dep and dep not in depots:
				depots.append(dep)

	params["depots"] = depots

	with mysql.session() as session:
		where = text("h.type='OpsiClient'")
		where_depots = None
		for idx, depot in enumerate(params["depots"]):
			params[f"depot{idx}"] = f"%{depot}%"
			if idx > 0:
				where_depots = or_(where_depots, text(f"cs.values LIKE :depot{idx}"))  # type: ignore
			else:
				where_depots = text(f"cs.values LIKE :depot{idx}")  # type: ignore
		if get_configserver_id() in params["depots"]:
			where_depots = or_(where_depots, text("cs.values IS NULL"))  # type: ignore

		where = and_(where, where_depots)  # type: ignore
		query = (
			select(text("h.hostId AS client"))  # type: ignore
			.select_from(table("HOST").alias("h"))
			.join(
				table("CONFIG_STATE").alias("cs"),
				text("h.hostId = cs.objectId AND cs.configId = 'clientconfig.depot.id'"),
				isouter=True,
			)
			.where(where)
		)

		result = session.execute(query, params)
		result = result.fetchall()

		clients = []  # pylint: disable=redefined-outer-name
		username = get_username()
		if user_register() and host_group_access_configured(username):
			allowed_clients = get_allowed_group_objects(username, "HostGroup")
			for row in result:
				if row is not None and dict(row).get("client") and allowed_clients and dict(row).get("client") in allowed_clients:
					clients.append(dict(row).get("client"))
			return RESTResponse(data=clients)
		for row in result:
			if row is not None and dict(row).get("client"):
				clients.append(dict(row).get("client"))
		return RESTResponse(data=clients)


@api_router.get("/api/opsidata/depots/client-counts", response_model=list[DepotClientCount])
@rest_api
@filter_depot_access
def client_counts_on_depots(
	request: Request,
	selectedDepots: list[str] = Depends(parse_depot_list),  # pylint: disable=invalid-name
) -> RESTResponse:
	"""
	Get client counts grouped by depot.
	"""

	if selectedDepots == []:
		return RESTResponse(data=[])

	username = get_username()
	depots_raw = selectedDepots if selectedDepots is not None else get_depots(username)
	depots: list[str] = []
	for depot in depots_raw or []:
		dep = str(depot).strip().strip('"').strip("'")
		if dep and dep not in depots:
			depots.append(dep)

	# Robust fallback for malformed single-item list values like "[depot1,depot2]"
	if len(depots) == 1 and depots[0].startswith("[") and depots[0].endswith("]"):
		raw = depots[0][1:-1]
		depots = []
		for item in raw.split(","):
			dep = item.strip().strip('"').strip("'")
			if dep and dep not in depots:
				depots.append(dep)

	if not depots:
		return RESTResponse(data=[])

	params = {
		"configserver_id": get_configserver_id(),
	}

	where = and_(text("h.type='OpsiClient'"))

	allowed_clients = None
	allowed_clients_set: set[str] | None = None
	if user_register() and host_group_access_configured(username):
		allowed_clients = get_allowed_group_objects(username, "HostGroup")
		if not allowed_clients:
			return RESTResponse(data=[])
		allowed_clients_set = set(allowed_clients)

	allowed_depots = set(depots)

	with mysql.session() as session:
		query = (
			select(
				text(  # type: ignore[arg-type]
					"""
                    h.hostId AS clientId,
                    COALESCE(
                        (
                            SELECT TRIM(TRAILING '"]' FROM TRIM(LEADING '["' FROM cs.`values`))
                            FROM CONFIG_STATE AS cs
                            WHERE cs.objectId = h.hostId AND cs.configId = 'clientconfig.depot.id'
                        ),
                        :configserver_id
                    ) AS depotId
                    """
				)
			)
			.select_from(table("HOST").alias("h"))
			.where(where)
		)

		rows = session.execute(query, params).fetchall()

		count_by_depot: dict[str, int] = {depot: 0 for depot in depots}
		for row in rows:
			if row is None:
				continue
			row_data = dict(row)
			client_id = row_data.get("clientId")
			depot_id = row_data.get("depotId")
			if not client_id or not depot_id or depot_id not in allowed_depots:
				continue
			if allowed_clients_set is not None and client_id not in allowed_clients_set:
				continue
			count_by_depot[depot_id] = count_by_depot.get(depot_id, 0) + 1

		data = [{"depotId": depot, "clientCount": count_by_depot.get(depot, 0)} for depot in sorted(count_by_depot.keys())]
		return RESTResponse(data=data)


@api_router.get("/api/opsidata/depots/products", response_model=list[str])
@rest_api
@filter_depot_access
def products_on_depots(
	request: Request,
	selectedDepots: list[str] = Depends(parse_depot_list),  # pylint: disable=invalid-name
	productType: str = "NetbootProduct",  # pylint: disable=invalid-name
) -> RESTResponse:
	"""
	Get all product ids on selected depots.
	"""

	if selectedDepots == []:
		return RESTResponse(data=[])

	if productType not in ("NetbootProduct", "LocalbootProduct"):
		return RESTErrorResponse(
			http_status=status.HTTP_400_BAD_REQUEST,
			message="Product type not recognised.",
		)

	products = [pod.serialize() for pod in backend.productOnDepot_getObjects(depotId=selectedDepots, productType=productType)]
	return RESTResponse(data=products)
