#!/bin/bash
# post_start.sh - Runs every time the container starts
set -e

echo "[INFO] Running post_start as $(whoami)"

# Setup /etc/hosts (runs on every start in case hostname changed)
/workspace/scripts/setup-hosts.sh

# Fetch test license
echo "[INFO] Fetching test license..."
sudo mkdir -p /etc/opsi/licenses
sudo wget --header="Authorization: Bearer ${OPSILICSRV_TOKEN}" \
    "https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiconfd-addon-dev-container-webgui" \
    -O /etc/opsi/licenses/test.opsilic 2>/dev/null || true

# Upgrade opsi-dev-tool (2>/dev/null suppresses stderr - errors are silently ignored)
echo "[INFO] Upgrading opsi-dev-tool..."
sudo opsi-dev-tool --self-upgrade 2>/dev/null || true

# Start services
echo "[INFO] Starting services..."
sudo supervisorctl status redis-server | grep RUNNING >/dev/null || sudo supervisorctl start redis-server
sudo supervisorctl status mariadb-server | grep RUNNING >/dev/null || sudo supervisorctl start mariadb-server

sudo chown -R ${DEV_USER:-$USER} /workspace
sudo opsi-set-rights 2>/dev/null || true

# Clone/update opsiconfd
echo "[INFO] Setting up opsiconfd..."
OPSICONFD_DIR=/workspace/docker/opsiconfd
if [ -d "$OPSICONFD_DIR/.git" ]; then
    cd $OPSICONFD_DIR
    git checkout -- . 2>/dev/null || true
    git pull 2>/dev/null || true
else
    git clone git@gitlab.uib.gmbh:uib/opsiconfd.git $OPSICONFD_DIR 2>/dev/null || \
        echo "[WARN] Could not clone opsiconfd - you may need to clone manually or the dir already exists"
fi

# Sync opsiconfd dependencies
echo "[INFO] Syncing opsiconfd dependencies with Python 3.14.0..."
cd $OPSICONFD_DIR
rm -rf .venv/ 2>/dev/null || true
uv sync --python 3.14.0

# Symlink static directory
echo "[INFO] Creating static directory symlink..."
rm -rf $OPSICONFD_DIR/static 2>/dev/null || true
ln -sf $OPSICONFD_DIR/opsiconfd_data/static $OPSICONFD_DIR/static

# Start opsiconfd
echo ""
echo "[INFO] Starting opsiconfd ..."
sudo supervisorctl start opsiconfd

echo ""
echo "========================================"
echo "[INFO] Setup completed."
echo ""
echo "  View logs:"
echo "    sudo tail -f /var/log/opsi/opsiconfd/stderr.log"
echo ""
echo "  Test endpoints:"
echo "    API docs: https://localhost:4447/docs"
echo "    opsi-WebGUI addon: https://localhost:4447/addons/${ADDON_ID:-webgui}/api/user/opsiserver"
echo ""
echo "  To restore a backup:"
echo "    /workspace/scripts/restore-backup.sh <backup_url>"
echo "========================================"
