#!/bin/bash

echo "========================================== Install dev-tools"
wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/installer.sh
chmod +x installer.sh
./installer.sh
opsi-dev-cli self upgrade
rm -f installer.sh*



echo "========================================== Install webgui dependencies"
cd /workspace/opsiweb/
npm ci --legacy-peer-deps
echo "========================================== Link webgui backend"

rm -rf /data/opsiconfd/addons/webgui
cp -r /workspace/backend/addon/webgui /data/opsiconfd/addons/.
