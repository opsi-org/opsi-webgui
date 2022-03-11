# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui utils
"""
from typing import Optional, List

from sqlalchemy import select, text
from fastapi import Query

from opsiconfd.application.utils import get_configserver_id, parse_list
from opsiconfd.backend import get_mysql as backend_get_mysql
from opsiconfd.logging import logger

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

def build_tree(group, groups, allowed, processed=None, selection=None):
	# logger.devel("build_tree")
	# logger.devel(group)
	# logger.devel(groups)
	if not processed:
		processed = []
	processed.append(group["id"])

	is_root_group = group["parent"] == "#"  # or group["id"] == "clientdirectory"
	group["allowed"] = is_root_group or allowed == ... or group["id"] in allowed

	children = {}
	for grp in groups:
		if grp["id"] == group["id"]:
			continue
		if grp["parent"] == group["id"]:
			if grp["id"] in processed:
				logger.error("Loop: %s %s", grp["id"], processed)
			else:
				children[grp["id"]] = build_tree(grp, groups, allowed, processed, selection=selection)
			# logger.devel("isDefaultExpanded: %s, %s", grp["id"], grp.get("isDefaultExpanded"))
			# logger.devel("selection: %s", selection)
			if selection and grp.get("isDefaultExpanded"):
				group["isDefaultExpanded"] = True
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
