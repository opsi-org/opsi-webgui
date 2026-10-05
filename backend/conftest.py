# This file is part of the OPSI-WebGUI application.
# The OPSI-WebGUI backend is an addon for opsiconfd.
# https://opsi.org/en/
#
# Copyright (c) UIB GmbH info@uib.de 2026
# All rights reserved.
# License: AGPL-3.0

"""Root conftest for backend tests of the OPSI-WebGUI addon."""

import sys

# Keep only the executable name; opsiconfd's configargparse can then initialise
# cleanly without seeing "--rootdir", "-v" etc.
sys.argv = sys.argv[:1]
