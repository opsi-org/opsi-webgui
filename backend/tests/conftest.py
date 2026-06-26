# -*- coding: utf-8 -*-

# opsiconfd is part of the desktop management solution opsi http://www.opsi.org
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0
"""
conftest - pytest configuration for backend integration tests.
"""

import os
import sys
import warnings

import pytest
import urllib3

urllib3.disable_warnings()
warnings.filterwarnings("ignore", category=urllib3.exceptions.InsecureRequestWarning)

# Add tests dir to path so we can import utils without package structure
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# to avoid test errors with "fixture 'config' not found".
from utils import (  # noqa: E402, F401
    config,
    create_check_data,
    database_connection,
)


@pytest.hookimpl()
def pytest_configure(config):
    config.option.asyncio_mode = "auto"
    config.addinivalue_line(
        "filterwarnings",
        "ignore:Unverified HTTPS request is being made to host.*:urllib3.exceptions.InsecureRequestWarning",
    )


@pytest.fixture(autouse=True)
def disable_insecure_request_warning():
    warnings.simplefilter("ignore", urllib3.exceptions.InsecureRequestWarning)
