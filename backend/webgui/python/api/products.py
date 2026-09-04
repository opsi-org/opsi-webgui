# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui product methods
"""

import json
from functools import lru_cache
from typing import Any

from fastapi import APIRouter, Body, Depends, Request, status
from fastapi.responses import JSONResponse

try:
	from opsi.opsi.service.model.object import ProductOnClient
except ImportError:  # pragma: no cover - legacy opsi fallback
	from opsi_legacy.Object import ProductOnClient  # type: ignore

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
from sqlalchemy import alias, and_, column, or_, select, text  # type: ignore[import]
from sqlalchemy.dialects.mysql import insert  # type: ignore[import]
from sqlalchemy.exc import IntegrityError  # type: ignore[import]
from sqlalchemy.sql.expression import table, update  # type: ignore[import]

from ..logger import get_logger
from ..utils import (
	backend,
	bool_value,
	expand_allowed_groups,
	filter_depot_access,
	get_all_children_groupids,
	get_allowed_group_objects,
	get_allowed_product_groups,
	get_depots_of_clients,
	get_groups_ids,
	get_objects_of_group,
	get_sub_groups,
	get_username,
	merge_dicts,
	mysql,
	parse_client_list,
	parse_depot_list,
	parse_filter_query,
	parse_group_list,
	parse_selected_list,
	product_group_access_configured,
	read_only_check,
	unicode_value,
	user_register,
)
from .depots import get_depots
from .utils_groups import (  # pylint: disable=import-error
	build_nested_group,
	read_groups,
)

logger = get_logger()
api_router = APIRouter()


@lru_cache(maxsize=1000)
def depot_get_product_version(depot: str, product: str) -> str | None:
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


def get_product_description(product: str, product_version: str, package_version: str) -> tuple[str, str]:
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
def get_product_type(product_id: str, product_version: str, package_version: str) -> str | None:
	with mysql.session() as session:
		query = (
			select(text("type"))
			.select_from(text("PRODUCT"))
			.where(text("productId = :product_id AND productVersion = :product_version AND packageVersion = :package_version"))
		)

		result = session.execute(
			query,
			{
				"product_id": product_id,
				"product_version": product_version,
				"package_version": package_version,
			},
		)
		res = result.fetchone()
		if not res:
			return None
		return res[0]


def get_product_actions(product: str, version: str, package_version: str) -> list[str]:
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
	selectedDepots: list[str]
	depotVersions: list[str]
	depot_version_diff: bool
	not_on_all_depots: bool
	selctedClients: list[str]
	clientVersions: list[str]
	client_version_outdated: bool
	actions: list[str]
	productType: str
	installationStatus: str
	actionRequest: str
	actionProgress: str
	actionResult: str
	lastAction: str | None = None
	actionSequence: int | None = None


@api_router.get("/api/opsidata/products", response_model=list[Product])
@rest_api
@filter_depot_access
def products(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name, unused-argument, too-many-arguments
	request: Request,
	commons: dict = Depends(common_query_parameters),
	type: str = "LocalbootProduct",
	selectedClients: list[str] = Depends(parse_client_list),
	selectedDepots: list[str] = Depends(parse_depot_list),
	selected: list[str] | None = Depends(parse_selected_list),
	filteredGroups: list[str] | None = Depends(parse_group_list),
	onlySelected: bool = False,
	installationStatusFilter: str | None = None,
	hasFailedActionResult: bool | None = None,
	hasPendingActionRequest: bool | None = None,
	unused: bool | None = None,
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

	params["num_depots"] = len(selectedDepots) if selectedDepots else 0

	if user_register() and product_group_access_configured(username):
		allowed_products = get_allowed_group_objects(username, "ProductGroup")
		if not allowed_products:
			logger.warning("No products found for user '%s'.", username)
			return RESTResponse(data=[], total=0)

	with mysql.session() as session:
		where = text("pod.depotId IN :depots AND pod.producttype = :product_type")
		if filteredGroups:
			where = and_(where, text("(pod.productId IN :filtered_groups)"))
			params["filtered_groups"] = get_objects_of_group(filteredGroups, "ProductGroup")
		filter_query = parse_filter_query(commons.get("filterQuery"))
		if isinstance(filter_query, dict):
			for field, column in (("id", "pod.productId"), ("description", "pr.description")):
				value = filter_query.get(field)
				if isinstance(value, list):
					params[f"filter_{field}"] = value
					where = and_(where, text(f"{column} IN :filter_{field}"))
				elif value:
					params[f"filter_{field}"] = f"%{value}%"
					where = and_(where, text(f"{column} LIKE :filter_{field}"))
		elif filter_query:
			where = and_(
				where,
				text("(pod.productId LIKE :search OR pr.name LIKE :search OR pr.description LIKE :search OR pr.advice LIKE :search)"),
			)
			params["search"] = f"%{filter_query}%"
		if allowed_products:
			params["allowed_products"] = allowed_products
			where = and_(where, text("(pod.productId in :allowed_products)"))
		if onlySelected and selected and selected != [""]:
			where = and_(where, text("(pod.productId IN :selected)"))
		# Client scope: when clients are selected the advanced filters look at those clients only,
		# otherwise at every client of the selected depots.
		client_scope = " AND poc.clientId IN :clients" if params["clients"] != [""] else ""
		if installationStatusFilter in ("installed", "not_installed", "unknown"):
			# Matches products where at least one relevant client (all clients if none selected)
			# currently has the given installationStatus - same semantics as the aggregate
			# "installationStatus" column already computed per row below.
			params["installation_status_filter"] = installationStatusFilter
			where = and_(
				where,
				text(
					f"""
					EXISTS (
						SELECT 1 FROM PRODUCT_ON_CLIENT AS poc
						WHERE poc.productId = pod.productId{client_scope}
							AND IFNULL(poc.installationStatus, 'not_installed') = :installation_status_filter
					)
					"""
				),
			)
		if hasFailedActionResult:
			where = and_(
				where,
				text(
					f"EXISTS (SELECT 1 FROM PRODUCT_ON_CLIENT AS poc "
					f"WHERE poc.productId = pod.productId{client_scope} AND poc.actionResult = 'failed')"
				),
			)
		if hasPendingActionRequest:
			where = and_(
				where,
				text(
					f"EXISTS (SELECT 1 FROM PRODUCT_ON_CLIENT AS poc "
					f"WHERE poc.productId = pod.productId{client_scope} "
					f"AND poc.actionRequest IS NOT NULL AND poc.actionRequest NOT IN ('none', ''))"
				),
			)
		if unused:
			where = and_(
				where,
				text(
					f"NOT EXISTS (SELECT 1 FROM PRODUCT_ON_CLIENT AS poc "
					f"WHERE poc.productId = pod.productId{client_scope} AND poc.installationStatus = 'installed')"
				),
			)
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
			poc_agg.selectedClients AS selectedClients,
			poc_agg.installationStatusDetails AS installationStatusDetails,
			IF(poc_agg.installationStatusDetails LIKE '%unknown%',
				1,
				IF(poc_agg.installationStatusDetails LIKE '%,installed%' OR poc_agg.installationStatusDetails LIKE 'installed%',
					0,
					2
				)
			) AS installationStatusErrorLevel,
			IF(
				COALESCE(poc_agg.installationStatus_distinct, 0) > 1 OR (:client_count > 1 AND poc_agg.installationStatusDetails IN ("installed")),
				"mixed",
				COALESCE(poc_agg.installationStatus_value, "not_installed")
			) AS installationStatus,
			poc_agg.actionRequestDetails AS actionRequestDetails,
			IF(
				COALESCE(poc_agg.actionRequest_distinct, 0) > 1,
				"mixed",
				COALESCE(poc_agg.actionRequest_value, "none")
			) AS actionRequest,
			poc_agg.actionProgressDetails AS actionProgressDetails,
			IF(
				COALESCE(poc_agg.actionProgress_distinct, 0) > 1,
				"mixed",
				COALESCE(poc_agg.actionProgress_value, "")
			) AS actionProgress,
			poc_agg.actionResultDetails AS actionResultDetails,
			IF(poc_agg.actionResultDetails LIKE '%failed%',
				1,
				IF(poc_agg.actionResultDetails LIKE '%successful%',
					0,
					2
				)
			) AS actionResultErrorLevel,
			IF(
				COALESCE(poc_agg.actionResult_distinct, 0) > 1 OR (:client_count > 1 AND poc_agg.actionResultDetails IN ("failed","successful")),
				"mixed",
				COALESCE(poc_agg.actionResult_value, "none")
			) AS actionResult,
			IF(
				COALESCE(poc_agg.lastAction_distinct, 0) > 1,
				"mixed",
				COALESCE(poc_agg.lastAction_value, "none")
			) AS lastAction,
            NULL AS actionSequence,
			DATE_FORMAT(
				IF(
					COALESCE(poc_agg.modificationTime_distinct, 0) > 1,
					"mixed",
					COALESCE(poc_agg.modificationTime_value, "")
				), '%Y-%m-%dT%TZ'
			) AS modificationTime,
			poc_agg.clientVersions AS clientVersions,
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
					AND NOT poc.installationStatus = 'not_installed'
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
			.join(
				text(
					"""
				(
					SELECT
						poc.productId AS productId,
						GROUP_CONCAT(poc.clientId SEPARATOR ',') AS selectedClients,
						GROUP_CONCAT(IFNULL(poc.installationStatus, 'not_installed') SEPARATOR ',') AS installationStatusDetails,
						GROUP_CONCAT(IFNULL(poc.actionRequest, 'none') SEPARATOR ',') AS actionRequestDetails,
						GROUP_CONCAT(IFNULL(poc.actionProgress, 'none') SEPARATOR ',') AS actionProgressDetails,
						GROUP_CONCAT(IFNULL(poc.actionResult, 'none') SEPARATOR ',') AS actionResultDetails,
						GROUP_CONCAT(CONCAT(poc.productVersion, '-', poc.packageVersion) SEPARATOR ',') AS clientVersions,
						COUNT(DISTINCT IFNULL(poc.installationStatus, 'not_installed')) AS installationStatus_distinct,
						MIN(IFNULL(poc.installationStatus, 'not_installed')) AS installationStatus_value,
						COUNT(DISTINCT IFNULL(poc.actionRequest, 'none')) AS actionRequest_distinct,
						MIN(IFNULL(poc.actionRequest, 'none')) AS actionRequest_value,
						COUNT(DISTINCT IFNULL(poc.actionProgress, '')) AS actionProgress_distinct,
						MIN(IFNULL(poc.actionProgress, '')) AS actionProgress_value,
						COUNT(DISTINCT IFNULL(poc.actionResult, 'none')) AS actionResult_distinct,
						MIN(IFNULL(poc.actionResult, 'none')) AS actionResult_value,
						COUNT(DISTINCT IFNULL(poc.lastAction, 'none')) AS lastAction_distinct,
						MIN(IFNULL(poc.lastAction, 'none')) AS lastAction_value,
						COUNT(DISTINCT IFNULL(poc.modificationTime, '')) AS modificationTime_distinct,
						MIN(IFNULL(poc.modificationTime, '')) AS modificationTime_value
					FROM PRODUCT_ON_CLIENT AS poc
					WHERE poc.clientId IN :clients
					GROUP BY poc.productId
				) AS poc_agg
			"""
				),
				text("poc_agg.productId = pod.productId"),
				isouter=True,
			)
		)
		if not commons.get("filterQuery"):
			commons["filterQuery"] = ""
		if not commons.get("sortBy"):
			commons["sortBy"] = ""
		# logger.devel(commons)
		# Sort selected items first when a selection is active
		if selected and selected != [""]:
			query = query.order_by(text("selected DESC"))
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
				for value in [
					"installationStatus",
					"actionRequest",
					"actionProgress",
					"actionResult",
				]:
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
			product.pop("actionSequence", None)

			products.append(product)

		# The filter can reference PRODUCT columns (name/description/advice), so the count
		# query has to join PRODUCT the same way the data query does.
		products_on_depots = alias(
			select(text("pod.productId AS productId"))
			.select_from(text("PRODUCT_ON_DEPOT AS pod"))
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
			.where(where)
			.group_by(text("pod.productId"))
			.subquery()
		)
		total = session.execute(select(text("COUNT(*)")).select_from(products_on_depots), params).fetchone()[0]

		return RESTResponse(data=products, total=total)


@api_router.get("/api/opsidata/products/depots")
@rest_api
@filter_depot_access
def products_on_depot(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name, unused-argument, too-many-arguments
	request: Request,
	type: str = "LocalbootProduct",
	selectedDepots: list[str] = Depends(parse_depot_list),
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

	restricted = user_register() and product_group_access_configured(username)
	allowed_products = None
	if restricted:
		allowed_products = get_allowed_group_objects(username, "ProductGroup")
		if not allowed_products:
			return RESTResponse(data={})

	with mysql.session() as session:
		where = text("pod.depotId IN :depots AND pod.producttype = :product_type")

		if restricted:
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
				if not products.get(product["productId"]):
					products[product["productId"]] = [product["depotId"]]
				else:
					products[product["productId"]].append(product["depotId"])

		return RESTResponse(data=products)


@api_router.get("/api/opsidata/products/count", response_model=list[Product])
@rest_api
@filter_depot_access
def product_count(
	request: Request,  # pylint:  disable=invalid-name, unused-argument
	type: str = "all",  # pylint:  disable=redefined-builtin
	selectedDepots: list[str] = Depends(parse_depot_list),  # pylint:  disable=invalid-name, unused-argument
) -> RESTResponse:
	"""
	Get number products from selected depots.
	"""
	if selectedDepots == []:
		# Empty selection (e.g. depot-restricted user without accessible depots)
		return RESTResponse(data=0)
	if selectedDepots is None:
		selectedDepots = get_depots(get_username())
		if not selectedDepots:
			return RESTResponse(data=0)

	params = {"depots": selectedDepots, "product_type": ""}
	if type == "all":
		where = text("pod.depotId IN :depots")
	else:
		params["product_type"] = type
		where = text("pod.depotId IN :depots AND pod.producttype = :product_type")

	with mysql.session() as session:
		count = session.execute(
			select(text("COUNT(*)")).select_from(text("PRODUCT_ON_DEPOT AS pod")).where(where),
			params,
		).fetchone()[0]

	return RESTResponse(data=count)


class PocItem(BaseModel):  # pylint: disable=too-few-public-methods
	clientIds: list[str]
	productIds: list[str]
	actionRequest: str | None = None
	actionProgress: str | None = None
	actionResult: str | None = None
	installationStatus: str | None = None


@api_router.post("/api/opsidata/clients/products")
@rest_api
@read_only_check
def save_poduct_on_client(  # pylint: disable=too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request,
	data: PocItem,  # pylint: disable=unused-argument
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
	depot_by_client = get_depots_of_clients(data.clientIds)
	for client_id in data.clientIds:
		if client_id not in result_data:
			result_data[client_id] = {}

		depot_id = depot_by_client[client_id]

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
				logger.warning(
					"Action request '%s' not supported by product '%s' version '%s'.",
					data.actionRequest,
					product_id,
					version,
				)
				raise OpsiApiException(
					message=f"Action request '{data.actionRequest}' not supported by product '{product_id}' version '{version}'.",
					http_status=status.HTTP_400_BAD_REQUEST,
				)

			values = {
				"productId": product_id,
				"productType": get_product_type(product_id, product_version, package_version),
				"clientId": client_id,
				"productVersion": product_version,
				"packageVersion": package_version,
			}
			for attr in (
				"actionRequest",
				"actionProgress",
				"actionResult",
				"installationStatus",
			):
				if getattr(data, attr) is not None:
					values[attr] = getattr(data, attr)
			poc_list.append(ProductOnClient(**values))
			result_data[client_id][product_id] = values

	try:
		backend.productOnClient_updateObjectsWithDependencies(poc_list)

	except Exception as err:  # pylint: disable=broad-except
		if isinstance(err, OpsiApiException):
			raise err
		logger.error("Could not create ProductOnClient: %s", err)
		return RESTErrorResponse(
			message="Could not create ProductOnClient.",
			http_status=status.HTTP_400_BAD_REQUEST,
			details=err,
		)

	return RESTResponse(http_status=http_status, data=result_data)


# Cache for product icons (avoid scanning depot on every request)
_product_icons_cache: dict[str, str] = {}
_product_icons_cache_time: float = 0
_PRODUCT_ICONS_CACHE_TTL: int = 300  # 5 minutes


def _scan_product_icons() -> dict[str, str]:
	"""Scan depot directory for product icon files.
	Reads productIconFilePath from opsi-meta-data.toml when available.
	"""
	import os
	import posixpath

	try:
		import tomllib
	except ModuleNotFoundError:
		import tomli as tomllib  # type: ignore[no-redef]

	from opsiconfd.config import DEPOT_DIR  # type: ignore[import]

	icons_map: dict[str, str] = {}
	try:
		for entry in os.scandir(DEPOT_DIR):
			if not entry.is_dir():
				continue
			product_id = entry.name

			meta_path = os.path.join(entry.path, "opsi-meta-data.toml")
			if not os.path.isfile(meta_path):
				continue
			try:
				with open(meta_path, "rb") as f:
					meta = tomllib.load(f)
				product_meta = meta.get("product", {})
				icon_file = product_meta.get("productIconFilePath", "") or product_meta.get("product_icon_file_path", "")
				if not icon_file:
					continue
				icon_file = icon_file.replace("\\", "/")
				normalized = posixpath.normpath(icon_file)
				if normalized.startswith("..") or normalized.startswith("/"):
					continue
				if os.path.isfile(os.path.join(entry.path, normalized)):
					icons_map[product_id] = f"/depot/{product_id}/{normalized}"
			except Exception:
				pass
	except Exception:
		pass
	return icons_map


@api_router.get("/api/opsidata/producticons")
def product_icons() -> JSONResponse:
	import time

	global _product_icons_cache, _product_icons_cache_time

	now = time.time()
	if _product_icons_cache and (now - _product_icons_cache_time) < _PRODUCT_ICONS_CACHE_TTL:
		return JSONResponse({"result": _product_icons_cache})

	_product_icons_cache = _scan_product_icons()
	_product_icons_cache_time = now
	return JSONResponse({"result": _product_icons_cache})


class Property(BaseModel):  # pylint: disable=too-few-public-methods
	productId: str
	propertyId: str
	type: str | None = "UnicodeProductProperty"
	version: str | None = None
	versionDetails: dict | None = None
	allValues: list[str] | None = ["value1"]
	possibleValues: list[str] | None = ["value1"]
	editable: bool | None = True
	editableDetails: dict | None = {}
	multiValue: bool | None = None
	multiValueDetails: dict | None = None
	description: str | None = None
	descriptionDetails: dict | None = None
	default: list[str] | None = ["value1"]
	depots: dict | None = {"depot1": ["value1"]}
	clients: dict | None = {"client1": ["value1"]}
	allClientValuesEqual: bool | None = True
	anyDepotDifferentFromDefault: bool | None = False
	anyClientDifferentFromDepot: bool | None = False
	newValue: str | None = ""
	newValues: list[str] | None = [""]


@api_router.get("/api/opsidata/products/{productId}/properties", response_model=dict[str, Property])
@rest_api
def product_properties(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name
	productId: str,
	selectedClients: list[str] = Depends(parse_client_list),
	selectedDepots: list[str] = Depends(parse_depot_list),
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
		depot_by_client = get_depots_of_clients(selectedClients)
		for client in selectedClients:
			depot = depot_by_client[client]
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
				GROUP_CONCAT(DISTINCT(pod.depotId) SEPARATOR ',') AS depots
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
					defaults = property["defaultDetails"]
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
							if isinstance(defaults, dict):
								property["defaultDetails"][depot] = [bool_value(defaults.get(depot))]

							else:
								property["defaultDetails"][depot] = [bool_value(defaults)]
							property["possibleValues"][depot] = [bool_value(value) for value in property["values"].split(",")]
						else:
							property["allValues"].update(unicode_value(property["values"]))
							property["defaultDetails"][depot] = unicode_value(defaults)
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
						values = session.execute(
							query,
							{
								"product": productId,
								"property": property["propertyId"],
								"depot": depot,
							},
						)
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
							values = session.execute(
								query,
								{
									"product": productId,
									"property": property["propertyId"],
									"client": client,
								},
							)
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
					(
						data["productDescriptionDetails"][depot],
						data["productAdviceDetails"][depot],
					) = get_product_description(productId, *data["productVersions"][depot].split("-"))

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

				for key in (
					"version",
					"description",
					"multiValue",
					"editable",
					"default",
				):
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
					property["newValue"] = ""
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
				message="Could not get properties.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err


@lru_cache(maxsize=1000)
def get_product_properties(product: str, version: str) -> list:
	product_version, package_version = version.split("-", 1)
	with mysql.session() as session:
		query = (
			select(text("propertyId"))
			.select_from(text("PRODUCT_PROPERTY"))
			.where(text("productId = :product_id AND productVersion = :product_version AND packageVersion = :package_version"))
		)

		result = session.execute(
			query,
			{
				"product_id": product,
				"product_version": product_version,
				"package_version": package_version,
			},
		)
		result = result.fetchall()
		properties = []
		for row in result:
			if row is not None:
				properties.append(dict(row).get("propertyId"))
	return properties


def get_product_product_property_state(object_id: str, product_id: str, property_id: str) -> str | None:
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

		result = session.execute(
			query,
			{
				"product_id": product_id,
				"property_id": property_id,
				"object_id": object_id,
			},
		)
		res = result.fetchone()
		if not res:
			return None
		return res[0]


class ProductProperty(BaseModel):  # pylint: disable=too-few-public-methods
	clientIds: list[str] | None = []
	depotIds: list[str] | None = []
	properties: dict


@api_router.post("/api/opsidata/products/{productId}/properties")
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
	objects: list = []
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

	depot_by_object = get_depots_of_clients(objects)
	with mysql.session() as session:
		for object_id in objects:
			if object_id not in result_data:
				result_data[object_id] = {}

			depot_id = depot_by_object[object_id]

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

				values = {
					"objectId": object_id,
					"productId": productId,
					"propertyId": property_id,
					"values": pp_values,
				}

				try:
					if get_product_product_property_state(object_id, productId, property_id):
						stmt = (
							update(
								table(
									"PRODUCT_PROPERTY_STATE",
									*[column(name) for name in values],
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
									"PRODUCT_PROPERTY_STATE",
									*[column(name) for name in values],
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
	data: list[Dependency]


@api_router.get(
	"/api/opsidata/products/{productId}/dependencies",
	response_model=ProductDependenciesResponse,
)
@rest_api
def product_dependencies(  # pylint: disable=too-many-locals, too-many-branches, too-many-statements, redefined-builtin, invalid-name
	productId: str,
	selectedClients: list[str] = Depends(parse_client_list),
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
		depot_by_client = get_depots_of_clients(selectedClients)
		for client in selectedClients:
			depots.add(depot_by_client[client])

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
					(
						data["productDescriptionDetails"][depot],
						data["productAdviceDetails"][depot],
					) = get_product_description(productId, *data["productVersions"][depot].split("-"))
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
				message="Could not get dependencies.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err

	return RESTResponse(http_status=status_code, data=data)


@api_router.post("/api/opsidata/products/{product}/unlock")
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


@api_router.post("/api/opsidata/products/unlock")
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


@api_router.get("/api/opsidata/locked-products", response_model=list[str])
@rest_api
def get_locked_products_list() -> RESTResponse:
	locked_products = backend.getProductLocks_hash()  # pylint: disable=no-member
	return RESTResponse(locked_products)


@api_router.get("/api/opsidata/products/installation-status", response_model=list[str])
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
				message="Could not get installationStatus.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err

	return RESTResponse(data=installation_status_list)


@api_router.get("/api/opsidata/products/action-result", response_model=list[str])
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
				message="Could not get actionResult.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err

	return RESTResponse(data=action_result_list)


@api_router.get("/api/opsidata/products/groups")
@rest_api
def get_product_groups(withProducts: bool = True) -> RESTResponse:  # pylint: disable=too-many-locals
	"""
	Get all product groups as a tree of groups.
	"""

	username = get_username()
	configured = product_group_access_configured(username)
	restricted = user_register() and configured
	allowed = None if not restricted else get_allowed_product_groups(username)

	params: dict = {}
	where = text("g.`type` = 'ProductGroup'")

	with mysql.session() as session:
		if withProducts:
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
				.join(
					text("OBJECT_TO_GROUP AS og"),
					text("og.groupType = g.`type` AND og.groupId = g.groupId"),
					isouter=True,
				)
				.where(where)
			)
		else:
			query = (
				select(
					text(
						"""
			g.parentGroupId AS parent_id,
			g.groupId AS group_id,
			NULL AS object_id,
			(SELECT COUNT(*) FROM OBJECT_TO_GROUP og WHERE og.groupId = g.groupId AND og.groupType = 'ProductGroup') AS member_count
		"""
					)
				)
				.select_from(text("`GROUP` AS g"))
				.where(where)
			)

		result = session.execute(query, params)
		result = result.fetchall()

		all_groups: dict = {}
		root_group = {
			"id": "groups",
			"type": "ProductGroup",
			"text": "groups",
			"parent": None,
		}
		all_groups = read_groups(
			result,
			root_group,
			selected_object_ids=[],
			allowed=allowed,
			withClients=withProducts,
			gtype="ProductGroup",
		)

		if not withProducts:
			for row in result:
				row_dict = dict(row)
				group_id = row_dict.get("group_id")
				member_count = int(row_dict.get("member_count", 0) or 0)
				if group_id and group_id in all_groups and member_count > 0:
					all_groups[group_id]["member_count"] = member_count
					if all_groups[group_id].get("children") is None:
						all_groups[group_id]["children"] = {}

		product_groups = build_nested_group(root_group, all_groups)
		return RESTResponse(data={"groups": product_groups})


@api_router.get("/api/opsidata/products/groups-dynamic")
@rest_api
def get_product_groups_dynamic(
	parentGroup: str | None = None,
	withProducts: bool = True,
	recursiveMembers: bool = False,
) -> RESTResponse:
	"""
	Get direct child product groups and products for a specific parent group.
	"""
	username = get_username()
	configured = product_group_access_configured(username)
	restricted = user_register() and configured
	allowed = None if not restricted else get_allowed_product_groups(username)
	# Configed semantics: children of an allowed group are allowed as well.
	allowed_children = expand_allowed_groups(allowed, "ProductGroup")

	if parentGroup == "root" or not parentGroup:
		parentGroup = "groups"
		where = text("g.`type` = 'ProductGroup' AND g.parentGroupId IS NULL")
	else:
		where = text("g.`type` = 'ProductGroup' AND g.parentGroupId = :parent")

	params: dict[str, str] = {}
	if parentGroup != "groups":
		params["parent"] = parentGroup

	with mysql.session() as session:
		if recursiveMembers and parentGroup and parentGroup != "groups":
			group_rows = session.execute(
				select(
					text(
						"""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id
			"""
					)
				)
				.select_from(text("`GROUP` AS g"))
				.where(text("g.`type` = 'ProductGroup'"))
			).fetchall()

			raw_group_rows = [dict(row) for row in group_rows if row]
			if restricted and parentGroup.lower() not in (allowed_children or set()) and parentGroup != "groups":
				return RESTResponse(
					data={
						"groups": {
							"id": parentGroup,
							"type": "ProductGroup",
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
				actual_group_ids = [group_id for group_id in actual_group_ids if group_id.lower() in (allowed_children or set())]

			member_conditions = []
			member_params: dict[str, str] = {}
			for idx, group_id in enumerate(actual_group_ids):
				param_name = f"group_{idx}"
				member_params[param_name] = group_id
				member_conditions.append(text(f"og.groupId = :{param_name}"))

			if not member_conditions:
				return RESTResponse(
					data={
						"groups": {
							"id": parentGroup,
							"type": "ProductGroup",
							"text": parentGroup,
							"parent": None,
							"children": {},
						},
						"members": [],
					}
				)

			member_rows = session.execute(
				select(text("DISTINCT og.objectId AS object_id"))
				.select_from(text("OBJECT_TO_GROUP AS og"))
				.where(and_(text("og.groupType = 'ProductGroup'"), or_(*member_conditions))),
				member_params,
			).fetchall()

			members = sorted({str(row["object_id"]) for row in member_rows if row and row["object_id"]})
			return RESTResponse(
				data={
					"groups": {
						"id": parentGroup,
						"type": "ProductGroup",
						"text": parentGroup,
						"parent": None,
						"children": {},
					},
					"members": members,
				}
			)

		child_groups_query = (
			select(
				text(
					"""
				g.parentGroupId AS parent_id,
				g.groupId AS group_id
			"""
				)
			)
			.select_from(text("`GROUP` AS g"))
			.where(where)
		)
		child_group_rows = session.execute(child_groups_query, params).fetchall()

		child_group_ids = [row["group_id"] for row in child_group_rows if row and row["group_id"]]
		member_counts: dict[str, int] = {}
		if child_group_ids:
			count_query = (
				select(
					text(
						"""
					og.groupId AS group_id,
					COUNT(*) AS member_count
				"""
					)
				)
				.select_from(text("OBJECT_TO_GROUP AS og"))
				.where(text("og.groupType = 'ProductGroup' AND og.groupId IN :group_ids"))
				.group_by(text("og.groupId"))
			)
			count_result = session.execute(count_query, {"group_ids": child_group_ids}).fetchall()
			member_counts = {row["group_id"]: int(row["member_count"] or 0) for row in count_result if row is not None}

		member_rows = []
		if withProducts and parentGroup != "groups":
			member_query = (
				select(text("og.objectId AS object_id"))
				.select_from(text("OBJECT_TO_GROUP AS og"))
				.where(text("og.groupType = 'ProductGroup' AND og.groupId = :parent"))
			)
			member_rows = session.execute(member_query, {"parent": parentGroup}).fetchall()

	product_groups: dict[str, Any] = {
		"id": parentGroup,
		"type": "ProductGroup",
		"text": parentGroup,
		"parent": None,
		"children": {},
	}

	if restricted and parentGroup.lower() not in (allowed_children or set()) and parentGroup != "groups":
		return RESTResponse(data={"groups": product_groups})

	for row in child_group_rows:
		group_id = row["group_id"]
		if not group_id:
			continue
		if restricted and group_id.lower() not in (allowed_children or set()):
			continue
		product_groups["children"][group_id] = {
			"id": f"{group_id};{parentGroup.lower()}",
			"type": "ProductGroup",
			"text": group_id,
			"parent": parentGroup,
			"children": None,
			"member_count": member_counts.get(group_id, 0),
		}

	if withProducts:
		for row in member_rows:
			object_id = row["object_id"]
			if not object_id:
				continue
			product_groups["children"][object_id] = {
				"id": f"{object_id};{parentGroup.lower()}",
				"type": "ObjectToGroup",
				"text": object_id,
				"parent": parentGroup,
				"allowed": True,
			}

	return RESTResponse(data={"groups": product_groups})


@api_router.get("/api/opsidata/products/groups/{group}")
@rest_api
@read_only_check
def delete_product_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,
	group: str,  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Delete product group
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


@api_router.put("/api/opsidata/products/groups/{group}")
@rest_api
@read_only_check
def update_product_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	group: str,
	parent: str = Body(default=None),
	description: str = Body(default=None),
	note: str = Body(default=None),
) -> RESTResponse:
	"""
	Update product group
	"""
	values = {"id": group, "type": "ProductGroup"}
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


@api_router.delete("/api/opsidata/products/groups/{group}/products")
@rest_api
@read_only_check
def rm_products_from_product_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,
	group: str,  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Remove products from product group
	"""

	try:
		backend.objectToGroup_delete(groupType="ProductGroup", objectId="*", groupId=group)
	except Exception as error:  # pylint: disable=broad-exception-caught
		logger.error(error)
		return RESTErrorResponse(message=f"Could not delete products from group {group}.", details=error)

	return RESTResponse(data=f"Removed products from {group}.")


@api_router.delete("/api/opsidata/products/groups/{group}/{product}")
@rest_api
@read_only_check
def rm_product_from_product_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,
	group: str,
	product: str,  # pylint: disable=unused-argument
) -> RESTResponse:
	"""
	Remove product from product group
	"""

	try:
		backend.objectToGroup_delete(groupType="ProductGroup", objectId=product, groupId=group)
	except Exception as error:  # pylint: disable=broad-exception-caught
		logger.error(error)
		return RESTErrorResponse(
			message=f"Could not delete product '{product}' from group '{group}'.",
			details=error,
		)

	return RESTResponse(data=f"Removed product {product} from {group}.")


@api_router.post("/api/opsidata/products/groups/{group}/products")
@rest_api
@read_only_check
def add_products_host_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request,  # pylint: disable=unused-argument
	group: str,
	products: list[str] = Body(default=None),
) -> RESTResponse:
	"""
	Add products to product group
	"""
	if not products:
		return RESTErrorResponse(
			http_status=status.HTTP_400_BAD_REQUEST,
			message="No products given.",
		)

	with mysql.session() as session:
		try:
			values = {
				"groupType": "ProductGroup",
				"groupId": group,
			}

			for product in products:
				values["objectId"] = product
				query = insert(
					table(
						"OBJECT_TO_GROUP",
						column("groupType"),
						column("groupId"),
						column("objectId"),
					)
				).values(values)
				session.execute(query)

			return RESTResponse(data=products, http_status=status.HTTP_201_CREATED)

		except Exception as err:  # pylint: disable=broad-except
			logger.error("Could not add product '%s' to group object.", product)
			logger.error(err)
			session.rollback()
			raise OpsiApiException(
				message=f"Could not add product '{product}' to group object.",
				http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error=err,
			) from err


class ProductGroup(BaseModel):  # pylint: disable=too-few-public-methods
	groupId: str
	parentGroupId: str | None = None
	description: str | None = None
	notes: str | None = None


@api_router.post("/api/opsidata/products/groups")
@rest_api
@read_only_check
def create_product_group(  # pylint: disable=invalid-name, too-many-locals, too-many-branches, too-many-statements
	request: Request, group: ProductGroup
) -> RESTResponse:
	"""
	Create product groups
	"""

	values = vars(group)
	values["type"] = "ProductGroup"

	if group.parentGroupId == "groups" or not group.parentGroupId:
		group.parentGroupId = None
	if group.parentGroupId:
		groups = get_groups_ids("ProductGroup")
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
