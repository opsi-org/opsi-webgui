# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui
"""

import os
from typing import Optional

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse, RedirectResponse

from opsiconfd import contextvar_client_session
from opsiconfd.application.utils import get_configserver_id
from opsiconfd.backend import get_backend
from opsiconfd.config import config
from opsiconfd.logging import logger

from .utils import (
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

DATA_PATH = "/var/lib/opsiconfd/addons/webgui/data"
webgui_router = APIRouter()


@webgui_router.get("")
@webgui_router.get("/")
async def route_index(request: Request):
	return RedirectResponse(url=f"{request.scope['path'].rstrip('/')}/app/", status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@webgui_router.options("/api/{any:path}")
async def options():
	return PlainTextResponse("OK", status_code=200)


@webgui_router.get("/api/auth/login")
@webgui_router.post("/api/auth/login")
async def auth_login():
	return JSONResponse({"result": "Login success"})


@webgui_router.get("/api/auth/logout")
@webgui_router.post("/api/auth/logout")
async def auth_logout():
	client_session = contextvar_client_session.get()
	if client_session:
		await client_session.delete()
	return JSONResponse({"result": "logout success"})


@webgui_router.get("/api/user/getsettings")
@webgui_router.post("/api/user/getsettings")
async def user_getsettings():
	return JSONResponse({"username": get_username(), "expertmode": False, "recentactivityexpiry": "3m"})


@webgui_router.get("/api/user/createactivity")
@webgui_router.post("/api/user/createactivity")
async def user_create_activity(request: Request):
	# {"username":"adminuser","type":"Login","status":"ok"}
	request_data = {}
	try:
		request_data = await request.json()
	except ValueError:
		pass
	if request_data.get("type").lower() == "login":
		pass
	return JSONResponse({"result": {}})


@webgui_router.get("/api/user/opsiserver")
@webgui_router.post("/api/user/opsiserver")
async def user_opsiserver():
	return JSONResponse({"result": get_configserver_id()})


@webgui_router.get("/api/user/configuration")
def user_configuration():
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

	return JSONResponse({"user": username, "configuration": None})


@webgui_router.get("/api/opsidata/modulesContent")
@webgui_router.post("/api/opsidata/modulesContent")
async def modules_content():
	return JSONResponse({"result": get_backend().backend_getLicensingInfo()["available_modules"]})


@webgui_router.get("/api/opsidata/log")
async def opsidata_log(selectedClient: Optional[str], selectedLogType: Optional[str]):  # pylint: disable=invalid-name
	return JSONResponse(
		{"result": get_backend().readLog(type=selectedLogType, objectId=selectedClient).split("\n")}  # pylint: disable=no-member
	)


@webgui_router.get("/api/opsidata/home")
@webgui_router.post("/api/opsidata/home")
async def home():
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
				if not row["group_id"] in all_groups:
					all_groups[row["group_id"]] = {
						"id": row["group_id"],
						"type": group_type,
						"text": row["group_id"],
						"parent": row["parent_id"] or root_group["id"],
						"allowed": True,
					}
				if row["object_id"]:
					if not "children" in all_groups[row["group_id"]]:
						all_groups[row["group_id"]]["children"] = {}
					all_groups[row["group_id"]]["children"][row["object_id"]] = {
						"id": row["object_id"],
						"type": "ObjectToGroup",
						"text": row["object_id"],
						"parent": row["group_id"],
						"inDepot": "configserver",  # TODO
					}

			if group_type == "ProductGroup":
				product_groups = build_tree(root_group, all_groups.values(), allowed["product_groups"])
			elif group_type == "HostGroup":
				host_groups = build_tree(root_group, list(all_groups.values()), allowed["host_groups"])

		return JSONResponse({"groups": {"productgroups": product_groups, "clientdirectory": host_groups}})


@webgui_router.get("/api/opsidata/changelogs")
def get_markdown() -> PlainTextResponse:

	with open(os.path.join(DATA_PATH, "changelog", "changelog.md"), "r", encoding="utf-8") as changelogs_file:
		text = changelogs_file.read()
	return PlainTextResponse(text)


def set_data_path_var(path: str) -> None:
	global DATA_PATH  # pylint: disable=global-statement
	DATA_PATH = path
