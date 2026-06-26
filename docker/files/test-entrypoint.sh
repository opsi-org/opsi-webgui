#!/usr/bin/env bash

set -euo pipefail

OPSI_BACKUP_URL="${OPSI_BACKUP_URL:-https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json}"
OPSICONFD_DIR="${OPSICONFD_DIR:-/workspace/docker/opsiconfd}"

echo "[test-entrypoint] Disabling incompatible in-container RedisTimeSeries module..."
sed -i 's|^[[:space:]]*loadmodule[[:space:]]\+/usr/lib/redis/modules/redistimeseries.so|# disabled-in-tests (ABI-incompatible with redis 8): &|' /etc/redis/redis.conf || true

echo "[test-entrypoint] Starting supervisor (redis + mariadb)..."
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf &
SUPERVISOR_PID=$!

echo "[test-entrypoint] Waiting for MariaDB..."
for i in $(seq 1 60); do
    nc -z localhost 3306 2>/dev/null && break
    [ "$i" -eq 60 ] && { echo "[test-entrypoint] ERROR: MariaDB did not start"; exit 1; }
    sleep 1
done

echo "[test-entrypoint] Initializing MySQL (idempotent)..."
mysql -u root -e "CREATE USER IF NOT EXISTS '${MYSQL_USER:-opsi}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD:-opsi}';" 2>/dev/null || true
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER:-opsi}'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null || true
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE:-opsi};" 2>/dev/null || true

if [ -d "$OPSICONFD_DIR" ]; then
    echo "[test-entrypoint] Preparing opsiconfd virtualenv in $OPSICONFD_DIR..."
    (
        cd "$OPSICONFD_DIR"
        # NOTE: here .venv is a Docker *named volume* mount point, so it can never
        # be `rm -rf`-ed (fails with "Device or resource busy"). Clear its CONTENTS
        # instead, otherwise `set -e` would kill the entrypoint -> container exits 1.
        if [ -d .venv ] && ! .venv/bin/python --version >/dev/null 2>&1; then
            echo "[test-entrypoint] Clearing broken/empty .venv contents (mount point can't be removed)..."
            find .venv -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
        fi
        uv sync --frozen || uv sync || echo "[test-entrypoint] WARN: uv sync failed"
        rm -f "$OPSICONFD_DIR/static"
        ln -sf "$OPSICONFD_DIR/opsiconfd_data/static" "$OPSICONFD_DIR/static" 2>/dev/null || true
    )
else
    echo "[test-entrypoint] ERROR: $OPSICONFD_DIR not found — opsiconfd cannot start."
    echo "[test-entrypoint]        In CI the job must clone opsiconfd into docker/opsiconfd."
fi

MARKER=/var/lib/opsi/.backup-restored
if [ ! -f "$MARKER" ]; then
    echo "[test-entrypoint] Restoring backup: $OPSI_BACKUP_URL"
    if /workspace/scripts/restore-backup.sh "$OPSI_BACKUP_URL"; then
        sudo touch "$MARKER" 2>/dev/null || touch "$MARKER" || true
    else
        echo "[test-entrypoint] WARN: backup restore failed — tests may run against empty data"
    fi
fi

echo "[test-entrypoint] Starting opsiconfd..."
supervisorctl start opsiconfd >/dev/null 2>&1 || sudo supervisorctl start opsiconfd >/dev/null 2>&1 || true

echo "[test-entrypoint] Waiting for opsiconfd to be healthy..."
for i in $(seq 1 90); do
    if curl -sk -o /dev/null https://localhost:4447/admin/healthy 2>/dev/null; then
        echo "[test-entrypoint] opsiconfd is ready."
        break
    fi
    sleep 2
done

wait $SUPERVISOR_PID
