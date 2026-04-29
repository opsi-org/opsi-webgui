# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
addon utils
"""

import inspect
import logging
from typing import Any

from opsi.logging import (
    get_logger,
    log_context,
)
from opsiconfd import contextvar_client_session  # type: ignore[import]
from opsiconfd.backend import get_mysql, get_unprotected_backend  # type: ignore

from .const import ADDON_ID

logger_opsi = get_logger(ADDON_ID)

backend = get_unprotected_backend()
mysql = get_mysql()

LEVEL = logging.DEBUG


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

    """
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
    """

    def __log(
        self,
        level,
        msg,
        with_event: bool = False,
        *args,
        exc_info=None,
        extra=None,
        stack_info=False,
        stacklevel=1,
    ):
        username = get_username(raise_error=False) or ""
        msg2 = f"[{username: <10s}] {msg}"
        # send to global opsi logger (preserves handlers configured by opsicommon)
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
            """
            if with_event:
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
            """

    def info(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", False)
        self.__log(logging.INFO, msg, with_event, *args, **kwargs)

    def debug(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", False)
        self.__log(logging.DEBUG, msg, with_event, *args, **kwargs)

    def error(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", True)
        self.__log(logging.ERROR, msg, with_event, *args, **kwargs)

    def warning(self, msg: object, *args: Any, **kwargs: Any) -> None:
        with_event = kwargs.pop("with_event", True)
        self.__log(logging.WARNING, msg, with_event, *args, **kwargs)


def get_logger() -> Logger:
    return Logger(ADDON_ID)
