# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
addon webgui
"""

import os
from typing import Any

from fastapi import APIRouter, FastAPI, HTTPException, Request, status
from fastapi.requests import HTTPConnection
from fastapi.responses import JSONResponse, PlainTextResponse, RedirectResponse
from fastapi.security import HTTPBasic
from fastapi.staticfiles import StaticFiles
from opsicommon.exceptions import BackendAuthenticationError, BackendPermissionDeniedError
from opsiconfd.addon import Addon
from opsiconfd.logging import logger
from opsiconfd.session import ACCESS_ROLE_AUTHENTICATED, ACCESS_ROLE_PUBLIC
from opsiconfd.session import authenticate as opsiconfd_authenticate
from opsiconfd.utils import Singleton
from opsiconfd.utils.fastapi import remove_route_path
from starlette.concurrency import run_in_threadpool
from starlette.types import Receive, Send

from .clients import client_router
from .config import config_router
from .const import ADDON_ID, ADDON_NAME, ADDON_VERSION
from .depots import depot_router
from .hosts import host_router
from .products import product_router
from .server import server_router
from .utils import mysql
from .webgui import webgui_router

SESSION_LIFETIME = 60 * 30
PUBLIC_PATHS = ["/app", "/api/user/opsiserver", "/api/auth/status"]


class Webgui(Addon, metaclass=Singleton):
    id = ADDON_ID
    name = ADDON_NAME
    version = ADDON_VERSION
    _local_config: Any = None

    def init(self) -> None:
        # Init config
        pass

    def setup(self, app: FastAPI) -> None:
        logger.debug(f"setup {self.data_path}")
        if not mysql:
            logger.warning(
                f"No mysql backend found! {ADDON_ID} only works with mysql backend.",
            )
            error_router = APIRouter()

            @error_router.get(f"{self.router_prefix}/app")
            def addon_error() -> PlainTextResponse:
                logger.error(
                    f"No mysql backend found! {ADDON_ID} only works with mysql backend.",
                )
                return PlainTextResponse(
                    f"No mysql backend found! {ADDON_ID} only works with mysql backend.",
                    status_code=501,
                )

            app.include_router(error_router)
            return

        self.init()

        app.include_router(webgui_router, prefix=self.router_prefix)
        app.include_router(product_router, prefix=self.router_prefix)
        app.include_router(host_router, prefix=self.router_prefix)
        app.include_router(client_router, prefix=self.router_prefix)
        app.include_router(depot_router, prefix=self.router_prefix)
        app.include_router(config_router, prefix=self.router_prefix)
        app.include_router(server_router, prefix=self.router_prefix)

        app.mount(
            path=f"{self.router_prefix}/app",
            app=StaticFiles(directory=os.path.join(self.data_path, "app"), html=True),
            name="app",
        )

        logger.info(f"Addon {ADDON_ID} setup complete")

    def on_load(self, app: FastAPI) -> None:  # pylint: disable=no-self-use
        """Called after loading the addon"""
        self.setup(app)

    def on_unload(self, app: FastAPI) -> None:  # pylint: disable=no-self-use
        """Called before unloading the addon"""
        remove_route_path(app, self.router_prefix)

    async def handle_request(
        self, connection: HTTPConnection, receive: Receive, send: Send
    ) -> bool:  # pylint: disable=no-self-use,unused-argument
        """
        Called on every request where the path matches the addons router prefix.
        Return true to skip further request processing.
        """
        self.init()
        connection.scope["required_access_role"] = ACCESS_ROLE_AUTHENTICATED
        path = connection.scope.get("path", "").rstrip("/")

        if not path.startswith(self.router_prefix):
            return False
        logger.debug(f"{ADDON_ID} Handling request for path: {path}")

        rel_path = "/" + path.removeprefix(self.router_prefix).lstrip("/")
        logger.debug(f"{ADDON_ID} Relative path: {rel_path}")
        if rel_path.startswith("/-dev/"):
            # workaround for development mode
            rel_path = rel_path.replace("/-dev/", "/", 1)
        logger.debug(f"{ADDON_ID} Received request: {connection} ; {receive} ; {send}")

        redirect_code = status.HTTP_301_MOVED_PERMANENTLY
        if rel_path == "/":
            logger.debug(f"{ADDON_ID} Redirecting to /app")
            response = RedirectResponse(
                url=f"{self.router_prefix}/app", status_code=redirect_code
            )
            await response(connection.scope, receive, send)
            return False

        if any(rel_path.startswith(pub_path) for pub_path in PUBLIC_PATHS):
            connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
            return False

        if rel_path == "/api/auth/login":
            if connection.scope.get("method") == "OPTIONS":
                connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
                return False

            try:
                await authenticate(connection, receive)
                connection.scope["session"].max_age = SESSION_LIFETIME
            except Exception as err:
                logger.error(f"{ADDON_ID} Authentication failed: {err}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail=str(err)
                ) from err

        if not connection.scope["session"].is_admin:
            ### if username and password are given, pass to opsiconfd with returning false
            creds: Any = None
            try:
                req = Request(connection.scope, receive)
                creds = await HTTPBasic(auto_error=False)(req)
            except Exception:
                pass

            if (
                creds
                and getattr(creds, "username", None)
                and getattr(creds, "password", None)
            ):
                logger.warning(
                    f"{ADDON_ID} Passing authentication to opsiconfd for user {creds.username}"
                )
                return False

            logger.error(f"{ADDON_ID} Permission denied for {rel_path}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
            )

        return False

    async def handle_request_exception(
        self, err: Exception, connection: HTTPConnection, receive: Receive, send: Send
    ) -> bool:  # pylint: disable=no-self-use,unused-argument
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
            content={"http_status": status_code, "error": str(err), "message": message},
            status_code=status_code,
            headers=headers,
        )
        await response(connection.scope, receive, send)
        return True


async def authenticate(connection: HTTPConnection, receive: Receive) -> None:
    logger.debug(f"Start authentication of client {connection.client.host}")  # type: ignore[union-attr]
    req = Request(connection.scope, receive)
    form = await req.form()
    username = str(form.get("username", ""))
    password = str(form.get("password", ""))
    mfa_otp = str(form.get("mfa_otp", ""))

    logger.debug(f"Authenticating user {username}")
    result = await opsiconfd_authenticate(
        scope=connection.scope,
        username=username,
        password=password,
        mfa_otp=mfa_otp,
    )
    logger.debug(f"Authentication result for user {username}: {result}")
