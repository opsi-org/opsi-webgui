#!/bin/bash

# apt update
# apt -y install debhelper osc
# wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.0.79.tar.gz
# tar -xf opsi-dev-tools_linux_x64_1.0.79.tar.gz

# IMPORTANT: NAME OF ADDON (default: webgui)
ADDON_ID=webgui-dev43
ADDON_NAME=Webgui-Dev43

WORKING_DIR=$1
FRONTEND_DIR=opsiweb
BACKEND_DIR=backend
WEBGUI_DIR=webgui

PY_CONST_FILE=${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/python/const.py
ADDON_ID_ORIGIN=webgui
ADDON_NAME_ORIGIN=Webgui
ADDON_KEY_ID=ADDON_ID
ADDON_KEY_NAME=ADDON_NAME


TS_CONST_FILE=${WORKING_DIR}/${FRONTEND_DIR}/nuxt.config.js
ADDON_PATH=/addons/${ADDON_ID}
ADDON_PATH_ORIGIN=/addons/${ADDON_ID_ORIGIN}


ENV_CONFD_PORT="OPSICONFD_PORT"
DEFAULT_PORT=4447
PORT_VALUE="${!ENV_CONFD_PORT:-$DEFAULT_PORT}"
echo "PORT_VALUE: $PORT_VALUE"


# replace the ADDON_ID and ADDON_NAME in const.py
echo "> update python config${PY_CONST_FILE}...."
sed -i "s/${ADDON_KEY_ID} = .*/${ADDON_KEY_ID} = \"${ADDON_ID}\"/" ${PY_CONST_FILE}
sed -i "s/${ADDON_KEY_NAME} = .*/${ADDON_KEY_NAME} = \"${ADDON_NAME}\"/" ${PY_CONST_FILE}
# cat ${PY_CONST_FILE}

# replace "const ADDON_PATH"  in TS_CONST_FILE
echo "> update nuxt config ${TS_CONST_FILE}...."
sed -i "s|const ADDON_PATH = .*|const ADDON_PATH = '$ADDON_PATH'|" "$TS_CONST_FILE"
cat ${TS_CONST_FILE} | grep ADDON_PATH


cd ${WORKING_DIR}/${FRONTEND_DIR}/
rm -rf ${WORKING_DIR}/${FRONTEND_DIR}/dist
echo "WORKING FRONTEND DIR: ${WORKING_DIR}/${FRONTEND_DIR}"
echo "WORKING BACKEND DIR: ${WORKING_DIR}/${BACKEND_DIR}"

echo "> npm generate..."
npm run generate
# npm run generate-nossl
# npm run generate-with-ssl
echo "> npm generate done"

mkdir -p webgui
rm -rf opsi-${ADDON_ID}.zip

# chmod 770 ${WORKING_DIR}/${BACKEND_DIR}/addon/changelogs.md
# chown 998:1000 ${WORKING_DIR}/${BACKEND_DIR}/addon/changelogs.md


mkdir -p ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/data
mkdir -p ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/data/app
echo "> copy frontend to backend"
cp -r ${WORKING_DIR}/${FRONTEND_DIR}/dist/* ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/data/app/
echo "> copy frontend to backend done"

echo "> packaging..."
mkdir -p ${ADDON_ID}
cp -r ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/* ${ADDON_ID}/
chown 1000:1000 -R ${ADDON_ID}
chown 1000:1000 -R ${ADDON_ID}/*
apt install -y zip
zip -r -q opsi-${ADDON_ID}.zip ${ADDON_ID}
chown 1000:1000 opsi-${ADDON_ID}.zip
echo "> packaging done"

echo "> check if also install locally"
if [[ $2 != 0 ]] # flag to install addon locally
then
    echo ".....install locally"
    # rm -rf /var/lib/opsiconfd/addons/webgui
    # mv -f webgui/ /var/lib/opsiconfd/addons/.
    rm -rf /data/opsiconfd/addons/${ADDON_ID}
    mv -f ${ADDON_ID}/ /data/opsiconfd/addons/.
    git restore ${WORKING_DIR}/backend/addon/${WEBGUI_DIR}/data/app/README.md
    git restore ${WORKING_DIR}/backend/addon/${WEBGUI_DIR}/python/const.py
    # git restore ${WORKING_DIR}/backend/addon/${ADDON_ID}/data/app/README.md
    echo "> local install done"

    # docker exec -u root opsi-webgui_devcontainer-opsi-server-1 supervisorctl reload
    CONTAINER=$(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)
    echo "> reload supervisorctl in container: $CONTAINER"
    docker exec -u root ${CONTAINER} supervisorctl reload

else
    echo "> local install skipped"
fi


# # replace the ADDON_ID and ADDON_NAME in const.py
# sed -i "s/${ADDON_KEY_ID} = .*/${ADDON_KEY_ID} = \"${ADDON_ID_ORIGIN}\"/" ${PY_CONST_FILE}
# sed -i "s/${ADDON_KEY_NAME} = .*/${ADDON_KEY_NAME} = \"${ADDON_NAME_ORIGIN}\"/" ${PY_CONST_FILE}
sed -i "s|const ADDON_PATH = .*|const ADDON_PATH = '$ADDON_PATH_ORIGIN'|" "$TS_CONST_FILE"

echo ""
echo "IMPORTANT: Access your webgui at: https://....:${PORT_VALUE}${ADDON_PATH}/app"
echo ""
cd -
