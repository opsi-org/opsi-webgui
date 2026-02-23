#!/bin/sh
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

echo "*** Setup grafana ***"

ORG_ID=1
USER_ID=2
echo "GF_SECURITY_ADMIN_USER = ${GF_SECURITY_ADMIN_USER}"
echo "GF_SECURITY_ADMIN_PASSWORD = ${GF_SECURITY_ADMIN_PASSWORD}"
echo "GF_INSTALL_PLUGINS = ${GF_INSTALL_PLUGINS}"
echo "GF_SERVER_HTTP_PORT = ${GF_SERVER_HTTP_PORT:-3000}"

[ -d /var/run/grafana ] || sudo install -m 755 -o grafana -g root -d /var/run/grafana
sudo chmod u+rwX,g+rwX,o+rwX -R /var/lib/grafana

# grafana-cli --homepath "/usr/share/grafana" admin reset-admin-password $GF_SECURITY_ADMIN_PASSWORD

echo "* Stopping grafana server"
sudo supervisorctl stop grafana-server

echo "* Configure grafana server"
sudo grep -v "^root_url" /etc/grafana/grafana.ini > /tmp/grafana.ini
sudo mv /tmp/grafana.ini /etc/grafana/grafana.ini
sudo sed -i '/^;root_url/!b;n;croot_url = %(protocol)s://%(domain)s:%(http_port)s/grafana' /etc/grafana/grafana.ini

echo "* Installing grafana plugins"
sudo grafana-cli plugins install $GF_INSTALL_PLUGINS

timeout_seconds=30
echo "* Starting and waiting for grafana server (timeout ${timeout_seconds}s)"
sudo supervisorctl start grafana-server
GH=${GRAFANA_HOST:-localhost}
while [ $timeout_seconds -gt 0 ]; do
	nc -v -z -w3 $GH ${GF_SERVER_HTTP_PORT:-3000} >/dev/null 2>&1
	if [ $? -eq 0 ]; then
		break
	fi
	timeout_seconds=$((timeout_seconds - 1))
	sleep 1
done
grafana_status=$(nc -v -z -w3 $GH ${GF_SERVER_HTTP_PORT:-3000} >/dev/null 2>&1; echo $?)
echo "Grafana is up: $grafana_status"