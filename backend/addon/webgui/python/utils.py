# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui utils
"""
from functools import wraps
from operator import and_
from typing import List, Optional

from fastapi import Query, status
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


def read_only_user(user):
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


def get_allowd_depots(user):
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
		logger.devel("%s - check user", func)
		if user_register():
			username = kwargs.get("request").scope.get("session").user_store.username
			logger.devel(username)
			allowed_depots = get_allowd_depots(username)
			selected_depots = kwargs.get("selectedDepots")
			for depot in selected_depots:
				logger.devel("depot %s", depot)
				logger.devel(depot not in selected_depots)
				if depot not in allowed_depots:
					selected_depots.remove(depot)
			if selected_depots:
				kwargs["selectedDepots"] = selected_depots
			else:
				kwargs["selectedDepots"] = None
			logger.devel(kwargs)
		return func(*args, **kwargs)
	return check_user
