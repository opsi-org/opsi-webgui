#!/bin/bash
# post_start.sh - Runs every time the container starts (keep this FAST)
# This is the ONLY place that starts services. No duplicates.
set -e

echo "[post_start] Running as $(whoami)"

# Setup /etc/hosts
/workspace/scripts/setup-hosts.sh

# Fetch test license (non-blocking, fail-safe)
if [ -n "${OPSILICSRV_TOKEN:-}" ]; then
    sudo mkdir -p /etc/opsi/licenses
    sudo curl -sfL -H "Authorization: Bearer ${OPSILICSRV_TOKEN}" \
        "https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiconfd-addon-dev-container-webgui" \
        -o /etc/opsi/licenses/test.opsilic 2>/dev/null || true
fi

# Ensure infra services are running (entrypoint starts them, this is just a safety check)
sudo supervisorctl start redis-server >/dev/null 2>&1 || true
sudo supervisorctl start mariadb-server >/dev/null 2>&1 || true

sudo opsi-set-rights >/dev/null 2>&1 || true

# Restore backup on first run only (marker file prevents re-running)
# Do this BEFORE starting opsiconfd since CLI restore runs standalone
BACKUP_MARKER=/workspace/docker/.backup-restored
if [ ! -f "$BACKUP_MARKER" ]; then
    OPSI_BACKUP_URL="${OPSI_BACKUP_URL:-https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json}"
    echo "[post_start] Restoring backup (first run)..."
    /workspace/scripts/restore-backup.sh "$OPSI_BACKUP_URL" && touch "$BACKUP_MARKER" || \
        echo "[WARN] Backup restore failed - run manually: /workspace/scripts/restore-backup.sh"
fi

# Start opsiconfd (only if not already running)
if ! sudo supervisorctl status opsiconfd 2>/dev/null | grep -q RUNNING; then
    echo "[post_start] Starting opsiconfd..."
    sudo supervisorctl start opsiconfd
fi

# Wait for opsiconfd to be healthy (responds to requests)
for i in $(seq 1 90); do
    if curl -sk -o /dev/null -w '%{http_code}' https://localhost:4447/admin/healthy 2>/dev/null | grep -q '[2-4]'; then
        echo "[post_start] opsiconfd is ready."
        break
    fi
    sleep 1
done

echo ""
echo "========================================"
echo " opsi-webgui Dev Container Ready"
echo "========================================"
echo ""
echo " Endpoints:"
echo "   API docs:     https://localhost:4447/docs"
echo "   WebGUI API:   https://localhost:4447/addons/${ADDON_ID:-webgui}/api/user/opsiserver"
echo ""
echo " opsiconfd management:"
echo "   sudo supervisorctl status"
echo "   sudo supervisorctl restart opsiconfd"
echo "   sudo supervisorctl stop opsiconfd"
echo "   sudo tail -f /var/log/opsi/opsiconfd/stderr.log"
echo ""
echo " Frontend development:"
echo "   cd /workspace/frontend"
echo "   pnpm install"
echo "   pnpm dev"
echo ""
echo " Restore backup (re-run):"
echo "   rm /workspace/docker/.backup-restored && /workspace/scripts/restore-backup.sh"
echo "========================================"
