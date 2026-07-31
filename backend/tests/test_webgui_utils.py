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


@pytest.mark.asyncio
async def test_filter_depot_access_skips_functions_without_selected_depots(
    monkeypatch, request_with_user
):
    """Regression: endpoints without a selectedDepots parameter (e.g.
    reachable_clients) must not receive an injected selectedDepots kwarg,
    which previously raised
    "reachable_clients() got an unexpected keyword argument 'selectedDepots'".
    """
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(utils, "depot_access_configured", lambda _user: True)
    monkeypatch.setattr(utils, "get_allowed_depots", lambda _user: ["depot-a"])

    @utils.filter_depot_access
    async def reachable_clients(request, selectedClients=None):  # pylint: disable=invalid-name, unused-argument
        return selectedClients

    result = await reachable_clients(
        request=request_with_user, selectedClients=["client-1.opsi.org"]
    )
    assert result == ["client-1.opsi.org"]


@pytest.mark.asyncio
async def test_filter_depot_access_injects_for_named_selected_depots_param(
    monkeypatch, request_with_user
):
    """Endpoints with an explicit selectedDepots parameter (no **kwargs)
    must still get the allowed depots injected when none are selected."""
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(utils, "depot_access_configured", lambda _user: True)
    monkeypatch.setattr(
        utils, "get_allowed_depots", lambda _user: ["depot-a", "depot-b"]
    )

    @utils.filter_depot_access
    async def handler(request, selectedDepots=None):  # pylint: disable=invalid-name, unused-argument
        return selectedDepots

    selected = await handler(request=request_with_user, selectedDepots=None)
    assert selected == ["depot-a", "depot-b"]


@pytest.mark.asyncio
async def test_filter_depot_access_supports_sync_functions(
    monkeypatch, request_with_user
):
    """Sync endpoints (e.g. depots.py handlers) are also decorated."""
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(utils, "depot_access_configured", lambda _user: True)
    monkeypatch.setattr(utils, "get_allowed_depots", lambda _user: ["depot-a"])

    @utils.filter_depot_access
    def handler(request, selectedDepots=None):  # pylint: disable=invalid-name, unused-argument
        return selectedDepots

    selected = await handler(
        request=request_with_user, selectedDepots=["depot-a", "forbidden"]
    )
    assert selected == ["depot-a"]


@pytest.mark.asyncio
async def test_filter_depot_access_no_user_register_passes_through(
    monkeypatch, request_with_user
):
    monkeypatch.setattr(utils, "user_register", lambda: False)

    @utils.filter_depot_access
    async def handler(request, selectedClients=None):  # pylint: disable=unused-argument
        return selectedClients

    result = await handler(request=request_with_user, selectedClients=["c1"])
    assert result == ["c1"]


@pytest.mark.asyncio
async def test_filter_depot_access_no_depot_restriction_keeps_selection(
    monkeypatch, request_with_user
):
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(utils, "depot_access_configured", lambda _user: False)

    @utils.filter_depot_access
    async def handler(request, selectedDepots=None):  # pylint: disable=invalid-name, unused-argument
        return selectedDepots

    selected = await handler(request=request_with_user, selectedDepots=["depot-x"])
    assert selected == ["depot-x"]


def test_filter_depot_access_endpoint_signatures_are_consistent() -> None:
    """Guard: scan all @filter_depot_access endpoints. Endpoints without a
    selectedDepots parameter are only safe because the decorator skips kwarg
    injection for them (regression: reachable_clients). This test documents
    which endpoints rely on that skip so signature changes are reviewed."""
    import re
    from pathlib import Path

    api_dir = Path(__file__).parent.parent / "webgui" / "python" / "api"
    pattern = re.compile(
        r"@filter_depot_access\s*\n(?:async\s+)?def\s+(\w+)\s*\((.*?)\)\s*->",
        re.DOTALL,
    )
    endpoints_without_selected_depots = set()
    endpoints_with_selected_depots = set()
    for source_file in api_dir.glob("*.py"):
        source = source_file.read_text(encoding="utf-8")
        for match in pattern.finditer(source):
            func_name, params = match.group(1), match.group(2)
            if "selectedDepots" in params or "**" in params:
                endpoints_with_selected_depots.add(func_name)
            else:
                endpoints_without_selected_depots.add(func_name)

    assert endpoints_with_selected_depots, (
        "No @filter_depot_access endpoints with selectedDepots found — "
        "regex or API layout changed, update this test"
    )
    # Endpoints relying on the decorator skipping injection:
    assert endpoints_without_selected_depots == {"reachable_clients"}
