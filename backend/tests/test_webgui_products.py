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
import uuid
from string import Template

import pytest
import requests

from .utils import (  # pylint: disable=unused-import
	ADMIN_PASS,
	ADMIN_USER,
	assert_or_update_fixture,
	remove_volatile,
)

API_ROOT = "/addons/webgui/api/opsidata"
FQDN = socket.getfqdn()
FILE_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), "data", "webgui", "products")

depots = sorted([FQDN, "pytest-test-depot.uib.gmbh", "pytest-test-depot2.uib.gmbh"])
depot_versions = {
	FQDN: "1.0-1",
	"pytest-test-depot.uib.gmbh": "1.0-1",
	"pytest-test-depot2.uib.gmbh": "2.0-1",
}

test_data = [
	(
		{
			"selectedClients": [
				"pytest-client-1.domain.local",
				"pytest-client-4.domain.local",
			],
			"selectedDepots": [FQDN],
			"type": "LocalbootProduct",
			"pageNumber": 1,
			"perPage": 90,
			"sortBy": "productId",
			"sortDesc": False,
			"filterQuery": "",
		},
		f"{FILE_DIR}/products-get1.json",
	),
	(
		{
			"type": "LocalbootProduct",
			"selectedDepots": [FQDN],
			"pageNumber": 1,
			"perPage": 90,
			"sortBy": "productId",
			"sortDesc": False,
			"filterQuery": "",
		},
		f"{FILE_DIR}/products-get2.json",
	),
	(
		{
			"selectedClients": [
				"pytest-client-1.domain.local",
				"pytest-client-4.domain.local",
			],
			"selectedDepots": sorted([FQDN, "test-depot.uib.gmbh"]),
			"type": "LocalbootProduct",
			"pageNumber": 1,
			"perPage": 2,
			"sortBy": "productId",
			"sortDesc": False,
			"filterQuery": "",
		},
		f"{FILE_DIR}/products-get3.json",
	),
	(
		{
			"selectedClients": [
				"pytest-client-1.domain.local",
				"pytest-client-4.domain.local",
			],
			"selectedDepots": sorted([FQDN, "test-depot.uib.gmbh"]),
			"type": "LocalbootProduct",
			"pageNumber": 2,
			"perPage": 2,
			"sortBy": "productId",
			"sortDesc": False,
			"filterQuery": "",
		},
		f"{FILE_DIR}/products-get4.json",
	),
	(
		{
			"selectedClients": [
				"pytest-client-1.domain.local",
				"pytest-client-4.domain.local",
			],
			"selectedDepots": [
				"pytest-test-depot.uib.gmbh",
				"pytest-test-depot2.uib.gmbh",
			],
			"type": "LocalbootProduct",
			"pageNumber": 1,
			"perPage": 3,
			"sortBy": "productId",
			"sortDesc": False,
			"filterQuery": "",
		},
		f"{FILE_DIR}/products-get5.json",
	),
	(
		{
			"selectedClients": [
				"pytest-client-1.domain.local",
				"pytest-client-4.domain.local",
			],
			"selectedDepots": [
				FQDN,
				"pytest-test-depot.uib.gmbh",
				"pytest-test-depot2.uib.gmbh",
			],
			"type": "LocalbootProduct",
			"pageNumber": 1,
			"perPage": 3,
			"sortBy": "productId",
			"sortDesc": False,
			"filterQuery": "prod-1",
		},
		f"{FILE_DIR}/products-get6.json",
	),
	(
		{
			"selectedClients": [
				"pytest-client-1.domain.local",
				"pytest-client-4.domain.local",
			],
			"selectedDepots": [
				FQDN,
				"pytest-test-depot.uib.gmbh",
				"pytest-test-depot2.uib.gmbh",
			],
			"type": "LocalbootProduct",
			"pageNumber": 1,
			"perPage": 3,
			"sortBy": "productId",
			"sortDesc": False,
			"filterQuery": "ffff",
		},
		f"{FILE_DIR}/products-get7.json",
	),
]


@pytest.mark.parametrize("input_data, expected_result", test_data)
@pytest.mark.asyncio
async def test_products(config, input_data, expected_result):  # pylint: disable=too-many-arguments,redefined-outer-name
	res = requests.get(
		f"{config.external_url}{API_ROOT}/products",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		params=input_data,
	)

	from .utils import UPDATE_FIXTURES

	if UPDATE_FIXTURES:
		assert_or_update_fixture(res.json(), expected_result)
	else:
		with open(expected_result, "r", encoding="utf-8") as f:
			json_string = (
				Template(f.read())
				.substitute(
					FQDN=FQDN,
					depots=depots,
					depot_versions=[x[1] for x in sorted(depot_versions.items())],
				)
				.replace("'", '"')
			)
			json_data = json.loads(json_string)

		assert res.status_code == 200
		assert remove_volatile(res.json()) == remove_volatile(json_data)


@pytest.mark.asyncio
async def test_product_groups_dynamic_returns_children_and_products(config):
	parent_group = "pytest-prod-lazy-parent"
	child_group = "pytest-prod-lazy-child"
	product_id = "pytest-prod-1"

	create_parent = requests.post(
		f"{config.external_url}{API_ROOT}/products/groups",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"groupId": parent_group},
	)
	assert create_parent.status_code == 201

	create_child = requests.post(
		f"{config.external_url}{API_ROOT}/products/groups",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"groupId": child_group, "parentGroupId": parent_group},
	)
	assert create_child.status_code == 201

	add_product = requests.post(
		f"{config.external_url}{API_ROOT}/products/groups/{parent_group}/products",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json=[product_id],
	)
	assert add_product.status_code == 201

	res = requests.get(
		f"{config.external_url}{API_ROOT}/products/groups-dynamic",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		params={"parentGroup": parent_group, "withProducts": True},
	)

	assert res.status_code == 200
	groups = res.json()["groups"]
	children = groups["children"]
	assert parent_group not in children
	assert child_group in children
	assert product_id in children


def _find_group_node(tree: dict, group_id: str) -> dict | None:
	if tree.get("text") == group_id:
		return tree
	for child in (tree.get("children") or {}).values():
		found = _find_group_node(child, group_id)
		if found:
			return found
	return None


@pytest.mark.asyncio
async def test_product_group_move_to_other_group_and_top_level(config):
	suffix = uuid.uuid4().hex[:8]
	group_a = f"pytest-prod-move-a-{suffix}"
	group_b = f"pytest-prod-move-b-{suffix}"
	child_group = f"pytest-prod-move-child-{suffix}"

	for group_id in (group_a, group_b):
		res = requests.post(
			f"{config.external_url}{API_ROOT}/products/groups",
			auth=(ADMIN_USER, ADMIN_PASS),
			verify=False,
			json={"groupId": group_id},
		)
		assert res.status_code == 201

	create_child = requests.post(
		f"{config.external_url}{API_ROOT}/products/groups",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"groupId": child_group, "parentGroupId": group_a},
	)
	assert create_child.status_code == 201

	move_to_b = requests.put(
		f"{config.external_url}{API_ROOT}/products/groups/{child_group}",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"parent": group_b, "note": "moved to b"},
	)
	assert move_to_b.status_code == 200

	tree = requests.get(
		f"{config.external_url}{API_ROOT}/products/groups",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		params={"withProducts": False},
	).json()["groups"]
	child_node = _find_group_node(tree, child_group)
	assert child_node is not None
	assert child_node["parent"] == group_b

	move_to_top = requests.put(
		f"{config.external_url}{API_ROOT}/products/groups/{child_group}",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"parent": "groups"},
	)
	assert move_to_top.status_code == 200

	tree = requests.get(
		f"{config.external_url}{API_ROOT}/products/groups",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		params={"withProducts": False},
	).json()["groups"]
	child_node = _find_group_node(tree, child_group)
	assert child_node is not None
	assert child_node["parent"] == "groups"

	move_to_self = requests.put(
		f"{config.external_url}{API_ROOT}/products/groups/{group_a}",
		auth=(ADMIN_USER, ADMIN_PASS),
		verify=False,
		json={"parent": group_a},
	)
	assert move_to_self.status_code == 400
