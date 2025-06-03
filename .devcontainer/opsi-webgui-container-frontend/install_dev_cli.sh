#!/bin/bash
set -e
set -x
cd /workspace

SCRIPT_NAME="installer.sh"
DEV_TOOLS_URL=https://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/$SCRIPT_NAME
DEV_TOOLS_BINARY="opsi-dev-tool"

echo -e "\n==========================================\nInstalling dev-tools\n===================================================="
echo "who am i: $(whoami)"
wget $DEV_TOOLS_URL
ls -lah
chmod 750 $SCRIPT_NAME
./${SCRIPT_NAME}
rm -f "./${SCRIPT_NAME}"
rm -f "./${SCRIPT_NAME}*"
cd -