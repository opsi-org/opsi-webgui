#!/bin/bash

echo "========================================== Install dev-tools"
wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.27.0.tar.gz
tar -xf opsi-dev-tools_linux_x64_1.27.0.tar.gz
./opsi-dev-tool --self-install
opsi-dev-tool --self-upgrade
opsi-dev-tool git-hooks --install
rm -f opsi-dev-tools_linux_x64_1.27.0.tar.gz opsi-dev-tools_linux_x64_1.27.0.tar.gz.1
rm -f opsi-dev-tool

echo "========================================== Install webgui dependencies"
cd /workspace/frontend/
npm i

echo "========================================== Link webgui backend"

rm -rf /data/opsiconfd/addons/webgui
cp -r /workspace/backend/addon/webgui /data/opsiconfd/addons/.

zsh
