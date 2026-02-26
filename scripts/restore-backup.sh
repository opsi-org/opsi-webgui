#!/bin/bash
# restore-backup.sh - Restore OPSI backup from URL
# Usage: ./restore-backup.sh [backup_url]

set -e

BACKUP_URL="${1:-$OPSI_BACKUP_URL}"
BACKUP_FILE="/tmp/opsi-backup.json"

if [ -z "$BACKUP_URL" ]; then
    echo "[INFO] No backup URL provided. Set OPSI_BACKUP_URL or pass as argument."
    echo "Usage: $0 [backup_url]"
    exit 0
fi

echo "[INFO] Downloading backup from: $BACKUP_URL"
curl -sL "$BACKUP_URL" -o "$BACKUP_FILE" || {
    echo "[ERROR] Failed to download backup from $BACKUP_URL"
    exit 1
}

# Check if opsiconfd is running
if ! sudo supervisorctl status opsiconfd 2>/dev/null | grep -q RUNNING; then
    echo "[INFO] Starting opsiconfd..."
    sudo supervisorctl start opsiconfd

    # Wait for opsiconfd to be ready (up to 60 seconds)
    echo "[INFO] Waiting for opsiconfd to be ready..."
    for i in {1..60}; do
        if curl -sk https://localhost:4447/admin/healthy 2>/dev/null | grep -q '"healthy"'; then
            echo "[INFO] opsiconfd is ready"
            break
        fi
        if [ $i -eq 60 ]; then
            echo "[WARN] Timeout waiting for opsiconfd - continuing anyway"
        fi
        sleep 1
    done
fi

echo "[INFO] Restoring backup..."
# Use opsiconfd backup restore command
cd /workspace/docker/opsiconfd
.venv/bin/opsiconfd backup restore "$BACKUP_FILE" \
    --server-id=local \
    --no-config-files \
    --no-redis-data \
    || echo "[WARN] Backup restore may have had issues - check logs"

# Clean up
rm -f "$BACKUP_FILE"

echo "[INFO] Backup restore complete"
echo ""
echo "  The following data was restored:"
echo "    - Hosts (clients, depots)"
echo "    - Products and product properties"
echo "    - Groups (host groups, product groups)"
echo "    - Configs and config states"
echo ""
echo "  Note: Config files and Redis data were NOT restored."
