# -*- coding: utf-8 -*-

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
