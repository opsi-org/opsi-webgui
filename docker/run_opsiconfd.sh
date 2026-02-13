#!/usr/bin/env bash

ENV_FILE=/workspace/docker/.env
set -a
source ${ENV_FILE}
set +a

CURRENT_DIR=$(dirname "$(readlink -f "$0")")
echo "Current directory: $CURRENT_DIR"
echo "port ${OPSICONFD_PORT}"
echo "mysql ${MYSQL_OPSICONFD_MYSQL_INTERNAL_URL}"
echo "redis ${REDIS_OPSICONFD_REDIS_INTERNAL_URL}"

echo "currently ignore mysql create table error"
echo "Running as $(whoami)"
cd ${CURRENT_DIR}/opsiconfd
/root/.local/bin/uv sync --frozen --group dev
cd -

${CURRENT_DIR}/opsiconfd/.venv/bin/python ${CURRENT_DIR}/_run_opsiconfd.py