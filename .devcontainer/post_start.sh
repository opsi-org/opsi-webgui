#!/bin/bash

set -e

DEV_TOOLS_URL="http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.27.0.tar.gz"
DEV_TOOLS_ARCHIVE="opsi-dev-tools_linux_x64_1.27.0.tar.gz"
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

echo -e "\n==========================================\nInstalling webgui dependencies\n==========================================="
cd /workspace/frontend/
npm install
npx nuxi clean

echo -e "\n==========================================\nInstalling Playwright\n===================================================="
npx playwright install-deps

echo -e "\n==========================================\nStarting opsiconfd container\n===================================================="
echo 'alias opsiconfdrestart="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi) supervisorctl reload"' >>/etc/bash.bashrc
echo 'alias opsiconfdcontainer="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)" >>/etc/bash.bashrc'

exec zsh
