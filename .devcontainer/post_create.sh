#!/bin/bash
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Running post_create as $(whoami)"

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sudo sh
uv self update

echo "\n" >> ~/.bashrc
echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc

# Create opsi directories
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
/workspace/scripts/setup-hosts.sh
/workspace/scripts/setup-mysql.sh
/workspace/scripts/setup-redis.sh

# Use license if available
if [ -f /workspace/docker/test.opsilic ]; then
    sudo mkdir -p /etc/opsi/licenses
    sudo cp /workspace/docker/test.opsilic /etc/opsi/licenses/test.opsilic
fi
