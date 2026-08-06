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

API_ROOT = "/addons/webgui/api/opsidata"

from .utils import (  # pylint: disable=unused-import
    ADMIN_PASS,
    ADMIN_USER,
    assert_or_update_fixture,
    remove_volatile,
)

FQDN = socket.getfqdn()
FILE_DIR = os.path.join(
    os.path.abspath(os.path.dirname(__file__)), "data", "webgui", "hosts"
)


test_data = [
    (
        "hosts",
        {"sortBy": "[type,hostId]", "perPage": 2, "pageNumber": 1, "sortDesc": False},
        f"{FILE_DIR}/hosts-get1.json",
    ),
    (
        "hosts",
        {"sortBy": "[type,hostId]", "perPage": 2, "pageNumber": 6, "sortDesc": True},
        f"{FILE_DIR}/hosts-get2.json",
    ),
    (
        "hosts",
        {"sortBy": "[type,hostId]", "perPage": 2, "pageNumber": 1, "sortDesc": True},
        f"{FILE_DIR}/hosts-get3.json",
    ),
]


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


@pytest.mark.parametrize("path, query_params, expected_result", test_data)
@pytest.mark.asyncio
async def test_hosts_get(config, path, query_params, expected_result):  # pylint: disable=too-many-arguments,redefined-outer-name
    res = requests.get(
        f"{config.external_url}{API_ROOT}/{path}",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        params=query_params,
    )
    res_data = res.json()

    from .utils import UPDATE_FIXTURES

    if UPDATE_FIXTURES:
        assert_or_update_fixture(res_data, expected_result)
    else:
        with open(expected_result, "r", encoding="utf-8") as f:
            json_data = json.loads(
                Template(f.read()).substitute(FQDN=FQDN).replace("'", '"')
            )

        if json_data[0]:
            json_data = remove_volatile(json_data)
            res_data = remove_volatile(res_data)

        assert res.status_code == status.HTTP_200_OK
        assert sorted(res_data, key=lambda item: item["hostId"]) == sorted(
            json_data, key=lambda item: item["hostId"]
        )


@pytest.mark.asyncio
async def test_host_groups_dynamic_does_not_return_group_as_its_own_child(config):
    parent_group = "pytest-lazy-parent"
    child_group = "pytest-lazy-child"
    client_id = "pytest-client-6.domain.local"

    create_parent = requests.post(
        f"{config.external_url}{API_ROOT}/hosts/groups",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        json={"groupId": parent_group},
    )
    assert create_parent.status_code == status.HTTP_201_CREATED

    create_child = requests.post(
        f"{config.external_url}{API_ROOT}/hosts/groups",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        json={"groupId": child_group, "parentGroupId": parent_group},
    )
    assert create_child.status_code == status.HTTP_201_CREATED

    add_client = requests.post(
        f"{config.external_url}{API_ROOT}/hosts/groups/{parent_group}/clients",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        json=[client_id],
    )
    assert add_client.status_code == status.HTTP_201_CREATED

    res = requests.get(
        f"{config.external_url}{API_ROOT}/hosts/groups-dynamic",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        params={"parentGroup": parent_group, "withClients": True},
    )

    assert res.status_code == status.HTTP_200_OK
    groups = res.json()["groups"]
    children = groups["children"]
    assert parent_group not in children
    assert child_group in children
    assert client_id in children


@pytest.mark.asyncio
async def test_servers_respect_restricted_depot_access(config):  # pylint: disable=redefined-outer-name
    depot_ids = requests.get(
        f"{config.external_url}{API_ROOT}/depot_ids",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
    ).json()
    assert depot_ids, "test data must contain at least one depot/config server"
    allowed_depot = depot_ids[0]

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
            f"{config.external_url}{API_ROOT}/servers",
            auth=(ADMIN_USER, ADMIN_PASS),
            verify=False,
            params={"pageNumber": 1, "perPage": 50, "sortBy": "[hostId]"},
        )
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data
        host_ids = [row["hostId"] for row in data]
        assert set(host_ids) == {allowed_depot}
    finally:
        _rpc(config, "config_delete", [config_ids])
