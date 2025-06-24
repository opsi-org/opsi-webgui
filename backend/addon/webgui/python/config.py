# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui config methods
"""

import json
from typing import List, Literal, Optional, Union

from fastapi import APIRouter, Depends, Request, status
from opsiconfd.backend import get_protected_backend
from opsiconfd.logging import logger
from opsiconfd.rest import OpsiApiException, RESTErrorResponse, RESTResponse, common_query_parameters, order_by, rest_api
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from sqlalchemy import and_, column, select, table, text, update  # type: ignore[import]
from sqlalchemy.dialects.mysql import insert  # type: ignore[import]
from sqlalchemy.exc import IntegrityError  # type: ignore[import]

from .utils import backend, bool_value, mysql, parse_client_list, read_only_check, unicode_value, unicode_config

config_router = APIRouter()


@config_router.get("/api/opsidata/config")
@config_router.get("/api/opsidata/config/server")
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
						(SELECT GROUP_CONCAT(CONFIG_VALUE.value  SEPARATOR '|')
							FROM CONFIG_VALUE WHERE CONFIG_VALUE.configId=c.configId AND CONFIG_VALUE.isDefault=1) AS value,
						(SELECT GROUP_CONCAT(`value`  SEPARATOR '|')
							FROM CONFIG_VALUE WHERE configId=c.configId) AS possibleValues,
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


				val = row_dict.get("value", "")
				if row_dict.get("type") == "BoolConfig":
					pos_val_list = [bool_value(value) for value in row_dict.get("possibleValues", "").split("|")]
					row_dict["value"] = bool_value(val)
				else:
					pos_val_list = row_dict.get("possibleValues", "").split("|")
					row_dict["value"] = unicode_config(val, multi_value=row_dict.get("multiValue", False), delimiter="|")

				row_dict["possibleValues"] = list(set(pos_val_list))  # remove duplicates

				if row_dict.get("editable", False):
					row_dict["newValue"] = ""
					row_dict["newValues"] = []

				config_data[id_prefix].append(row_dict)
		return RESTResponse(data=config_data)


@config_router.get("/api/opsidata/config/objects/{object_id}")
@rest_api
def get_client_config(
	object_id: str,
	commons: dict = Depends(common_query_parameters),
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get client config data.
	"""

	backend = get_protected_backend()
	config_states = backend.configState_getValues(object_ids=object_id).get(object_id, {})
	configs = backend.config_getObjects()

	config_data: dict = {"general": [], "clientconfig": [], "opsi-script": [], "opsiclientd": [], "software-on-demand": [], "licensing": []}
	server_configs = ["user", "configed"]
	for config in configs:
		id_prefix = config.id.split(".")[0]
		if id_prefix in server_configs:
			continue
		if id_prefix not in config_data:
			id_prefix = "general"
		tmp_config = config.to_hash()
		tmp_config["objects"] = {}
		if config.getType() == "BoolConfig":
			tmp_config["objects"][object_id] = bool_value(config_states.get(config.id, {})[0])
		elif config.multiValue:
			tmp_config["objects"][object_id] = config_states.get(config.id, {})
		else:
			tmp_config["objects"][object_id] = (
				config_states.get(config.id) if config_states.get(config.id) and config_states.get(config.id, {})[0] else ""
			)
		tmp_config["configId"] = config.id
		if config.editable:
			tmp_config["newValue"] = ""
			tmp_config["newValues"] = []
		config_data[id_prefix].append(tmp_config)

	logger.debug(config_states)
	return RESTResponse(data=config_data)


@config_router.get("/api/opsidata/config/clients")
@rest_api
def get_client_configs(  # pylint: disable=too-many-locals,too-many-branches,too-many-statements
	selectedClients: List[str] = Depends(parse_client_list),  # pylint: disable=invalid-name
	commons: dict = Depends(common_query_parameters),
) -> RESTResponse:
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
						(SELECT GROUP_CONCAT(cs.values SEPARATOR ';')
							FROM CONFIG_STATE AS cs WHERE cs.configId=c.configId AND cs.objectId IN :clients GROUP BY cs.configId) AS clientValues,
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
					and (
						not config.get("allClientValuesEqual", False)
						or len(config.get("clientsWithDiff", "").split(";")) == len(selectedClients)
					)  # len 1
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


@config_router.get("/api/opsidata/config/exists/{configid}")
@rest_api
def exists_config(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, configid: str
) -> RESTResponse:
	"""
	Check if a config exists
	"""
	logger.warning("Checking if config %s exists", configid)
	try:
		config_ids = backend.config_getIdents()
		return RESTResponse(data=configid in config_ids)
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not check if config object exists, error: %s", err)
		raise OpsiApiException(
			message="Could not check if config object exists.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


ConfigType = Literal["UnicodeConfig", "BoolConfig"]


class ConfigComplete(BaseModel):  # pylint: disable=too-few-public-methods
	configId: str
	editable: bool = False
	multiValue: bool = False
	description: Optional[str] = None
	possibleValues: Optional[List[str]] = None
	defaultValues: Optional[List[str]] = None
	type: ConfigType = "UnicodeConfig"


class Config(BaseModel):  # pylint: disable=too-few-public-methods
	configId: str
	description: str | None = None
	value: Union[str, List[str], bool] | None = None


class ConfigStates(BaseModel):  # pylint: disable=too-few-public-methods
	objectIds: List[str] = []
	configs: List[Config]


@config_router.delete("/api/opsidata/config/delete/{configid}")
@rest_api
@read_only_check
def delete_config(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, configid: str
) -> RESTResponse:
	"""
	Delete a config
	"""
	logger.warning("Deleting config %s", configid)
	try:
		# with mysql.session() as session:
		config_ids = backend.config_getIdents()
		if configid not in config_ids:
			logger.error("Could not delete config object.")
			raise OpsiApiException(
				message=f"Could not delete config object. Config '{configid}' does not exist",
				http_status=status.HTTP_404_NOT_FOUND,
			)

		backend.config_delete(id=configid)

		return RESTResponse()
	except Exception as err:
		logger.error("Could not delete config object, error: %s", err)
		logger.error(err)
		raise OpsiApiException(
			message="Could not delete config object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
		) from err


@config_router.post("/api/opsidata/config")
@rest_api
@read_only_check
def create_config(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, config: ConfigComplete
) -> RESTResponse:
	"""
	Create a new config
	"""
	logger.warning("Creating config %s", config)
	try:
		# with mysql.session() as session:
		config_ids = backend.config_getIdents()
		if config.configId in config_ids:
			logger.error("Could not create config object.")
			raise OpsiApiException(
				message=f"Config '{config.configId}' already exists",
				http_status=status.HTTP_409_CONFLICT,
			)

		if config.type not in ("UnicodeConfig", "BoolConfig"):
			logger.error("Could not create config object.")
			raise OpsiApiException(
				message=f"Config type '{config.type}' is not supported",
				http_status=status.HTTP_400_BAD_REQUEST,
			)
		elif config.type == "BoolConfig":
			if not config.defaultValues:
				defaultValue = False
			elif isinstance(config.defaultValues, list):
				defaultValue = config.defaultValues[0] if config.defaultValues and len(config.defaultValues) > 0 else False
			elif isinstance(config.defaultValues, bool):
				defaultValue = config.defaultValues
			backend.config_createBool(id=config.configId, description=config.description, defaultValues=[defaultValue])
		elif config.type == "UnicodeConfig":
			defaultValues = config.defaultValues if config.defaultValues else []
			backend.config_createUnicode(
				id=config.configId,
				description=config.description,
				possibleValues=config.possibleValues,
				defaultValues=defaultValues,
				multiValue=config.multiValue,
				editable=config.editable,
			)

		headers = {"Location": f"{request.url}/{config.configId}"}
		logger.warning("Config %s created.", backend.config_getObjects(configId=config.configId)[0])
		return RESTResponse(data=config.model_dump(mode="json"), http_status=status.HTTP_201_CREATED, headers=headers)

	except IntegrityError as err:
		logger.error("Could not create config object. Already exists. Error: %s", err)
		return RESTErrorResponse(
			message=f"Could not create config object. config '{config.configId}' already exists",
			http_status=status.HTTP_409_CONFLICT,
			details=err,
		)

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not create config object, error: %s", err)
		raise OpsiApiException(
			message="Could not create config object.", http_status=status.HTTP_500_INTERNAL_SERVER_ERROR, error=err
		) from err


@config_router.post("/api/opsidata/config/values")
@rest_api
@read_only_check
def save_config_value(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, data: List[Config]
) -> RESTResponse:
	"""
	save config value
	"""
	errors = []
	ids = []
	for config in data:
		ids.append(config.configId)

		with mysql.session() as session:
			try:
				values = {"configId": config.configId, "value": config.value, "isDefault": True}
				stmt = (
					update(table("CONFIG_VALUE", column("isDefault")))  # pylint: disable=consider-iterating-dictionary
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
										"CONFIG_VALUE",
										*[column(name) for name in values.keys()],  # pylint: disable=consider-iterating-dictionary
									)
								)
								.where(text(f"configId = '{config.configId}' AND value = '{value}'"))
								.values(**values)
							)
						else:
							stmt = (
								insert(
									table(
										"CONFIG_VALUE",
										*[column(name) for name in values.keys()],  # pylint: disable=consider-iterating-dictionary
									)
								)
								.values(**values)
								.on_duplicate_key_update(**values)
							)
						session.execute(stmt)
				else:
					value: Union[str, bool, None] = config.value  # type: ignore[no-redef]
					values = {"configId": config.configId, "value": value, "isDefault": True}
					if get_config_value(config.configId, value):
						stmt = (
							update(
								table(
									"CONFIG_VALUE",
									*[column(name) for name in values.keys()],  # pylint: disable=consider-iterating-dictionary
								)
							)
							.where(text(f"configId = '{config.configId}' AND value = '{value}'"))
							.values(**values)
						)
						backend._send_messagebus_event("config_updated", data=values)  # pylint: disable=protected-access
					else:
						stmt = (
							insert(
								table(
									"CONFIG_VALUE",
									*[column(name) for name in values.keys()],  # pylint: disable=consider-iterating-dictionary
								)
							)
							.values(**values)
							.on_duplicate_key_update(**values)
						)
						backend._send_messagebus_event("config_created", data=values)  # pylint: disable=protected-access
					logger.devel(stmt)
					session.execute(stmt)

				logger.debug("Config %s saved.", config.configId)
			except Exception as err:  # pylint: disable=broad-except
				logger.error("Could not save config: %s", err)
				session.rollback()
				errors.append({"id": config.configId, "error": str(err)})
	if errors:
		message = "Failed to save: "
		ids = []
		for config_error in errors:
			message += config_error.get("id", "") + "\n"
			ids.append(config_error.get("id", ""))
		return RESTErrorResponse(message=message, http_status=status.HTTP_400_BAD_REQUEST, details=errors)

	return RESTResponse(http_status=status.HTTP_200_OK, data=f"Values for {','.join(ids)} changed.")


@config_router.post("/api/opsidata/config/values/objects")
@rest_api
@read_only_check
def save_config_state(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, data: ConfigStates
) -> RESTResponse:
	"""
	Save config State
	"""
	changes = []

	if not data.objectIds:
		logger.notice("No configurations were transferred to save. Nothing to do...")
		return RESTErrorResponse(http_status=status.HTTP_400_BAD_REQUEST, message="No configurations were transferred to save.")

	for client in data.objectIds:
		for config in data.configs:
			changes.append(f"{client}: {config.configId}")
			if isinstance(config.value, list):
				cs_values = json.dumps(config.value)
			elif isinstance(config.value, str) and config.value.lower() in ("true", "false"):
				cs_values = f"[{config.value}]".lower()
			else:
				cs_values = f'["{config.value}"]'

			values = {"objectId": client, "configId": config.configId, "values": cs_values}

			with mysql.session() as session:
				if get_config_state(client, config.configId):
					stmt = (
						update(
							table(
								"CONFIG_STATE",
								*[column(name) for name in values.keys()],  # pylint: disable=consider-iterating-dictionary
							)
						)
						.where(text(f"objectId = '{client}' AND configId = '{config.configId}'"))
						.values(**values)
					)
					backend._send_messagebus_event("configState_updated", data=values)  # pylint: disable=protected-access
				else:
					stmt = (
						insert(
							table(
								"CONFIG_STATE",
								*[column(name) for name in values.keys()],  # pylint: disable=consider-iterating-dictionary
							)
						)
						.values(**values)
						.on_duplicate_key_update(**values)
					)
					backend._send_messagebus_event("configState_created", data=values)  # pylint: disable=protected-access
				session.execute(stmt)

	return RESTResponse(http_status=status.HTTP_200_OK, data=f"Changed the following config states: {', '.join(changes)}")


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
