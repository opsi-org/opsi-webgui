#!/bin/bash
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
# running script as user:
echo "current user: $(whoami)"

rm -f /workspace/installer.sh*

sh $SCRIPT_DIR/install_dev_cli.sh

sudo chown $DEV_USER /data
# no need to install it twice....

#MIN_VERSION=1.33.2 # will be updated to latest version, just indicate the required minimum version
#wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_${MIN_VERSION}.tar.gz
#tar -xf opsi-dev-tools_linux_x64_${MIN_VERSION}.tar.gz

#mv opsi-dev-tool opsi-dev-cli
#./opsi-dev-cli self install # installs into ~/.local/bin
#./opsi-dev-cli self upgrade
#opsi-dev-tool git-hooks install
#rm -f opsi-dev-tools_linux_x64_${MIN_VERSION}.tar.gz

echo "========================================== Install webgui dependencies"
cd /workspace/frontend/
npm i

# npm i -D @playwright/test
# npx playwright install
# npx playwright install-deps
echo "========================================== Link webgui backend"

sudo rm -rf /data/opsiconfd/addons/webgui
sudo cp -r /workspace/backend/addon/webgui /data/opsiconfd/addons/.


# use license if available
if [ -f /workspace/docker/test.opsilic ]; then
    sudo mkdir -p /data/etc/opsi/licenses
    sudo cp /workspace/docker/test.opsilic /data/etc/opsi/licenses/test.opsilic
fi
