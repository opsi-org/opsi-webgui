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
FILE_DIR = os.path.abspath(os.path.dirname(__file__))

test_data = [
	({}, f"{FILE_DIR}/data/webgui/clients/clients-get1.json"),
	(
		{"perPage": 2, "pageNumber": 2},
		f"{FILE_DIR}/data/webgui/clients/clients-get2.json",
	),
	(
		{
			"filterQuery": "lost-client",
			"perPage": 2,
			"pageNumber": 2,
			"sortDesc": False,
			"sortBy": "clientId",
		},
		f"{FILE_DIR}/data/webgui/clients/clients-get3.json",
	),
	({"sortBy": "clientId"}, f"{FILE_DIR}/data/webgui/clients/clients-get4.json"),
	(
		{"sortBy": "[installationStatus_installed,actionResult_failed]"},
		f"{FILE_DIR}/data/webgui/clients/clients-get5.json",
	),
]


@pytest.mark.parametrize("query_params, expected_result", test_data)
@pytest.mark.asyncio
async def test_clients_get(config, query_params, expected_result):  # pylint: disable=too-many-arguments,redefined-outer-name
	res = requests.get(
		f"{config.external_url}{API_ROOT}/clients",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		params=query_params,
	)

	assert res.status_code == 200
	assert_or_update_fixture(res.json(), expected_result)


test_data = [
	(
		{},
		status.HTTP_422_UNPROCESSABLE_ENTITY,
	),
	(
		{
			"hostId": "myclient.test.local",
			"inventoryNumber": "120",
			"description": "test client",
		},
		status.HTTP_201_CREATED,
	),
]


@pytest.mark.parametrize("data, http_status", test_data)
@pytest.mark.asyncio
async def test_clients_create(config, data, http_status):  # pylint: disable=too-many-arguments,redefined-outer-name
	# Clean up from previous test runs
	if data.get("hostId"):
		requests.delete(
			f"{config.external_url}{API_ROOT}/clients/{data['hostId']}",
			auth=(ADMIN_USER, ADMIN_PASS),
			verify=False,
		)

	res = requests.post(
		f"{config.external_url}{API_ROOT}/clients",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"client": data} if data else {},
	)

	assert res.status_code == http_status

	if http_status == 201:
		res_body = res.json()
		assert res_body["hostId"] == data["hostId"]
		assert res_body["description"] == data["description"]

		# Verify the client exists
		res = requests.get(
			f"{config.external_url}{API_ROOT}/clients/{data['hostId']}",
			auth=(ADMIN_USER, ADMIN_PASS),
			verify=False,
		)
		assert res.status_code == status.HTTP_200_OK


@pytest.mark.asyncio
async def test_clients_create_integrity_error(config):  # pylint: disable=too-many-arguments,redefined-outer-name

	data = {
		"hostId": "integrity-test-client.test.local",
		"inventoryNumber": "120",
		"description": "test client",
	}
	# Clean up from previous test runs
	requests.delete(
		f"{config.external_url}{API_ROOT}/clients/{data['hostId']}",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
	)

	# First create
	res = requests.post(
		f"{config.external_url}{API_ROOT}/clients",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"client": data},
	)
	assert res.status_code == status.HTTP_201_CREATED

	# Second create should give IntegrityError
	res = requests.post(
		f"{config.external_url}{API_ROOT}/clients",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"client": data},
	)
	res_body = res.json()
	assert res.status_code in (status.HTTP_409_CONFLICT, 500)
	assert "already exists" in res_body.get("details", "") or "already exists" in res_body.get("message", "")


test_data = [
	(
		"pytest-client-1.domain.local",
		f"{FILE_DIR}/data/webgui/clients/clients-get6.json",
		status.HTTP_200_OK,
	),
	(
		"no-client.domain.local",
		f"{FILE_DIR}/data/webgui/clients/clients-get7.json",
		status.HTTP_404_NOT_FOUND,
	),
]


@pytest.mark.parametrize("client_id, expected_result, http_status", test_data)
@pytest.mark.asyncio
async def test_client_get(config, client_id, expected_result, http_status):  # pylint: disable=too-many-arguments,redefined-outer-name
	res = requests.get(
		f"{config.external_url}{API_ROOT}/clients/{client_id}",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
	)
	assert res.status_code == http_status
	if UPDATE_FIXTURES:
		assert_or_update_fixture(res.json(), expected_result)
	else:
		with open(expected_result, "r", encoding="utf-8") as f:
			json_data = json.loads(f.read())

		res_data = remove_volatile(res.json())
		json_data = remove_volatile(json_data)
		assert res_data == json_data


test_data = [
	("pytest-client-1.domain.local", None, status.HTTP_200_OK),
	("no-client.domain.local", None, status.HTTP_200_OK),
]


@pytest.mark.parametrize("client_id, expected_result, http_status", test_data)
@pytest.mark.asyncio
async def test_clients_delete(config, client_id, expected_result, http_status):  # pylint: disable=too-many-arguments,redefined-outer-name
	res = requests.delete(
		f"{config.external_url}{API_ROOT}/clients/{client_id}",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
	)
	assert res.status_code == http_status
	assert res.json() == expected_result
