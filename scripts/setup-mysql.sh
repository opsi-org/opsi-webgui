#!/usr/bin/env sh
# setup-mysql.sh - Verify MySQL/MariaDB is ready (init is handled by entrypoint)
echo "[INFO] Verifying MySQL connection..."
echo "[INFO]   Database: ${MYSQL_DATABASE}"
echo "[INFO]   User: ${MYSQL_USER}"

for i in $(seq 1 30); do
    if nc -z localhost 3306 2>/dev/null; then
        echo "[INFO] MySQL is ready"
        exit 0
    fi
    sleep 1
done

echo "[ERROR] MySQL not available after 30s"
exit 1
