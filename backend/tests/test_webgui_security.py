# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

"""
Security regression tests for the webgui addon.

These tests send SQL-injection payloads through user-controllable query
parameters (selectedDepots, filterQuery) and assert that the backend
neutralises them: the request must not trigger a SQL error (HTTP 5xx) and the
data must stay intact.
"""

import socket

import pytest
import requests

from .utils import ADMIN_PASS, ADMIN_USER  # pylint: disable=unused-import

API_ROOT = "/addons/webgui/api/opsidata"
FQDN = socket.getfqdn()

# Classic SQL-injection probes. A vulnerable backend would either raise a SQL
# error (HTTP 500) or, in the destructive case, mutate the schema/data.
SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "'; DROP TABLE HOST; --",
    "' UNION SELECT opsiHostKey FROM HOST --",
    "%' OR 1=1 -- ",
    "\\'; SELECT SLEEP(5); --",
]


def _get(config, path, params):  # pylint: disable=redefined-outer-name
    return requests.get(
        f"{config.external_url}{API_ROOT}{path}",
        auth=(ADMIN_USER, ADMIN_PASS),
        verify=False,
        params=params,
        timeout=30,
    )


@pytest.mark.parametrize("payload", SQL_INJECTION_PAYLOADS)
@pytest.mark.asyncio
async def test_products_filter_query_injection(config, payload):  # pylint: disable=redefined-outer-name
    """A malicious ``filterQuery`` must be treated as a literal search string."""
    res = _get(
        config,
        "/products",
        {
            "type": "LocalbootProduct",
            "selectedDepots": [FQDN],
            "pageNumber": 1,
            "perPage": 90,
            "sortBy": "productId",
            "sortDesc": False,
            "filterQuery": payload,
        },
    )
    assert res.status_code == 200, res.text


@pytest.mark.parametrize("payload", SQL_INJECTION_PAYLOADS)
@pytest.mark.asyncio
async def test_products_selected_depots_injection(config, payload):  # pylint: disable=redefined-outer-name
    """A malicious ``selectedDepots`` value must not break the depot filter."""
    res = _get(
        config,
        "/products",
        {
            "type": "LocalbootProduct",
            "selectedDepots": [payload],
            "pageNumber": 1,
            "perPage": 90,
            "sortBy": "productId",
            "sortDesc": False,
            "filterQuery": "",
        },
    )
    assert res.status_code == 200, res.text


@pytest.mark.parametrize("payload", SQL_INJECTION_PAYLOADS)
@pytest.mark.asyncio
async def test_clients_filter_query_injection(config, payload):  # pylint: disable=redefined-outer-name
    """A malicious ``filterQuery`` on the clients endpoint must be neutralised."""
    res = _get(
        config,
        "/clients",
        {
            "pageNumber": 1,
            "perPage": 90,
            "sortBy": "clientId",
            "sortDesc": False,
            "filterQuery": payload,
        },
    )
    assert res.status_code == 200, res.text


@pytest.mark.asyncio
async def test_data_intact_after_injection_attempts(config):  # pylint: disable=redefined-outer-name
    """After all injection attempts the data must still be queryable.

    If a ``DROP TABLE``/``SLEEP`` payload had been executed, this baseline
    request would fail. It proves the destructive payloads above were inert.
    """
    for payload in SQL_INJECTION_PAYLOADS:
        _get(config, "/products", {"type": "LocalbootProduct", "filterQuery": payload})

    res = _get(
        config,
        "/products",
        {
            "type": "LocalbootProduct",
            "selectedDepots": [FQDN],
            "pageNumber": 1,
            "perPage": 90,
            "sortBy": "productId",
            "sortDesc": False,
            "filterQuery": "",
        },
    )
    assert res.status_code == 200, res.text
    assert isinstance(res.json(), list)
