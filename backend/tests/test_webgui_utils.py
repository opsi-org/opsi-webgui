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


def test_get_objects_of_group_works_with_user_register_active(monkeypatch):
    """Regression: with user roles active (user.{}.register = true) this
    helper raised "NameError: name 'configured' is not defined" because the
    userrole setup lines were unreachable dead code behind a raise."""
    monkeypatch.setattr(utils, "user_register", lambda: True)
    monkeypatch.setattr(
        utils,
        "get_groups",
        lambda gtype, parent_ids=None: (
            [{"group_id": "sub-group", "parent_id": "group-a", "type": gtype}]
            if parent_ids == ["group-a"]
            else []
        ),
    )
    members = {
        ("group-a",): [{"objectId": "client-1.opsi.org"}],
        ("sub-group",): [{"objectId": "client-2.opsi.org"}],
    }

    def fake_object_to_groups(gtype, group_ids=None):
        ids = [group_ids] if isinstance(group_ids, str) else list(group_ids or [])
        return members.get(tuple(ids), [])

    monkeypatch.setattr(utils, "_get_object_to_groups", fake_object_to_groups)

    result = utils.get_objects_of_group(["group-a"], "HostGroup")
    assert result == ["client-1.opsi.org", "client-2.opsi.org"]


def test_get_objects_of_group_invalid_group_type_raises():
    with pytest.raises(ValueError):
        utils.get_objects_of_group(["group-a"], "InvalidType")


def test_get_objects_of_group_does_not_mutate_input(monkeypatch):
    """The passed group list must not grow while nested groups are resolved."""
    monkeypatch.setattr(utils, "user_register", lambda: False)
    monkeypatch.setattr(
        utils,
        "get_groups",
        lambda gtype, parent_ids=None: (
            [{"group_id": "sub-group", "parent_id": "group-a", "type": gtype}]
            if parent_ids == ["group-a"]
            else []
        ),
    )
    monkeypatch.setattr(
        utils, "_get_object_to_groups", lambda gtype, group_ids=None: []
    )

    groups = ["group-a"]
    utils.get_objects_of_group(groups, "HostGroup")
    assert groups == ["group-a"]


def test_get_allowed_sql_returns_empty_for_no_configured_groups(monkeypatch):
    """No configured groups must yield [] without touching the database
    (an empty IN () clause would be a SQL syntax error)."""
    monkeypatch.setattr(utils, "get_allowed_host_groups", lambda _user: [])
    assert utils.get_allowed_sql("alice", "HostGroup") == []

    monkeypatch.setattr(utils, "get_allowed_product_groups", lambda _user: [])
    assert utils.get_allowed_sql("alice", "ProductGroup") == []


class TestRestrictClientsToAllowedDepots:
    """Depot-restricted users must not be able to probe reachability of
    clients outside their allowed depots (clients/reachable endpoint)."""

    @pytest.fixture
    def api_clients(self):
        from webgui.python.api import clients as api_clients_module

        return api_clients_module

    def test_unrestricted_user_passes_through(self, monkeypatch, api_clients):
        monkeypatch.setattr(api_clients, "user_register", lambda: False)
        assert api_clients._restrict_clients_to_allowed_depots(["c1"]) == ["c1"]
        assert api_clients._restrict_clients_to_allowed_depots(None) is None

    def test_no_depot_restriction_passes_through(self, monkeypatch, api_clients):
        monkeypatch.setattr(api_clients, "user_register", lambda: True)
        monkeypatch.setattr(api_clients, "get_username", lambda: "alice")
        monkeypatch.setattr(api_clients, "depot_access_configured", lambda _user: False)
        assert api_clients._restrict_clients_to_allowed_depots(["c1"]) == ["c1"]

    def test_restricted_user_selection_is_filtered(self, monkeypatch, api_clients):
        monkeypatch.setattr(api_clients, "user_register", lambda: True)
        monkeypatch.setattr(api_clients, "get_username", lambda: "alice")
        monkeypatch.setattr(api_clients, "depot_access_configured", lambda _user: True)
        monkeypatch.setattr(
            api_clients, "get_allowed_depots", lambda _user: ["depot-a"]
        )
        monkeypatch.setattr(
            api_clients,
            "_clients_of_depots",
            lambda depots: ["allowed-1.opsi.org", "allowed-2.opsi.org"],
        )
        result = api_clients._restrict_clients_to_allowed_depots(
            ["allowed-1.opsi.org", "forbidden.opsi.org"]
        )
        assert result == ["allowed-1.opsi.org"]

    def test_restricted_user_without_selection_gets_allowed_clients(
        self, monkeypatch, api_clients
    ):
        monkeypatch.setattr(api_clients, "user_register", lambda: True)
        monkeypatch.setattr(api_clients, "get_username", lambda: "alice")
        monkeypatch.setattr(api_clients, "depot_access_configured", lambda _user: True)
        monkeypatch.setattr(
            api_clients, "get_allowed_depots", lambda _user: ["depot-a"]
        )
        monkeypatch.setattr(
            api_clients,
            "_clients_of_depots",
            lambda depots: ["b.opsi.org", "a.opsi.org"],
        )
        result = api_clients._restrict_clients_to_allowed_depots(None)
        assert result == ["a.opsi.org", "b.opsi.org"]

    def test_restricted_user_with_no_allowed_clients(self, monkeypatch, api_clients):
        monkeypatch.setattr(api_clients, "user_register", lambda: True)
        monkeypatch.setattr(api_clients, "get_username", lambda: "alice")
        monkeypatch.setattr(api_clients, "depot_access_configured", lambda _user: True)
        monkeypatch.setattr(api_clients, "get_allowed_depots", lambda _user: [])
        monkeypatch.setattr(api_clients, "_clients_of_depots", lambda depots: [])
        assert api_clients._restrict_clients_to_allowed_depots(["c1"]) == []
        assert api_clients._restrict_clients_to_allowed_depots(None) == []
