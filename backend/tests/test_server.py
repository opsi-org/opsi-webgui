# This file is part of the OPSI-WebGUI application.
# The OPSI-WebGUI backend is an addon for opsiconfd.
# https://opsi.org/en/
#
# Copyright (c) UIB GmbH info@uib.de 2026
# All rights reserved.
# License: AGPL-3.0

"""Unit tests for webgui.python.api.server of the OPSI-WebGUI addon."""

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
ADDON_ID = "webgui"
API_ROOT = f"/addons/{ADDON_ID}/api/opsidata/"
_fixture_refs = (config, create_check_data)


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
	)

	assert isinstance(res, list), f"Expected list, got {type(res)}: {res}"
	num_entries = TEST_NUM_ITEMS + 1  # depots + configserver
	assert len(res) == num_entries, f"Expected {num_entries} entries, got {len(res)}\n\n{res}"

	for server in res:
		assert server["hostId"] is not None and (".domain.local" in server["hostId"] or config_server_id == server["hostId"])
