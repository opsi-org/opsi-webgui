#!/bin/bash
# Script used by supervisor to start opsiconfd
set -e

# Load environment variables
if [ -f /workspace/docker/.env ]; then
    set -a
    source /workspace/docker/.env
    set +a
fi

cd /workspace/docker/opsiconfd
echo "[INFO] Waiting for services..."
sleep 3

uv sync --quiet 2>/dev/null || uv sync

# Start opsiconfd
exec uv run opsiconfd \
    --log-level-stderr=6 \
    --static-dir=/workspace/docker/opsiconfd/opsiconfd_data/static \
    --workers=1
