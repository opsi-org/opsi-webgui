# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
addon webgui
"""

import os

from fastapi import APIRouter, FastAPI, HTTPException, Request, status
from fastapi.requests import HTTPConnection
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from opsicommon.exceptions import BackendAuthenticationError, BackendPermissionDeniedError
from opsiconfd.addon import Addon
from opsiconfd.logging import logger
from opsiconfd.session import ACCESS_ROLE_AUTHENTICATED, ACCESS_ROLE_PUBLIC
from opsiconfd.session import authenticate as opsiconfd_authenticate
from opsiconfd.utils import remove_route_path
from starlette.concurrency import run_in_threadpool
from starlette.types import Receive, Send

from .clients import client_router
from .config import conifg_router
from .const import ADDON_ID, ADDON_NAME, ADDON_VERSION
from .depots import depot_router
from .hosts import host_router
from .products import product_router
from .server import server_router
from .utils import mysql
from .webgui import set_data_path_var, webgui_router

SESSION_LIFETIME = 60 * 30


class Webgui(Addon):
	id = ADDON_ID
	name = ADDON_NAME
	version = ADDON_VERSION

	def setup(self, app: FastAPI) -> None:
		if not mysql:
			logger.warning("No mysql backend found! Webgui only works with mysql backend.")
			error_router = APIRouter()

			@error_router.get(f"{self.router_prefix}/app")
			def webgui_error() -> PlainTextResponse:
				return PlainTextResponse("No mysql backend found! Webgui only works with mysql backend.", status_code=501)

			app.include_router(error_router)
			return

		app.include_router(webgui_router, prefix=self.router_prefix)
		app.include_router(product_router, prefix=self.router_prefix)
		app.include_router(host_router, prefix=self.router_prefix)
		app.include_router(client_router, prefix=self.router_prefix)
		app.include_router(depot_router, prefix=self.router_prefix)
		app.include_router(conifg_router, prefix=self.router_prefix)
		app.include_router(server_router, prefix=self.router_prefix)

		app.mount(path=f"{self.router_prefix}/app", app=StaticFiles(directory=os.path.join(self.data_path, "app"), html=True), name="app")
		set_data_path_var(self.data_path)

	def on_load(self, app: FastAPI) -> None:  # pylint: disable=no-self-use
		"""Called after loading the addon"""
		self.setup(app)

	def on_unload(self, app: FastAPI) -> None:  # pylint: disable=no-self-use
		"""Called before unloading the addon"""
		remove_route_path(app, self.router_prefix)

	async def handle_request(self, connection: HTTPConnection, receive: Receive, send: Send) -> bool:  # pylint: disable=no-self-use,unused-argument
		"""Called on every request where the path matches the addons router prefix.
		Return true to skip further request processing."""
		connection.scope["required_access_role"] = ACCESS_ROLE_AUTHENTICATED
		if (
			connection.scope["path"].startswith(f"{self.router_prefix}/api/auth")
			or connection.scope["path"].startswith(f"{self.router_prefix}/api/opsidata")
			or connection.scope["path"].startswith(f"{self.router_prefix}/api/user/configuration")
		) and connection.base_url.hostname in ("127.0.0.1", "::1", "0.0.0.0", "localhost"):
			if connection.scope.get("method") == "OPTIONS":
				connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
		if connection.scope["path"].rstrip("/") == self.router_prefix or connection.scope["path"].startswith(
			(f"{self.router_prefix}/app", f"{self.router_prefix}/api/user/opsiserver", f"{self.router_prefix}/api/opsidata/changelogs")
		):
			connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
		elif connection.scope["path"] == f"{self.router_prefix}/api/auth/login":
			if connection.scope.get("method") == "OPTIONS":
				connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
			else:
				try:
					await authenticate(connection, receive)
					if connection.scope["session"].is_admin:
						connection.scope["session"].max_age = SESSION_LIFETIME
					else:
						raise BackendAuthenticationError("Not an admin")
				except Exception as err:
					raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(err)) from err

		return False

	async def handle_request_exception(self, err: Exception, connection: HTTPConnection, receive: Receive, send: Send) -> bool:  # pylint: disable=no-self-use,unused-argument
		"""Called on every request exception where the path matches the addons router prefix.
		Return true to skip further request processing."""
		message = str(err)
		status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
		headers: dict = {}

		if isinstance(err, (BackendAuthenticationError, BackendPermissionDeniedError)):
			status_code = status.HTTP_403_FORBIDDEN
		if isinstance(err, HTTPException):
			status_code = err.status_code
			message = err.detail

		if status_code == status.HTTP_401_UNAUTHORIZED:
			message = "Not logged in"

		if status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
			logger.error(err, exc_info=True)

		response = JSONResponse(
			content={"http_status": status_code, "error": str(err), "message": message}, status_code=status_code, headers=headers
		)
		await response(connection.scope, receive, send)
		return True


async def authenticate(connection: HTTPConnection, receive: Receive) -> None:
	logger.info("Start authentication of client %s", connection.client.host)  # type: ignore[union-attr]
	username = None
	password = None
	req = Request(connection.scope, receive)
	form = await req.form()
	username = form.get("username")
	password = form.get("password")

	await opsiconfd_authenticate(connection.scope, username, password)  # type: ignore
