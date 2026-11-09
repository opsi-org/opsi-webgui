# This file is part of the OPSI-WebGUI application.
# The OPSI-WebGUI backend is an addon for opsiconfd.
# https://opsi.org/en/
#
# Copyright (c) UIB GmbH info@uib.de 2026
# All rights reserved.
# License: AGPL-3.0

"""Focused tests for WebGUI server-configuration write permissions."""

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import Request
from webgui.python import utils
from webgui.python.api import config as config_api
from webgui.python.api import hosts as hosts_api


@pytest.fixture(autouse=True)
def create_check_data() -> None:
	"""Keep these permission tests isolated from integration seed data."""


@pytest.fixture
def request_with_user() -> Request:
	return Request({"type": "http", "session": SimpleNamespace(username="alice"), "headers": [], "path": "/"})


@pytest.fixture
def permission_backend(monkeypatch: pytest.MonkeyPatch) -> SimpleNamespace:
	rights = SimpleNamespace(registered=True, server_write=False, read_only=False)
	monkeypatch.setattr(utils, "user_register", lambda: rights.registered)
	monkeypatch.setattr(config_api, "user_register", lambda: rights.registered)
	monkeypatch.setattr(utils, "is_opsiserver_write_permitted", lambda _user: rights.server_write)
	monkeypatch.setattr(utils, "read_only_user", lambda _user: rights.read_only)
	monkeypatch.setattr(utils.backend, "accessControl_userIsReadOnlyUser", lambda: False)
	rights.events = MagicMock()
	monkeypatch.setattr(config_api.backend, "_send_messagebus_event", rights.events)
	return rights


@pytest.fixture
def database(monkeypatch: pytest.MonkeyPatch) -> MagicMock:
	mysql = MagicMock()
	session = mysql.session.return_value.__enter__.return_value
	session.execute.return_value.fetchall.return_value = []
	monkeypatch.setattr(config_api, "mysql", mysql)
	monkeypatch.setattr(hosts_api, "mysql", mysql)
	return session


@pytest.mark.parametrize("operation", ["create_config", "save_config_value", "update_server"])
@pytest.mark.asyncio
async def test_server_writes_denied_before_database_access(
	operation: str, request_with_user: Request, permission_backend: SimpleNamespace, database: MagicMock
) -> None:
	if operation == "update_server":
		response = await hosts_api.update_server(
			request=request_with_user, server_id="server.test", server=hosts_api.Server(hostId="server.test")
		)
	elif operation == "create_config":
		response = await config_api.create_config(
			request=request_with_user, config=config_api.ConfigComplete(configId="user.{alice}.privilege.host.opsiserver.write")
		)
	else:
		response = await config_api.save_config_value(
			request=request_with_user, data=[config_api.Config(configId="test.config", value="changed")]
		)
	assert response.status_code == 403
	database.execute.assert_not_called()
	permission_backend.events.assert_not_called()


@pytest.mark.parametrize(
	("targets", "server_target"),
	[
		(["configserver.test"], "configserver.test"),
		(["depot.test"], "depot.test"),
		(["client.test", "depot.test"], "depot.test"),
	],
)
@pytest.mark.asyncio
async def test_server_config_states_denied_atomically(
	targets: list[str],
	server_target: str,
	request_with_user: Request,
	permission_backend: SimpleNamespace,
	database: MagicMock,
) -> None:
	database.execute.return_value.fetchone.return_value = (server_target,)
	response = await config_api.save_config_state(
		request=request_with_user,
		data=config_api.ConfigStates(objectIds=targets, configs=[config_api.Config(configId="test.config", value="changed")]),
	)
	assert response.status_code == 403
	database.execute.assert_called_once()
	query, params = database.execute.call_args.args
	assert "OpsiConfigserver" in str(query)
	assert "OpsiDepotserver" in str(query)
	assert params == {"object_ids": targets}
	permission_backend.events.assert_not_called()


@pytest.mark.parametrize(
	("registered", "server_write", "server_target"),
	[(True, False, None), (True, True, "server.test"), (False, False, "server.test")],
)
@pytest.mark.asyncio
async def test_permitted_config_states_are_saved(
	registered: bool,
	server_write: bool,
	server_target: str | None,
	request_with_user: Request,
	permission_backend: SimpleNamespace,
	database: MagicMock,
) -> None:
	permission_backend.registered = registered
	permission_backend.server_write = server_write
	database.execute.return_value.fetchone.return_value = (server_target,) if server_target else None
	target = server_target or "client.test"
	response = await config_api.save_config_state(
		request=request_with_user,
		data=config_api.ConfigStates(objectIds=[target], configs=[config_api.Config(configId="test.config", value="changed")]),
	)
	assert response.status_code == 200
	assert any(str(call.args[0]).startswith("INSERT INTO") for call in database.execute.call_args_list)
	permission_backend.events.assert_called_once()


@pytest.mark.parametrize(("registered", "server_write"), [(True, True), (False, False)])
@pytest.mark.asyncio
async def test_permitted_server_attributes_are_saved(
	registered: bool,
	server_write: bool,
	request_with_user: Request,
	permission_backend: SimpleNamespace,
	database: MagicMock,
	monkeypatch: pytest.MonkeyPatch,
) -> None:
	permission_backend.registered = registered
	permission_backend.server_write = server_write
	monkeypatch.setattr(hosts_api, "host_check_duplicates", lambda *_args: None)
	response = await hosts_api.update_server(
		request=request_with_user, server_id="server.test", server=hosts_api.Server(hostId="server.test", description="changed")
	)
	assert response.status_code == 201
	database.execute.assert_called_once()
	assert str(database.execute.call_args.args[0]).startswith("UPDATE")


@pytest.mark.asyncio
async def test_read_only_still_blocks_server_write_permission(
	request_with_user: Request, permission_backend: SimpleNamespace, database: MagicMock
) -> None:
	permission_backend.server_write = True
	permission_backend.read_only = True
	response = await hosts_api.update_server(
		request=request_with_user, server_id="server.test", server=hosts_api.Server(hostId="server.test")
	)
	assert response.status_code == 403
	database.execute.assert_not_called()
