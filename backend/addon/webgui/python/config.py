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

from .utils import bool_value, mysql, parse_client_list, unicode_config, unicode_value

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
			(SELECT GROUP_CONCAT(CONFIG_VALUE.value  SEPARATOR ',') FROM CONFIG_VALUE WHERE CONFIG_VALUE.configId=c.configId AND CONFIG_VALUE.isDefault=1) AS value,
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
				row_dict["multiValue"] = bool(row_dict.get("multiValue", False))
				row_dict["editable"] = bool(row_dict.get("editable", False))
				if id_prefix not in config_data:
					id_prefix = "general"
				if row_dict.get("multiValue"):
					row_dict["value"] = row_dict.get("value", "").split(",")
				if row_dict.get("type") == "BoolConfig":
					row_dict["value"] = bool_value(row_dict.get("value", ""))
					row_dict["possibleValues"] = [bool_value(value) for value in row_dict.get("possibleValues", "").split(",")]
				else:
					row_dict["possibleValues"] = row_dict.get("possibleValues", "").split(",")
				logger.devel(row_dict.get("editable"))
				logger.devel(row_dict.get("editable", False))
				if row_dict.get("editable", False):
					row_dict["newValue"] = ""
					row_dict["newValues"] = []

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
			(SELECT GROUP_CONCAT(IF(cs.values IS NOT NULL, cs.values, CONFIG_VALUE.value)  SEPARATOR ',') FROM CONFIG_VALUE WHERE CONFIG_VALUE.configId=c.configId AND CONFIG_VALUE.isDefault=1) AS value,
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
				if row_dict.get("editable", False):
					row_dict["newValue"] = ""
					row_dict["newValues"] = []
				config_data[id_prefix].append(row_dict)

		logger.devel(count)
		return RESTResponse(data=config_data)


@conifg_router.get("/api/opsidata/config/clients")
@rest_api
def get_client_configs(
	selectedClients: List[str] = Depends(parse_client_list),
	commons: dict = Depends(common_query_parameters),
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get client config data.
	"""

	params: dict = {"clients": selectedClients, "num_clients": len(selectedClients)}
	with mysql.session() as session:
		query = (
			select(
				text(  # type: ignore
					"""
			cv.configId AS configId,
			c.description AS description,
			c.type AS type,
			GROUP_CONCAT(DISTINCT IF(cv.isDefault, cv.value, NULL) SEPARATOR ';') AS defaultValue,
			IF(
				COUNT(DISTINCT cs.values) > 1,
				"mixed",
				IF(cs.values IS NOT NULL, cs.values, cv.value)
			) AS value,
			GROUP_CONCAT(DISTINCT IF(cs.values IS NOT NULL, cs.values, cv.value) SEPARATOR ';') AS clientValues,
			GROUP_CONCAT(DISTINCT cv.value SEPARATOR ';') AS possibleValues,
			c.multiValue AS multiValue,
			c.editable AS editable,
			GROUP_CONCAT(DISTINCT cs.objectId SEPARATOR ';') AS clientsWithDiff
		"""
				)
			)
			.select_from(table("CONFIG").alias("c"))
			.join(text("CONFIG_VALUE AS cv"), text("c.configId = cv.configId"))  # type: ignore[arg-type]
			.join(
				text("CONFIG_STATE AS cs"),
				text(("c.configId=cs.configId AND cs.objectId IN :clients OR cs.objectId IS NULL")),
				isouter=True,
			)
			# .where(text("c.configId='opsi-linux-bootimage.append'"))
			.group_by(text("c.configId"))
		)  # pylint: disable=redefined-outer-name

		query = order_by(query, commons)  # type: ignore[assignment,arg-type]
		# query = pagination(query, commons)  # type: ignore[assignment,arg-type]
		logger.devel(query)
		result = session.execute(query, params)
		result = result.fetchall()
		configs: dict = {"general": [], "clientconfig": [], "opsi-script": [], "opsiclientd": [], "software-on-demand": []}
		server_configs = ["user", "configed"]
		count = 0

		for row in result:
			if row is not None:
				config = dict(row)
				logger.devel("1: %s", config)

				id_prefix = config.get("configId", "").split(".")[0]
				if id_prefix in server_configs:
					continue
				if id_prefix not in configs:
					id_prefix = "general"

				config["multiValue"] = bool(config.get("multiValue", ""))
				config["editable"] = bool(config.get("editable", ""))

				if config.get("value", "") == "mixed":
					config["allClientValuesEqual"] = False
				else:
					config["allClientValuesEqual"] = True

				if config.get("type", "") == "BoolConfig":
					config["value"] = bool_value(config.get("value", ""))
					config["possibleValues"] = [True, False]
					config["defaultValue"] = bool_value(config.get("defaultValue", ""))
					config["clientValues"] = [bool_value(value) for value in config.get("clientValues", "").split(";")]
				else:
					config["value"] = unicode_config(config.get("value", ""), multi_value=config.get("multiValue", False))
					config["possibleValues"] = [unicode_config(value) for value in config.get("possibleValues", "").split(";")]
					config["defaultValue"] = unicode_config(config.get("defaultValue", ""), multi_value=config.get("multiValue", False))
					config["clientValues"] = [
						unicode_config(value, multi_value=config.get("multiValue", False))
						for value in config.get("clientValues", "").split(";")
					]
					logger.devel(config.get("possibleValues", []))
					logger.devel("CLIENT VALUES: %s", config.get("clientValues", []))

					p_values = config.get("possibleValues", [])

					for values in config.get("clientValues", []):
						p_values.extend(values)
					config["possibleValues"] = list(dict.fromkeys(p_values))
					logger.devel(config.get("possibleValues", []))

				if not config.get("allClientValuesEqual") or config.get("value", "") != config.get("defaultValue", ""):
					config["anyClientDiffrentFromDefault"] = True
				else:
					config["anyClientDiffrentFromDefault"] = False

				logger.devel("2: %s", config)
				# logger.devel(config.get("value", ""))
				# logger.devel(config.get("defaultValue", ""))
				# logger.devel(config.get("value", "") == "mixed" or config.get("value", "") != config.get("defaultValue", ""))
				config["clients"] = {}
				if (
					config.get("clientsWithDiff", "")
					and not config.get("allClientValuesEqual", False)
					and config.get("value", "") != config.get("defaultValue", "")
				):
					logger.devel("mixed")
					clients = config.get("clientsWithDiff", "").split(";")

					for idx, client in enumerate(clients):
						config["clients"][client] = {}
						if config.get("type") == "BoolConfig":
							config["clients"][client] = config.get("clientValues", [])[idx]
						else:
							config["clients"][client] = config.get("clientValues", [])[idx]

				del config["clientValues"]
				del config["clientsWithDiff"]
				del config["value"]
				for client in selectedClients:
					if client not in config.get("clients", []):
						config["clients"][client] = config.get("defaultValue", "")

				if config.get("editable", False):
					config["newValue"] = ""
					config["newValues"] = []

				count = count + 1
				logger.devel("3: %s", config)
				configs[id_prefix].append(config)

				# config["multiValue"] = bool(config.get("multiValue", ""))
				# config["editable"] = bool(config.get("editable", ""))
				# id_prefix = config.get("configId", "").split(".")[0]
				# if id_prefix in server_configs:
				# 	continue
				# if id_prefix not in configs:
				# 	id_prefix = "general"
				# if config.get("type") == "BoolConfig":
				# 	config["value"] = bool_value(config.get("value", ""))
				# 	config["defaultValue"] = bool_value(config.get("defaultValue", ""))
				# 	config["possibleValues"] = [bool_value(value) for value in config.get("possibleValues", "").split(";")]

				# else:
				# 	config["value"] = unicode_config(config.get("value", ""), config["multiValue"])
				# 	config["defaultValue"] = unicode_config(config.get("defaultValue", ""), config["multiValue"])
				# 	config["possibleValues"] = [unicode_value(value) for value in config.get("possibleValues", "").split(";")]
				# logger.devel(config)
				# if config.get("clients") and config.get("value") == "mixed" and config.get("defaultValue") != config.get("valueDetails"):
				# 	config["clients"] = config.get("clients", "").split(";")

				# 	config["values"] = {}
				# 	for idx, client in enumerate(config.get("clients", [])):  #

				# 		if config.get("type") == "BoolConfig":
				# 			config["values"][client] = bool_value(config.get("valueDetails", "").split(";")[idx])
				# 		else:
				# 			config["values"][client] = unicode_config(config.get("valueDetails", "").split(";")[idx], config["multiValue"])
				# else:
				# 	del config["valueDetails"]
				# count = count + 1
				# logger.devel(config)
				# configs[id_prefix].append(config)

		logger.devel(count)
		return RESTResponse(data=configs)
