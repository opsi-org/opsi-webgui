# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

"""
test opsiconfd webgui products
"""

import json
import os
import socket
from string import Template

import pytest
import requests
from fastapi import status

from .utils import (  # pylint: disable=unused-import
    ADMIN_PASS,
    ADMIN_USER,
    UPDATE_FIXTURES,
    assert_or_update_fixture,
    remove_volatile,
)

API_ROOT = "/addons/webgui/api/opsidata"
FQDN = socket.getfqdn()
FILE_DIR = os.path.join(
    os.path.abspath(os.path.dirname(__file__)), "data", "webgui", "depots"
)


test_data = [
    (
        "depots",
        {
            "filterQuery": "depot2",
            "perPage": 1,
            "pageNumber": 1,
            "sortBy": "[depotId,ip]",
            "sortDesc": False,
        },
        f"{FILE_DIR}/depots-get1.json",
    ),
    ("depot_ids", {"selectedDepots": FQDN}, f"{FILE_DIR}/depot-ids-get1.json"),
    ("depots/clients", {}, f"{FILE_DIR}/depots-clients-get1.json"),
    (
        "depots/clients",
        {"selectedDepots": "pytest-test-depot2.uib.gmbh"},
        f"{FILE_DIR}/depots-clients-get2.json",
    ),
]


@pytest.mark.parametrize("path, query_params, expected_result", test_data)
@pytest.mark.asyncio
async def test_depots_get(config, path, query_params, expected_result):  # pylint: disable=too-many-arguments,redefined-outer-name
    res = requests.get(
        f"{config.external_url}{API_ROOT}/{path}",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        params=query_params,
    )

    if UPDATE_FIXTURES:
        assert_or_update_fixture(res.json(), expected_result)
    else:
        with open(expected_result, "r", encoding="utf-8") as f:
            json_data = json.loads(
                Template(f.read()).substitute(FQDN=FQDN).replace("'", '"')
            )

        assert res.status_code == status.HTTP_200_OK
        res_data = remove_volatile(res.json())
        json_data = remove_volatile(json_data)
        if isinstance(json_data, list) and json_data and isinstance(json_data[0], dict):
            assert sorted(res_data, key=lambda item: item["depotId"]) == sorted(
                json_data, key=lambda item: item["depotId"]
            )
        else:
            assert sorted(res_data) == sorted(json_data)


@pytest.mark.asyncio
async def test_depots_selected_are_sorted_first(config):
    selected_depot = "pytest-test-depot-2.domain.local"
    res = requests.get(
        f"{config.external_url}{API_ROOT}/depots",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        params={
            "selected": f"[{selected_depot}]",
            "sortBy": "depotId",
            "sortDesc": False,
            "pageNumber": 1,
            "perPage": 20,
        },
    )

    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data
    assert data[0]["depotId"] == selected_depot
    assert bool(data[0]["selected"]) is True


def _rpc(config, method, params):  # pylint: disable=redefined-outer-name
    res = requests.post(
        f"{config.external_url}/rpc",
        auth=(ADMIN_USER, ADMIN_PASS),
        json={"id": 1, "method": method, "params": params},
        verify=False,
    )
    res.raise_for_status()
    result = res.json()
    assert result.get("error") is None, result
    return result


@pytest.mark.asyncio
async def test_depots_restricted_user_data_and_total_are_consistent(config):  # pylint: disable=redefined-outer-name
    """Regression: for users with restricted depot access the depot filter was
    applied AFTER pagination while the total stayed unfiltered. The frontend
    infinite scroll then kept requesting pages that came back empty, causing an
    endless refresh loop on the servers page."""
    # Restrict the admin user to a single depot via user roles.
    all_depots = requests.get(
        f"{config.external_url}{API_ROOT}/depot_ids",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
    ).json()
    depot_servers = [depot for depot in all_depots if depot != FQDN]
    assert depot_servers, "test data must contain at least one depot server"
    allowed_depot = depot_servers[0]

    config_ids = [
        "user.{}.register",
        f"user.{{{ADMIN_USER}}}.privilege.host.depotaccess.configured",
        f"user.{{{ADMIN_USER}}}.privilege.host.depotaccess.depots",
    ]
    _rpc(
        config,
        "config_updateObjects",
        [
            [
                {"id": config_ids[0], "type": "BoolConfig", "defaultValues": [True]},
                {"id": config_ids[1], "type": "BoolConfig", "defaultValues": [True]},
                {
                    "id": config_ids[2],
                    "type": "UnicodeConfig",
                    "multiValue": True,
                    "possibleValues": [allowed_depot],
                    "defaultValues": [allowed_depot],
                },
            ]
        ],
    )
    try:
        res = requests.get(
            f"{config.external_url}{API_ROOT}/depots",
            auth=(ADMIN_USER, ADMIN_PASS),
            verify=False,
            params={"pageNumber": 1, "perPage": 50},
        )
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        total = int(res.headers["x-total-count"])
        assert [depot["depotId"] for depot in data] == [allowed_depot]
        assert total == len(data) == 1

        # Later pages must be empty with the same (consistent) total.
        res = requests.get(
            f"{config.external_url}{API_ROOT}/depots",
            auth=(ADMIN_USER, ADMIN_PASS),
            verify=False,
            params={"pageNumber": 2, "perPage": 1},
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.json() == []
        assert int(res.headers["x-total-count"]) == 1
    finally:
        _rpc(config, "config_delete", [config_ids])
