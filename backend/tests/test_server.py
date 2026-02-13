# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

"""
test opsiconfd products
"""

import pytest
import urllib3

from .utils import (
    TEST_NUM_ITEMS,
    config,
    config_server_id,
    create_check_data,
    http_call,
)

urllib3.disable_warnings()
# from backend.tests.utils import ADMIN_PASS, ADMIN_USER  # pylint: disable=import-error, unused-import
ADDON_ID = "opsi-webgui"
API_ROOT = f"/addons/{ADDON_ID}/api/"
# FQDN = socket.getfqdn()
# FILE_DIR = os.path.abspath(os.path.dirname(__file__))
print(
    f"Need to use this imports directly to not disappear: {config} {create_check_data}"
)


@pytest.mark.asyncio
@pytest.mark.parametrize("with_all", [True, False])
async def test_servers(config, with_all):  # pylint: disable=too-many-arguments,redefined-outer-name
    res = http_call(
        config,
        f"{API_ROOT}servers",
        method="get",
        query_params={
            "with_all": with_all,
        },
        # expected_result={"result": []},
    )

    assert "result" in res and isinstance(res["result"], list)
    num_entries = (TEST_NUM_ITEMS + 1) if with_all else TEST_NUM_ITEMS  # depots
    num_entries += 1  # configserver
    print(f"res['result']: {res['result']}")
    assert len(res["result"]) == num_entries, (
        f"Expected {num_entries} entries, got {len(res['result'])}\n\n{res['result']}"
    )

    for i, server in enumerate(res["result"]):
        if with_all and i == 0:
            # ui is updating the text
            assert server["id"] == ""
            assert server["description"] == ""
            assert server["label"] == ""
        else:
            assert server["id"] is not None and (
                ".domain.local" in server["id"] or config_server_id == server["id"]
            )
            assert len(server["description"]) > 10
            # assert server["description"] == f"description server{index}"
            assert server["id"] in server["label"]
            assert server["description"] in server["label"]
