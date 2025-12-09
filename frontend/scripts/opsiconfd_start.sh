#!/bin/bash
set -e
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Starting opsiconfd start script"
echo "Current working directory: $(pwd)"
echo "Environment variables:"
echo "  OPSI_ADMINUSER=${OPSI_ADMINUSER}"
echo "  OPSI_ADMINPW=${OPSI_ADMINPW:+***}"


cd opsiconfd

echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> start opsiconfd"
uv run opsiconfd  -c tests/data/default-opsiconfd.conf  -l6 &
sleep 60
curl -I "https://${OPSI_ADMINUSER}:${OPSI_ADMINPW}@localhost:4447/admin"
cd -