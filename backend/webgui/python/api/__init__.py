# This file is part of the OPSI-WebGUI application.
# The OPSI-WebGUI backend is an addon for opsiconfd.
# https://opsi.org/en/
#
# Copyright (c) UIB GmbH info@uib.de 2026
# All rights reserved.
# License: AGPL-3.0

"""API routes for the OPSI-WebGUI addon."""

from collections import Counter
from pathlib import Path
from typing import Annotated, Optional

from fastapi import APIRouter, Body, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse, RedirectResponse
from opsiconfd import contextvar_client_session
from opsiconfd.application import AppState
from opsiconfd.config import get_configserver_id
from opsiconfd.rest import RESTResponse, rest_api
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from ..logger import get_logger
from ..utils import (
	backend,
	client_creation_allowed,
	depot_access_configured,
	get_username,
	host_group_access_configured,
	is_opsiserver_write_permitted,
	product_group_access_configured,
	read_only_user,
	user_register,
)

logger = get_logger()
api_router = APIRouter()

PUBLIC_PATHS = ["/api/user/opsiserver"]


@api_router.get("")
@api_router.get("/")
async def route_index(request: Request) -> RedirectResponse:
	return RedirectResponse(
		url=f"{request.scope['path'].rstrip('/')}/app/",
		status_code=status.HTTP_307_TEMPORARY_REDIRECT,
	)


@api_router.options("/api/{any:path}")
async def options() -> PlainTextResponse:
	return PlainTextResponse("OK", status_code=200)


@api_router.post("/api/auth/login")
async def auth_login() -> JSONResponse:
	return JSONResponse({"result": "Login success"})


@api_router.post("/api/auth/logout")
async def auth_logout() -> JSONResponse:
	client_session = contextvar_client_session.get()
	if client_session:
		await client_session.delete()
	return JSONResponse({"result": "logout success"})


@api_router.get("/api/user/getsettings")
async def user_getsettings() -> JSONResponse:
	return JSONResponse({"username": get_username(), "expertmode": False, "recentactivityexpiry": "3m"})


@api_router.get("/api/user/opsiserver")
async def user_opsiserver() -> JSONResponse:
	logger.info("Received request for opsiserver id")
	return JSONResponse({"result": get_configserver_id()})


@api_router.get("/api/user/configuration")
def user_configuration() -> JSONResponse:
	username = get_username()
	status_counts = {}
	worst_case_health = "ok"

	healthchecks = list(backend.service_healthCheck(clear_cache=False))
	if healthchecks:
		status_order = {"ok": 0, "warning": 1, "error": 2}

		statuses = [check.check_status for check in healthchecks]
		status_counts = Counter(statuses)
		worst_case_health = max(
			(check.check_status for check in healthchecks),
			key=lambda status: status_order[status],
			default="ok",
		)

	if user_register():
		return JSONResponse(
			{
				"user": username,
				"configuration": {
					"read_only": read_only_user(username),
					"server_write_access": is_opsiserver_write_permitted(username),
					"depot_access": depot_access_configured(username),
					"host_group_access": host_group_access_configured(username),
					"product_group_access": product_group_access_configured(username),
					"client_creation": client_creation_allowed(username),
					"health": {
						"counts": status_counts,
						"worst_case": worst_case_health,
					},
				},
			}
		)
	return JSONResponse(
		{
			"user": username,
			"configuration": {
				"read_only": read_only_user(username),
				"server_write_access": True,
				"depot_access": False,
				"host_group_access": False,
				"product_group_access": False,
				"client_creation": True,
				"health": {"counts": status_counts, "worst_case": worst_case_health},
			},
		}
	)


@api_router.get("/api/opsidata/log")
async def opsidata_log(selectedClient: Optional[str], selectedLogType: Optional[str]) -> JSONResponse:  # pylint: disable=invalid-name
	return JSONResponse({"result": backend.readLog(type=selectedLogType, objectId=selectedClient).split("\n")})  # pylint: disable=no-member


class State(BaseModel):  # pylint: disable=too-few-public-methods
	type: str = "normal"
	address_exceptions: list | None = None  #
	retry_after: int | None = None


@api_router.post("/api/app-state")
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


@api_router.get("/api/app-state")
@rest_api
async def get_app_state(request: Request) -> RESTResponse:
	return RESTResponse(data=request.app.app_state.to_dict())


@api_router.post("/api/backup/restore")
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


@api_router.post("/api/backup/create")
@rest_api
async def create_backup(
	config_files: Annotated[bool, Body()] = True,
	redis_data: Annotated[bool, Body()] = False,
	maintenance_mode: Annotated[bool, Body()] = True,
	password: Annotated[str, Body()] | None = None,
) -> RESTResponse:
	backup_file = await run_in_threadpool(
		backend.service_createBackup,
		config_files=config_files,
		redis_data=redis_data,
		maintenance_mode=maintenance_mode,
		password=password,
	)
	return RESTResponse(data=backup_file)


@api_router.get("/api/opsidata/changelogs")
def get_markdown() -> PlainTextResponse:
	changelog_path = Path(__file__).resolve().parents[2] / "data" / "changelog" / "changelog.md"
	if not changelog_path.is_file():
		return PlainTextResponse("", status_code=404)
	return PlainTextResponse(changelog_path.read_text(encoding="utf-8"))
