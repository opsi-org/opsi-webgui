# opsiconfd is part of the desktop management solution opsi https://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""Regression tests for webgui addon exception handling."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from webgui.python import Webgui


@pytest.fixture(autouse=True)
def create_check_data():
	# Override autouse DB fixture from tests/conftest.py for pure unit tests.
	pass


def _new_addon() -> Webgui:
	# Avoid Addon/Singleton setup side effects; method under test only needs
	# instance methods and logging.
	return object.__new__(Webgui)


@pytest.mark.asyncio
async def test_handle_request_root_redirect_is_fully_handled(monkeypatch) -> None:
	addon = _new_addon()
	monkeypatch.setattr(addon, "init", lambda: None)

	connection = SimpleNamespace(
		scope={
			"type": "http",
			"path": "/addons/webgui",
			"method": "GET",
			"required_access_role": None,
		}
	)

	async def receive():
		return {"type": "http.request", "body": b"", "more_body": False}

	sent_messages = []

	async def send(message):
		sent_messages.append(message)

	handled = await addon.handle_request(connection, receive, send)

	assert handled is True
	assert sent_messages
	assert sent_messages[0]["type"] == "http.response.start"


@pytest.mark.asyncio
async def test_handle_request_exception_sends_json_response() -> None:
	addon = _new_addon()
	connection = SimpleNamespace(scope={"type": "http", "path": "/addons/webgui/api/opsidata/servers"})

	async def receive():
		return {"type": "http.request", "body": b"", "more_body": False}

	sent_messages = []

	async def send(message):
		sent_messages.append(message)

	handled = await addon.handle_request_exception(ValueError("boom"), connection, receive, send)

	assert handled is True
	assert sent_messages
	assert sent_messages[0]["type"] == "http.response.start"


@pytest.mark.asyncio
@pytest.mark.parametrize(
	"asgi_error",
	[
		"Unexpected ASGI message 'http.response.start' sent, after response already completed.",
		"Unexpected ASGI message 'http.response.start' sent, after response already started.",
	],
)
async def test_handle_request_exception_ignores_completed_response_runtime_error(
	asgi_error,
) -> None:
	addon = _new_addon()
	connection = SimpleNamespace(scope={"type": "http", "path": "/addons/webgui/api/opsidata/servers"})

	async def receive():
		return {"type": "http.request", "body": b"", "more_body": False}

	async def send(_message):
		raise RuntimeError(asgi_error)

	handled = await addon.handle_request_exception(ValueError("original error"), connection, receive, send)

	assert handled is True


@pytest.mark.asyncio
async def test_handle_request_exception_reraises_unrelated_runtime_error() -> None:
	addon = _new_addon()
	connection = SimpleNamespace(scope={"type": "http", "path": "/addons/webgui/api/opsidata/servers"})

	async def receive():
		return {"type": "http.request", "body": b"", "more_body": False}

	async def send(_message):
		raise RuntimeError("some other transport failure")

	with pytest.raises(RuntimeError, match="some other transport failure"):
		await addon.handle_request_exception(ValueError("boom"), connection, receive, send)
