
#!/bin/bash

# apt update
# apt -y install debhelper osc
# wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.0.79.tar.gz
# tar -xf opsi-dev-tools_linux_x64_1.0.79.tar.gz
WORKING_DIR=$1
# $2: flag to install addon locally

cd ${WORKING_DIR}/frontend/
rm -rf ${WORKING_DIR}/frontend/dist
echo "WROKING DIR: ${WORKING_DIR}/frontend/"
npm run generate
mkdir -p webgui
rm -rf opsi-webgui.zip

chmod 770 ${WORKING_DIR}/backend/addon/changelogs.md
chown opsiconfd:pwuser ${WORKING_DIR}/backend/addon/changelogs.md
mkdir -p ${WORKING_DIR}/backend/addon/webgui/data
mkdir -p ${WORKING_DIR}/backend/addon/webgui/data/app
cp -r ${WORKING_DIR}/frontend/dist/* ${WORKING_DIR}/backend/addon/webgui/data/app/


mkdir -p webgui
cp -r ${WORKING_DIR}/backend/addon/webgui/* webgui/

chown 1000:1000 -R webgui
chown 1000:1000 -R webgui/*
apt install -y zip
zip -r -q opsi-webgui.zip webgui
chown 1000:1000 opsi-webgui.zip

if [[ $2 != 0 ]] # flag to install addon locally
then
    # rm -rf /var/lib/opsiconfd/addons/webgui
    # mv -f webgui/ /var/lib/opsiconfd/addons/.
    rm -rf /data/opsiconfd/addons/webgui
    mv -f webgui/ /data/opsiconfd/addons/.

    git restore ${WORKING_DIR}/backend/addon/webgui/data/app/README.md
    echo ".....$2"
else
    echo ".....nothing todo"
fi
cd -