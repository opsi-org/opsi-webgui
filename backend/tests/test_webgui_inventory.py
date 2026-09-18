# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

"""
Unit tests for webgui single-client hardware/software inventory (backend/webgui/python/api/inventory.py).
"""

import json
from datetime import datetime, timedelta
from types import SimpleNamespace

import pytest
from webgui.python.api import inventory


def hw_row(hardware_class, state=1, lastseen="2026-09-01 10:00:00", firstseen="2026-01-01 10:00:00", **attrs):
	data = {"hardwareClass": hardware_class, "hostId": "client1.test.local", "firstseen": firstseen, "lastseen": lastseen, "state": state}
	data.update(attrs)
	return SimpleNamespace(to_hash=lambda d=data: dict(d), **data)


def sw_client_row(name, version="1.0", sub_version="", language="", architecture="x64", state=1, lastseen="2026-09-01 10:00:00", **kw):
	defaults = {
		"name": name,
		"version": version,
		"subVersion": sub_version,
		"language": language,
		"architecture": architecture,
		"clientId": "client1.test.local",
		"firstseen": "2026-01-01 10:00:00",
		"lastseen": lastseen,
		"state": state,
		"usageFrequency": -1,
		"lastUsed": "0000-00-00 00:00:00",
		"licenseKey": None,
		"binaryName": None,
		"uninstallString": None,
	}
	defaults.update(kw)
	return SimpleNamespace(**defaults)


def sw_meta_row(name, version="1.0", sub_version="", language="", architecture="x64", **kw):
	defaults = {
		"name": name,
		"version": version,
		"subVersion": sub_version,
		"language": language,
		"architecture": architecture,
		"windowsSoftwareId": None,
		"windowsDisplayName": None,
		"windowsDisplayVersion": None,
		"isOperatingSystem": False,
		"installSize": None,
	}
	defaults.update(kw)
	return SimpleNamespace(**defaults)


HW_CONFIG = [
	{
		"Class": {"Opsi": "COMPUTER_SYSTEM", "UI": "Computer"},
		"Values": [
			{"Opsi": "name", "Type": "varchar(100)", "Scope": "g", "UI": "Name"},
			{"Opsi": "vendor", "Type": "varchar(100)", "Scope": "g", "UI": "Vendor"},
			{"Opsi": "totalRam", "Type": "int", "Scope": "i", "UI": "Total RAM"},
		],
	}
]


# ---------------------------------------------------------------------------
# Hardware normalization
# ---------------------------------------------------------------------------


def test_hardware_normalization_uses_class_config(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", lambda: HW_CONFIG)
	rows = [hw_row("COMPUTER_SYSTEM", name="PC1", vendor="Acme", totalRam=8192)]

	items = inventory._normalize_hardware_rows(rows)

	assert len(items) == 1
	item = items[0]
	assert item.className == "Computer"
	assert item.displayName == "PC1"
	labels = {a.key: a.label for a in item.attributes}
	assert labels["vendor"] == "Vendor"
	assert labels["totalRam"] == "Total RAM"


def test_hardware_normalization_missing_class_definition(monkeypatch):
	# Backend raises -> fall back gracefully instead of hard-coding the schema.
	def raise_error():
		raise RuntimeError("no config")

	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", raise_error)
	rows = [hw_row("SOME_UNKNOWN_CLASS", model="X1")]

	items = inventory._normalize_hardware_rows(rows)

	assert items[0].className == "SOME_UNKNOWN_CLASS"
	assert items[0].attributes[0].key == "model"


def test_hardware_duplicate_identities_get_distinct_identifiers(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", lambda: [])
	rows = [hw_row("MEMORY_MODULE", capacity=4096), hw_row("MEMORY_MODULE", capacity=4096)]

	items = inventory._normalize_hardware_rows(rows)

	identifiers = {item.identifier for item in items}
	assert len(identifiers) == 2


# ---------------------------------------------------------------------------
# Inventory state (ok / stale / not_scanned / empty) + malformed timestamps
# ---------------------------------------------------------------------------


def test_inventory_state_not_scanned_when_no_rows():
	meta = inventory._build_meta("client1.test.local", "src", [], [])
	assert meta.state == "not_scanned"
	assert meta.count == 0


def test_inventory_state_empty_when_all_rows_absent():
	rows = [hw_row("DISK", state=0)]
	meta = inventory._build_meta("client1.test.local", "src", rows, [])
	assert meta.state == "empty"


def test_inventory_state_stale_when_last_scan_old():
	old_ts = (datetime.now() - timedelta(days=inventory.STALE_AFTER_DAYS + 1)).strftime(inventory.OPSI_TIMESTAMP_FORMAT)
	rows = [hw_row("DISK", lastseen=old_ts)]
	meta = inventory._build_meta("client1.test.local", "src", rows, rows)
	assert meta.state == "stale"


def test_inventory_state_ok_for_recent_scan():
	recent_ts = datetime.now().strftime(inventory.OPSI_TIMESTAMP_FORMAT)
	rows = [hw_row("DISK", lastseen=recent_ts)]
	meta = inventory._build_meta("client1.test.local", "src", rows, rows)
	assert meta.state == "ok"


def test_inventory_state_ignores_malformed_timestamps():
	rows = [hw_row("DISK", lastseen="not-a-timestamp"), hw_row("DISK", lastseen=None)]
	meta = inventory._build_meta("client1.test.local", "src", rows, rows)
	# Neither row parses -> no crash, no known last scan, still reports "ok" (data present).
	assert meta.lastScan is None
	assert meta.state == "ok"


# ---------------------------------------------------------------------------
# Software: identity, KB filtering, joining audit master data, duplicates
# ---------------------------------------------------------------------------


def test_software_join_with_master_data():
	client_rows = [sw_client_row("Firefox", version="128.0")]
	meta_rows = [sw_meta_row("Firefox", version="128.0", windowsDisplayName="Mozilla Firefox", isOperatingSystem=False)]

	items = inventory._normalize_software_rows(client_rows, meta_rows)

	assert items[0].displayName == "Mozilla Firefox"
	assert items[0].isOperatingSystem is False


def test_software_kb_update_detection_simple_prefix():
	assert inventory._is_kb_update("kb5001234") is True
	assert inventory._is_kb_update("KB5001234") is True
	assert inventory._is_kb_update("Firefox") is False
	assert inventory._is_kb_update(None) is False


def test_software_kb_update_detection_guid_prefixed():
	assert inventory._is_kb_update("{90140000-1234-0000-0000-0000000FF1CE};kb5001234") is True


def test_software_kb_filtering_excludes_updates_when_disabled():
	client_rows = [sw_client_row("Update for App", windows_software_id_placeholder=None)]
	# attach windowsSoftwareId via meta join
	meta_rows = [sw_meta_row("Update for App", windowsSoftwareId="kb123456")]
	items = inventory._normalize_software_rows(client_rows, meta_rows)
	assert items[0].isKbUpdate is True

	filtered = inventory._filter_software_items(items, filter_query=None, include_kb_updates=False, include_absent=False)
	assert filtered == []

	kept = inventory._filter_software_items(items, filter_query=None, include_kb_updates=True, include_absent=False)
	assert len(kept) == 1


def test_software_duplicate_identities_get_distinct_identifiers():
	client_rows = [sw_client_row("Firefox", version="128.0"), sw_client_row("Firefox", version="128.0")]
	items = inventory._normalize_software_rows(client_rows, [])
	identifiers = {item.identifier for item in items}
	assert len(identifiers) == 2


def test_software_empty_and_null_data_does_not_crash():
	items = inventory._normalize_software_rows([], [])
	assert items == []
	meta = inventory._build_meta("client1.test.local", inventory.SOFTWARE_SOURCE, [], [])
	assert meta.state == "not_scanned"


# ---------------------------------------------------------------------------
# Large inventories / bounded responses
# ---------------------------------------------------------------------------


def test_large_hardware_inventory_is_truncated(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", lambda: [])
	rows = [hw_row("DISK", diskId=str(i)) for i in range(inventory.MAX_INVENTORY_ITEMS + 50)]
	monkeypatch.setattr(inventory.backend, "auditHardwareOnHost_getObjects", lambda **_kw: rows)

	response = inventory.get_hardware_inventory.__wrapped__("client1.test.local")
	payload = response.content

	assert payload["meta"]["truncated"] is True
	assert len(payload["items"]) == inventory.MAX_INVENTORY_ITEMS
	assert int(response.headers["x-total-count"]) == inventory.MAX_INVENTORY_ITEMS


def test_hardware_inventory_pagination(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", lambda: [])
	rows = [hw_row("DISK", diskId=str(i)) for i in range(12)]
	monkeypatch.setattr(inventory.backend, "auditHardwareOnHost_getObjects", lambda **_kw: rows)

	response = inventory.get_hardware_inventory.__wrapped__("client1.test.local", page=2, perPage=5)
	payload = response.content

	assert int(response.headers["x-total-count"]) == 12
	assert len(payload["items"]) == 5
	assert payload["items"][0]["displayName"] != payload["items"][4]["displayName"]


def test_hardware_inventory_sorting(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", lambda: [])
	rows = [hw_row("DISK", name="Alpha"), hw_row("DISK", name="Zulu")]
	monkeypatch.setattr(inventory.backend, "auditHardwareOnHost_getObjects", lambda **_kw: rows)

	response = inventory.get_hardware_inventory.__wrapped__("client1.test.local", sortBy="displayName", sortDesc=True)

	assert [item["displayName"] for item in response.content["items"]] == ["Zulu", "Alpha"]


# ---------------------------------------------------------------------------
# Endpoint wiring / error wrapping (kept separate from normalization errors)
# ---------------------------------------------------------------------------


def test_get_hardware_inventory_wraps_backend_errors(monkeypatch):
	def raise_error(**_kw):
		raise RuntimeError("mysql down")

	monkeypatch.setattr(inventory.backend, "auditHardwareOnHost_getObjects", raise_error)

	with pytest.raises(inventory.OpsiApiException):
		inventory.get_hardware_inventory.__wrapped__("client1.test.local")


@pytest.mark.asyncio
async def test_get_software_inventory_endpoint_returns_json(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditSoftwareOnClient_getObjects", lambda **_kw: [sw_client_row("Firefox")])
	monkeypatch.setattr(inventory.backend, "auditSoftware_getObjects", lambda **_kw: [sw_meta_row("Firefox")])

	response = await inventory.get_software_inventory(clientid="client1.test.local")
	data = json.loads(response.body)

	assert data["meta"]["clientId"] == "client1.test.local"
	assert data["meta"]["state"] == "ok"
	assert data["items"][0]["name"] == "Firefox"


@pytest.mark.asyncio
async def test_get_inventory_summary_not_scanned_when_no_data(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditHardwareOnHost_getObjects", lambda **_kw: [])
	monkeypatch.setattr(inventory.backend, "auditSoftwareOnClient_getObjects", lambda **_kw: [])
	monkeypatch.setattr(inventory.backend, "auditSoftware_getObjects", lambda **_kw: [])
	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", lambda: [])

	response = await inventory.get_inventory_summary(clientid="client1.test.local")
	data = json.loads(response.body)

	assert data["hardware"]["state"] == "not_scanned"
	assert data["software"]["state"] == "not_scanned"


# ---------------------------------------------------------------------------
# CSV export respects filters
# ---------------------------------------------------------------------------


async def _read_streaming_response(response):
	return "".join([chunk async for chunk in response.body_iterator])


@pytest.mark.asyncio
async def test_software_csv_export_respects_kb_filter(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditSoftwareOnClient_getObjects", lambda **_kw: [sw_client_row("Update for App")])
	monkeypatch.setattr(
		inventory.backend, "auditSoftware_getObjects", lambda **_kw: [sw_meta_row("Update for App", windowsSoftwareId="kb999")]
	)

	response = inventory.export_software_inventory_csv(clientid="client1.test.local", includeKbUpdates=False)
	content = await _read_streaming_response(response)
	assert "Update for App" not in content


@pytest.mark.asyncio
async def test_hardware_csv_export_contains_property_rows(monkeypatch):
	monkeypatch.setattr(inventory.backend, "auditHardware_getConfig", lambda: HW_CONFIG)
	monkeypatch.setattr(
		inventory.backend, "auditHardwareOnHost_getObjects", lambda **_kw: [hw_row("COMPUTER_SYSTEM", name="PC1", vendor="Acme")]
	)

	response = inventory.export_hardware_inventory_csv(clientid="client1.test.local")
	content = await _read_streaming_response(response)
	assert "Vendor" in content
	assert "Acme" in content
