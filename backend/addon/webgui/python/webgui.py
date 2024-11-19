# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui
"""

import os
from pathlib import Path
from typing import Annotated, Optional

from fastapi import APIRouter, Body, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse, RedirectResponse
from opsiconfd import contextvar_client_session
from opsiconfd.application import AppState
from opsiconfd.config import get_configserver_id
from opsiconfd.logging import logger
from opsiconfd.rest import RESTResponse, rest_api
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from .utils import (
	backend,
	build_tree,
	client_creation_allowed,
	depot_access_configured,
	get_allowed_objects,
	get_username,
	host_group_access_configured,
	mysql,
	product_group_access_configured,
	read_only_user,
	user_register,
)

webgui_router = APIRouter()


@webgui_router.get("")
@webgui_router.get("/")
async def route_index(request: Request) -> RedirectResponse:
	return RedirectResponse(url=f"{request.scope['path'].rstrip('/')}/app/", status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@webgui_router.options("/api/{any:path}")
async def options() -> PlainTextResponse:
	return PlainTextResponse("OK", status_code=200)


@webgui_router.get("/api/auth/login")
@webgui_router.post("/api/auth/login")
async def auth_login() -> JSONResponse:
	return JSONResponse({"result": "Login success"})


@webgui_router.get("/api/auth/logout")
@webgui_router.post("/api/auth/logout")
async def auth_logout() -> JSONResponse:
	client_session = contextvar_client_session.get()
	if client_session:
		await client_session.delete()
	return JSONResponse({"result": "logout success"})


@webgui_router.get("/api/user/getsettings")
@webgui_router.post("/api/user/getsettings")
async def user_getsettings() -> JSONResponse:
	return JSONResponse({"username": get_username(), "expertmode": False, "recentactivityexpiry": "3m"})


@webgui_router.get("/api/user/createactivity")
@webgui_router.post("/api/user/createactivity")
async def user_create_activity(request: Request) -> JSONResponse:
	# {"username":"adminuser","type":"Login","status":"ok"}
	request_data = {}
	try:
		request_data = await request.json()
	except ValueError:
		pass
	if request_data.get("type", "").lower() == "login":
		pass
	return JSONResponse({"result": {}})


@webgui_router.get("/api/user/opsiserver")
@webgui_router.post("/api/user/opsiserver")
async def user_opsiserver() -> JSONResponse:
	return JSONResponse({"result": get_configserver_id()})


@webgui_router.get("/api/user/configuration")
def user_configuration() -> JSONResponse:
	username = get_username()
	if user_register():
		return JSONResponse(
			{
				"user": username,
				"configuration": {
					"read_only": read_only_user(username),
					"depot_access": depot_access_configured(username),
					"host_group_access": host_group_access_configured(username),
					"product_group_access": product_group_access_configured(username),
					"client_creation": client_creation_allowed(username),
				},
			}
		)
	return JSONResponse(
		{
			"user": username,
			"configuration": {
				"read_only": False,
				"depot_access": False,
				"host_group_access": False,
				"product_group_access": False,
				"client_creation": True,
			},
		}
	)


@webgui_router.get("/api/opsidata/modulesContent")
@webgui_router.post("/api/opsidata/modulesContent")
async def modules_content() -> JSONResponse:
	return JSONResponse({"result": backend.backend_getLicensingInfo()["available_modules"]})


@webgui_router.get("/api/opsidata/log")
async def opsidata_log(selectedClient: Optional[str], selectedLogType: Optional[str]) -> JSONResponse:  # pylint: disable=invalid-name
	return JSONResponse({"result": backend.readLog(type=selectedLogType, objectId=selectedClient).split("\n")})  # pylint: disable=no-member


@webgui_router.get("/api/opsidata/home")
@webgui_router.post("/api/opsidata/home")
async def home() -> JSONResponse:
	allowed = get_allowed_objects()

	with mysql.session() as session:
		product_groups = {}
		host_groups = {}

		for group_type in ("ProductGroup", "HostGroup"):
			all_groups = {}
			root_group = None
			if group_type == "ProductGroup":
				root_group = {"id": "productgroups", "type": group_type, "text": "productgroups", "parent": "#", "allowed": True}
			elif group_type == "HostGroup":
				root_group = {"id": "clientdirectory", "type": group_type, "text": "clientdirectory", "parent": "#", "allowed": True}

			for row in session.execute(
				"""
				SELECT
					g.parentGroupId AS parent_id,
					g.groupId AS group_id,
					og.objectId AS object_id
				FROM
					`GROUP` AS g
				LEFT JOIN
					OBJECT_TO_GROUP AS og ON og.groupType = g.`type` AND og.groupId = g.groupId
				WHERE
					g.`type` = :group_type
				ORDER BY
					parent_id,
					group_id,
					object_id
				""",
				{"group_type": group_type},
			).fetchall():
				if row["group_id"] not in all_groups:
					all_groups[row["group_id"]] = {
						"id": row["group_id"],
						"type": group_type,
						"text": row["group_id"],
						"parent": row["parent_id"] or root_group["id"],  # type: ignore
						"allowed": True,
					}
				if row["object_id"]:
					if "children" not in all_groups[row["group_id"]]:
						all_groups[row["group_id"]]["children"] = {}
					all_groups[row["group_id"]]["children"][row["object_id"]] = {
						"id": row["object_id"],
						"type": "ObjectToGroup",
						"text": row["object_id"],
						"parent": row["group_id"],
						"inDepot": "configserver",  # TODO
					}

			if group_type == "ProductGroup":
				product_groups = build_tree(root_group, all_groups.values(), allowed["product_groups"])  # type: ignore
			elif group_type == "HostGroup":
				host_groups = build_tree(root_group, list(all_groups.values()), allowed["host_groups"])  # type: ignore

		return JSONResponse({"groups": {"productgroups": product_groups, "clientdirectory": host_groups}})


class State(BaseModel):  # pylint: disable=too-few-public-methods
	type: str = "normal"
	address_exceptions: list | None = None  #
	retry_after: int | None = None


@webgui_router.post("/api/app-state")
@rest_api
async def set_app_state(request: Request, app_state: State) -> RESTResponse:
	params: dict = {}
	params["type"] = app_state.type
	if app_state.type == "maintenance":
		params["address_exceptions"] = ["127.0.0.1/32", "::1/128"]
		params["retry_after"] = 600
		if request.client:
			params["address_exceptions"].append(request.client.host)
		if app_state.address_exceptions:
			params["address_exceptions"] = params["address_exceptions"] + app_state.address_exceptions
		if app_state.retry_after:
			params["retry_after"] = app_state.retry_after

	await run_in_threadpool(request.app.set_app_state, AppState.from_dict(params))
	return RESTResponse(data=request.app.app_state.to_dict())


@webgui_router.get("/api/app-state")
@rest_api
async def get_app_state(request: Request) -> RESTResponse:
	return RESTResponse(data=request.app.app_state.to_dict())


@webgui_router.post("/api/backup/restore")
@rest_api
async def restore_backup(
	file_id: Annotated[str, Body()],
	config_files: Annotated[bool, Body()] = False,
	redis_data: Annotated[bool, Body()] = False,
	server_id: Annotated[str, Body(examples=["backup", "local", "new-id.test.local"])] = "backup",
	password: Annotated[str, Body()] | None = None,
) -> RESTResponse:
	logger.devel(file_id)
	logger.devel(server_id)
	await run_in_threadpool(
		backend.service_restoreBackup,
		file_id,
		config_files=config_files,
		redis_data=redis_data,
		server_id=server_id,
		password=password,
	)
	return RESTResponse(
		data="Backup restored",
	)


@webgui_router.post("/api/backup/create")
@rest_api
async def create_backup(
	config_files: Annotated[bool, Body()] = True,
	redis_data: Annotated[bool, Body()] = False,
	maintenance_mode: Annotated[bool, Body()] = True,
	password: Annotated[str, Body()] | None = None,
) -> RESTResponse:
	backup_file = await run_in_threadpool(
		backend.service_createBackup, config_files=config_files, redis_data=redis_data, maintenance_mode=maintenance_mode, password=password
	)
	return RESTResponse(data=backup_file)


@webgui_router.get("/api/opsidata/changelogs")
def get_markdown() -> PlainTextResponse:
	from . import Webgui

	return PlainTextResponse((Path(Webgui().data_path) / "changelog/changelog.md").read_text(encoding="utf-8"))
