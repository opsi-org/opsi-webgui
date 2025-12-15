#!/bin/bash
set -e
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Starting opsiconfd start script"
echo "Current working directory: $(pwd)"
echo "Environment variables:"
echo "  OPSI_ADMIN_USER=${OPSI_ADMIN_USER}"
echo "  OPSI_ADMIN_PASSWORD=${OPSI_ADMIN_PASSWORD:+***}"


cd opsiconfd

echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start opsiconfd"
uv run opsiconfd  -c tests/data/default-opsiconfd.conf  -l6 &
sleep 60
curl -I "https://${OPSI_ADMIN_USER}:${OPSI_ADMIN_PASSWORD}@localhost:4447/admin"
cd -