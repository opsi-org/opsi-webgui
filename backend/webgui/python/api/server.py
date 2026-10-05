# This file is part of the OPSI-WebGUI application.
# The OPSI-WebGUI backend is an addon for opsiconfd.
# https://opsi.org/en/
#
# Copyright (c) UIB GmbH info@uib.de 2026
# All rights reserved.
# License: AGPL-3.0

"""Server-related API routes for the OPSI-WebGUI addon."""

from fastapi import APIRouter, Request, status
from opsiconfd.config import config
from opsiconfd.rest import OpsiApiException, RESTResponse, rest_api

from ..logger import get_logger
from ..utils import backend

api_router = APIRouter()

logger = get_logger()


@api_router.get("/api/opsidata/server/diagnostic")
@rest_api
async def get_diagnostic_data(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	get server diagnostic data
	"""

	try:
		diagnostic_data = await backend.service_getDiagnosticData()
	except Exception as err:  # pylint: disable=broad-except
		logger.error("Could not get diagnostic data.")
		logger.error(err)
		raise OpsiApiException(
			message="Could not get diagnostic data.",
			http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			error=err,
		) from err

	return RESTResponse(http_status=200, data=diagnostic_data)


@api_router.get("/api/opsidata/server/disabled-features")
@rest_api
def get_server_disabled_freatures(request: Request) -> RESTResponse:  # pylint: disable=unused-argument
	"""
	get disabled server features
	"""

	return RESTResponse(http_status=200, data=config.disabled_features)
