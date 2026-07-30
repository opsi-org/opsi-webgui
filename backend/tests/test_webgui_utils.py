# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

"""Unit tests for webgui backend utility decorators."""

from types import SimpleNamespace

import pytest
from webgui.python import utils


@pytest.fixture
def request_with_user() -> SimpleNamespace:
    return SimpleNamespace(scope={"session": SimpleNamespace(username="alice")})


@pytest.mark.asyncio
async def test_filter_depot_access_none_selected_depots_uses_allowed(
    monkeypatch, request_with_user
):
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(utils, "depot_access_configured", lambda _user: True)
    monkeypatch.setattr(
        utils, "get_allowed_depots", lambda _user: ["depot-a", "depot-b"]
    )

    @utils.filter_depot_access
    async def handler(*_args, **kwargs):
        return kwargs.get("selectedDepots")

    selected = await handler(request=request_with_user, selectedDepots=None)
    assert selected == ["depot-a", "depot-b"]


@pytest.mark.asyncio
async def test_filter_depot_access_filters_disallowed_depots(
    monkeypatch, request_with_user
):
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(utils, "depot_access_configured", lambda _user: True)
    monkeypatch.setattr(
        utils, "get_allowed_depots", lambda _user: ["depot-a", "depot-b"]
    )

    @utils.filter_depot_access
    async def handler(*_args, **kwargs):
        return kwargs.get("selectedDepots")

    selected = await handler(
        request=request_with_user,
        selectedDepots=["depot-a", "forbidden-depot", "depot-b"],
    )
    assert selected == ["depot-a", "depot-b"]


@pytest.mark.asyncio
async def test_filter_depot_access_keeps_empty_selection(
    monkeypatch, request_with_user
):
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(utils, "depot_access_configured", lambda _user: True)
    monkeypatch.setattr(utils, "get_allowed_depots", lambda _user: ["depot-a"])

    @utils.filter_depot_access
    async def handler(*_args, **kwargs):
        return kwargs.get("selectedDepots")

    selected = await handler(request=request_with_user, selectedDepots=[])
    assert selected == []
