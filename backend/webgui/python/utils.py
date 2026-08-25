# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui utils
"""

import inspect
from collections.abc import Callable
from functools import wraps
from json import loads  # pylint: disable=no-name-in-module
from typing import Any

from fastapi import Query, status

# from OPSI.Backend.MySQL import MySQL, MySQLBackend
from opsiconfd import contextvar_client_session
from opsiconfd.application.utils import parse_list
from opsiconfd.backend import get_mysql, get_protected_backend
from opsiconfd.config import get_configserver_id

# from opsiconfd.logging import logger
from opsiconfd.rest import OpsiApiException
from sqlalchemy import and_, select, table, text  # type: ignore[import]

from .logger import get_logger

logger = get_logger()
backend = get_protected_backend()

mysql = get_mysql()


def get_depot_of_client(client: str) -> str:
	params = {}
	with mysql.session() as session:
		params["client"] = client
		where = text("cs.configId='clientconfig.depot.id' AND cs.objectId = :client")

		query = select(text("cs.objectId AS client, cs.values")).select_from(text("CONFIG_STATE AS cs")).where(where)

		result = session.execute(query, params)
		result = result.fetchone()

		if result:
			depot = dict(result).get("values", "")[2:-2]
		else:
			depot = get_configserver_id()
		return depot


def parse_hosts_list(hosts: list[str] = Query(None)) -> list | None:
	return parse_list(hosts)


def parse_server_list(servers: list[str] = Query(None)) -> list | None:
	return parse_list(servers)


def parse_depot_list(selectedDepots: list[str] = Query(None)) -> list | None:  # pylint: disable=invalid-name
	return parse_list(selectedDepots)


def parse_client_list(selectedClients: list[str] = Query(None)) -> list | None:  # pylint: disable=invalid-name
	return parse_list(selectedClients)


def parse_selected_list(selected: list[str] = Query(None)) -> list | None:  # pylint: disable=invalid-name
	return parse_list(selected)


def parse_group_list(filteredGroups: list[str] = Query(None)) -> list | None:  # pylint: disable=invalid-name
	return parse_list(filteredGroups)


def get_username() -> str:
	client_session = contextvar_client_session.get()
	if not client_session:
		raise RuntimeError("Session invalid")
	return client_session.username  # type: ignore


def get_allowed_objects() -> dict:
	allowed = {"product_groups": ..., "host_groups": ...}
	username = get_username()
	# Restrictions only apply when user roles are activated (user.{}.register),
	# matching opsi-configed's behavior.
	if user_register():
		if product_group_access_configured(username):
			allowed["product_groups"] = get_allowed_product_groups(username)  # type: ignore[assignment]
		if host_group_access_configured(username):
			allowed["host_groups"] = get_allowed_host_groups(username)  # type: ignore[assignment]
	return allowed


def build_tree(  # pylint: disable=too-many-branches
	group: dict,
	groups: list[dict],
	allowed: list[str] | None,
	processed: list[str] | None = None,
	default_expanded: bool | None = None,
) -> dict:
	if not processed:
		processed = []
	processed.append(group.get("id", ""))

	is_root_group = group["parent"] == "groups" or group["id"] == "clientdirectory"
	# allowed is None / ... = unrestricted user
	group["allowed"] = is_root_group or allowed is None or allowed == ... or group["id"] in allowed

	children = {}
	for grp in groups:
		if grp["id"] == group["id"]:
			if default_expanded and grp.get("hasAnySelection"):
				group["hasAnySelection"] = True
			continue

		if grp["parent"] == group["id"]:
			if grp["id"] in processed:
				logger.error("Loop: %s %s", grp["id"], processed)
			else:
				children[grp["id"]] = build_tree(grp, groups, allowed, processed, default_expanded=default_expanded)
				if default_expanded and grp.get("hasAnySelection"):
					group["hasAnySelection"] = True
	if children:
		if "children" not in group:
			group["children"] = {}
		group["children"].update(children)
	# else:
	# 	if group["type"] == "HostGroup":
	# 		group["children"] = None

	if not is_root_group and group.get("children"):
		for child in group["children"].values():
			# Correct id for webgui
			child["id"] = f"{child['id']};{group['id']}"
			if child.get("allowed"):
				# Allow parent if child is allowed
				group["allowed"] = True

	return group


def merge_dicts(dict_a: dict, dict_b: dict, path: list | None = None) -> dict:
	if dict_a is None or dict_b is None:
		raise ValueError("Merge_dicts: At least one of the dicts (a and b) is not set.")
	if path is None:
		path = []
	for key in dict_b:
		if key in dict_a:
			if isinstance(dict_a[key], dict) and isinstance(dict_b[key], dict):
				merge_dicts(dict_a[key], dict_b[key], path + [str(key)])
			elif isinstance(dict_a[key], list) and isinstance(dict_b[key], list):
				dict_a[key] = list(set(dict_a[key] + dict_b[key]))
			elif dict_a[key] == dict_b[key]:
				pass
			else:
				raise Exception(f"Conflict at {'.'.join(path + [str(key)])}")
		else:
			dict_a[key] = dict_b[key]
	return dict_a


def _get_bool_config_value(config_id: str, default: bool = False) -> bool:
	with mysql.session() as session:
		where = text("cv.configId = :config_id")
		query = select(text("cv.configId, cv.value, cv.isDefault")).select_from(text("CONFIG_VALUE AS cv")).where(where)
		result = session.execute(query, {"config_id": config_id})
		result = result.fetchall()
	if not result:
		# No config row exists at all → caller's default wins.
		return default
	for row in result:
		row_dict = dict(row)
		if row_dict.get("isDefault") == 1 and row_dict.get("value") in [
			"1",
			"true",
			"True",
			True,
		]:
			return True
	return False


def user_register() -> bool:
	return _get_bool_config_value("user.{}.register")


def host_group_access_configured(user: str) -> bool:
	return _get_bool_config_value(f"user.{{{user}}}.privilege.host.groupaccess.configured")


def depot_access_configured(user: str) -> bool:
	return _get_bool_config_value(f"user.{{{user}}}.privilege.host.depotaccess.configured")


def product_group_access_configured(user: str) -> bool:
	return _get_bool_config_value(f"user.{{{user}}}.privilege.product.groupaccess.configured")


def read_only_user(user: str) -> bool:
	bak = backend.accessControl_userIsReadOnlyUser()  # if user is in readonly group in /etc/opsi/opsi.conf
	ur = _get_bool_config_value(f"user.{{{user}}}.privilege.host.all.registered_readonly")  # if user roles read_only
	return bak or ur


def is_opsiserver_write_permitted(user: str) -> bool:
	# Default True: users have server-write access unless explicitly forbidden.
	return _get_bool_config_value(f"user.{{{user}}}.privilege.host.opsiserver.write", default=True)


def client_creation_allowed(user: str) -> bool:
	# Default True: users may create clients unless explicitly forbidden.
	return _get_bool_config_value(f"user.{{{user}}}.privilege.host.createclient", default=True)


def get_allowed_depots(user: str) -> list:
	with mysql.session() as session:
		where = text("cv.configId='user.{" + user + "}.privilege.host.depotaccess.depots'")
		where = and_(where, text("cv.isDefault=1"))
		query = select(text("cv.value")).select_from(text("CONFIG_VALUE AS cv")).where(where)
		result = session.execute(query)
		result = result.fetchall()
		depots = []
		for row in result:
			depots.append(dict(row).get("value"))
	return depots


def get_allowed_product_groups(user: str) -> list:
	with mysql.session() as session:
		where = text("cv.configId='user.{" + user + "}.privilege.product.groupaccess.productgroups'")
		where = and_(where, text("cv.isDefault=1"))
		query = select(text("cv.value")).select_from(text("CONFIG_VALUE AS cv")).where(where)
		result = session.execute(query)
		result = result.fetchall()
		groups = []
		for row in result:
			groups.append(dict(row).get("value"))
	return groups


def get_groups(gtype: str, parent_ids: str | list[str] | None = None) -> list:
	"""
	Helper function to get all groups of a specific type.
	"""

	where = text("g.type = :type")
	params = {"type": gtype}
	if parent_ids is not None:
		parent_ids = [parent_ids] if isinstance(parent_ids, str) else parent_ids
		if not parent_ids:
			return []
		where = and_(where, text("(g.parentGroupId IN :parentIds)"))
		params["parentIds"] = parent_ids

	with mysql.session() as session:
		query = (
			select(  # type: ignore[arg-type,attr-defined]
				text(  # type: ignore[arg-type]
					"""
					g.groupId AS group_id,
					g.parentGroupId AS parent_id,
					g.type AS type
				"""
				)
			)
			.where(where)
			.select_from(table("GROUP").alias("g"))
		)
		logger.debug("GType %s, parent_ids %s", gtype, parent_ids)
		logger.debug("Group query: %s", query)
		result = session.execute(query, params=params)
		result = result.fetchall()
		groups = []
		for row in result:
			if row:
				groups.append(dict(row))
		return groups


def _get_object_to_groups(gtype: str, group_ids: list[str] | str | None = None) -> list[str]:
	"""Helper function to get all objects in a specific group.
	MariaDB [opsi]> SELECT * FROM OBJECT_TO_GROUP WHERE groupType='HostGroup' AND groupId IN ("verwaltung");"""
	if group_ids is not None:
		group_ids = [group_ids] if isinstance(group_ids, str) else group_ids
		if not group_ids:
			return []

	where = text("groupType=:type")
	params = {"type": gtype}
	if group_ids:
		where = and_(where, text("(groupId IN :group_ids)"))
		params["group_ids"] = group_ids

	with mysql.session() as session:
		query = (
			select(  # type: ignore[arg-type,attr-defined]
				text(  # type: ignore[arg-type]
					"""
					objectId,
					groupId,
					groupType
				"""
				)
			)
			.where(where)
			.select_from(table("OBJECT_TO_GROUP"))
		)
		logger.debug("GType %s, group_ids %s", gtype, group_ids)
		logger.debug("Object to group query: %s", query)
		result = session.execute(query, params=params)
		result = result.fetchall()
		objects = []
		for row in result:
			objects.append(dict(row))
		return objects


def get_objects_of_group(group: str | list[str] = ["verwaltung"], group_type: str = "HostGroup") -> list[str]:
	"""
	Get all (nested) clients in a specific group, which are allowed (by userroles)
	"""
	if group_type not in ["HostGroup", "ProductGroup"]:
		raise ValueError("Invalid group type")

	# Note: userrole-based object filtering (allowed clients/products) is
	# applied by the calling endpoints; this helper only resolves the
	# (nested) members of the given groups.
	child_groups = get_groups(group_type, parent_ids=group)
	logger.debug("Child groups: %s", child_groups)
	object_to_groups = [obj["objectId"] for obj in _get_object_to_groups(group_type, group_ids=group)]
	logger.debug("Object to groups: %s", object_to_groups)
	processed_groups = [group] if isinstance(group, str) else list(group)
	for row in child_groups:
		if row["group_id"] in processed_groups:
			continue
		processed_groups.append(row["group_id"])
		child_groups.extend(get_groups(group_type, parent_ids=row["group_id"]))
		objs_ids = [obj["objectId"] for obj in _get_object_to_groups(group_type, group_ids=row["group_id"])]
		object_to_groups.extend(objs_ids)

	return object_to_groups


def get_allowed_host_groups(user: str) -> list:
	with mysql.session() as session:
		where = text("cv.configId='user.{" + user + "}.privilege.host.groupaccess.hostgroups'")
		where = and_(where, text("cv.isDefault=1"))
		query = select(text("cv.value")).select_from(text("CONFIG_VALUE AS cv")).where(where)
		result = session.execute(query)
		result = result.fetchall()
		groups = []
		for row in result:
			groups.append(dict(row).get("value"))
	return groups


def get_allowed_group_objects(user: str, gtype: str = "HostGroup") -> list | None:
	allowed_objectIds: list | None = None
	try:
		allowed_objectIds = get_allowed_sql(user, gtype)
	except Exception:
		logger.info(f"Could not use db method to build {gtype} tree")
		if gtype == "HostGroup":
			allowed_objectIds = get_allowed_clients(user)
		elif gtype == "ProductGroup":
			allowed_objectIds = get_allowed_products(user)
		else:
			raise ValueError(f"Unsupported group type: {gtype}")
	return allowed_objectIds


def get_allowed_sql(user: str, gtype: str = "HostGroup") -> list:
	allowed_group_ids: list = []
	if gtype == "HostGroup":
		allowed_group_ids = get_allowed_host_groups(user)
	elif gtype == "ProductGroup":
		allowed_group_ids = get_allowed_product_groups(user)
	else:
		raise ValueError(f"Unsupported group type: {gtype}")

	if not allowed_group_ids:
		return []

	placeholders = ", ".join([f":p{i}" for i in range(len(allowed_group_ids))])
	params = {f"p{i}": gid for i, gid in enumerate(allowed_group_ids)}
	logger.debug("Allowed group ids: %s", allowed_group_ids)
	sql = f"""
			WITH RECURSIVE group_tree AS (
					SELECT groupId
					FROM `GROUP`
					WHERE groupId IN ({placeholders})  AND type = '{gtype}'
					UNION ALL
					SELECT g.groupId
					FROM `GROUP` g
					JOIN group_tree gt ON g.parentGroupId = gt.groupId
					WHERE g.type = '{gtype}'
			)
			SELECT objectId
			FROM OBJECT_TO_GROUP
			WHERE groupId IN (SELECT groupId FROM group_tree)
	"""

	allowed_objects = []
	with mysql.session() as session:
		result = session.execute(text(sql), params)
		# return [row[0] for row in result.fetchall()]

		otg_result = result.fetchall()
		for otg_row in otg_result:
			if otg_row is not None:
				allowed_objects.append(dict(otg_row).get("objectId"))

	logger.debug("Allowed objects of %s: %s", gtype, allowed_objects)
	return allowed_objects


def get_allowed_clients(user: str) -> list:
	all_groups = get_groups("HostGroup")
	allowed_groups = get_allowed_host_groups(user)
	allowed_groups_with_childs = get_all_children_groupids(all_groups, allowed_groups)
	if not allowed_groups_with_childs:
		return []

	allowed_clients = []
	with mysql.session() as session:
		query = select(text("otg.objectId AS client")).select_from(text("OBJECT_TO_GROUP AS otg")).where(text("otg.groupId IN :groupids"))
		otg_result = session.execute(query, {"groupids": allowed_groups_with_childs}).fetchall()
		for otg_row in otg_result:
			if otg_row is not None:
				allowed_clients.append(dict(otg_row).get("client"))
	return allowed_clients


def get_allowed_products(user: str) -> list:
	allowed_groups = get_allowed_product_groups(user)
	if not allowed_groups:
		return []

	allowed_products = []
	with mysql.session() as session:
		query = select(text("otg.objectId AS product")).select_from(text("OBJECT_TO_GROUP AS otg")).where(text("otg.groupId IN :groupids"))
		otg_result = session.execute(query, {"groupids": allowed_groups}).fetchall()
		for otg_row in otg_result:
			if otg_row is not None:
				allowed_products.append(dict(otg_row).get("product"))
	return allowed_products


def read_only_check(func: Callable) -> Callable:
	@wraps(func)
	def check_user(*args, **kwargs):  # type: ignore[no-untyped-def]
		username = kwargs.get("request").scope.get("session").username
		if user_register():
			if read_only_user(username):
				logger.error("User %s is a read only user by user role.", username)
				raise OpsiApiException(
					message=f"User {username} is a read only user.",
					http_status=status.HTTP_403_FORBIDDEN,
				)

		back_read_only = backend.accessControl_userIsReadOnlyUser()
		if back_read_only:
			logger.error("User %s is a read only user.", username)
			raise OpsiApiException(
				message=f"User {username} is a read only user.",
				http_status=status.HTTP_403_FORBIDDEN,
			)
		return func(*args, **kwargs)

	return check_user


def opsi_server_write_check(func: Callable) -> Callable:
	@wraps(func)
	def check_user(*args, **kwargs):  # type: ignore[no-untyped-def]
		if user_register():
			username = kwargs.get("request").scope.get("session").username
			if not is_opsiserver_write_permitted(username):
				logger.error("User %s is has no write access.", username)
				raise OpsiApiException(
					message=f"User {username} has no write access.",
					http_status=status.HTTP_403_FORBIDDEN,
				)
		return func(*args, **kwargs)

	return check_user


def filter_depot_access(func: Callable) -> Callable:
	# Only touch the "selectedDepots" kwarg if the wrapped function actually
	# accepts it (either as a named parameter or via **kwargs). Injecting it
	# into functions without that parameter (e.g. reachable_clients) raises
	# "got an unexpected keyword argument 'selectedDepots'".
	func_parameters = inspect.signature(func).parameters
	accepts_selected_depots = "selectedDepots" in func_parameters or any(
		parameter.kind == inspect.Parameter.VAR_KEYWORD for parameter in func_parameters.values()
	)

	@wraps(func)
	async def check_user(*args, **kwargs):  # type: ignore[no-untyped-def]
		logger.debug("%s - check user", func)
		if user_register() and accepts_selected_depots:
			username = None
			request = kwargs.get("request")
			if request is not None and getattr(request, "scope", None):
				username = getattr(request.scope.get("session"), "username", None)
			if not username:
				username = get_username()
			if depot_access_configured(username):
				allowed_depots = get_allowed_depots(username)
				selected_depots = kwargs.get("selectedDepots")

				# No explicit depot selection: restrict to user's allowed depots.
				if selected_depots is None:
					kwargs["selectedDepots"] = list(allowed_depots)
				else:
					# Normalize to a list and keep only allowed depots.
					selected_depots_list = list(selected_depots) if isinstance(selected_depots, (list, tuple, set)) else [selected_depots]
					kwargs["selectedDepots"] = [depot for depot in selected_depots_list if depot in allowed_depots]
		if inspect.iscoroutinefunction(func):
			return await func(*args, **kwargs)
		return func(*args, **kwargs)

	return check_user


def check_client_creation_rights(func: Callable) -> Callable:
	@wraps(func)
	def check_user(*args, **kwargs):  # type: ignore[no-untyped-def]
		if user_register():
			username = kwargs.get("request").scope.get("session").username
			if not client_creation_allowed(username):
				logger.error("User %s is not allowed to create clients.", username)
				raise OpsiApiException(
					message=f"User {username} is not allowed to create clients.",
					http_status=status.HTTP_403_FORBIDDEN,
				)
		return func(*args, **kwargs)

	return check_user


def bool_value(value: str | bool) -> bool:
	if isinstance(value, bool):
		return value
	if value:
		if value.lower() == "[true]" or str(value) == "1" or value.lower() == "true":
			return True
	return False


def unicode_value(value: str | list[str], delimiter: str = ";") -> list[str]:
	if value and isinstance(value, list):
		return value
	if value and isinstance(value, str):
		if value.startswith('["'):
			return loads(value)  # pylint: disable=no-member
		if value == "[]":
			return [""]
		return value.replace('\\"', '"').split(delimiter)
	return [""]


def unicode_config(value: str, multi_value: bool = False, delimiter: str = ";") -> str | list[str]:
	if multi_value:
		return unicode_value(value, delimiter)
	if value and isinstance(value, str):
		if value.startswith('["'):
			return loads(value)[0]  # pylint: disable=no-member
		if value == "[]":
			return ""
		return value
	return ""


def get_sub_groups(group: str) -> Any:
	result = set()
	groups = [g.id for g in backend.group_getObjects(parentGroupId=group)]
	result.update(groups)
	for subgroup in groups:
		result.update(get_sub_groups(subgroup))

	return result


def get_groups_ids(type: str) -> list[str]:
	groups = []
	with mysql.session() as session:
		query = select(text("g.groupId AS group_id")).select_from(table("GROUP").alias("g")).where(text("g.type = :type"))  # type: ignore[arg-type,attr-defined]
		result = session.execute(query, params={"type": type})
		result = result.fetchall()

		for row in result:
			if row:
				groups.append(dict(row).get("group_id", ""))
		return groups


def get_group_tree(type: str) -> list[str]:
	groups = []
	with mysql.session() as session:
		query = select(text("g.groupId AS group_id")).select_from(table("GROUP").alias("g")).where(text("g.type = :type"))  # type: ignore[arg-type,attr-defined]
		result = session.execute(query, params={"type": type})
		result = result.fetchall()
		return groups


def get_all_children_groupids(raw_groups: list[dict], group_ids: list[str]) -> set[str]:
	"""
	Returns all child group IDs for a list of group IDs.
	"""
	if not raw_groups or not group_ids:
		return set()

	# Build a parent_id -> [child_id, ...] mapping (case-insensitive)
	parent_map = {}
	for row in raw_groups:
		parent = row["parent_id"]
		parent_key = str(parent).lower() if parent else parent
		child = row["group_id"].lower()
		parent_map.setdefault(parent_key, []).append(child)

	all_children = set()
	stack = [str(gid).lower() for gid in group_ids]
	while stack:
		gid = stack.pop()
		if gid not in all_children:
			all_children.add(gid)
			stack.extend(parent_map.get(gid, []))

	return all_children


def expand_allowed_groups(allowed: list | None, gtype: str = "HostGroup") -> set[str] | None:
	"""
	Expand an allowed-groups list with all descendant group ids (lowercased).
	Configed semantics: children of an allowed group are allowed as well.
	Returns None for unrestricted users (allowed is None).
	"""
	if allowed is None:
		return None
	# "clientdirectory" is the virtual root; never expand it to its children
	# (same behavior as read_groups in utils_groups.py).
	seeds = [str(group_id).lower() for group_id in allowed if group_id and group_id != "clientdirectory"]
	if not seeds:
		return set()
	return get_all_children_groupids(get_groups(gtype), seeds)


def get_all_children_groupid(raw_groups: list[dict], group_id: str) -> set[str]:
	"""
	Returns all child group IDs for a given group ID.
	"""
	if not raw_groups:
		return set()

	all_children = set()
	for row in raw_groups:
		if row["parent_id"] == group_id:
			all_children.add(row["group_id"].lower())
			all_children.update(get_all_children_groupid(raw_groups, row["group_id"]))

	return all_children
