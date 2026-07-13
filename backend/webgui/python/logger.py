# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi https://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
addon opsi-portal - utils
"""

import inspect
import logging
from logging.handlers import RotatingFileHandler
from typing import Any

from opsi.logging import (
    ContextSecretFormatter,
    context_filter,
    log_context,
)
from opsi.logging import (
    get_logger as get_opsi_logger,
)
from opsi.util.pattern import Singleton
from opsiconfd import contextvar_client_session  # type: ignore[import]
from opsiconfd.backend import get_mysql, get_unprotected_backend  # type: ignore
from opsiconfd.config import config as opsi_config  # type: ignore
from sqlalchemy import select, text

from .config import Config
from .const import ADDON_ID

logger_opsi = get_opsi_logger(ADDON_ID)

backend = get_unprotected_backend()
mysql = get_mysql()
PRINT_TO_CUSTOM_LOG_FILE_DEFAULT = (
    True  # warning and errors always printed to custom logfile
)


class Globals(metaclass=Singleton):
    def __init__(self) -> None:
        self.config: Config | None = None
        self.logger: Logger | None = None

    def __setattr__(self, name: str, value: Any) -> None:
        super().__setattr__(name, value)


def get_bool_config_value(config_id: str) -> bool:
    with mysql.session() as session:
        where = text(f"cv.configId='{config_id}'")
        query = (
            select(text("cv.configId, cv.value, cv.isDefault"))
            .select_from(text("CONFIG_VALUE AS cv"))
            .where(where)
        )
        result = session.execute(query)
        result = result.fetchall()
    if result:
        for row in result:
            row_dict = dict(row)
            if row_dict.get("isDefault") == 1 and row_dict.get("value") in [
                "1",
                "true",
                "True",
                True,
            ]:
                return True
    return False


def get_clients_of_server(opsi_backend: Any, server_id: str) -> dict[str, str]:
    res: dict[str, str] = {}
    if not server_id or server_id == "":
        _client_server: list[dict[str, str]] = (
            opsi_backend.configState_getClientToDepotserver()
        )
        _client2server: dict[str, str] = {
            obj["clientId"]: obj["depotId"] for obj in _client_server
        }
        hostIds = opsi_backend.host_getIdents(type="*client")
        if len(hostIds) == 0:
            return {}
        if len(hostIds) == len(_client2server):
            return _client2server
        res = {c: _client2server.get(c, "") for c in hostIds}
        return res

    # specific server (check if is configserver and allow clients with empty depot)
    ###configserver: str = get_configserver_id()
    res = {
        obj["clientId"]: obj["depotId"]
        for obj in opsi_backend.configState_getClientToDepotserver(depotIds=[server_id])
    }
    return res


def get_username(raise_error: bool = True) -> str:
    client_session = contextvar_client_session.get()
    if raise_error and not client_session:
        raise RuntimeError("Session invalid")
    elif not raise_error and not client_session:
        return ""
    return client_session.username


class Logger(logging.Logger):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        # _lvl = Config().get_log_level() if hasattr(Config, "get_log_level") else "INFO"
        # LOG_LEVEL: int = getattr(logging, _lvl, logging.INFO)

        # self.setLevel(LOG_LEVEL)
        self.propagate = False

    def set_config(self, config: Config) -> None:
        lvl = config.get_log_level()
        LOG_LEVEL: int = getattr(logging, lvl, logging.INFO)
        self.setLevel(LOG_LEVEL)

        file_handler = CustomFileHandler()
        file_handler.setup(config)
        self.addHandler(file_handler)

        config.set_logger(self)
        self.local_config = config

    def __log_event(self, level, msg, *args: Any, **kwargs: Any):
        with log_context({"action": ADDON_ID}):
            super().log(level, msg, *args, **kwargs)

    def __log_opsi(self, level, msg, *args: Any, **kwargs: Any):
        with log_context({"action": ADDON_ID}):
            logger_opsi.log(
                level,
                msg,
                *args,
                **kwargs,
            )

    def __log(
        self,
        level,
        msg,
        with_event: bool = PRINT_TO_CUSTOM_LOG_FILE_DEFAULT,
        *args,
        exc_info=None,
        extra=None,
        stack_info=False,
        stacklevel=1,
    ):
        username = get_username(raise_error=False) or ""
        msg2 = f"[{username: <10s}] {msg}"
        # send to global opsi logger (preserves handlers configured by opsi)
        # compute a stacklevel that points to the original caller outside this module
        try:
            stack = inspect.stack()
            # find first frame that is not this file and not part of the logging module
            computed = 1
            for i, frame_info in enumerate(stack):
                fn = frame_info.filename
                if fn == __file__:
                    continue
                if "logging" in fn:
                    continue
                computed = i
                break
        except Exception:
            computed = stacklevel

        # add an offset to account for the wrapper frames (__log_opsi, logging.*)
        effective_stacklevel = max(1, computed + 2)

        # Create LogRecords with the original caller filename/lineno and dispatch
        try:
            stack = inspect.stack()
            target = None
            for frame_info in stack:
                fn = frame_info.filename
                if fn == __file__:
                    continue
                if "logging" in fn:
                    continue
                target = frame_info
                break
            if target:
                fn = target.filename
                lno = target.lineno
                funcname = target.function
            else:
                fn = __file__
                lno = 1
                funcname = ""
        except Exception:
            fn = __file__
            lno = 1
            funcname = ""

        # Normal / global opsi logger
        with log_context({"action": ADDON_ID}):
            try:
                rec = logger_opsi.makeRecord(
                    logger_opsi.name,
                    level,
                    fn,
                    lno,
                    msg2,
                    args,
                    exc_info,
                    funcname,
                    extra,
                    None,
                )
                logger_opsi.handle(rec)
            except Exception:
                # fallback to simple call if something unexpected happens
                logger_opsi.log(
                    level,
                    msg2,
                    *args,
                    exc_info=exc_info,
                    extra=extra,
                    stack_info=stack_info,
                    stacklevel=effective_stacklevel,
                )

            if (
                with_event
                and self.local_config
                and self.local_config.get_log_custom_active()
            ):
                # also write to event file using this Logger's handlers
                try:
                    rec2 = self.makeRecord(
                        self.name,
                        level,
                        fn,
                        lno,
                        msg2,
                        args,
                        exc_info,
                        funcname,
                        extra,
                        None,
                    )
                    self.handle(rec2)
                except Exception:
                    super().log(
                        level,
                        msg2,
                        *args,
                        exc_info=exc_info,
                        extra=extra,
                        stack_info=stack_info,
                        stacklevel=effective_stacklevel,
                    )

    def info(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", PRINT_TO_CUSTOM_LOG_FILE_DEFAULT)
        self.__log(logging.INFO, msg, with_event, *args, **kwargs)

    def debug(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", PRINT_TO_CUSTOM_LOG_FILE_DEFAULT)
        self.__log(logging.DEBUG, msg, with_event, *args, **kwargs)

    def trace(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", PRINT_TO_CUSTOM_LOG_FILE_DEFAULT)
        self.__log(logging.TRACE, msg, with_event, *args, **kwargs)

    def error(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", True)
        self.__log(logging.ERROR, msg, with_event, *args, **kwargs)

    def notice(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", True)
        self.__log(logging.NOTICE, msg, with_event, *args, **kwargs)

    def warning(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", True)
        self.__log(logging.WARNING, msg, with_event, *args, **kwargs)

    def detailed(self, msg: object, *args: Any, **kwargs: Any) -> None:
        if not hasattr(self, "local_config") or not self.local_config:
            self.local_config = Config()

        with_event = kwargs.pop("with_event", PRINT_TO_CUSTOM_LOG_FILE_DEFAULT)
        msg = f"{msg} (Remove detailed log in production by setting 'detailed' to false in the addon config)"
        if (
            hasattr(self.local_config, "get_log_detailed")
            and self.local_config.get_log_detailed()
        ):
            self.__log(logging.TRACE, msg, with_event, *args, **kwargs)

    def devel(self, msg: object, *args: Any, **kwargs: Any) -> None:
        if not hasattr(self, "local_config") or not self.local_config:
            self.local_config = Config()

        with_event = kwargs.pop("with_event", PRINT_TO_CUSTOM_LOG_FILE_DEFAULT)
        msg = f"{msg} (Remove devel log in production by setting 'devel' to false in the addon config)"
        if (
            hasattr(self.local_config, "get_log_devel")
            and self.local_config.get_log_devel()
        ):
            self.__log(logging.DEVEL, msg, with_event, *args, **kwargs)


class CustomFileHandler(RotatingFileHandler):
    def __init__(self) -> None:
        pass

    def setup(self, config: Config | None = None) -> None:
        if not config:
            config = Config()

        Globals().config = config
        if config.get_log_custom_active():
            log_file = config.get_log_file_path(create=True)
            max_bytes, backup_count = config.get_log_rotation_settings()
            try:
                super().__init__(
                    log_file,
                    maxBytes=max_bytes,
                    backupCount=int(backup_count),
                    encoding="UTF-8",
                )
            except Exception:
                # fallback to non-rotating if something goes wrong
                super().__init__(log_file, encoding="UTF-8")

        _lvl = config.get_log_level()
        LOG_LEVEL: int = getattr(logging, _lvl, logging.INFO)
        LOG_FORMAT: str = (
            opsi_config.log_format_file
            or "[%(opsilevel)d] [%(asctime)s.%(msecs)03d] [%(contextstring)-15s] %(message)s   (%(filename)s:%(lineno)d)"
        )
        base_formatter = logging.Formatter(LOG_FORMAT, datefmt="%Y-%m-%d %H:%M:%S")
        formatter = ContextSecretFormatter(base_formatter)
        self.setFormatter(formatter)
        # ensure contextfilter is attached so ContextSecretFormatter can fill contextstring
        try:
            self.addFilter(context_filter)
        except Exception:
            pass
        self.setLevel(LOG_LEVEL)


def get_logger() -> Logger:
    if Globals().logger:
        return Globals().logger

    _logger = Logger(ADDON_ID)
    try:
        config = Config()
        config.get_log_file_path(create=config.get_log_custom_active())
        _logger.set_config(config)
    except Exception as e:
        _logger.error(
            f"Failed to initialize logger in get_logger: {e}", with_event=True
        )
        pass
    Globals().logger = _logger
    return _logger
