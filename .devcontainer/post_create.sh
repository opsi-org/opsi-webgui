#!/bin/bash
# post_create.sh - Runs once when the container is created
set -e

echo "[INFO] Running post_create as $(whoami)"

# Install uv
echo "[INFO] Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sudo sh

echo "" >> ~/.bashrc
echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc

# Create opsi directories
echo "[INFO] Creating opsi directories..."
sudo mkdir -p /var/log/opsi
sudo mkdir -p /var/lib/opsi/depot
sudo mkdir -p /var/lib/opsi/public
sudo mkdir -p /var/lib/opsi/repository
sudo mkdir -p /var/lib/opsi/workbench
sudo mkdir -p /var/lib/opsiconfd
sudo mkdir -p /tftpboot
sudo mkdir -p /var/lib/opsiconfd/addons

sudo chown -R $DEV_USER:$DEV_USER /workspace

# Setup services
/workspace/scripts/setup-mysql.sh
/workspace/scripts/setup-redis.sh

# Use license if available
if [ -f /workspace/docker/test.opsilic ]; then
    echo "[INFO] Copying test license..."
    sudo mkdir -p /etc/opsi/licenses
    sudo cp /workspace/docker/test.opsilic /etc/opsi/licenses/test.opsilic
fi

echo "[INFO] post_create completed"
