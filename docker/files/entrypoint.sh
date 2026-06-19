#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] Starting supervisor (redis + mariadb)..."
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf &
SUPERVISOR_PID=$!

# Wait for MariaDB with timeout
echo "[entrypoint] Waiting for MariaDB..."
for i in $(seq 1 30); do
    if nc -z localhost 3306 2>/dev/null; then
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "[entrypoint] ERROR: MariaDB failed to start within 30s"
        exit 1
    fi
    sleep 1
done

# Initialize MySQL database and user (idempotent)
echo "[entrypoint] Initializing MySQL..."
mysql -u root -e "CREATE USER IF NOT EXISTS '${MYSQL_USER:-opsi}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD:-opsi}';" 2>/dev/null
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER:-opsi}'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE:-opsi};" 2>/dev/null

echo "[entrypoint] Services ready."

# Keep container running
wait $SUPERVISOR_PID
