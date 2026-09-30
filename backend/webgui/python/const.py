# This file is part of the OPSI-WebGUI application.
# The OPSI-WebGUI backend is an addon for opsiconfd.
# https://opsi.org/en/
#
# Copyright (c) UIB GmbH info@uib.de 2026
# All rights reserved.
# License: AGPL-3.0

"""
addon webgui - const
"""

from fastapi import APIRouter

ADDON_ID = "webgui"
ADDON_NAME = "OPSI-WebGUI"
ADDON_VERSION = "4.3.48.15"

# Upper bounds for id lists accepted by batch/action endpoints to avoid resource exhaustion
MAX_IDS_PER_REQUEST = 1000
MAX_ID_COMBINATIONS = 10000

test_router = APIRouter()
