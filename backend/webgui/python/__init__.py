# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
opsiconfd addon for opsi web interface
"""

import os
from typing import Any

from fastapi import APIRouter, FastAPI, HTTPException, status
from fastapi.requests import HTTPConnection
from fastapi.responses import JSONResponse, PlainTextResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from opsi.exception import (
    BackendAuthenticationError,
    BackendPermissionDeniedError,
)
from opsiconfd.addon import Addon  # type: ignore
from opsiconfd.session import (  # type: ignore
    ACCESS_ROLE_AUTHENTICATED,
    ACCESS_ROLE_PUBLIC,
)
from opsiconfd.utils import Singleton  # type: ignore
from opsiconfd.utils.fastapi import remove_route_path  # type: ignore

# from starlette.concurrency import run_in_threadpool
from starlette.types import Receive, Send

from .api import PUBLIC_PATHS as PP_API
from .api import api_router
from .api.clients import api_router as client_router
from .api.config import api_router as config_router
from .api.depots import api_router as depot_router
from .api.hosts import api_router as host_router
from .api.products import api_router as product_router
from .api.server import api_router as server_router
from .auth import Authentication
from .config import Config
from .const import ADDON_ID, ADDON_NAME, ADDON_VERSION
from .logger import Globals, get_logger
from .utils import mysql

SESSION_LIFETIME = 60 * 30
PUBLIC_PATHS = ["/app"] + PP_API

logger = get_logger()


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope: Any) -> Any:
        response = await super().get_response(path, scope)
        if response.status_code == status.HTTP_404_NOT_FOUND:
            response = await super().get_response("index.html", scope)
        return response


class Webgui(Addon, metaclass=Singleton):
    id = ADDON_ID
    name = ADDON_NAME
    version = ADDON_VERSION

    def init(self) -> None:
        # Init config
        if Globals().config is not None:
            return
        Globals().config = Config()
        try:
            logger.set_config(Globals().config)
            Globals().config.set_logger(logger) if hasattr(
                Globals().config, "set_logger"
            ) else None
            Globals().config.get_log_file_path(create=True)
        except Exception as err:
            logger.error(f"Error initializing config: {err}", with_event=True)
            raise err

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

        app.include_router(api_router, prefix=self.router_prefix)
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
        logger = get_logger()
        connection.scope["required_access_role"] = ACCESS_ROLE_AUTHENTICATED
        path = connection.scope.get("path", "").rstrip("/")

        if not path.startswith(self.router_prefix):
            return False
        logger.debug(f"Handling request for path: {path}")

        rel_path = "/" + path.removeprefix(self.router_prefix).lstrip("/")
        logger.debug(f"Relative path: {rel_path}")
        if rel_path.startswith("/-dev/"):
            logger.info("Detected development mode path, applying workaround")
            # workaround for development mode
            rel_path = rel_path.replace("/-dev/", "/", 1)
        logger.debug(f"Received request: {connection} ; {receive} ; {send}")

        if rel_path == "/":
            logger.debug(" Redirecting to /app")
            response = RedirectResponse(
                url=f"{self.router_prefix}/app",
                status_code=status.HTTP_301_MOVED_PERMANENTLY,
            )
            await response(connection.scope, receive, send)
            return False

        if any(rel_path.startswith(pub_path) for pub_path in PUBLIC_PATHS):
            connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
            return False

        auth = Authentication()

        # Handle authentication if path is /api/auth/login or if credentials are provided
        if rel_path == "/api/auth/login":
            if connection.scope.get("method") == "OPTIONS":
                connection.scope["required_access_role"] = ACCESS_ROLE_PUBLIC
                return False
            await auth.authenticate(connection, receive)  # create session
        elif await auth.credentials_provided(connection, receive):
            logger.info(
                f"Credentials provided, attempting authentication, ldap {auth.config_ldap.get('active', False)}",
                with_event=True,
            )
            await auth.authenticate(connection, receive)

        # Check authentication for other paths
        if not await auth.authenticated(connection, receive):
            logger.error(f"Permission denied (path {rel_path})", with_event=True)
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
            logger.error(err, with_event=True)

        response = JSONResponse(
            content={"http_status": status_code, "error": str(err), "message": message},
            status_code=status_code,
            headers=headers,
        )
        logger.debug(
            f"Sending error response: {response} ; {connection} ; {receive} ; {send}"
        )
        await response(connection.scope, receive, send)
        return True
