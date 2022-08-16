# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui config methods
"""


from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, or_, select, table, text, union

from opsiconfd.logging import logger
from opsiconfd.rest import RESTResponse, common_query_parameters, order_by, rest_api

from .utils import bool_value, mysql

conifg_router = APIRouter()


@conifg_router.get("/api/opsidata/config/server")
@rest_api
def get_server_config(
	commons: dict = Depends(common_query_parameters),
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get server config data.
	"""

	params: dict = {}
	with mysql.session() as session:
		query = (
			select(
				text(  # type: ignore
					"""
			cv.configId AS configId,
			c.description AS description,
			c.type AS type,
			cv.value AS value,
			(SELECT GROUP_CONCAT(`value`  SEPARATOR ',') FROM CONFIG_VALUE WHERE configId=c.configId) AS possibleValues,
			c.multiValue AS multiValue,
			c.editable AS editable
		"""
				)
			)
			.select_from(table("CONFIG_VALUE").alias("cv"))
			.join(text("CONFIG AS c"), text("cv.configId=c.configId"))  # type: ignore[arg-type]
			.where(text("cv.isDefault=1"))
		)  # pylint: disable=redefined-outer-name

		query = order_by(query, commons)  # type: ignore[assignment,arg-type]
		# query = pagination(query, commons)  # type: ignore[assignment,arg-type]
		logger.devel(query)
		result = session.execute(query, params)
		result = result.fetchall()
		config_data: dict = {
			"general": [],
			"clientconfig": [],
			"configed": [],
			"opsi-script": [],
			"opsiclientd": [],
			"software-on-demand": [],
			"user": [],
		}
		for row in result:
			if row is not None:
				row_dict = dict(row)
				id_prefix = row_dict.get("configId", "").split(".")[0]
				if id_prefix not in config_data:
					id_prefix = "general"
				if row_dict.get("type") == "BoolConfig":
					row_dict["value"] = bool_value(row_dict.get("value", ""))
					row_dict["possibleValues"] = [bool_value(value) for value in row_dict.get("possibleValues", "").split(",")]
				else:
					row_dict["possibleValues"] = row_dict.get("possibleValues", "").split(",")
				row_dict["multiValue"] = bool(row_dict.get("multiValue", ""))
				row_dict["editable"] = bool(row_dict.get("editable", ""))

				config_data[id_prefix].append(row_dict)
		return RESTResponse(data=config_data)


@conifg_router.get("/api/opsidata/config/clients/{object_id}")
@rest_api
def get_client_config(
	object_id: str,
	commons: dict = Depends(common_query_parameters),
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get client config data.
	"""

	params: dict = {}
	with mysql.session() as session:
		query = (
			select(
				text(  # type: ignore
					"""
			cv.configId AS configId,
			c.description AS description,
			c.type AS type,
			cv.value AS defaultValue,
			IF(cs.values IS NOT NULL, cs.values, cv.value) as value,
			(SELECT GROUP_CONCAT(`value`  SEPARATOR ',') FROM CONFIG_VALUE WHERE configId=c.configId) AS possibleValues,
			c.multiValue AS multiValue,
			c.editable AS editable,
			cs.objectId AS objectId
		"""
				)
			)
			.select_from(table("CONFIG").alias("c"))
			.join(text("CONFIG_VALUE AS cv"), text("c.configId=cv.configId"))  # type: ignore[arg-type]
			.join(
				text("CONFIG_STATE AS cs"),
				and_(text("c.configId=cs.configId"), text((f"cs.objectId IS NULL OR cs.objectId='{object_id}'"))),
				isouter=True,
			)
			.where(text("cv.isDefault=1"))
			.group_by(text("c.configId, cs.objectId"))
		)  # pylint: disable=redefined-outer-name

		query = order_by(query, commons)  # type: ignore[assignment,arg-type]
		# query = pagination(query, commons)  # type: ignore[assignment,arg-type]
		logger.devel(query)
		result = session.execute(query, params)
		result = result.fetchall()
		config_data: dict = {"general": [], "clientconfig": [], "opsi-script": [], "opsiclientd": [], "software-on-demand": []}
		server_configs = ["user", "configed"]
		count = 0
		my_list = []
		for row in result:
			if row is not None:
				row_dict = dict(row)
				id_prefix = row_dict.get("configId", "").split(".")[0]
				if id_prefix in server_configs:
					continue
				if id_prefix not in config_data:
					id_prefix = "general"
				if row_dict.get("type") == "BoolConfig":
					row_dict["value"] = bool_value(row_dict.get("value", ""))
					row_dict["defaultValue"] = bool_value(row_dict.get("defaultValue", ""))
					row_dict["possibleValues"] = [bool_value(value) for value in row_dict.get("possibleValues", "").split(",")]
				else:
					row_dict["possibleValues"] = row_dict.get("possibleValues", "").split(",")
				row_dict["multiValue"] = bool(row_dict.get("multiValue", ""))
				row_dict["editable"] = bool(row_dict.get("editable", ""))
				count = count + 1
				my_list.append(row_dict.get("configId", ""))
				config_data[id_prefix].append(row_dict)

		logger.devel(count)
		return RESTResponse(data=config_data)
