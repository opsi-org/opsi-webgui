#!/bin/bash
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

sh $SCRIPT_DIR/install_dev_cli.sh

sudo chown $DEV_USER /data


echo "========================================== Link webgui backend"
sudo rm -rf /data/opsiconfd/addons/webgui
sudo cp -r /workspace/backend/addon/webgui /data/opsiconfd/addons/.


# use license if available
if [ -f /workspace/docker/test.opsilic ]; then
    sudo mkdir -p /data/etc/opsi/licenses
    sudo cp /workspace/docker/test.opsilic /data/etc/opsi/licenses/test.opsilic
fi
