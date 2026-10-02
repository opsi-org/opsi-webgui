# This file is part of the OPSI-WebGUI application.
# The OPSI-WebGUI backend is an addon for opsiconfd.
# https://opsi.org/en/
#
# Copyright (c) UIB GmbH info@uib.de 2026
# All rights reserved.
# License: AGPL-3.0

"""
Configuration management for the OPSI-WebGUI addon.
"""

import json
from typing import Any, Literal

from fastapi import APIRouter, Depends, Request, status
from opsiconfd.backend import get_protected_backend

# from opsiconfd.logging import logger
from opsiconfd.rest import (
	OpsiApiException,
	RESTErrorResponse,
	RESTResponse,
	common_query_parameters,
	order_by,
	rest_api,
)
from pydantic import BaseModel, Field  # pylint: disable=no-name-in-module
from sqlalchemy import and_, column, select, table, text, update  # type: ignore[import]
from sqlalchemy.dialects.mysql import insert  # type: ignore[import]
from sqlalchemy.exc import IntegrityError  # type: ignore[import]

from ..const import MAX_IDS_PER_REQUEST
from ..logger import get_logger
from ..utils import (
	backend,
	bool_value,
	check_batch_combination,
	mysql,
	opsi_server_write_check,
	read_only_check,
	unicode_config,
)

api_router = APIRouter()

logger = get_logger()


@api_router.get("/api/opsidata/config")
@api_router.get("/api/opsidata/config/server")
@rest_api
def get_server_config(
	commons: dict = Depends(common_query_parameters),
) -> RESTResponse:  # pylint: disable=redefined-builtin
	"""
	Get server config data.
	"""

	params: dict = {}
	# where = text("cv.isDefault=1")
	where = text("")
	if commons.get("filterQuery"):
		where = and_(where, text("(c.configId LIKE :search)"))
		params["search"] = f"%{commons['filterQuery']}%"

	with mysql.session() as session:
		query = (
			select(
				text(  # type: ignore
					"""
						c.configId AS configId,
						c.description AS description,
						c.type AS type,
						GROUP_CONCAT(IF(cv.isDefault, cv.value, NULL) SEPARATOR '|') AS value,
						GROUP_CONCAT(cv.value SEPARATOR '|') AS possibleValues,
						c.multiValue AS multiValue,
						c.editable AS editable
					"""
				)
			)
			.select_from(table("CONFIG").alias("c"))
			.join(text("CONFIG_VALUE AS cv"), text("cv.configId=c.configId"))  # type: ignore[arg-type]
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
					row_dict["value"] = unicode_config(
						val,
						multi_value=row_dict.get("multiValue", False),
						delimiter="|",
					)

				row_dict["possibleValues"] = list(dict.fromkeys(pos_val_list))

				if row_dict.get("editable", False):
					row_dict["newValue"] = ""
					row_dict["newValues"] = []

				config_data[id_prefix].append(row_dict)
		return RESTResponse(data=config_data)


@api_router.get("/api/opsidata/config/objects/{object_id}")
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

	config_data: dict = {
		"general": [],
		"clientconfig": [],
		"opsi-script": [],
		"opsiclientd": [],
		"software-on-demand": [],
		"licensing": [],
	}
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
			config_values = config_states.get(config.id, {})
			tmp_config["objects"][object_id] = bool_value(config_values[0] if config_values else False)
		elif config.multiValue:
			tmp_config["objects"][object_id] = config_states.get(config.id, {})
		else:
			config_values = config_states.get(config.id, {})
			tmp_config["objects"][object_id] = config_values[0] if config_values else ""
		tmp_config["configId"] = config.id
		if config.editable:
			tmp_config["newValue"] = ""
			tmp_config["newValues"] = []
		config_data[id_prefix].append(tmp_config)

	logger.debug(config_states)
	return RESTResponse(data=config_data)


ConfigType = Literal["UnicodeConfig", "BoolConfig"]


class ConfigComplete(BaseModel):  # pylint: disable=too-few-public-methods
	configId: str
	editable: bool = False
	multiValue: bool = False
	description: str | None = None
	possibleValues: list[str] | None = None
	defaultValues: list[str] | None = None
	type: ConfigType = "UnicodeConfig"


class Config(BaseModel):  # pylint: disable=too-few-public-methods
	configId: str
	description: str | None = None
	value: str | list[str] | bool | None = None


class ConfigStates(BaseModel):  # pylint: disable=too-few-public-methods
	objectIds: list[str] = Field(default=[], max_length=MAX_IDS_PER_REQUEST)
	configs: list[Config] = Field(..., max_length=MAX_IDS_PER_REQUEST)


@api_router.post("/api/opsidata/config")
@rest_api
@read_only_check
@opsi_server_write_check
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
			backend.config_createBool(
				id=config.configId,
				description=config.description,
				defaultValues=[defaultValue],
			)
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
		return RESTResponse(
			data=config.model_dump(mode="json"),
			http_status=status.HTTP_201_CREATED,
			headers=headers,
		)

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
			message="Could not create config object.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err


@api_router.post("/api/opsidata/config/values")
@rest_api
@read_only_check
@opsi_server_write_check
def save_config_value(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, data: list[Config]
) -> RESTResponse:
	"""
	save config value
	"""

	def convert_bool_value(config_type: str | None, value: Any) -> int | Any:
		# Convert boolean values to integers if the config type is BoolConfig
		_isTrue = value in ("true", True, 1, "1", "True", "TRUE")
		return int(_isTrue) if config_type and config_type == "BoolConfig" else json.loads(json.dumps(value))

	def _get_config(session, config: dict):
		# first check if the config exists and get its type to convert bool to tinyint
		query = (
			select(
				text(  # type: ignore
					"""
							c.configId AS configId,
							c.type AS type
						"""
				)
			)
			.select_from(table("CONFIG").alias("c"))
			.where(text("configId = :config_id"))
		)  # pylint: disable=redefined-outer-name
		result = session.execute(query, {"config_id": config.configId})
		result = result.fetchall()
		config_result = dict(result[0]) if result and len(result) > 0 else None
		if not config_result:
			logger.warning("Config %s does not exist. sql result: %s", config.configId, result)
		return config_result

	def _get_values(session, config: dict[str, Any], type: str) -> list[dict]:
		# Get all values for a config
		query = (
			select(
				text(  # type: ignore
					"""
						cv.configId AS configId,
						cv.value AS value,
						cv.isDefault AS isDefault
					"""
				)
			)
			.select_from(table("CONFIG_VALUE").alias("cv"))
			.where(text("cv.configId = :config_id"))
		)
		result = session.execute(query, {"config_id": config.configId})
		result = result.fetchall()
		config_values = []
		for row in result:
			if row is not None:
				val = convert_bool_value(type, dict(row)["value"])
				config_values.append(val)
		return config_values

	def _insert_or_update(
		session,
		column_name: str,
		dbitem: Any,
		identifier_ids: list[str],
		update_ids: list[str],
		exists: bool = False,
	) -> Any:
		if not dbitem:
			logger.error("dbitem is empty. Cannot insert or update.")
			return None
		if not exists:
			stmt = insert(
				table(
					column_name,
					*[column(name) for name in dbitem.keys()],
				)
			).values(**dbitem)
			params = None
		else:
			stmt = (
				update(
					table(
						column_name,
						*[column(name) for name in dbitem.keys()],  # pylint: disable=consider-iterating-dictionary
					)
				)
				.where(
					text(" AND ".join([f"{col} = :w_{col}" for col in identifier_ids]))  # needs params
				)
				.values(
					**{col: dbitem[col] for col in set(update_ids)}  # only update the specified columns
				)
			)
			params = {f"w_{col}": dbitem[col] for col in identifier_ids}
		return stmt, params

	errors = []
	ids = []
	for config in data:
		ids.append(config.configId)

		with mysql.session() as session:
			config_original = _get_config(session, config)
			if not config_original:
				logger.warning("Config %s does not exist. Skipping.", config.configId)
				continue
			values_original = _get_values(session, config, type=config_original.get("type", None))  # type: ignore[assignment]

			_type = config_original.get("type", None)
			_values: Any = convert_bool_value(_type, config.value) if config.value is not None else []
			values: list = _values if isinstance(_values, list) else [_values]
			logger.debug("Values: %s", values)

			for value in values + values_original:
				try:
					dbitem = {
						"configId": config.configId,
						"value": value,
						"isDefault": int(value in values),
					}
					logger.debug("dbitem: %s", dbitem)
					val_exists = get_config_value(config.configId, value)
					method_name = "config_created" if not val_exists else "config_updated"
					stmt, params = _insert_or_update(
						session,
						column_name="CONFIG_VALUE",
						dbitem=dbitem,
						identifier_ids=["configId", "value"],
						update_ids=["isDefault"],
						exists=bool(val_exists),
					)
					logger.debug("stmt: %s", stmt)
					session.execute(stmt, params)
					backend._send_messagebus_event(method_name, data=dbitem)  # pylint: disable=protected-access
					logger.debug("Config %s saved.", config.configId)
				except Exception as err:  # pylint: disable=broad-except
					logger.error("Could not save config: %s", err)
					logger.error("Config item: %s", dbitem)
					session.rollback()
					errors.append({"id": config.configId, "error": str(err)})
	if errors:
		message = "Failed to save: "
		ids = []
		for config_error in errors:
			logger.error(
				"Error saving config %s: %s",
				config_error.get("id", ""),
				config_error.get("error", ""),
			)
			message += config_error.get("id", "") + "\n"
			ids.append(config_error.get("id", ""))
		return RESTErrorResponse(message=message, http_status=status.HTTP_400_BAD_REQUEST, details=errors)

	return RESTResponse(http_status=status.HTTP_200_OK, data=f"Values for {','.join(ids)} changed.")


@api_router.post("/api/opsidata/config/values/objects")
@rest_api
@read_only_check
# @opsi_server_write_check
def save_config_state(  # pylint: disable=invalid-name, too-many-locals, too-many-statements, too-many-branches, unused-argument
	request: Request, data: ConfigStates
) -> RESTResponse:
	"""
	Save config State for clients
	"""
	changes = []

	if not data.objectIds:
		logger.notice("No configurations were transferred to save. Nothing to do...")
		return RESTErrorResponse(
			http_status=status.HTTP_400_BAD_REQUEST,
			message="No configurations were transferred to save.",
		)

	check_batch_combination(data.objectIds, data.configs, "object/config combinations")

	rows = []
	for client in data.objectIds:
		for config in data.configs:
			changes.append(f"{client}: {config.configId}")
			if isinstance(config.value, list):
				cs_values = json.dumps(config.value)
			elif isinstance(config.value, str) and config.value.lower() in (
				"true",
				"false",
			):
				cs_values = f"[{config.value}]".lower()
			else:
				cs_values = f'["{config.value}"]'

			rows.append({"objectId": client, "configId": config.configId, "values": cs_values})

	if not rows:
		return RESTResponse(http_status=status.HTTP_200_OK, data="No config states to save.")

	config_ids = list({row["configId"] for row in rows})
	with mysql.session() as session:
		# One existing-pairs lookup instead of a per-(client, config) SELECT, so the
		# correct messagebus event (created/updated) can still be sent per row.
		existing_query = (
			select(text("objectId AS objectId, configId AS configId"))
			.select_from(table("CONFIG_STATE"))
			.where(and_(text("objectId IN :clients"), text("configId IN :configs")))
		)
		existing_result = session.execute(existing_query, {"clients": data.objectIds, "configs": config_ids}).fetchall()
		existing_pairs = {(dict(row)["objectId"], dict(row)["configId"]) for row in existing_result if row is not None}

		stmt = insert(
			table(
				"CONFIG_STATE",
				column("objectId"),
				column("configId"),
				column("values"),
			)
		).values(rows)
		# stmt.inserted.values would collide with ColumnCollection.values(); use item access.
		stmt = stmt.on_duplicate_key_update(**{"values": stmt.inserted["values"]})
		session.execute(stmt)

		for row in rows:
			event = "configState_updated" if (row["objectId"], row["configId"]) in existing_pairs else "configState_created"
			backend._send_messagebus_event(event, data=row)  # pylint: disable=protected-access

	return RESTResponse(
		http_status=status.HTTP_200_OK,
		data=f"Changed the following config states: {', '.join(changes)}",
	)


def get_config_state(object_id: str, config_id: str) -> str | None:
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


def get_config_value(config_id: str, value: Any) -> list:
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
