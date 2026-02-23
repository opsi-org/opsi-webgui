#!/bin/sh
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

echo "*** Setup /etc/hosts ***"

echo "127.0.0.1       ${OPSI_HOSTNAME} $(hostname) mysql redis grafana localhost" > /tmp/hosts
grep -v "127.0.0.1" /etc/hosts | grep -v ${OPSI_HOSTNAME} >> /tmp/hosts
sudo cp /tmp/hosts /etc/hosts
rm /tmp/hosts
