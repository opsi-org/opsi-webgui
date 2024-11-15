# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui utils
"""

import asyncio
from functools import wraps
from json import loads  # pylint: disable=no-name-in-module
from operator import and_
from typing import Callable, List, Optional, Union

from fastapi import Query, status
from sqlalchemy import and_, column, insert, or_, select, table, text, union, update  # type: ignore[import]

# from OPSI.Backend.MySQL import MySQL, MySQLBackend
from opsiconfd import contextvar_client_session
from opsiconfd.application.utils import parse_list
from opsiconfd.backend import get_mysql, get_protected_backend
from opsiconfd.config import get_configserver_id
from opsiconfd.logging import logger
from opsiconfd.rest import OpsiApiException


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


def parse_hosts_list(hosts: List[str] = Query(None)) -> Optional[List]:
	return parse_list(hosts)


def parse_server_list(servers: List[str] = Query(None)) -> Optional[List]:
	return parse_list(servers)


def parse_depot_list(selectedDepots: List[str] = Query(None)) -> Optional[List]:  # pylint: disable=invalid-name
	return parse_list(selectedDepots)


def parse_client_list(selectedClients: List[str] = Query(None)) -> Optional[List]:  # pylint: disable=invalid-name
	return parse_list(selectedClients)


def parse_selected_list(selected: List[str] = Query(None)) -> Optional[List]:  # pylint: disable=invalid-name
	return parse_list(selected)


def get_username() -> str:
	client_session = contextvar_client_session.get()
	if not client_session:
		raise RuntimeError("Session invalid")
	return client_session.username  # type: ignore


def get_allowed_objects() -> dict:
	allowed = {"product_groups": ..., "host_groups": ...}
	# privileges = get_user_privileges()
	# if True in privileges.get("product.groupaccess.configured", [False]):
	# 	allowed["product_groups"] = privileges.get("product.groupaccess.productgroups", [])
	username = get_username()
	if product_group_access_configured(username):
		allowed["product_groups"] = get_allowd_product_groups(username)  # type: ignore[assignment]
	if host_group_access_configured(username):
		allowed["host_groups"] = get_allowd_host_groups(username)  # type: ignore[assignment]
	return allowed


def build_tree(  # pylint: disable=too-many-branches
	group: dict, groups: List[dict], allowed: List[str], processed: List[str] | None = None, default_expanded: bool | None = None
) -> dict:
	if not processed:
		processed = []
	processed.append(group.get("id", ""))

	is_root_group = group["parent"] == "groups" or group["id"] == "clientdirectory"
	group["allowed"] = is_root_group or allowed == ... or group["id"] in allowed

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
			child["id"] = f'{child["id"]};{group["id"]}'
			if child.get("allowed"):
				# Allow parent if child is allowed
				group["allowed"] = True

	return group


def merge_dicts(dict_a: dict, dict_b: dict, path: Optional[List] = None) -> dict:
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
				raise Exception(f"Conflict at { '.'.join(path + [str(key)])}")
		else:
			dict_a[key] = dict_b[key]
	return dict_a


def _get_bool_config_value(config_id: str) -> bool:
	with mysql.session() as session:
		where = text(f"cv.configId='{config_id}'")
		query = select(text("cv.value, cv.isDefault")).select_from(text("CONFIG_VALUE AS cv")).where(where)
		result = session.execute(query)
		result = result.fetchall()
	if result:
		for row in result:
			row_dict = dict(row)
			if row_dict.get("isDefault") == 1 and row_dict.get("value") == "1":
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
	return _get_bool_config_value(f"user.{{{user}}}.privilege.host.all.registered_readonly")


def client_creation_allowed(user: str) -> bool:
	return _get_bool_config_value(f"user.{{{user}}}.privilege.host.createclient")


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


def get_allowd_product_groups(user: str) -> list:
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


def get_allowd_host_groups(user: str) -> list:
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


def get_allowed_clients(user: str) -> list:
	allowed_groups = get_allowd_host_groups(user)
	allowed_clients = []
	with mysql.session() as session:
		for group in allowed_groups:
			query = select(text("otg.objectId AS client")).select_from(text("OBJECT_TO_GROUP AS otg")).where(text(f"otg.groupId='{group}'"))
			otg_result = session.execute(query)
			otg_result = otg_result.fetchall()
			for otg_row in otg_result:
				if otg_row is not None:
					allowed_clients.append(dict(otg_row).get("client"))
	return allowed_clients


def get_allowed_products(user: str) -> list:
	allowed_groups = get_allowd_product_groups(user)
	allowed_products = []
	with mysql.session() as session:
		for group in allowed_groups:
			query = (
				select(text("otg.objectId AS product")).select_from(text("OBJECT_TO_GROUP AS otg")).where(text(f"otg.groupId='{group}'"))
			)
			otg_result = session.execute(query)
			otg_result = otg_result.fetchall()
			for otg_row in otg_result:
				if otg_row is not None:
					allowed_products.append(dict(otg_row).get("product"))
	return allowed_products


def read_only_check(func: Callable) -> Callable:
	@wraps(func)
	def check_user(*args, **kwargs):  # type: ignore[no-untyped-def]
		if user_register():
			username = kwargs.get("request").scope.get("session").username
			if read_only_user(username):
				logger.error("User %s is a read only user.", username)
				raise OpsiApiException(message=f"User {username} is a read only user.", http_status=status.HTTP_403_FORBIDDEN)
		return func(*args, **kwargs)

	return check_user


def filter_depot_access(func: Callable) -> Callable:
	@wraps(func)
	async def check_user(*args, **kwargs):  # type: ignore[no-untyped-def]
		logger.debug("%s - check user", func)
		if user_register():
			username = kwargs.get("request").scope.get("session").username
			if depot_access_configured(username):
				allowed_depots = get_allowd_depots(username)
				selected_depots = kwargs.get("selectedDepots")
				for depot in selected_depots:
					if depot not in allowed_depots:
						selected_depots.remove(depot)
				if selected_depots:
					kwargs["selectedDepots"] = selected_depots
				else:
					kwargs["selectedDepots"] = []
		if asyncio.iscoroutinefunction(func):
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
				raise OpsiApiException(message=f"User {username} is not allowed to create clients.", http_status=status.HTTP_403_FORBIDDEN)
		return func(*args, **kwargs)

	return check_user


def bool_value(value: Union[str, bool]) -> bool:
	if isinstance(value, bool):
		return value
	if value:
		if value.lower() == "[true]" or str(value) == "1" or value.lower() == "true":
			return True
	return False


def unicode_value(value: Union[str, List[str]], delimiter: str = ";") -> List[str]:
	if value and isinstance(value, list):
		return value
	if value and isinstance(value, str):
		if value.startswith('["'):
			return loads(value)  # pylint: disable=no-member
		if value == "[]":
			return [""]
		return value.replace('\\"', '"').split(delimiter)
	return [""]


def unicode_config(value: str, multi_value: bool = False, delimiter: str = ";") -> Union[str, List[str]]:
	if multi_value:
		return unicode_value(value, delimiter)
	if value and isinstance(value, str):
		if value.startswith('["'):
			return loads(value)[0]  # pylint: disable=no-member
		if value == "[]":
			return ""
		return value
	return ""


def get_sub_groups(group: str) -> list:
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
