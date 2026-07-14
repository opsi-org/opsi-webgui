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
