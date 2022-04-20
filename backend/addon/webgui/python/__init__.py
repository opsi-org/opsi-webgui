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
from OPSI.Exceptions import BackendAuthenticationError, BackendPermissionDeniedError
from opsiconfd.addon import Addon
from opsiconfd.backend import get_client_backend
from opsiconfd.logging import logger
from opsiconfd.session import ACCESS_ROLE_AUTHENTICATED, ACCESS_ROLE_PUBLIC
from opsiconfd.utils import remove_route_path
from starlette.concurrency import run_in_threadpool
from starlette.types import Receive, Send

from .clients import client_router
from .const import ADDON_ID, ADDON_NAME, ADDON_VERSION
from .depots import depot_router
from .hosts import host_router
from .products import product_router
from .utils import mysql
from .webgui import webgui_router

SESSION_LIFETIME = 60*30

class Webgui(Addon):
	id = ADDON_ID
	name = ADDON_NAME
	version = ADDON_VERSION

	def setup(self, app):

		if not mysql:
			logger.warning("No mysql backend found! Webgui only works with mysql backend.")
			error_router = APIRouter()
			@error_router.get(f"{self.router_prefix}/app")
			def webgui_error():
				return PlainTextResponse("No mysql backend found! Webgui only works with mysql backend.", status_code=501)
			app.include_router(error_router)
			return

		app.include_router(webgui_router, prefix=self.router_prefix)
		app.include_router(product_router, prefix=self.router_prefix)
		app.include_router(host_router, prefix=self.router_prefix)
		app.include_router(client_router, prefix=self.router_prefix)
		app.include_router(depot_router, prefix=self.router_prefix)

		app.mount(
			path=f"{self.router_prefix}/app",
			app=StaticFiles(directory=os.path.join(self.data_path, "app"), html=True),
			name="app"
		)


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
			(connection.scope["path"].startswith(f"{self.router_prefix}/api/auth") or
			connection.scope["path"].startswith(f"{self.router_prefix}/api/opsidata")) and
			connection.base_url.hostname in ("127.0.0.1", "::1", "0.0.0.0", "localhost")
		):
			if connection.scope.get("method") == "OPTIONS":
				connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
		if (connection.scope["path"].rstrip("/") == self.router_prefix
			or connection.scope["path"].startswith((f"{self.router_prefix}/app",f"{self.router_prefix}/api/user/opsiserver"))
		):
			connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
		elif connection.scope["path"] == f"{self.router_prefix}/api/auth/login":
			if connection.scope.get("method") == "OPTIONS":
				connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
			else:
				try:
					await authenticate(connection, receive)
					connection.scope["session"].max_age = SESSION_LIFETIME
				except Exception as err:
					raise HTTPException(
						status_code=status.HTTP_403_FORBIDDEN,
						detail=str(err)
					) from err

		return False

	async def handle_request_exception(self, err: Exception, connection: HTTPConnection, receive: Receive, send: Send) -> bool:  # pylint: disable=no-self-use,unused-argument
		"""Called on every request exception where the path matches the addons router prefix.
		Return true to skip further request processing."""
		message = str(err)
		status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
		headers = {}

		if isinstance(err, (BackendAuthenticationError, BackendPermissionDeniedError)):
			status_code = status.HTTP_403_FORBIDDEN
		if isinstance(err, HTTPException):
			status_code = err.status_code
			message = err.detail

		if status_code == status.HTTP_401_UNAUTHORIZED:
			message = "Not logged in"

		if connection.scope.get("session"):
			headers = connection.scope["session"].get_headers()

		if status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
			logger.error(err, exc_info=True)

		response = JSONResponse(
			content={
				"http_status": status_code,
				"error": str(err),
				"message": message
			},
			status_code=status_code,
			headers=headers
		)
		await response(connection.scope, receive, send)
		return True


async def authenticate(connection: HTTPConnection, receive: Receive) -> None:
	logger.info("Start authentication of client %s", connection.client.host)
	username = None
	password = None
	# if connection.scope["path"] == "/addons/webgui/api/auth/login":
	req = Request(connection.scope, receive)
	form = await req.form()
	username = form.get("username")
	password = form.get("password")

	auth_type = None
	def sync_auth(username, password, auth_type):
		get_client_backend().backendAccessControl.authenticate(username, password, auth_type=auth_type)

	await run_in_threadpool(sync_auth, username, password, auth_type)
