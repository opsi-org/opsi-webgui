# -*- coding: utf-8 -*- # pylint: disable=too-many-lines

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui product methods
"""

import json
from functools import lru_cache
from typing import Dict, List, Optional, Tuple, Union

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import alias, and_, column, select, text  # type: ignore[import]
from sqlalchemy.dialects.mysql import insert  # type: ignore[import]
from sqlalchemy.sql.expression import table, update  # type: ignore[import]

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

from .depots import get_depots
from .utils import (
	backend,
	bool_value,
	filter_depot_access,
	get_allowd_product_groups,
	get_allowed_products,
	get_depot_of_client,
	get_username,
	merge_dicts,
	mysql,
	parse_client_list,
	parse_depot_list,
	parse_selected_list,
	product_group_access_configured,
	read_only_check,
	unicode_value,
	user_register,
)

product_router = APIRouter()


@lru_cache(maxsize=1000)
def depot_get_product_version(depot: str, product: str) -> Union[str, None]:
	version = None
	params = {}
	with mysql.session() as session:
		params["depot"] = depot
		params["product"] = product
		where = text("pod.depotId = :depot AND pod.productId = :product")

		query = (
			select(text("CONCAT(pod.productVersion,'-',pod.packageVersion) AS version"))  # type: ignore[arg-type]
			.select_from(table("PRODUCT_ON_DEPOT").alias("pod"))
			.where(where)
		)

		result = session.execute(query, params)
		result = result.fetchone()

		if result:
			version = dict(result).get("version")

		return version


def get_product_description(product: str, product_version: str, package_version: str) -> Tuple[str, str]:
	description = None
	params = {}
	with mysql.session() as session:
		params["product"] = product
		params["product_version"] = product_version
		params["package_version"] = package_version
		where = text("p.productId = :product AND p.productVersion = :product_version AND p.packageVersion = :package_version")

		query = select(text("description, advice")).select_from(table("PRODUCT").alias("p")).where(where)

		result = session.execute(query, params)
		result = result.fetchone()

		if result:
			description = dict(result).get("description", "")
			advice = dict(result).get("advice", "")
			return (description, advice)

		return ("", "")


@lru_cache(maxsize=1000)
def get_product_type(product_id: str, product_version: str, package_version: str) -> Union[str, None]:
	with mysql.session() as session:
		query = (
			select(text("type"))
			.select_from(text("PRODUCT"))
			.where(text("productId = :product_id AND productVersion = :product_version AND packageVersion = :package_version"))
		)

		result = session.execute(query, {"product_id": product_id, "product_version": product_version, "package_version": package_version})
		res = result.fetchone()
		if not res:
			return None
		return res[0]


def get_product_actions(product: str, version: str, package_version: str) -> List[str]:
	params = {}
	params["product"] = product
	params["version"] = version
	params["package_version"] = package_version
	where = text("productId = :product AND productVersion = :version AND packageVersion = :package_version")

	with mysql.session() as session:
		actions = []
		query = (
			select(
				text(
					"""
			CONCAT_WS(',',
				IF(setupScript <> '','setup', NULL),
				IF(uninstallScript <> '','uninstall',NULL),
				IF(updateScript <> '','update',NULL),
				IF(alwaysScript <> '','always',NULL),
				IF(customScript <> '','custom',NULL),
				IF(onceScript <> '','once',NULL),
				"none"
			) as actions
		"""
				)
			)
			.select_from(text("PRODUCT"))
			.where(where)
		)

		result = session.execute(query, params)
		result = result.fetchone()

		if result:
			actions = dict(result).get("actions", "").split(",")
		return actions


def is_product_on_depot(product: str, version: str, package_version: str, depot: str) -> bool:
	params = {}
	params["product"] = product
	params["version"] = version
	params["package_version"] = package_version
	params["depot"] = depot

	with mysql.session() as session:
		query = (
			select(text("productId"))
			.select_from(text("PRODUCT_ON_DEPOT"))
			.where(
				text(
					"""
				productId = :product AND
				productVersion = :version AND
				packageVersion = :package_version AND
				depotId = :depot
			"""
				)
			)
		)

	result = session.execute(query, params)
	result = result.fetchone()

	if result:
		return True
	return False


class Product(BaseModel):  # pylint: disable=too-few-public-methods
	productId: str
	name: str
	description: str
	advice: str
	selectedDepots: List[str]
	depotVersions: List[str]
	depot_version_diff: bool
	not_on_all_depots: bool
	selctedClients: List[str]
	clientVersions: List[str]
	client_version_outdated: bool
	actions: List[str]
	productType: str
	installationStatus: str
	actionRequest: str
	actionProgress: str
	actionResult: str


@product_router.get("/api/opsidata/products", response_model=List[Product])
@rest_api
@filter_depot_access
def products(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name, unused-argument, too-many-arguments
	request: Request,
	commons: dict = Depends(common_query_parameters),
	type: str = "LocalbootProduct",
	selectedClients: List[str] = Depends(parse_client_list),
	selectedDepots: List[str] = Depends(parse_depot_list),
	selected: Optional[List[str]] = Depends(parse_selected_list),
) -> RESTResponse:
	"""
	Get products from selected depots and clients.
	"""

	if selectedDepots == []:
		return RESTResponse(data=[], total=0)
	username = get_username()
	params = {"clients": [""], "client_count": 0, "depots": [""], "product_type": str}
	params["product_type"] = type
	if selectedClients == [] or selectedClients is None:
		params["clients"] = [""]
		params["client_count"] = 0
	else:
		params["clients"] = selectedClients
		params["client_count"] = len(selectedClients)
	if selectedDepots is None:
		params["depots"] = get_depots(username)
	else:
		params["depots"] = selectedDepots
	if selected:
		params["selected"] = selected
	else:
		params["selected"] = [""]
	allowed_products = None

	params["num_depots"] = len(selectedDepots)

	if user_register() and product_group_access_configured(username):
		allowed_products = get_allowed_products(username)

	with mysql.session() as session:
		where = text("pod.depotId IN :depots AND pod.producttype = :product_type")
		if commons.get("filterQuery"):
			where = and_(where, text("(pod.productId LIKE :search)"))
			params["search"] = f"%{commons['filterQuery']}%"
		if allowed_products:
			params["allowed_products"] = allowed_products
			where = and_(where, text("(pod.productId in :allowed_products)"))
		query = (
			select(
				text(
					"""
			pod.productId AS productId,
			pr.name AS name,
			pr.priority AS priority,
			pr.description AS description,
			pr.advice AS advice,
			GROUP_CONCAT(pod.depotId SEPARATOR ',') AS selectedDepots,
			(
				SELECT GROUP_CONCAT(poc.clientId SEPARATOR ',')
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.clientId IN :clients AND poc.productId=pod.productId
				ORDER BY poc.clientId
			) AS selectedClients,
			(
				SELECT GROUP_CONCAT(IFNULL(poc.installationStatus, "not_installed") SEPARATOR ',')
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
				ORDER BY poc.clientId
			) AS installationStatusDetails,
			(
				SELECT IF(GROUP_CONCAT(IFNULL(poc.installationStatus, "not_installed") SEPARATOR ',') LIKE '%unknown%',
					1,
					IF(GROUP_CONCAT(IFNULL(poc.installationStatus, "not_installed") SEPARATOR ',') LIKE '%,installed%' OR GROUP_CONCAT(IFNULL(poc.installationStatus, "not_installed") SEPARATOR ',') LIKE 'installed%',
						0,
						2
					)
				)
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
				ORDER BY poc.clientId
			) AS installationStatusErrorLevel,
			(	SELECT
					IF(
						COUNT(DISTINCT IFNULL(poc.installationStatus, "not_installed")) > 1 OR (:client_count > 1 AND GROUP_CONCAT(IFNULL(poc.installationStatus, "not_installed") SEPARATOR ',') IN ("installed")),
						"mixed",
						IFNULL(poc.installationStatus, "not_installed")
					)
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
			) AS installationStatus,
			(
				SELECT GROUP_CONCAT(IFNULL(poc.actionRequest, "none") SEPARATOR ',')
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
				ORDER BY poc.clientId
			) AS actionRequestDetails,
			(	SELECT
					IF(
						COUNT(DISTINCT IFNULL(poc.actionRequest, "none")) > 1,
						"mixed",
						IFNULL(poc.actionRequest, "none")
					)
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
			) AS actionRequest,
			(
				SELECT GROUP_CONCAT(IFNULL(poc.actionProgress, "none") SEPARATOR ',')
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
				ORDER BY poc.clientId
			) AS actionProgressDetails,
			(	SELECT
					IF(
						COUNT(DISTINCT IFNULL(poc.actionProgress, "")) > 1,
						"mixed",
						IFNULL(poc.actionProgress, "")
					)
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
			) AS actionProgress,
			(
				SELECT GROUP_CONCAT(IFNULL(poc.actionResult, "none") SEPARATOR ',')
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
				ORDER BY poc.clientId
			) AS actionResultDetails,
			(
				SELECT IF(GROUP_CONCAT(IFNULL(poc.actionResult, "none") SEPARATOR ',') LIKE '%failed%',
					1,
					IF(GROUP_CONCAT(IFNULL(poc.actionResult, "none") SEPARATOR ',') LIKE '%successful%',
						0,
						2
					)
				)
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
				ORDER BY poc.clientId
			) AS actionResultErrorLevel,
			(	SELECT
					IF(
						COUNT(DISTINCT IFNULL(poc.actionResult, "none")) > 1 OR (:client_count > 1 AND GROUP_CONCAT(IFNULL(poc.actionResult, "none") SEPARATOR ',') IN ("failed","successful")),
						"mixed",
						IFNULL(poc.actionResult, "none")
					)
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
			) AS actionResult,
			DATE_FORMAT((	SELECT
					IF(
						COUNT(DISTINCT IFNULL(poc.modificationTime, "")) > 1,
						"mixed",
						IFNULL(poc.modificationTime, "")
					)
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
			), '%Y-%m-%dT%TZ') AS modificationTime,
			(
				SELECT GROUP_CONCAT(CONCAT(poc.productVersion,'-',poc.packageVersion) SEPARATOR ',')
				FROM PRODUCT_ON_CLIENT AS poc WHERE poc.productId=pod.productId AND poc.clientId IN :clients
				ORDER BY poc.clientId
			) AS clientVersions,
			0 IN (
				SELECT IF(
						CONCAT(poc.productVersion, '-', poc.packageVersion) = CONCAT(pod.productVersion, '-', pod.packageVersion) OR poc.productVersion IS NULL,
						TRUE,
						FALSE
					)
				FROM PRODUCT_ON_CLIENT AS poc
					LEFT JOIN PRODUCT_ON_DEPOT AS p ON p.productId = poc.productId
						AND p.productVersion = poc.productVersion
						AND p.packageVersion = poc.packageVersion
					LEFT JOIN CONFIG_STATE AS cs ON cs.configId = 'clientconfig.depot.id'
							AND cs.objectId = poc.clientId
				WHERE poc.clientId IN :clients AND poc.productId = pod.productId
			) AS client_version_outdated,
			(
				SELECT CONCAT_WS(',',
					IF(setupScript <> '','setup', NULL),
					IF(uninstallScript <> '','uninstall',NULL),
					IF(updateScript <> '','update',NULL),
					IF(alwaysScript <> '','always',NULL),
					IF(customScript <> '','custom',NULL),
					IF(onceScript <> '','once',NULL),
					"none"
				)
				FROM PRODUCT AS p
				WHERE p.productId=pod.productId AND
					p.productVersion=pod.productVERSION AND p.packageVersion=pod.packageVersion
			) AS actions,
			IF(
				LENGTH(GROUP_CONCAT(DISTINCT pod.productVersion SEPARATOR ',')) - LENGTH(REPLACE(GROUP_CONCAT(DISTINCT pod.productVersion SEPARATOR ','), ',', '')) > 0 OR LENGTH(GROUP_CONCAT(DISTINCT pod.packageVersion SEPARATOR ',')) - LENGTH(REPLACE(GROUP_CONCAT(DISTINCT pod.packageVersion SEPARATOR ','), ',', '')) > 0,
				TRUE,
				FALSE
			) AS depot_version_diff,
			IF(
				COUNT(DISTINCT pod.depotId) < :num_depots,
				TRUE,
				FALSE
			) AS not_on_all_depots,
			COUNT(DISTINCT pod.depotId) AS numDepots,
			GROUP_CONCAT(CONCAT(pod.productVersion,'-',pod.packageVersion) SEPARATOR ',') AS depotVersions,
			pod.productType AS productType,
			IF(
				pod.productId IN :selected,
				TRUE,
				FALSE
			) AS selected
		"""
				)
			)
			.select_from(text("PRODUCT_ON_DEPOT AS pod"))
			.where(where)
			.group_by(text("pod.productId"))
			.join(
				text("PRODUCT AS pr"),
				text(
					"""
				pr.productId=pod.productId
					AND pr.productVersion=pod.productVersion
					AND pr.packageVersion=pod.packageVersion
			"""
				),
			)
		)
		if not commons.get("filterQuery"):
			commons["filterQuery"] = ""
		if not commons.get("sortBy"):
			commons["sortBy"] = ""
		# logger.devel(commons)
		if "actionRequest" in commons.get("sortBy", []):
			query = query.order_by(text("actionRequest='none' ASC"))
		if "installationStatus" in commons.get("sortBy", []):
			query = query.order_by(text("installationStatus='not_installed' ASC"))
		if "actionResult" in commons.get("sortBy", []):
			query = query.order_by(text("actionResult='none' ASC"))
		query = order_by(query, commons)
		# logger.debug(query)
		query = pagination(query, commons)

		result = session.execute(query, params)
		result = result.fetchall()

		products = []  # pylint: disable=redefined-outer-name
		for row in result:
			if row is not None:
				product = dict(row)
				for value in ["installationStatus", "actionRequest", "actionProgress", "actionResult"]:
					if product[value] != "mixed":
						del product[f"{value}Details"]

				for value in [
					"selectedDepots",
					"actions",
					"depotVersions",
					"selectedClients",
					"installationStatusDetails",
					"actionRequestDetails",
					"actionProgressDetails",
					"actionResultDetails",
					"clientVersions",
				]:
					if product.get(value):
						product[value] = product.get(value, "").split(",")
				# if "failed" in product.get("installationStatusDetails", []) or product.get("installationStatus") == "failed":
				# 	product["installationStatusErrorLevel"] = 2
				# elif "unknown " in product.get("installationStatusDetails", []) or product.get("installationStatus") == "unknown ":
				# 	product["installationStatusErrorLevel"] = 1
				# else:
				# 	product["installationStatusErrorLevel"] = 0
			product["depot_version_diff"] = bool(product.get("depot_version_diff", False))
			product["client_version_outdated"] = bool(product.get("client_version_outdated", False))
			product["not_on_all_depots"] = bool(product.get("not_on_all_depots", False))

			products.append(product)

		products_on_depots = alias(
			select(text("*")).select_from(text("PRODUCT_ON_DEPOT AS pod")).where(where).group_by(text("pod.productId")).subquery()
		)
		total = session.execute(select(text("COUNT(*)")).select_from(products_on_depots), params).fetchone()[0]

		return RESTResponse(data=products, total=total)


@product_router.get("/api/opsidata/products/depots")
@rest_api
@filter_depot_access
def products_on_depot(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name, unused-argument, too-many-arguments
	request: Request,
	type: str = "LocalbootProduct",
	selectedDepots: List[str] = Depends(parse_depot_list),
) -> RESTResponse:
	"""
	Get product ids with depots
	"""

	if selectedDepots == []:
		return RESTResponse(data=[], total=0)
	username = get_username()
	params = {"clients": [""], "client_count": 0, "depots": [""], "product_type": str}
	params["product_type"] = type

	if selectedDepots is None:
		params["depots"] = get_depots(username)
	else:
		params["depots"] = selectedDepots

	allowed_products = None

	if user_register() and product_group_access_configured(username):
		allowed_products = get_allowed_products(username)

	with mysql.session() as session:
		where = text("pod.depotId IN :depots AND pod.producttype = :product_type")

		if allowed_products:
			params["allowed_products"] = allowed_products
			where = and_(where, text("(pod.productId in :allowed_products)"))
		query = (
			select(
				text(
					"""
						pod.productId AS productId,
						pod.depotId AS depotId

					"""
				)
			)
			.select_from(text("PRODUCT_ON_DEPOT AS pod"))
			.where(where)
			.group_by(text("pod.productId"))
		)

		result = session.execute(query, params)
		result = result.fetchall()

		products: dict = {}  # pylint: disable=redefined-outer-name
		for row in result:
			if row is not None:
				product = dict(row)
				logger.devel(product)
				if not products.get(product["productId"]):
					products[product["productId"]] = [product["depotId"]]
				else:
					products[product["productId"]].append(product["depotId"])

		return RESTResponse(data=products)


@product_router.get("/api/opsidata/products/count", response_model=List[Product])
@rest_api
@filter_depot_access
def product_count(
	request: Request,  # pylint:  disable=invalid-name, unused-argument
	type: str = "all",  # pylint:  disable=redefined-builtin
	selectedDepots: List[str] = Depends(parse_depot_list),  # pylint:  disable=invalid-name, unused-argument
) -> RESTResponse:
	"""
	Get number products from selected depots.
	"""
	params = {"depots": selectedDepots, "product_type": ""}
	if type == "all":
		where = text("pod.depotId IN :depots")
	else:
		params["product_type"] = type
		where = text("pod.depotId IN :depots AND pod.producttype = :product_type")

	with mysql.session() as session:
		count = session.execute(select(text("COUNT(*)")).select_from(text("PRODUCT_ON_DEPOT AS pod")).where(where), params).fetchone()[0]

	return RESTResponse(data=count)


class PocItem(BaseModel):  # pylint: disable=too-few-public-methods
	clientIds: List[str]
	productIds: List[str]
	actionRequest: Optional[str] = None
	actionProgress: Optional[str] = None
	actionResult: Optional[str] = None
	installationStatus: Optional[str] = None


@product_router.post("/api/opsidata/clients/products")
@rest_api
@read_only_check
def save_poduct_on_client(  # pylint: disable=too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, data: PocItem  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Save a Product On Client object.
	"""
	http_status = status.HTTP_200_OK
	result_data: dict = {}
	depot_product_version: dict = {}
	product_actions: dict = {}

	get_product_type.cache_clear()
	depot_get_product_version.cache_clear()
	poc_list = []
	for client_id in data.clientIds:
		if client_id not in result_data:
			result_data[client_id] = {}

		depot_id = get_depot_of_client(client_id)

		for product_id in data.productIds:
			if depot_id not in depot_product_version:
				depot_product_version[depot_id] = {}
			if product_id not in depot_product_version[depot_id]:
				depot_product_version[depot_id][product_id] = depot_get_product_version(depot_id, product_id)
			if not depot_product_version[depot_id][product_id]:
				http_status = status.HTTP_400_BAD_REQUEST
				result_data[client_id][product_id] = f"Product '{product_id}' not available on depot '{depot_id}'."
				continue

			version = depot_product_version[depot_id][product_id]
			product_version, package_version = version.split("-", 1)

			if product_id not in product_actions:
				product_actions[product_id] = {}
			if product_version not in product_actions[product_id]:
				product_actions[product_id][product_version] = {}
			if package_version not in product_actions[product_id][product_version]:
				product_actions[product_id][product_version][package_version] = get_product_actions(
					product_id, product_version, package_version
				)
			actions = product_actions[product_id][product_version][package_version]

			if data.actionRequest not in actions:
				http_status = status.HTTP_400_BAD_REQUEST
				logger.warning("Action request '%s' not supported by product '%s' version '%s'.", data.actionRequest, product_id, version)
				raise OpsiApiException(
					message=f"Action request '{data.actionRequest}' not supported by product '{product_id}' version '{version}'.",
					http_status=status.HTTP_400_BAD_REQUEST,
				)

			values = {
				"clientId": client_id,
				"productId": product_id,
				"productType": get_product_type(product_id, product_version, package_version),
				"productVersion": product_version,
				"packageVersion": package_version,
			}
			for attr in ("actionRequest", "actionProgress", "actionResult", "installationStatus"):
				if getattr(data, attr) is not None:
					values[attr] = getattr(data, attr)
			poc_list.append(values)
			result_data[client_id][product_id] = values

	try:
		backend.productOnClient_updateObjects(poc_list)

	except Exception as err:  # pylint: disable=broad-except
		if isinstance(err, OpsiApiException):
			raise err
		logger.error("Could not create ProductOnClient: %s", err)
		return RESTErrorResponse(message="Could not create ProductOnClient.", http_status=status.HTTP_400_BAD_REQUEST, details=err)

	return RESTResponse(http_status=http_status, data=result_data)


@product_router.get("/api/opsidata/products/groups")
@rest_api
def get_product_groups() -> RESTResponse:  # pylint: disable=too-many-locals
	"""
	Get all product groups as a tree of groups.
	"""

	allowed = get_allowd_product_groups(get_username())

	params: dict = {}
	where = text("g.`type` = 'ProductGroup'")

	with mysql.session() as session:
		query = (
			select(
				text(
					"""
			g.parentGroupId AS parent_id,
			g.groupId AS group_id,
			og.objectId AS object_id
		"""
				)
			)
			.select_from(text("`GROUP` AS g"))
			.join(text("OBJECT_TO_GROUP AS og"), text("og.groupType = g.`type` AND og.groupId = g.groupId"), isouter=True)
			.where(where)
		)

		result = session.execute(query, params)
		result = result.fetchall()
		root_group = {"id": "root", "type": "ProductGroup", "text": "root", "parent": None}
		all_groups = {}
		for row in result:
			if user_register() and product_group_access_configured(get_username()):
				if row["group_id"] not in allowed:
					continue
			if row["group_id"] not in all_groups:
				all_groups[row["group_id"]] = {
					"id": row["group_id"],
					"type": "ProductGroup",
					"text": row["group_id"],
					"parent": row["parent_id"] or root_group["id"],
				}
			if row["object_id"]:
				if "children" not in all_groups[row["group_id"]]:
					all_groups[row["group_id"]]["children"] = {}
				if row.group_id == row.parent_id:
					if not row["object_id"] in all_groups:
						all_groups[row["object_id"]] = {
							"id": f'{row["object_id"]};{row["parent_id"]}',
							"type": "ProductGroup",
							"text": row["object_id"],
							"parent": row["parent_id"] or root_group["id"],
						}
				else:
					all_groups[row["group_id"]]["children"][row["object_id"]] = {
						"id": f'{row["object_id"]};{row["group_id"]}',
						"type": "ObjectToGroup",
						"text": row["object_id"],
						"parent": row["group_id"],
					}

		return RESTResponse(data={"groups": all_groups})


@product_router.get("/api/opsidata/producticons")
async def product_icons() -> JSONResponse:
	return JSONResponse({"result": {"opsi-client-agent": "assets/images/product_icons/opsi-logo.png"}})


class Property(BaseModel):  # pylint: disable=too-few-public-methods
	productId: str
	propertyId: str
	type: Optional[str] = "UnicodeProductProperty"
	version: Optional[str] = None
	versionDetails: Optional[dict]  = None
	allValues: Optional[List[str]] = ["value1"]
	possibleValues: Optional[List[str]] = ["value1"]
	editable: Optional[bool] = True
	editableDetails: Optional[dict] = {}
	multiValue: Optional[bool]  = None
	multiValueDetails: Optional[dict]  = None
	description: Optional[str]  = None
	descriptionDetails: Optional[dict]  = None
	default: Optional[List[str]] = ["value1"]
	depots: Optional[dict] = {"depot1": ["value1"]}
	clients: Optional[dict] = {"client1": ["value1"]}
	allClientValuesEqual: Optional[bool] = True
	anyDepotDifferentFromDefault: Optional[bool] = False
	anyClientDifferentFromDepot: Optional[bool] = False
	newValue: Optional[str] = ""
	newValues: Optional[List[str]] = [""]


@product_router.get("/api/opsidata/products/{productId}/properties", response_model=Dict[str, Property])
@rest_api
def product_properties(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name
	productId: str, selectedClients: List[str] = Depends(parse_client_list), selectedDepots: List[str] = Depends(parse_depot_list)
) -> RESTResponse:
	"""
	Get products propertiers.
	"""

	data: dict = {}
	params: dict = {}
	data["properties"] = {}
	params["productId"] = productId
	params["depots"] = []
	where = text("pp.productId = :productId")
	clients_on_depot: dict = {}

	depot_get_product_version.cache_clear()

	if not selectedClients and not selectedDepots:
		raise OpsiApiException(
			message="No clients and no depots were selected.",
			http_status=status.HTTP_400_BAD_REQUEST,
		)
	if selectedClients:
		for client in selectedClients:
			depot = get_depot_of_client(client)
			if depot not in clients_on_depot:
				clients_on_depot[depot] = []
				params["depots"].append(depot)
			clients_on_depot[depot].append(client)
	if selectedDepots:
		for depot in selectedDepots:
			if depot not in clients_on_depot:
				clients_on_depot[depot] = []
				params["depots"].append(depot)
	where = and_(where, text("(pod.depotId IN :depots)"))
	with mysql.session() as session:
		try:  # pylint: disable=too-many-nested-blocks
			query = (
				select(
					text(
						"""
				pp.productId,
				pp.propertyId,
				CONCAT(pp.productVersion,'-',pp.packageVersion) AS version,
				pp.type,
				pp.description AS description,
				pp.multiValue as multiValue,
				pp.editable AS editable,
				GROUP_CONCAT(ppv.value SEPARATOR ';') AS `values`,
				(SELECT GROUP_CONCAT(`value` SEPARATOR ',') FROM PRODUCT_PROPERTY_VALUE WHERE propertyId = pp.propertyId AND productId = pp.productId AND productVersion = pp.productVersion AND packageVersion = pp.packageVersion AND (isDefault = 1 OR ppv.isDefault is NULL)) AS `defaultDetails`,
				GROUP_CONCAT(pod.depotId SEPARATOR ',') AS depots
			"""
					)
				)
				.select_from(text("PRODUCT_PROPERTY AS pp"))
				.join(
					text("PRODUCT_ON_DEPOT AS pod"),
					text(
						"""
				pod.productId = pp.productId AND
				pod.productVersion = pp.productVersion AND
				pod.packageVersion = pp.packageVersion
			"""
					),
				)
				.join(
					text("PRODUCT_PROPERTY_VALUE AS ppv"),
					text(
						"""
				pp.propertyId = ppv.propertyId AND
				pp.productId = ppv.productId AND
				ppv.productVersion = pp.productVersion AND
				ppv.packageVersion = pp.packageVersion
			"""
					),
					isouter=True,
				)
				.where(where)
				.group_by(text("pp.productId, pp.propertyId, version"))
			)  # pylint: disable=redefined-outer-name

			result = session.execute(query, params)
			result = result.fetchall()

			for row in result:
				if row is not None:
					property = dict(row)  # pylint: disable=redefined-builtin
					if not data["properties"].get(property["propertyId"]):
						data["properties"][property["propertyId"]] = {}
					_depots = list(set(property["depots"].split(",")))
					property["depots"] = {}
					property["clients"] = {}
					property["allValues"] = set()
					property["versionDetails"] = {}
					property["descriptionDetails"] = {}
					property["multiValueDetails"] = {}
					property["editableDetails"] = {}
					property["defaultDetails"] = {}
					property["possibleValues"] = {}

					for depot in _depots:
						property["versionDetails"][depot] = property["version"]
						property["descriptionDetails"][depot] = property["description"]
						property["multiValueDetails"][depot] = bool(property["multiValue"])
						property["editableDetails"][depot] = bool(property["editable"])

						if property["type"] == "BoolProductProperty":
							property["allValues"].update([bool_value(value) for value in property["values"].split(",")])
							if isinstance(property["defaultDetails"], dict):
								property["defaultDetails"][depot] = [bool_value(property.get("defaultDetails", {}).get(depot))]

							else:
								property["defaultDetails"][depot] = [bool_value(property["defaultDetails"])]
							property["possibleValues"][depot] = [bool_value(value) for value in property["values"].split(",")]
						else:
							property["allValues"].update(unicode_value(property["values"]))
							property["defaultDetails"][depot] = unicode_value(property["defaultDetails"])
							property["possibleValues"][depot] = unicode_value(property["values"])

						query = (
							select(
								text(
									"""
							pps.values
						"""
								)
							)
							.select_from(text("PRODUCT_PROPERTY_STATE AS pps"))
							.where(text("pps.productId = :product AND pps.propertyId = :property AND pps.objectId = :depot"))
						)
						values = session.execute(query, {"product": productId, "property": property["propertyId"], "depot": depot})
						values = values.fetchone()

						if values is not None:
							if property["type"] == "BoolProductProperty":
								property["depots"][depot] = [bool_value(dict(values).get("values", ""))]
								property["allValues"].update([bool_value(dict(values).get("values", ""))])
							else:
								property["depots"][depot] = unicode_value(dict(values).get("values", ""))
								property["allValues"].update(unicode_value(dict(values).get("values", "")))
							if property["depots"][depot] != property["defaultDetails"][depot]:
								property["anyDepotDifferentFromDefault"] = True
						else:
							property["depots"][depot] = property["defaultDetails"][depot]

						# if not clients_on_depot.get(depot):
						# 	continue
						for client in clients_on_depot.get(depot, []):
							query = (
								select(
									text(
										"""
								pps.values
							"""
									)
								)
								.select_from(text("PRODUCT_PROPERTY_STATE AS pps"))
								.where(text("pps.productId = :product AND pps.propertyId = :property AND pps.objectId = :client"))
							)
							values = session.execute(query, {"product": productId, "property": property["propertyId"], "client": client})
							values = values.fetchone()

							if values is not None:
								if property["type"] == "BoolProductProperty":
									property["clients"][client] = [bool_value(dict(values).get("values", ""))]
									property["allValues"].update([bool_value(dict(values).get("values", ""))])
								else:
									property["clients"][client] = unicode_value(dict(values).get("values", ""))
									property["allValues"].update(unicode_value(dict(values).get("values", "")))
								if property["clients"][client] != property["depots"][depot]:
									property["anyClientDifferentFromDepot"] = True
							elif property["depots"][depot] is not None:
								property["clients"][client] = property["depots"][depot]
							else:
								property["clients"][client] = property["defaultDetails"][depot]
					del property["version"]
					del property["description"]
					del property["multiValue"]
					del property["editable"]
					del property["values"]
					property["allValues"] = sorted(list(property.get("allValues", [])))
					data["properties"][property["propertyId"]] = merge_dicts(property, data["properties"][property["propertyId"]])

			data["productVersions"] = {}
			data["productDescriptionDetails"] = {}
			data["productAdviceDetails"] = {}

			for depot in clients_on_depot:
				data["productVersions"][depot] = depot_get_product_version(depot, productId)
				if data["productVersions"][depot]:
					data["productDescriptionDetails"][depot], data["productAdviceDetails"][depot] = get_product_description(
						productId, *data["productVersions"][depot].split("-")
					)

			if data["productDescriptionDetails"]:
				if all(
					description == list(data["productDescriptionDetails"].values())[0]
					for description in data["productDescriptionDetails"].values()
				):
					data["productDescription"] = list(data["productDescriptionDetails"].values())[0]
				else:
					data["productDescription"] = "mixed"

			if data["productAdviceDetails"]:
				if all(advice == list(data["productAdviceDetails"].values())[0] for advice in data["productAdviceDetails"].values()):
					data["productAdvice"] = list(data["productAdviceDetails"].values())[0]
				else:
					data["productAdvice"] = "mixed"

			for pp_id in data["properties"]:
				property = data["properties"][pp_id]

				for key in ("version", "description", "multiValue", "editable", "default"):
					values = property.get(f"{key}Details", {}).values()
					first_value = list(values)[0]
					if all(value == first_value for value in values):
						property[key] = first_value
					else:
						property[key] = "mixed"

				client_values = property["clients"].values()
				if all(value == list(client_values)[0] for value in client_values):
					property["allClientValuesEqual"] = True
				else:
					property["allClientValuesEqual"] = False

				if property["editable"] is True or property["editable"] == "mixed":
					property["newValue"] = str()
					property["newValues"] = []

				if not property.get("anyDepotDifferentFromDefault"):
					property["anyDepotDifferentFromDefault"] = False
				if not property.get("anyClientDifferentFromDepot"):
					property["anyClientDifferentFromDepot"] = False

			return RESTResponse(data=data)

		except Exception as err:  # pylint: disable=broad-except
			if isinstance(err, OpsiApiException):
				raise err
			logger.error("Could not get properties.")
			logger.error(err)
			raise OpsiApiException(
				message="Could not get properties.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err


@lru_cache(maxsize=1000)
def get_product_properties(product: str, version: str) -> List:
	product_version, package_version = version.split("-", 1)
	with mysql.session() as session:
		query = (
			select(text("propertyId"))
			.select_from(text("PRODUCT_PROPERTY"))
			.where(text("productId = :product_id AND productVersion = :product_version AND packageVersion = :package_version"))
		)

		result = session.execute(query, {"product_id": product, "product_version": product_version, "package_version": package_version})
		result = result.fetchall()
		properties = []
		for row in result:
			if row is not None:
				properties.append(dict(row).get("propertyId"))
	return properties


def get_product_product_property_state(object_id: str, product_id: str, property_id: str) -> Union[str, None]:
	with mysql.session() as session:
		query = (
			select(
				text(
					"""
			pps.objectId AS objectId,
			pps.productId AS productId,
			pps.propertyId AS propertyId,
			pps.`values` AS `values`
		"""
				)
			)
			.select_from(text("PRODUCT_PROPERTY_STATE AS pps"))
			.where(text("productId = :product_id AND objectId = :object_id AND propertyId = :property_id"))
		)

		result = session.execute(query, {"product_id": product_id, "property_id": property_id, "object_id": object_id})
		res = result.fetchone()
		if not res:
			return None
		return res[0]


class ProductProperty(BaseModel):  # pylint: disable=too-few-public-methods
	clientIds: Optional[List[str]] = []
	depotIds: Optional[List[str]] = []
	properties: dict


@product_router.post("/api/opsidata/products/{productId}/properties")
@rest_api
@read_only_check
def save_poduct_property(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, productId: str, data: ProductProperty
) -> RESTResponse:
	"""
	Save Product Properties.
	"""

	get_product_properties.cache_clear()
	depot_get_product_version.cache_clear()

	result_data: dict = {}
	depot_product_version: dict = {}
	objects: List = []
	if data.clientIds and data.depotIds:
		raise OpsiApiException(
			message="Clients and depots set. Only one is allowed.",
			http_status=status.HTTP_400_BAD_REQUEST,
		)
	if data.clientIds:
		objects = objects + data.clientIds
	elif data.depotIds:
		objects = objects + data.depotIds
	else:
		raise OpsiApiException(
			message="No clients or depots set.",
			http_status=status.HTTP_400_BAD_REQUEST,
		)

	with mysql.session() as session:
		for object_id in objects:
			if object_id not in result_data:
				result_data[object_id] = {}

			depot_id = get_depot_of_client(object_id)

			if depot_id not in depot_product_version:
				depot_product_version[depot_id] = {}
				depot_product_version[depot_id][productId] = depot_get_product_version(depot_id, productId)

			version = depot_product_version[depot_id][productId]

			available_properties = get_product_properties(productId, version)

			for property_id in data.properties:
				if property_id not in available_properties:
					logger.error("Propertiy %s does not exist on %s.", property_id, depot_id)
					raise OpsiApiException(
						message=f"Failed to set Property: {property_id} for {productId} on {object_id}. Property does not exist.",
						http_status=status.HTTP_400_BAD_REQUEST,
					)
				if isinstance(data.properties[property_id], bool):
					pp_values = f"[{data.properties[property_id]}]".lower()
				elif isinstance(data.properties[property_id], list):
					pp_values = json.dumps(data.properties[property_id])
				else:
					pp_values = f'["{data.properties[property_id]}"]'

				values = {"objectId": object_id, "productId": productId, "propertyId": property_id, "values": pp_values}

				try:
					if get_product_product_property_state(object_id, productId, property_id):
						stmt = (
							update(
								table(
									"PRODUCT_PROPERTY_STATE", *[column(name) for name in values.keys()]
								)  # pylint: disable=consider-iterating-dictionary
							)
							.where(text(f"productId = '{productId}' AND objectId = '{object_id}' AND propertyId = '{property_id}'"))
							.values(**values)
						)
						session.execute(stmt, values)
					else:
						stmt = (
							insert(
								table(
									"PRODUCT_PROPERTY_STATE", *[column(name) for name in values.keys()]
								)  # pylint: disable=consider-iterating-dictionary
							)
							.values(**values)
							.on_duplicate_key_update(**values)
						)
						session.execute(stmt)
					values["values"] = data.properties[property_id]
					result_data[object_id][property_id] = values
				except Exception as err:  # pylint: disable=broad-except
					if isinstance(err, OpsiApiException):
						raise err
					logger.error("Could not save product property state: %s", err)
					session.rollback()
					raise OpsiApiException(
						message=f"Failed to set Property: {property_id} for {productId} on {object_id}.",
						http_status=status.HTTP_400_BAD_REQUEST,
						error=err,
					) from err

	return RESTResponse(http_status=status.HTTP_200_OK, data=result_data)


class Dependency(BaseModel):  # pylint: disable=too-few-public-methods
	productId: str
	productAction: str
	version: str
	requiredProductId: str
	requiredVersion: str
	requiredAction: str
	requiredInstallationStatus: str
	requirementType: str


class ProductDependenciesResponse(BaseModel):  # pylint: disable=too-few-public-methods
	status: int
	error: dict
	data: List[Dependency]


@product_router.get("/api/opsidata/products/{productId}/dependencies", response_model=ProductDependenciesResponse)
@rest_api
def product_dependencies(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name
	productId: str,
	selectedClients: List[str] = Depends(parse_client_list),
) -> RESTResponse:
	"""
	Get products dependencies.
	"""

	status_code = status.HTTP_200_OK
	data: dict = {}
	params: dict = {"depots": []}
	data["dependencies"] = []
	params["productId"] = productId
	where = text("pd.productId = :productId")
	depots = set()
	depots.add(get_configserver_id())
	if selectedClients:
		for client in selectedClients:
			depots.add(get_depot_of_client(client))

	params["depots"] = list(depots)
	where = and_(where, text("(pod.depotId IN :depots)"))

	with mysql.session() as session:
		try:
			query = (
				select(
					text(
						"""
				pd.productId,
				pd.productAction,
				CONCAT(pd.productVersion,'-',pd.packageVersion) AS version,
				pd.requiredProductId,
				CONCAT(pd.requiredProductVersion,'-',pd.requiredPackageVersion) AS requiredVersion,
				pd.requiredAction,
				pd.requiredInstallationStatus,
				pd.requirementType
			"""
					)
				)
				.select_from(text("PRODUCT_DEPENDENCY AS pd"))
				.join(
					text("PRODUCT_ON_DEPOT AS pod"),
					text(
						"""
				pod.productId = pd.productId AND
				pod.productVersion = pd.productVersion AND
				pod.packageVersion = pd.packageVersion
			"""
					),
				)
				.where(where)
			)  # pylint: disable=redefined-outer-name

			result = session.execute(query, params)
			result = result.fetchall()

			for row in result:
				if row is not None:
					dependency = dict(row)
					data["dependencies"].append(dependency)

			data["productVersions"] = {}
			data["productDescriptionDetails"] = {}
			data["productAdviceDetails"] = {}

			for depot in depots:
				data["productVersions"][depot] = depot_get_product_version(depot, productId)
				if data["productVersions"][depot]:
					data["productDescriptionDetails"][depot], data["productAdviceDetails"][depot] = get_product_description(
						productId, *data["productVersions"][depot].split("-")
					)
			if data["productDescriptionDetails"]:
				if all(
					description == list(data["productDescriptionDetails"].values())[0]
					for description in data["productDescriptionDetails"].values()
				):
					data["productDescription"] = list(data["productDescriptionDetails"].values())[0]
				else:
					data["productDescription"] = "mixed"

			if data["productAdviceDetails"]:
				if all(advice == list(data["productAdviceDetails"].values())[0] for advice in data["productAdviceDetails"].values()):
					data["productAdvice"] = list(data["productAdviceDetails"].values())[0]
				else:
					data["productAdvice"] = "mixed"

		except Exception as err:  # pylint: disable=broad-except
			if isinstance(err, OpsiApiException):
				raise err
			logger.error("Could not get dependencies.")
			logger.error(err)
			raise OpsiApiException(
				message="Could not get dependencies.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err

	return RESTResponse(http_status=status_code, data=data)


@product_router.post("/api/opsidata/products/{product}/unlock")
@rest_api
@read_only_check
def unlock_product(request: Request, product: str) -> RESTResponse:  # pylint: disable=unused-argument
	try:
		unlocked_products = []
		for pod in backend.productOnDepot_getObjects(productId=product, locked=True):
			unlocked_products.append(product)
			pod.locked = False
			backend.productOnDepot_updateObject(pod)
		return RESTResponse(data=unlocked_products)
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Error while unlocking products: %s", err)
		return RESTErrorResponse(message="Error while unlocking products", details=err)


@product_router.post("/api/opsidata/products/unlock")
@rest_api
@read_only_check
def unlock_all_products() -> RESTResponse:
	try:
		unlocked_products = []
		for product in backend.productOnDepot_getObjects(locked=True):
			unlocked_products.append(product.productId)
			product.locked = False
			backend.productOnDepot_updateObject(product)
		return RESTResponse(data=unlocked_products)
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Error while unlocking products: %s", err)
		return RESTErrorResponse(message="Error while unlocking products", details=err)


@product_router.get("/api/opsidata/locked-products", response_model=list[str])
@rest_api
def get_locked_products_list() -> RESTResponse:
	locked_products = backend.getProductLocks_hash()  # pylint: disable=no-member
	return RESTResponse(locked_products)


@product_router.get("/api/opsidata/products/installation-status", response_model=List[str])
@rest_api
def installation_status(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Get products installationStatus
	"""

	with mysql.session() as session:
		try:
			query = select(text("poc.installationStatus")).select_from(text("PRODUCT_ON_CLIENT AS poc")).distinct()

			result = session.execute(query)
			result = result.fetchall()

			installation_status_list = [dict(row).get("installationStatus") for row in result]

		except Exception as err:  # pylint: disable=broad-except
			if isinstance(err, OpsiApiException):
				raise err
			logger.error("Could not get installationStatus.")
			logger.error(err)
			raise OpsiApiException(
				message="Could not get installationStatus.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err

	return RESTResponse(data=installation_status_list)


@product_router.get("/api/opsidata/products/action-result", response_model=List[str])
@rest_api
def action_result(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	Get products actionResult
	"""

	with mysql.session() as session:
		try:
			query = select(text("poc.actionResult")).select_from(text("PRODUCT_ON_CLIENT AS poc")).distinct()

			result = session.execute(query)
			result = result.fetchall()

			action_result_list = [dict(row).get("actionResult") for row in result]

		except Exception as err:  # pylint: disable=broad-except
			if isinstance(err, OpsiApiException):
				raise err
			logger.error("Could not get actionResult.")
			logger.error(err)
			raise OpsiApiException(
				message="Could not get actionResult.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
			) from err

	return RESTResponse(data=action_result_list)
