#!/bin/sh
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

echo "*** Setup redis ***"

sudo sed -i s'/^daemonize yes/daemonize no/' /etc/redis/redis.conf
