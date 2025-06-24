#!/usr/bin/env bash

ENV_FILE=/workspace/docker/backend/.env
set -a
source ${ENV_FILE}
set +a

CURRENT_DIR=$(dirname "$(readlink -f "$0")")
echo "Current directory: $CURRENT_DIR"
echo "port ${OPSICONFD_PORT}"

#if [ "$(whoami)" != "${DEV_USER}" ]; then
#  echo "Switching to user ${DEV_USER}"
#  exec sudo -u ${DEV_USER} "$0" "$@"
#fi
echo "Running as $(whoami)"
cd ${CURRENT_DIR}/opsiconfd
/root/.local/bin/uv sync --frozen
cd -

${CURRENT_DIR}/opsiconfd/.venv/bin/python ${CURRENT_DIR}/_run_opsiconfd.py