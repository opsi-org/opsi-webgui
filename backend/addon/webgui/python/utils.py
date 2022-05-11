# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui utils
"""
from functools import wraps
from json import JSONDecodeError, loads
from operator import and_
from typing import List, Optional

from fastapi import Query, status
from opsiconfd import contextvar_client_session
from opsiconfd.application.utils import (
	bool_product_property,
	get_configserver_id,
	parse_list,
)
from opsiconfd.backend import get_mysql as backend_get_mysql
from opsiconfd.logging import logger
from opsiconfd.rest import OpsiApiException
from sqlalchemy import select, text


def get_mysql():
	try:
		return backend_get_mysql()
	except RuntimeError as err:
		return None


mysql = get_mysql()


def get_depot_of_client(client):
	params = {}
	with mysql.session() as session:

		params["client"] = client
		where = text("cs.configId='clientconfig.depot.id' AND cs.objectId = :client")

		query = select(text("cs.objectId AS client, cs.values"))\
			.select_from(text("CONFIG_STATE AS cs"))\
			.where(where)

		result = session.execute(query, params)
		result = result.fetchone()

		if result:
			depot = dict(result).get("values")[2:-2]
		else:
			depot = get_configserver_id()
		return depot


def parse_hosts_list(hosts: List[str] = Query(None)) -> Optional[List]:
	return parse_list(hosts)


def parse_depot_list(selectedDepots: List[str] = Query(None)) -> Optional[List]: # pylint: disable=invalid-name
	return parse_list(selectedDepots)


def parse_client_list(selectedClients: List[str] = Query(None)) -> Optional[List]: # pylint: disable=invalid-name
	return parse_list(selectedClients)


def parse_selected_list(selected: List[str] = Query(None)) -> Optional[List]: # pylint: disable=invalid-name
	return parse_list(selected)


def get_username():
	client_session = contextvar_client_session.get()
	if not client_session:
		raise RuntimeError("Session invalid")
	return client_session.user_store.username



def get_user_privileges():
	username = get_username()
	privileges = {}
	# mysql = get_mysql()  # pylint: disable=invalid-name
	filter_ = {"config_id_filter": f"user.{{{username}}}.privilege.%"}
	with mysql.session() as session:
		for row in session.execute(
			"""
			SELECT
				cv.configId,
				cv.value
			FROM
				CONFIG_VALUE AS cv
			WHERE
				cv.configId LIKE :config_id_filter AND cv.isDefault=1
			GROUP BY
				cv.configId
			ORDER BY
				cv.configId
			""",
			filter_,
		).fetchall():
			try:  # pylint: disable=loop-try-except-usage
				priv = ".".join(row["configId"].split(".")[3:])
				privileges[priv] = [val for val in loads(row["value"]) if val != ""]  # pylint: disable=loop-invariant-statement
			except JSONDecodeError as err:
				logger.error("Failed to parse privilege %s: %s", row, err)

		return privileges


def get_allowed_objects():
	allowed = {"product_groups": ..., "host_groups": ...}
	# privileges = get_user_privileges()
	# if True in privileges.get("product.groupaccess.configured", [False]):
	# 	allowed["product_groups"] = privileges.get("product.groupaccess.productgroups", [])
	username = get_username()
	if host_group_access_configured(username):
		allowed["host_groups"] = get_allowd_host_groups(username)
	return allowed


def build_tree(group, groups, allowed, processed=None, default_expanded=None):
	if not processed:
		processed = []
	processed.append(group["id"])

	is_root_group = group["parent"] == "#"  # or group["id"] == "clientdirectory"
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
	else:
		if group["type"] == "HostGroup":
			group["children"] = None

	if not is_root_group and group.get("children"):
		for child in group["children"].values():
			# Correct id for webgui
			child["id"] = f'{child["id"]};{group["id"]}'
			if child.get("allowed"):
				# Allow parent if child is allowed
				group["allowed"] = True

	return group

def merge_dicts(dict_a: dict, dict_b: dict, path=None) -> dict:
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


def user_register() -> bool:
	with mysql.session() as session:

		where = text("cv.configId='user.{}.register'")

		query = select(text("cv.value, cv.isDefault"))\
			.select_from(text("CONFIG_VALUE AS cv"))\
			.where(where)

		result = session.execute(query)
		result = result.fetchall()

	if result:
		for row in result:
			row_dict = dict(row)
			if row_dict.get("isDefault") == 1 and row_dict.get("value") == "1":
				return True
	return False


def host_group_access_configured(user: str) -> bool:
	with mysql.session() as session:

		where = text("cv.configId='user.{" + user + "}.privilege.host.groupaccess.configured'")

		query = select(text("cv.value, cv.isDefault"))\
			.select_from(text("CONFIG_VALUE AS cv"))\
			.where(where)

		result = session.execute(query)
		result = result.fetchall()

	if result:
		for row in result:
			row_dict = dict(row)
			if row_dict.get("isDefault") == 1 and row_dict.get("value") == "1":
				return True
	return False


def depot_access_configured(user: str) -> bool:
	with mysql.session() as session:

		where = text("cv.configId='user.{" + user + "}.privilege.host.depotaccess.configured'")

		query = select(text("cv.value, cv.isDefault"))\
			.select_from(text("CONFIG_VALUE AS cv"))\
			.where(where)

		result = session.execute(query)
		result = result.fetchall()

	if result:
		for row in result:
			row_dict = dict(row)
			if row_dict.get("isDefault") == 1 and row_dict.get("value") == "1":
				return True
	return False


def read_only_user(user: str) -> bool:
	with mysql.session() as session:
		where = text("cv.configId='user.{" + user + "}.privilege.host.all.registered_readonly'")
		query = select(text("cv.value, cv.isDefault"))\
			.select_from(text("CONFIG_VALUE AS cv"))\
			.where(where)
		result = session.execute(query)
		result = result.fetchall()

	if result:
		for row in result:
			row_dict = dict(row)
			if row_dict.get("isDefault") == 1 and row_dict.get("value") == "1":
				return True
	return False


def client_creation_allowed(user: str) -> bool:
	with mysql.session() as session:
		where = text("cv.configId='user.{" + user + "}.privilege.host.createclient'")
		query = select(text("cv.value, cv.isDefault"))\
			.select_from(text("CONFIG_VALUE AS cv"))\
			.where(where)
		result = session.execute(query)
		result = result.fetchall()

	if result:
		for row in result:
			row_dict = dict(row)
			if row_dict.get("isDefault") == 1 and row_dict.get("value") == "1":
				return True
	return False


def get_allowd_depots(user: str) -> list:
	with mysql.session() as session:
		where = text("cv.configId='user.{" + user + "}.privilege.host.depotaccess.depots'")
		where = and_(where, text("cv.isDefault=1"))
		query = select(text("cv.value"))\
			.select_from(text("CONFIG_VALUE AS cv"))\
			.where(where)
		result = session.execute(query)
		result = result.fetchall()
		depots = []
		for row in result:
			depots.append(dict(row).get("value"))
	return depots


def get_allowd_host_groups(user: str) -> list:
	with mysql.session() as session:
		where = text("cv.configId='user.{" + user + "}.privilege.host.groupaccess.hostgroups'")
		where = and_(where, text("cv.isDefault=1"))
		query = select(text("cv.value"))\
			.select_from(text("CONFIG_VALUE AS cv"))\
			.where(where)
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
			query = select(text("otg.objectId AS client"))\
				.select_from(text("OBJECT_TO_GROUP AS otg"))\
				.where(text(f"otg.groupId='{group}'"))
			otg_result = session.execute(query)
			otg_result = otg_result.fetchall()
			for otg_row in otg_result:
				if otg_row is not None:
					allowed_clients.append(dict(otg_row).get("client"))
	return allowed_clients

def read_only_check(func):
	@wraps(func)
	def check_user(*args, **kwargs):
		if user_register():
			username = kwargs.get("request").scope.get("session").user_store.username
			if read_only_user(username):
				logger.error("User %s is a read only user.", username)
				raise OpsiApiException(
					message=f"User {username} is a read only user.", http_status=status.HTTP_403_FORBIDDEN
				)
		return func(*args, **kwargs)
	return check_user


def filter_depot_access(func):
	@wraps(func)
	def check_user(*args, **kwargs):
		logger.debug("%s - check user", func)
		if user_register():
			username = kwargs.get("request").scope.get("session").user_store.username
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
		return func(*args, **kwargs)
	return check_user


def check_client_creation_rights(func):
	@wraps(func)
	def check_user(*args, **kwargs):
		if user_register():
			username = kwargs.get("request").scope.get("session").user_store.username
			if not client_creation_allowed(username):
				logger.error("User %s is not allowed to create clients.", username)
				raise OpsiApiException(
					message=f"User {username} is not allowed to create clients.", http_status=status.HTTP_403_FORBIDDEN
				)
		return func(*args, **kwargs)
	return check_user
