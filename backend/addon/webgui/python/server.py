# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2020-2021 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
webgui server methods
"""

from fastapi import APIRouter, Request, status


from opsiconfd.logging import logger
from opsiconfd.config import config
from opsiconfd.rest import (
	OpsiApiException,
	RESTResponse,
	rest_api,
)

from .utils import backend


server_router = APIRouter()


@server_router.get("/api/opsidata/server/health")
@rest_api
def get_health_check(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	get server health
	"""

	try:
		server_health = backend.service_healthCheck()

	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not get health check.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not get health check.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err

	return RESTResponse(http_status=200, data=server_health)


@server_router.get("/api/opsidata/server/diagnostic")
@rest_api
def get_diagnostic_data(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	get server diagnostic data
	"""

	try:
		diagnostic_data = backend.service_getDiagnosticData()
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not get diagnostic data.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not get diagnostic data.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err

	return RESTResponse(http_status=200, data=diagnostic_data)


@server_router.get("/api/opsidata/server/disabled-features")
@rest_api
def get_server_disabled_freatures(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	get disabled server features
	"""

	return RESTResponse(http_status=200, data=config.disabled_features)

