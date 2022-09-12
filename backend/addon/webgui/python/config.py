# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui config methods
"""


import json
from numbers import Integral
from sqlite3 import IntegrityError
from typing import List, Optional, Union

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, column, or_, select, table, text, update
from sqlalchemy.dialects.mysql import insert

from opsiconfd.logging import logger
from opsiconfd.rest import (
	RESTErrorResponse,
	RESTResponse,
	common_query_parameters,
	order_by,
	rest_api,
)

from .utils import bool_value, mysql, parse_client_list, read_only_check, unicode_value

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
	where = text("cv.isDefault=1")
	if commons.get("filterQuery"):
		where = and_(where, text("(c.configId LIKE :search)"))
		params["search"] = f"%{commons['filterQuery']}%"

	with mysql.session() as session:
		query = (
			select(
				text(  # type: ignore
					"""
			cv.configId AS configId,
			c.description AS description,
			c.type AS type,
			(SELECT GROUP_CONCAT(CONFIG_VALUE.value  SEPARATOR '|') FROM CONFIG_VALUE WHERE CONFIG_VALUE.configId=c.configId AND CONFIG_VALUE.isDefault=1) AS value,
			(SELECT GROUP_CONCAT(`value`  SEPARATOR '|') FROM CONFIG_VALUE WHERE configId=c.configId) AS possibleValues,
			c.multiValue AS multiValue,
			c.editable AS editable
		"""
				)
			)
			.select_from(table("CONFIG_VALUE").alias("cv"))
			.join(text("CONFIG AS c"), text("cv.configId=c.configId"))  # type: ignore[arg-type]
			.where(where)
			.group_by(text("c.configId"))
		)  # pylint: disable=redefined-outer-name

		query = order_by(query, commons)  # type: ignore[assignment,arg-type]
		# query = pagination(query, commons)  # type: ignore[assignment,arg-type]

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
					row_dict["value"] = row_dict.get("value", "").split("|")
				if row_dict.get("type") == "BoolConfig":
					row_dict["value"] = bool_value(row_dict.get("value", ""))
					row_dict["possibleValues"] = [bool_value(value) for value in row_dict.get("possibleValues", "").split("|")]
				else:
					row_dict["possibleValues"] = row_dict.get("possibleValues", "").split("|")

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

	where = text("")
	params: dict = {"clients": selectedClients, "num_clients": len(selectedClients)}
	if commons.get("filterQuery"):
		where = text("(c.configId LIKE :search)")
		params["search"] = f"%{commons['filterQuery']}%"

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
				IF(cs.values IS NOT NULL, cs.values, GROUP_CONCAT(DISTINCT IF(cv.isDefault, cv.value, NULL) SEPARATOR ';'))
			) AS value,
			GROUP_CONCAT(DISTINCT cs.values SEPARATOR ';') AS clientValuesOld,
			(SELECT GROUP_CONCAT(cs.values SEPARATOR ';') FROM CONFIG_STATE AS cs WHERE cs.configId=c.configId AND cs.objectId IN :clients GROUP BY cs.configId) AS clientValues,
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
			.where(where)
			.group_by(text("c.configId"))
		)  # pylint: disable=redefined-outer-name

		query = order_by(query, commons)  # type: ignore[assignment,arg-type]

		result = session.execute(query, params)
		result = result.fetchall()
		configs: dict = {"general": [], "clientconfig": [], "opsi-script": [], "opsiclientd": [], "software-on-demand": []}
		server_configs = ["user", "configed"]
		count = 0

		for row in result:
			if row is not None:
				config = dict(row)

				id_prefix = config.get("configId", "").split(".")[0]
				if id_prefix in server_configs:
					continue
				if id_prefix not in configs:
					id_prefix = "general"

				config["multiValue"] = bool(config.get("multiValue", ""))
				config["editable"] = bool(config.get("editable", ""))

				if not config.get("clientValues"):
					config["clientValues"] = ""
				if not config.get("clientsWithDiff"):
					config["clientsWithDiff"] = ""

				if config.get("type", "") == "BoolConfig":
					config["value"] = bool_value(config.get("value", ""))
					config["possibleValues"] = [True, False]
					config["defaultValue"] = bool_value(config.get("defaultValue", ""))
					config["clientValues"] = [bool_value(value) for value in config.get("clientValues", "").split(";")]
				else:
					config["value"] = unicode_value(config.get("value", ""))
					config["possibleValues"] = unicode_value(config.get("possibleValues", ""))
					config["defaultValue"] = unicode_value(config.get("defaultValue", ""))
					if ";" in config.get("clientValues", ""):
						config["clientValues"] = [unicode_value(value) for value in config.get("clientValues", "").split(";")]
					elif config.get("multiValue", False):
						config["clientValues"] = [unicode_value(config.get("clientValues", ""))]
					else:
						config["clientValues"] = unicode_value(config.get("clientValues", ""))
					p_values = config.get("possibleValues", [])

					for values in config.get("clientValues", []):
						if isinstance(values, list):
							p_values.extend(values)
						else:
							p_values.append(values)

					config["possibleValues"] = list(dict.fromkeys(p_values))

				if (
					(
						len(config.get("clientsWithDiff", "").split(";")) != len(selectedClients)
						and config.get("value", "") != config.get("defaultValue", "")
					)
					or config.get("value", "") == "mixed"
					or config.get("clientValues", []) == config.get("values", [])
					or config.get("clientValues", [])[0] == config.get("defaultValue", [])
				):
					config["allClientValuesEqual"] = False
				else:
					config["allClientValuesEqual"] = True

				if not config.get("allClientValuesEqual") or config.get("value", "") != config.get("defaultValue", ""):
					config["anyClientDiffrentFromDefault"] = True
				else:
					config["anyClientDiffrentFromDefault"] = False

				config["clients"] = {}
				if (
					config.get("clientsWithDiff", "")
					and (not config.get("allClientValuesEqual", False) or len(config.get("clientsWithDiff", "").split(";")) == len(selectedClients))  # len 1
					and config.get("value", "") != config.get("defaultValue", "")
				):

					clients = config.get("clientsWithDiff", "").split(";")

					for idx, client in enumerate(clients):
						config["clients"][client] = {}
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
				configs[id_prefix].append(config)

		return RESTResponse(data=configs)


class Config(BaseModel):
	configId: str
	description: Optional[str]
	value: Optional[Union[str, List[str], bool]]


class ConfigStates(BaseModel):  # pylint: disable=too-few-public-methods
	clientIds: Optional[List[str]] = []
	configs: List[Config]


@conifg_router.post("/api/opsidata/config/server")
@rest_api
@read_only_check
def save_config(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, data: List[Config]
) -> RESTResponse:
	"""
	save config value
	"""
	errors = []
	for config in data:

		with mysql.session() as session:
			try:
				values = {"configId": config.configId, "value": config.value, "isDefault": True}
				stmt = (
					update(
						table(
							"CONFIG_VALUE", column("isDefault")
						)  # pylint: disable=consider-iterating-dictionary
					)
					.where(text(f"configId = '{config.configId}' AND isDefault = 1"))
					.values(**{"isDefault": False})
				)
				session.execute(stmt)
				if isinstance(config.value, list):
					for value in config.value:
						values = {"configId": config.configId, "value": value, "isDefault": True}
						if get_config_value(config.configId, value):
							stmt = (
								update(
									table(
										"CONFIG_VALUE", *[column(name) for name in values.keys()]
									)  # pylint: disable=consider-iterating-dictionary
								)
								.where(text(f"configId = '{config.configId}' AND value = '{value}'"))
								.values(**values)
							)
						else:
							stmt = (
								insert(
									table(
										"CONFIG_VALUE", *[column(name) for name in values.keys()]  # pylint: disable=consider-iterating-dictionary
									)
								)
								.values(**values)
								.on_duplicate_key_update(**values)
							)
				else:
					value = config.value
					values = {"configId": config.configId, "value": value, "isDefault": True}
					if get_config_value(config.configId, value):
						stmt = (
							update(
								table(
									"CONFIG_VALUE", *[column(name) for name in values.keys()]
								)  # pylint: disable=consider-iterating-dictionary
							)
							.where(text(f"configId = '{config.configId}' AND value = '{value}'"))
							.values(**values)
						)
					else:
						stmt = (
							insert(
								table(
									"CONFIG_VALUE", *[column(name) for name in values.keys()]  # pylint: disable=consider-iterating-dictionary
								)
							)
							.values(**values)
							.on_duplicate_key_update(**values)
						)
				session.execute(stmt)
				logger.debug("Config %s saved.", config.configId)
			except Exception as err:  # pylint: disable=broad-except
				logger.error("Could not save config: %s", err)
				session.rollback()
				errors.append({"id": config.configId, "error": str(err)})
	if errors:
		message = "Failed to save: "
		ids = []
		for config in errors:
			message += config.get("id") + "\n"
			ids.append(config.get("id"))
		return RESTErrorResponse(message=message, http_status=status.HTTP_400_BAD_REQUEST, details=errors)

	return RESTResponse(http_status=status.HTTP_200_OK, data=data[0].configId)

@conifg_router.post("/api/opsidata/config/clients")
@rest_api
@read_only_check
def save_config_state(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, data: ConfigStates
) -> RESTResponse:
	"""
	Save config State
	"""

	for client in data.clientIds:
		for config in data.configs:

			if isinstance(config.value, bool):
				cs_values = f"[{config.value}]".lower()
			elif isinstance(config.value, list):
				cs_values = json.dumps(config.value)
			else:
				cs_values = f'["{config.value}"]'

			values = {"objectId": client, "configId": config.configId, "values": cs_values}

			with mysql.session() as session:
				if get_config_state(client, config.configId):
					stmt = (
						update(
							table(
								"CONFIG_STATE", *[column(name) for name in values.keys()]
							)  # pylint: disable=consider-iterating-dictionary
						)
						.where(text(f"objectId = '{client}' AND configId = '{ config.configId}'"))
						.values(**values)
					)
				else:
					stmt = (
						insert(
							table(
								"CONFIG_STATE", *[column(name) for name in values.keys()]  # pylint: disable=consider-iterating-dictionary
							)
						)
						.values(**values)
						.on_duplicate_key_update(**values)
					)
				session.execute(stmt)

	return RESTResponse(http_status=status.HTTP_200_OK, data=data.configs[0].configId)


def get_config_state(object_id: str, config_id: str) -> Union[str, None]:

	with mysql.session() as session:
		query = (
			select(
				text(
					"""
			cs.objectId AS objectId,
			cs.configId AS configId,
			cs.`values` AS `values`
		"""
				)
			)
			.select_from(text("CONFIG_STATE AS cs"))
			.where(text("configId = :config_id AND objectId = :object_id"))
		)

		result = session.execute(query, {"config_id": config_id, "object_id": object_id})
		res = result.fetchone()
		if not res:
			return None
		return res[0]


def get_config_value(config_id: str, value: Union[str, List[str], bool]) -> List:

	with mysql.session() as session:
		query = (
			select(
				text(
					"""
			cv.configId AS configId,
			cv.`value` AS `value`,
			cv.isDefault AS is_default
		"""
				)
			)
			.select_from(text("CONFIG_VALUE AS cv"))
			.where(text("cv.configId = :config_id AND cv.`value` = :value"))
		)

		result = session.execute(query, {"config_id": config_id, "value": value})
		result = result.fetchall()
		config_values = []
		for row in result:
			if row is not None:
				config_values.append(dict(row))
		return config_values
