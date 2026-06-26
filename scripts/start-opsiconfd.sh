#!/bin/bash
# Script used by supervisor to start opsiconfd
set -e

if [ -f /workspace/docker/.env ]; then
    set -a
    set +e
    source /workspace/docker/.env 2>/dev/null
    set -e
    set +a
fi

cd /workspace/docker/opsiconfd

# Wait for MySQL to be available
for i in $(seq 1 30); do
    nc -z localhost 3306 2>/dev/null && break
    sleep 1
done

exec uv run opsiconfd \
    --log-level-stderr=6 \
    --static-dir=/workspace/docker/opsiconfd/opsiconfd_data/static \
    --workers=1
