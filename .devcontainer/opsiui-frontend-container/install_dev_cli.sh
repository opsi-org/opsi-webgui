#!/bin/bash
set -e
cd /workspace

#MIN_VERSION=1.27.0 # actual min version for webgui..
MIN_VERSION=1.33.0
DEV_TOOLS_URL="http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_$MIN_VERSION.tar.gz"
DEV_TOOLS_ARCHIVE="opsi-dev-tools_linux_x64_$MIN_VERSION.tar.gz"
DEV_TOOLS_BINARY="opsi-dev-tool"
WEBGUI_BACKEND_PATH="/workspace/backend/addon/webgui"
WEBGUI_INSTALL_PATH="/data/opsiconfd/addons/webgui"

echo -e "\n==========================================\nInstalling dev-tools\n===================================================="
wget $DEV_TOOLS_URL
tar -xf $DEV_TOOLS_ARCHIVE
./$DEV_TOOLS_BINARY --self-install
$DEV_TOOLS_BINARY --self-upgrade
$DEV_TOOLS_BINARY git-hooks --install
rm -f $DEV_TOOLS_ARCHIVE ${DEV_TOOLS_ARCHIVE}.1
rm -f $DEV_TOOLS_BINARY
cd -