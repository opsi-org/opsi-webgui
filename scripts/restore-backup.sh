#!/bin/bash
# restore-backup.sh - Restore OPSI backup from URL
# Usage: ./restore-backup.sh [backup_url]

set -e

BACKUP_URL="${1:-${OPSI_BACKUP_URL:-}}"
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

# Stop opsiconfd before restore (CLI restore runs standalone)
OPSICONFD_WAS_RUNNING=false
if sudo supervisorctl status opsiconfd 2>/dev/null | grep -q RUNNING; then
    OPSICONFD_WAS_RUNNING=true
    echo "[INFO] Stopping opsiconfd for restore..."
    sudo supervisorctl stop opsiconfd >/dev/null 2>&1
    sleep 2
fi

echo "[INFO] Restoring backup..."
cd /workspace/docker/opsiconfd
.venv/bin/opsiconfd restore "$BACKUP_FILE" \
    --server-id=local \
    --quiet \
    || echo "[WARN] Backup restore may have had issues - check logs"

# Restart opsiconfd if it was running before
if [ "$OPSICONFD_WAS_RUNNING" = true ]; then
    echo "[INFO] Starting opsiconfd..."
    sudo supervisorctl start opsiconfd >/dev/null 2>&1
fi

# Clean up
rm -f "$BACKUP_FILE"

echo "[INFO] Backup restore complete"
