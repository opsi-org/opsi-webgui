# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui single-client hardware/software inventory (read-only)

Uses opsiconfd audit RPC methods as the only data source:
  auditHardware_getConfig, auditHardwareOnHost_getObjects,
  auditSoftware_getObjects, auditSoftwareOnClient_getObjects
No direct audit table/SQL access happens here.
"""

import csv
import hashlib
import io
import re
import time
from datetime import datetime, timedelta
from typing import Any, Literal

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from opsiconfd.rest import OpsiApiException, RESTResponse, rest_api
from pydantic import BaseModel

from ..logger import get_logger
from ..utils import backend

api_router = APIRouter()
logger = get_logger()

InventoryState = Literal["ok", "stale", "not_scanned", "empty"]

OPSI_TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"
STALE_AFTER_DAYS = 30
MAX_INVENTORY_ITEMS = 5000
MAX_EXPORT_ITEMS = 20000
DEFAULT_PAGE_SIZE = 100
MAX_PAGE_SIZE = 1000
HARDWARE_CONFIG_CACHE_SECONDS = 300
_hardware_class_meta_cache: dict[str, Any] = {}

_KB_GUID_RE = re.compile(r"^\{.*\}[^0-9a-z]*kb", re.IGNORECASE)

HARDWARE_SOURCE = "auditHardwareOnHost_getObjects"
SOFTWARE_SOURCE = "auditSoftwareOnClient_getObjects"


class InventoryAttribute(BaseModel):  # pylint: disable=too-few-public-methods
	key: str
	label: str
	value: Any = None


class HardwareItem(BaseModel):  # pylint: disable=too-few-public-methods
	identifier: str
	hardwareClass: str
	className: str
	displayName: str
	firstseen: str | None = None
	lastseen: str | None = None
	state: int | None = None
	attributes: list[InventoryAttribute] = []


class SoftwareItem(BaseModel):  # pylint: disable=too-few-public-methods
	identifier: str
	name: str
	version: str | None = None
	subVersion: str | None = None
	language: str | None = None
	architecture: str | None = None
	displayName: str
	windowsSoftwareId: str | None = None
	windowsDisplayName: str | None = None
	windowsDisplayVersion: str | None = None
	isOperatingSystem: bool = False
	isKbUpdate: bool = False
	installSize: int | None = None
	firstseen: str | None = None
	lastseen: str | None = None
	state: int | None = None
	usageFrequency: int | None = None
	lastUsed: str | None = None
	licenseKey: str | None = None
	binaryName: str | None = None
	uninstallString: str | None = None


class InventoryMeta(BaseModel):  # pylint: disable=too-few-public-methods
	clientId: str
	source: str
	state: InventoryState
	count: int
	lastScan: str | None = None
	truncated: bool = False


class HardwareInventoryResponse(BaseModel):  # pylint: disable=too-few-public-methods
	meta: InventoryMeta
	items: list[HardwareItem]


class SoftwareInventoryResponse(BaseModel):  # pylint: disable=too-few-public-methods
	meta: InventoryMeta
	items: list[SoftwareItem]


class InventorySummary(BaseModel):  # pylint: disable=too-few-public-methods
	clientId: str
	hardware: InventoryMeta
	software: InventoryMeta


def _parse_opsi_timestamp(value: Any) -> datetime | None:
	if not value or not isinstance(value, str):
		return None
	try:
		return datetime.strptime(value, OPSI_TIMESTAMP_FORMAT)
	except ValueError:
		return None


def _is_present(state: Any) -> bool:
	return state is None or state != 0


def _format_timestamp(value: datetime | None) -> str | None:
	if not value:
		return None
	return value.strftime(OPSI_TIMESTAMP_FORMAT)


def _build_meta(clientid: str, source: str, rows: list[Any], present_rows: list[Any]) -> InventoryMeta:
	has_any_rows = bool(rows)
	last_scan: datetime | None = None
	for row in present_rows:
		parsed = _parse_opsi_timestamp(getattr(row, "lastseen", None))
		if parsed and (last_scan is None or parsed > last_scan):
			last_scan = parsed

	state: InventoryState
	if not has_any_rows:
		state = "not_scanned"
	elif not present_rows:
		state = "empty"
	elif last_scan is not None and datetime.now() - last_scan > timedelta(days=STALE_AFTER_DAYS):
		state = "stale"
	else:
		state = "ok"

	return InventoryMeta(
		clientId=clientid,
		source=source,
		state=state,
		count=len(present_rows),
		lastScan=_format_timestamp(last_scan),
	)


def _get_hardware_class_meta() -> dict[str, dict[str, Any]]:
	now = time.monotonic()
	cached = _hardware_class_meta_cache.get("data")
	cached_at = _hardware_class_meta_cache.get("time", 0.0)
	if cached is not None and now - cached_at < HARDWARE_CONFIG_CACHE_SECONDS:
		return cached

	class_meta: dict[str, dict[str, Any]] = {}
	try:
		hw_config = backend.auditHardware_getConfig()
	except Exception as err:  # pylint: disable=broad-except
		logger.warning("Could not get hardware config, hardware classes/attributes will be shown without definitions: %s", err)
		return class_meta

	for entry in hw_config or []:
		cls = entry.get("Class") or {}
		opsi_class = cls.get("Opsi")
		if not opsi_class:
			continue
		values = entry.get("Values") or []
		attr_meta = {v["Opsi"]: v for v in values if v.get("Opsi")}
		ident_attrs = [v["Opsi"] for v in values if v.get("Scope") == "g"]
		class_meta[opsi_class] = {
			"ui": cls.get("UI") or opsi_class,
			"attrs": attr_meta,
			"identAttrs": ident_attrs,
		}
	_hardware_class_meta_cache["data"] = class_meta
	_hardware_class_meta_cache["time"] = now
	return class_meta


_HARDWARE_META_KEYS = {"hostId", "hardwareClass", "type", "ident", "firstseen", "lastseen", "state"}
_DISPLAY_NAME_CANDIDATES = ("name", "model", "description", "product")


def _normalize_hardware_rows(rows: list[Any]) -> list[HardwareItem]:
	class_meta = _get_hardware_class_meta()
	seen_identifiers: dict[str, int] = {}
	items: list[HardwareItem] = []

	for row in rows:
		data = row.to_hash() if hasattr(row, "to_hash") else dict(vars(row))
		hardware_class = data.get("hardwareClass") or "UNKNOWN"
		meta = class_meta.get(hardware_class)
		class_ui = meta["ui"] if meta else hardware_class
		attr_meta = meta["attrs"] if meta else {}
		ident_attrs = meta["identAttrs"] if meta and meta["identAttrs"] else None

		attribute_keys = sorted(k for k in data if k not in _HARDWARE_META_KEYS and not k.startswith("_"))
		if ident_attrs is None:
			# Missing hardware class definition: fall back to all known attributes for stable identity.
			ident_attrs = attribute_keys

		ident_values = [str(data.get(a, "")) for a in ident_attrs]
		raw_id = "|".join([hardware_class, *ident_values])
		digest = hashlib.sha1(raw_id.encode("utf-8")).hexdigest()[:16]
		occurrence = seen_identifiers.get(digest, 0)
		seen_identifiers[digest] = occurrence + 1
		identifier = digest if occurrence == 0 else f"{digest}-{occurrence}"

		attributes = [
			InventoryAttribute(key=key, label=attr_meta.get(key, {}).get("UI", key), value=data.get(key)) for key in attribute_keys
		]

		display_name = None
		for candidate in _DISPLAY_NAME_CANDIDATES:
			value = data.get(candidate)
			if value:
				display_name = str(value)
				break
		if not display_name:
			display_name = f"{class_ui} ({identifier[:8]})"

		items.append(
			HardwareItem(
				identifier=identifier,
				hardwareClass=hardware_class,
				className=class_ui,
				displayName=display_name,
				firstseen=data.get("firstseen"),
				lastseen=data.get("lastseen"),
				state=data.get("state"),
				attributes=attributes,
			)
		)
	return items


def _is_kb_update(windows_software_id: str | None) -> bool:
	wsid = (windows_software_id or "").strip()
	if not wsid:
		return False
	if wsid.lower().startswith("kb"):
		return True
	return bool(_KB_GUID_RE.match(wsid))


def _software_key(name: str, version: str, sub_version: str, language: str, architecture: str) -> tuple[str, str, str, str, str]:
	return (name, version, sub_version, language, architecture)


def _normalize_software_rows(client_rows: list[Any], software_meta_rows: list[Any]) -> list[SoftwareItem]:
	meta_by_key: dict[tuple[str, str, str, str, str], Any] = {}
	for row in software_meta_rows:
		meta_by_key[_software_key(row.name, row.version, row.subVersion, row.language, row.architecture)] = row

	seen_identifiers: dict[str, int] = {}
	items: list[SoftwareItem] = []
	for row in client_rows:
		key = _software_key(row.name, row.version, row.subVersion, row.language, row.architecture)
		meta = meta_by_key.get(key)
		windows_software_id = getattr(meta, "windowsSoftwareId", None)

		raw_id = "|".join(key)
		digest = hashlib.sha1(raw_id.encode("utf-8")).hexdigest()[:16]
		occurrence = seen_identifiers.get(digest, 0)
		seen_identifiers[digest] = occurrence + 1
		identifier = digest if occurrence == 0 else f"{digest}-{occurrence}"

		display_name = getattr(meta, "windowsDisplayName", None) or row.name

		items.append(
			SoftwareItem(
				identifier=identifier,
				name=row.name,
				version=row.version,
				subVersion=row.subVersion,
				language=row.language,
				architecture=row.architecture,
				displayName=display_name,
				windowsSoftwareId=windows_software_id,
				windowsDisplayName=getattr(meta, "windowsDisplayName", None),
				windowsDisplayVersion=getattr(meta, "windowsDisplayVersion", None),
				isOperatingSystem=bool(getattr(meta, "isOperatingSystem", False)),
				isKbUpdate=_is_kb_update(windows_software_id),
				installSize=getattr(meta, "installSize", None),
				firstseen=row.firstseen,
				lastseen=row.lastseen,
				state=row.state,
				usageFrequency=row.usageFrequency,
				lastUsed=row.lastUsed,
				licenseKey=row.licenseKey,
				binaryName=row.binaryName,
				uninstallString=row.uninstallString,
			)
		)
	return items


def _fetch_hardware_rows(clientid: str) -> list[Any]:
	try:
		return backend.auditHardwareOnHost_getObjects(hostId=[clientid]) or []
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not get hardware inventory for '%s': %s", clientid, err)
		raise OpsiApiException(
			message="Could not get hardware inventory.",
			http_status=500,
			error=err,
		) from err


def _fetch_software_rows(clientid: str) -> tuple[list[Any], list[Any]]:
	try:
		client_rows = backend.auditSoftwareOnClient_getObjects(clientId=[clientid]) or []
		names = sorted({row.name for row in client_rows})
		software_meta_rows = backend.auditSoftware_getObjects(name=names) if names else []
		return client_rows, software_meta_rows or []
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not get software inventory for '%s': %s", clientid, err)
		raise OpsiApiException(
			message="Could not get software inventory.",
			http_status=500,
			error=err,
		) from err


def _filter_hardware_items(
	items: list[HardwareItem],
	hardware_class: list[str] | None,
	filter_query: str | None,
	include_absent: bool,
) -> list[HardwareItem]:
	result = items
	if not include_absent:
		result = [item for item in result if _is_present(item.state)]
	if hardware_class:
		wanted = {c.upper() for c in hardware_class}
		result = [item for item in result if item.hardwareClass.upper() in wanted]
	if filter_query:
		query = filter_query.lower()
		filtered = []
		for item in result:
			haystack = " ".join([item.displayName, item.hardwareClass, item.className] + [str(a.value) for a in item.attributes])
			if query in haystack.lower():
				filtered.append(item)
		result = filtered
	return result


def _filter_software_items(
	items: list[SoftwareItem],
	filter_query: str | None,
	include_kb_updates: bool,
	include_absent: bool,
) -> list[SoftwareItem]:
	result = items
	if not include_absent:
		result = [item for item in result if _is_present(item.state)]
	if not include_kb_updates:
		result = [item for item in result if not item.isKbUpdate]
	if filter_query:
		query = filter_query.lower()
		result = [
			item
			for item in result
			if query in item.name.lower()
			or (item.windowsDisplayName or "").lower().find(query) != -1
			or (item.version or "").lower().find(query) != -1
		]
	return result


def _sort_software_items(items: list[SoftwareItem], sort_by: str, sort_desc: bool) -> list[SoftwareItem]:
	valid_sort_keys = {
		"name",
		"version",
		"lastseen",
		"firstseen",
		"installSize",
		"isOperatingSystem",
	}
	key = sort_by if sort_by in valid_sort_keys else "name"

	def sort_key(item: SoftwareItem) -> Any:
		value = getattr(item, key)
		return (value is None, value)

	return sorted(items, key=sort_key, reverse=sort_desc)


def _sort_hardware_items(items: list[HardwareItem], sort_by: str, sort_desc: bool) -> list[HardwareItem]:
	key = sort_by if sort_by in {"hardwareClass", "className", "displayName", "firstseen", "lastseen"} else "className"
	return sorted(items, key=lambda item: (getattr(item, key) is None, getattr(item, key)), reverse=sort_desc)


def _paginate_items[T](items: list[T], page: int, per_page: int) -> tuple[list[T], int]:
	page = max(1, page)
	per_page = min(max(1, per_page), MAX_PAGE_SIZE)
	start = (page - 1) * per_page
	return items[start : start + per_page], len(items)


@api_router.get("/api/opsidata/clients/{clientid}/inventory/summary", response_model=InventorySummary)
@rest_api
def get_inventory_summary(clientid: str) -> RESTResponse:
	"""Lightweight hardware/software inventory summary for a single client."""
	hardware_rows = _fetch_hardware_rows(clientid)
	hardware_present = [row for row in hardware_rows if _is_present(getattr(row, "state", None))]
	hardware_meta = _build_meta(clientid, HARDWARE_SOURCE, hardware_rows, hardware_present)

	software_rows, _ = _fetch_software_rows(clientid)
	software_present = [row for row in software_rows if _is_present(getattr(row, "state", None))]
	software_meta = _build_meta(clientid, SOFTWARE_SOURCE, software_rows, software_present)

	return RESTResponse(data=InventorySummary(clientId=clientid, hardware=hardware_meta, software=software_meta).model_dump())


@api_router.get("/api/opsidata/clients/{clientid}/inventory/hardware", response_model=HardwareInventoryResponse)
@rest_api
def get_hardware_inventory(
	clientid: str,
	hardwareClass: list[str] | None = None,
	filterQuery: str | None = None,
	includeAbsent: bool = False,
	sortBy: str = "className",
	sortDesc: bool = False,
	page: int | None = None,
	perPage: int = DEFAULT_PAGE_SIZE,
) -> RESTResponse:
	"""Client-scoped hardware inventory, grouped/labelled by dynamic hardware class definitions."""
	rows = _fetch_hardware_rows(clientid)
	present_rows = [row for row in rows if _is_present(getattr(row, "state", None))]
	meta = _build_meta(clientid, HARDWARE_SOURCE, rows, present_rows)

	items = _normalize_hardware_rows(rows)
	items = _filter_hardware_items(items, hardwareClass, filterQuery, includeAbsent)
	items = _sort_hardware_items(items, sortBy, sortDesc)

	truncated = len(items) > MAX_INVENTORY_ITEMS
	if truncated:
		items = items[:MAX_INVENTORY_ITEMS]
	total = len(items)
	if page is not None:
		items, total = _paginate_items(items, page, perPage)
	meta.truncated = truncated

	return RESTResponse(data=HardwareInventoryResponse(meta=meta, items=items).model_dump(), total=total)


@api_router.get("/api/opsidata/clients/{clientid}/inventory/software", response_model=SoftwareInventoryResponse)
@rest_api
def get_software_inventory(
	clientid: str,
	filterQuery: str | None = None,
	includeKbUpdates: bool = True,
	includeAbsent: bool = False,
	sortBy: str = "name",
	sortDesc: bool = False,
	page: int | None = None,
	perPage: int = DEFAULT_PAGE_SIZE,
) -> RESTResponse:
	"""Client-scoped software inventory with Configed-compatible KB/Microsoft-update filtering."""
	client_rows, software_meta_rows = _fetch_software_rows(clientid)
	present_rows = [row for row in client_rows if _is_present(getattr(row, "state", None))]
	meta = _build_meta(clientid, SOFTWARE_SOURCE, client_rows, present_rows)

	items = _normalize_software_rows(client_rows, software_meta_rows)
	items = _filter_software_items(items, filterQuery, includeKbUpdates, includeAbsent)
	items = _sort_software_items(items, sortBy, sortDesc)

	truncated = len(items) > MAX_INVENTORY_ITEMS
	if truncated:
		items = items[:MAX_INVENTORY_ITEMS]
	total = len(items)
	if page is not None:
		items, total = _paginate_items(items, page, perPage)
	meta.truncated = truncated

	return RESTResponse(data=SoftwareInventoryResponse(meta=meta, items=items).model_dump(), total=total)


def _csv_streaming_response(rows: list[list[Any]], header: list[str], filename: str) -> StreamingResponse:
	buffer = io.StringIO()
	writer = csv.writer(buffer)
	writer.writerow(header)
	writer.writerows(rows)
	buffer.seek(0)
	return StreamingResponse(
		iter([buffer.getvalue()]),
		media_type="text/csv",
		headers={"Content-Disposition": f'attachment; filename="{filename}"'},
	)


@api_router.get("/api/opsidata/clients/{clientid}/inventory/hardware/csv")
def export_hardware_inventory_csv(
	clientid: str,
	hardwareClass: list[str] | None = None,
	filterQuery: str | None = None,
	includeAbsent: bool = False,
	sortBy: str = "className",
	sortDesc: bool = False,
) -> StreamingResponse:
	"""CSV export of the hardware inventory respecting the same filters as the table view."""
	rows = _fetch_hardware_rows(clientid)
	items = _normalize_hardware_rows(rows)
	items = _filter_hardware_items(items, hardwareClass, filterQuery, includeAbsent)
	items = _sort_hardware_items(items, sortBy, sortDesc)
	items = items[:MAX_EXPORT_ITEMS]

	csv_rows = []
	for item in items:
		if not item.attributes:
			csv_rows.append(
				[item.hardwareClass, item.className, item.identifier, item.displayName, "", "", item.firstseen, item.lastseen, item.state]
			)
		for attr in item.attributes:
			csv_rows.append(
				[
					item.hardwareClass,
					item.className,
					item.identifier,
					item.displayName,
					attr.label,
					attr.value,
					item.firstseen,
					item.lastseen,
					item.state,
				]
			)

	return _csv_streaming_response(
		csv_rows,
		["hardwareClass", "className", "identifier", "displayName", "property", "value", "firstseen", "lastseen", "state"],
		f"{clientid}_hardware_inventory.csv",
	)


@api_router.get("/api/opsidata/clients/{clientid}/inventory/software/csv")
def export_software_inventory_csv(
	clientid: str,
	filterQuery: str | None = None,
	includeKbUpdates: bool = True,
	includeAbsent: bool = False,
	sortBy: str = "name",
	sortDesc: bool = False,
) -> StreamingResponse:
	"""CSV export of the software inventory respecting the same filters/sort as the table view."""
	client_rows, software_meta_rows = _fetch_software_rows(clientid)
	items = _normalize_software_rows(client_rows, software_meta_rows)
	items = _filter_software_items(items, filterQuery, includeKbUpdates, includeAbsent)
	items = _sort_software_items(items, sortBy, sortDesc)
	items = items[:MAX_EXPORT_ITEMS]

	csv_rows = [
		[
			item.name,
			item.version,
			item.subVersion,
			item.language,
			item.architecture,
			item.windowsSoftwareId,
			item.windowsDisplayName,
			item.windowsDisplayVersion,
			item.isOperatingSystem,
			item.isKbUpdate,
			item.installSize,
			item.firstseen,
			item.lastseen,
			item.state,
			item.usageFrequency,
			item.lastUsed,
			item.licenseKey,
			item.binaryName,
			item.uninstallString,
		]
		for item in items
	]

	return _csv_streaming_response(
		csv_rows,
		[
			"name",
			"version",
			"subVersion",
			"language",
			"architecture",
			"windowsSoftwareId",
			"windowsDisplayName",
			"windowsDisplayVersion",
			"isOperatingSystem",
			"isKbUpdate",
			"installSize",
			"firstseen",
			"lastseen",
			"state",
			"usageFrequency",
			"lastUsed",
			"licenseKey",
			"binaryName",
			"uninstallString",
		],
		f"{clientid}_software_inventory.csv",
	)
