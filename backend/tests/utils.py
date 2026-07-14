# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
admininterface tests
"""

import json
import os
import socket
from datetime import datetime, timedelta
from typing import Any

import MySQLdb
import pytest
import requests
import urllib3
from opsi.logging import get_logger
from requests.auth import HTTPBasicAuth

urllib3.disable_warnings()
logger = get_logger("backend.tests.utils")

ADMIN_USER = "adminuser"
ADMIN_PASS = "adminuser"
OPSI_SESSION_KEY = "opsiconfd:sessions"
MONITORING_CHECK_DAYS = 31

TEST_NUM_ITEMS = 10
UPDATE_FIXTURES = os.environ.get("UPDATE_FIXTURES", "").lower() in ("1", "true", "yes")

# Fields whose values are non-deterministic between runs (timestamps, generated
# host keys, one-time passwords). They are dropped before a snapshot is written or
# compared so the fixtures stay stable.
VOLATILE_KEYS = frozenset(
    {"created", "lastSeen", "modificationTime", "opsiHostKey", "oneTimePassword"}
)


def remove_volatile(obj):
    if isinstance(obj, dict):
        return {
            key: remove_volatile(value)
            for key, value in obj.items()
            if key not in VOLATILE_KEYS
        }
    if isinstance(obj, list):
        return [remove_volatile(item) for item in obj]
    return obj


def assert_or_update_fixture(actual_data, fixture_path):
    """Compare actual_data with fixture file, or update the fixture if UPDATE_FIXTURES is set."""
    if UPDATE_FIXTURES:
        os.makedirs(os.path.dirname(fixture_path), exist_ok=True)
        with open(fixture_path, "w", encoding="utf-8") as f:
            json.dump(remove_volatile(actual_data), f, indent=2, ensure_ascii=False)
        return
    with open(fixture_path, "r", encoding="utf-8") as f:
        expected_data = json.load(f)
    assert remove_volatile(actual_data) == remove_volatile(expected_data)


def _get_config_server_id():
    """Get the actual configserver ID from the database."""
    try:
        mysql = MySQLdb.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", 3306)),
            user=os.getenv("MYSQL_USER", "opsi"),
            passwd=os.getenv("MYSQL_PASSWORD", "opsi"),
            db=os.getenv("MYSQL_DATABASE", "opsi"),
            charset="utf8mb4",
        )
        cursor = mysql.cursor()
        cursor.execute(
            'SELECT hostId FROM HOST WHERE type = "OpsiConfigserver" LIMIT 1;'
        )
        row = cursor.fetchone()
        result = row[0] if row else socket.getfqdn()
        cursor.close()
        mysql.close()
        return result
    except Exception:
        return socket.getfqdn()


config_server_id = _get_config_server_id()


# MARK: http_call
def http_call(
    config,
    url,
    method="get",
    query_params=None,
    data=None,
    body=None,
    expected_result=None,
):
    external_url = config.internal_url
    req_kwargs: dict[str, Any] = dict(
        method=method.upper(),
        url=external_url + url,
        auth=HTTPBasicAuth(ADMIN_USER, ADMIN_PASS),
        verify=False,
        params=query_params,
    )
    if method.lower() == "post" and isinstance(data, dict):
        req_kwargs["json"] = data
    elif data is not None:
        req_kwargs["data"] = data

    res = requests.request(**req_kwargs)
    assert res.status_code == 200
    if expected_result is not None:
        assert res.json() == expected_result

    return res.json()


def create_depot_rpc(opsi_url: str, host_id: str, host_key: str | None = None):
    params = [
        host_id,
        host_key,
        "file:///var/lib/opsi/depot",  # depotLocalURL
        "smb://172.17.0.101/opsi_depot",  # depotRemoteUrl
        None,  # webdavUrl
        "file:///var/lib/opsi/repository",  # repoLocalURL
        f"webdavs://172.17.0.101:{os.getenv('OPSICONFD_PORT', 4447)}/repository",  # repoRemoteURL
        "depot description of " + host_id,  # description
    ]
    rpc_request_data = json.dumps(
        {"id": 1, "method": "host_createOpsiDepotserver", "params": params}
    )
    res = requests.post(
        f"{opsi_url}/rpc",
        auth=(ADMIN_USER, ADMIN_PASS),
        data=rpc_request_data,
        verify=False,
    )
    res.raise_for_status()
    return res.json()


# MARK: Fixtures
@pytest.fixture(autouse=True)
def disable_request_warning():
    urllib3.disable_warnings()
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


@pytest.fixture
def clean_redis():
    """No-op fixture - Redis cleanup not needed for HTTP-based integration tests."""
    yield


@pytest.fixture
def config():
    """opsiconfd connection settings for the integration tests.

    Resolved from the environment instead of importing ``opsiconfd.config`` so the
    tests stay decoupled from opsiconfd internals. These are HTTP + DB integration
    tests, so they only need the server URL, not the opsiconfd
    source.
    """
    port = int(os.getenv("OPSICONFD_PORT", "4447"))
    url = os.getenv("OPSICONFD_URL", f"https://localhost:{port}")

    class _OpsiconfdConfig:
        internal_url = url
        external_url = url
        server_id = url.replace("https://", "").replace("http://", "").split(":")[0]

    _OpsiconfdConfig.port = port
    return _OpsiconfdConfig()


@pytest.fixture
def database_connection():
    mysql = MySQLdb.connect(
        host=os.getenv("MYSQL_HOST", "opsi"),
        port=int(os.getenv("MYSQL_PORT", 3306)),
        user=os.getenv("MYSQL_USER", "opsi"),
        passwd=os.getenv("MYSQL_PASSWORD", "opsi"),
        db=os.getenv("MYSQL_DATABASE", "opsi"),
        charset="utf8mb4",
    )
    yield mysql
    mysql.close()


# MARK: check data
@pytest.fixture(autouse=True)
def create_check_data(config, database_connection):  # pylint: disable=redefined-outer-name
    mysql = database_connection
    mysql.autocommit(True)

    now = datetime.now()

    cursor = mysql.cursor()
    try:
        cursor.execute(
            (
                "DELETE FROM PRODUCT_ON_DEPOT;"
                "DELETE FROM PRODUCT_ON_CLIENT;"
                "DELETE FROM PRODUCT_PROPERTY_VALUE;"
                "DELETE FROM PRODUCT_PROPERTY_STATE;"
                "DELETE FROM PRODUCT_PROPERTY;"
                "DELETE FROM PRODUCT_DEPENDENCY;"
                "DELETE FROM OBJECT_TO_GROUP;"
                "DELETE FROM PRODUCT;"
                'DELETE FROM HOST WHERE type != "OpsiConfigserver";'
                "DELETE FROM `GROUP`;"
                'DELETE FROM CONFIG_STATE WHERE objectId like "pytest%";'
            )
        )
    except MySQLdb.Error as e:
        logger.warning("Error cleaning database before tests: %s", e)
        pass

    configserver = socket.getfqdn()
    # MARK: ---- loop
    for i in range(TEST_NUM_ITEMS * 2):
        cursor.execute(  # old clientnames
            f"INSERT INTO HOST (hostId, `type`, created, lastSeen, hardwareAddress, `description`, notes, inventoryNumber) "
            f'VALUES ("pytest-host-{i}.domain.local", "OpsiClient", "{now}", "{now}", "af:fe:af:fe:af:fe", "", "notes host{i}", "{i}");'
        )
    for i in range(TEST_NUM_ITEMS):
        create_depot_rpc(config.internal_url, f"pytest-test-depot-{i}.domain.local")

        description = ""
        if i % 2 == 0:
            description = f"Pytest dummy client {i}"

        cursor.execute(  # new clientnames
            f"INSERT INTO HOST (hostId, `type`, created, lastSeen, hardwareAddress, `description`, notes, inventoryNumber) "
            f'VALUES ("pytest-client-{i}.domain.local", "OpsiClient", "{now}", "{now}", "af:fe:af:fe:af:f{i}", "{description}", "notes client{i}", "{i}");'
        )
        if i > 5:
            cursor.execute(
                "INSERT INTO CONFIG_STATE (configId, objectId, CONFIG_STATE.values) VALUES "
                f'("clientconfig.depot.id", "pytest-client-{i}.domain.local", \'["{configserver}"]\');'
            )

        cursor.execute(
            "INSERT INTO PRODUCT (productId, productVersion, packageVersion, type,  name, priority, setupScript, uninstallScript) VALUES "
            f'("pytest-prod-{i}", "1.0", "1", "LocalbootProduct", "Pytest dummy PRODUCT {i}", 60+{i}, "setup.opsiscript", "uninstall.opsiscript");'
        )
        cursor.execute(
            f"INSERT INTO PRODUCT_ON_DEPOT (productId, productVersion, packageVersion, depotId, productType) VALUES "
            f'("pytest-prod-{i}", "1.0", "1", "{configserver}", "LocalbootProduct");'
        )

    # MARK: ---- host
    cursor.execute(
        "INSERT INTO HOST (hostId, type, created, lastSeen) VALUES "
        f'("pytest-lost-client-01.domain.local", "OpsiClient", "{now}", "{now - timedelta(days=MONITORING_CHECK_DAYS)}"),'
        f'("pytest-lost-client-02.domain.local", "OpsiClient", "{now}", "{now - timedelta(days=MONITORING_CHECK_DAYS)}"),'
        f'("pytest-lost-client-03.domain.local", "OpsiClient", "{now}", "{now - timedelta(days=MONITORING_CHECK_DAYS)}");'
    )

    # MARK: ---- pod
    ####pytest-test-depot-2.domain.local and product pytest-product-3

    cursor.execute(
        "INSERT INTO PRODUCT_ON_DEPOT (productId, productVersion, packageVersion, depotId, productType) VALUES "
        '("pytest-prod-1", "1.0", "1", "pytest-test-depot-1.domain.local", "LocalbootProduct"),'
        '("pytest-prod-1", "1.0", "1", "pytest-test-depot-2.domain.local", "LocalbootProduct"),'
        '("pytest-prod-2", "1.0", "1", "pytest-test-depot-1.domain.local", "LocalbootProduct"),'
        '("pytest-prod-2", "1.0", "1", "pytest-test-depot-2.domain.local", "LocalbootProduct"),'
        '("pytest-prod-3", "1.0", "1", "pytest-test-depot-1.domain.local", "LocalbootProduct"),'
        '("pytest-prod-3", "1.0", "1", "pytest-test-depot-2.domain.local", "LocalbootProduct"),'
        '("pytest-prod-4", "1.0", "1", "pytest-test-depot-1.domain.local", "LocalbootProduct"),'
        '("pytest-prod-4", "1.0", "1", "pytest-test-depot-2.domain.local", "LocalbootProduct");'
    )

    # MARK: ---- poc
    cursor.execute(
        "INSERT INTO PRODUCT_ON_CLIENT "
        "(productId, clientId, productType, installationStatus, actionRequest, actionResult, "
        " productVersion, packageVersion, modificationTime) VALUES "
        f'("pytest-prod-1", "pytest-client-1.domain.local", "LocalbootProduct", "not_installed", "setup", "none", "1.0", 1, "{now}"),'
        f'("pytest-prod-1", "pytest-lost-client-03.domain.local", "LocalbootProduct", "not_installed", "setup", "none", "1.0", 1, "{now}"),'
        f'("pytest-prod-2", "pytest-client-2.domain.local", "LocalbootProduct", "unknown", "none", "failed", "1.0", 1, "{now}"),'
        f'("pytest-prod-2", "pytest-lost-client-01.domain.local", "LocalbootProduct", "unknown", "none", "failed", "1.0", 1, "{now}"),'
        f'("pytest-prod-2", "pytest-lost-client-02.domain.local", "LocalbootProduct", "unknown", "none", "failed", "1.0", 1, "{now}"),'
        f'("pytest-prod-3", "pytest-client-3.domain.local", "LocalbootProduct", "installed", "setup", "none", "1.0", 1, "{now}"),'
        f'("pytest-prod-3", "pytest-client-2.domain.local", "LocalbootProduct", "installed", "setup", "none", "1.0", 1, "{now}"),'
        f'("pytest-prod-4", "pytest-client-0.domain.local", "LocalbootProduct", "not_installed", "none", "none", "1.0", 1, "{now}"),'
        f'("pytest-prod-4", "pytest-client-1.domain.local", "LocalbootProduct", "not_installed", "none", "none", "1.0", 1, "{now}"),'
        f'("pytest-prod-4", "pytest-client-4.domain.local", "LocalbootProduct", "not_installed", "setup", "none", "1.0", 1, "{now}");'
    )

    # MARK: ---- prodProp
    cursor.execute(
        "INSERT INTO PRODUCT_PROPERTY (productId, productVersion, packageVersion, propertyId,    type, description, multiValue, editable) VALUES "
        '("pytest-prod-1", "1.0", "1", "param1u",     "UnicodeProductProperty", "", "1", "1"),'
        '("pytest-prod-1", "1.0", "1", "param1b",     "BooleanProductProperty", "", "0", "0"),'
        '("pytest-prod-2", "1.0", "1", "param2u",     "UnicodeProductProperty", "", "1", "1"),'
        '("pytest-prod-2", "1.0", "1", "param2b",     "BooleanProductProperty", "", "0", "0"),'
        '("pytest-prod-3", "1.0", "1", "param3u",     "UnicodeProductProperty", "", "0", "1"),'
        '("pytest-prod-3", "1.0", "1", "param3b",     "BooleanProductProperty", "", "0", "0"),'
        '("pytest-prod-4", "1.0", "1", "param4u",     "UnicodeProductProperty", "", "0", "0"),'
        '("pytest-prod-4", "1.0", "1", "param4b",     "BooleanProductProperty", "", "0", "0")'
        ";",
    )
    # Property general VALUES
    cursor.execute(
        "INSERT INTO PRODUCT_PROPERTY_VALUE (productId, propertyId, value, isDefault, productVersion, packageVersion) VALUES "
        # bool values
        '("pytest-prod-1", "param1b",  "true", "1", "1.0", "1"),'  # default: true
        '("pytest-prod-1", "param1b",  "false", "0", "1.0", "1"),'
        '("pytest-prod-2", "param2b",  "false", "1", "1.0", "1"),'  # default: false
        '("pytest-prod-2", "param2b",  "true", "0", "1.0", "1"),'
        '("pytest-prod-3", "param3b",  "true", "1", "1.0", "1"),'  # default: true
        '("pytest-prod-3", "param3b",  "false", "0", "1.0", "1"),'
        '("pytest-prod-4", "param4b",  "true", "1", "1.0", "1"),'  # default: true
        '("pytest-prod-4", "param4b",  "false", "0", "1.0", "1"),'
        # unicode values
        '("pytest-prod-1", "param1u",  "A", "0", "1.0", "1"),'  # default: B, C
        '("pytest-prod-1", "param1u",  "B", "1", "1.0", "1"),'
        '("pytest-prod-1", "param1u",  "C", "1"  , "1.0", "1"),'
        '("pytest-prod-2", "param2u",  "Y", "0", "1.0", "1"),'  # default: Z
        '("pytest-prod-2", "param2u",  "Z", "1", "1.0", "1"),'
        '("pytest-prod-3", "param3u",  "III", "1", "1.0", "1"),'  # default: III
        '("pytest-prod-3", "param3u",  "IV", "0", "1.0", "1"),'
        '("pytest-prod-4", "param4u",  "yes", "1", "1.0", "1"),'  # default: yes
        '("pytest-prod-4", "param4u",  "no", "0", "1.0", "1")'
        ";"
    )

    # Property VALUES # Depots and Clients
    cursor.execute(
        "INSERT INTO PRODUCT_PROPERTY_STATE (productId, propertyId, objectId, `values`) VALUES "
        # depot defaults
        f'("pytest-prod-1", "param1u", "{configserver}", \'["B"]\'),'
        f'("pytest-prod-1", "param1b", "{configserver}", \'["true"]\'),'
        f'("pytest-prod-2", "param2u", "{configserver}", \'["Z"]\'),'
        f'("pytest-prod-2", "param2b", "{configserver}", \'["false"]\'),'
        f'("pytest-prod-3", "param3u", "{configserver}", \'["III"]\'),'
        f'("pytest-prod-3", "param3b", "{configserver}", \'["true"]\'),'
        # depot1
        f'("pytest-prod-1", "param1u", "pytest-test-depot-1.domain.local", \'["A"]\'),'  # no diff
        f'("pytest-prod-1", "param1b", "pytest-test-depot-1.domain.local", \'["false"]\'),'
        f'("pytest-prod-2", "param2u", "pytest-test-depot-1.domain.local", \'["Y"]\'),'  # one dif <-
        f'("pytest-prod-2", "param2b", "pytest-test-depot-1.domain.local", \'["false"]\'),'
        f'("pytest-prod-3", "param3u", "pytest-test-depot-1.domain.local", \'["III"]\'),'  # same <-
        f'("pytest-prod-3", "param3b", "pytest-test-depot-1.domain.local", \'["true"]\'),'  # <-
        # clients
        f'("pytest-prod-1", "param1u", "pytest-host-1.domain.local", \'["C"]\'),'  # differ from new depot
        f'("pytest-prod-1", "param1b", "pytest-host-1.domain.local", \'["true"]\'),'
        f'("pytest-prod-2", "param2u", "pytest-host-2.domain.local", \'["Y"]\'),'
        f'("pytest-prod-2", "param2b", "pytest-host-2.domain.local", \'["true"]\'),'
        f'("pytest-prod-3", "param3u", "pytest-host-3.domain.local", \'["IV"]\'),'
        f'("pytest-prod-3", "param3b", "pytest-host-3.domain.local", \'["true"]\')'
        ";"
    )

    # MARK: ---- ProdGroup
    cursor.execute(
        'INSERT INTO `GROUP` (type, groupId) VALUES ("ProductGroup", "pytest-group-1"),("ProductGroup", "pytest-group-2");'
    )
    cursor.execute(
        "INSERT INTO OBJECT_TO_GROUP (groupType, groupId, objectId) VALUES "
        '("ProductGroup", "pytest-group-1", "pytest-prod-0"),'
        '("ProductGroup", "pytest-group-1", "pytest-prod-1"),'
        '("ProductGroup", "pytest-group-1", "pytest-prod-2"),'
        '("ProductGroup", "pytest-group-2", "pytest-prod-3"),'
        '("ProductGroup", "pytest-group-2", "pytest-prod-4");'
    )

    # MARK: ---- Client2Depots
    cursor.execute(
        "INSERT INTO CONFIG_STATE (configId, objectId, CONFIG_STATE.values) VALUES "
        '("clientconfig.depot.id", "pytest-client-1.domain.local", \'["pytest-test-depot-1.domain.local"]\'),'
        '("clientconfig.depot.id", "pytest-client-3.domain.local", \'["pytest-test-depot-1.domain.local"]\'),'
        '("clientconfig.depot.id", "pytest-client-2.domain.local",	\'["pytest-test-depot-2.domain.local"]\'),'
        '("clientconfig.depot.id", "pytest-client-4.domain.local",	\'["pytest-test-depot-2.domain.local"]\'),'
        '("clientconfig.depot.id", "pytest-client-5.domain.local",	\'["pytest-test-depot-3.domain.local"]\'),'
        '("clientconfig.depot.id", "pytest-host-0.domain.local",	\'["pytest-test-depot-9.domain.local"]\'),'
        '("clientconfig.depot.id", "pytest-client-0.domain.local", \'[""]\');'
    )

    cursor.execute(
        "INSERT INTO CONFIG_STATE (configId, objectId, CONFIG_STATE.values) VALUES "
        '("clientconfig.dhcpd.filename", "pytest-client-1.domain.local", NULL),'
        '("clientconfig.dhcpd.filename", "pytest-client-2.domain.local", NULL),'
        '("clientconfig.dhcpd.filename", "pytest-client-3.domain.local",	NULL),'
        '("clientconfig.dhcpd.filename", "pytest-client-4.domain.local", NULL);'
    )

    cursor.close()

    yield

    return
    cursor = mysql.cursor()
    cursor.execute(
        "DELETE FROM PRODUCT_ON_DEPOT;"
        "DELETE FROM PRODUCT_ON_CLIENT;"
        "DELETE FROM PRODUCT_PROPERTY_VALUE;"
        "DELETE FROM PRODUCT_PROPERTY;"
        "DELETE FROM PRODUCT_DEPENDENCY;"
        "DELETE FROM OBJECT_TO_GROUP;"
        "DELETE FROM PRODUCT;"
        'DELETE FROM HOST WHERE type!="OpsiConfigserver";'
        "DELETE FROM `GROUP`;"
        "DELETE FROM CONFIG_STATE;"
    )
