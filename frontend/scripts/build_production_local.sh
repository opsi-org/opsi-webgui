#!/bin/bash -e

# apt update
# apt -y install debhelper osc
# wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.0.79.tar.gz
# tar -xf opsi-dev-tools_linux_x64_1.0.79.tar.gz


# IMPORTANT: NAME OF ADDON (default: webgui)
ADDON_ID=$1
ADDON_NAME=$2

WORKING_DIR=$3
FRONTEND_DIR=frontend
BACKEND_DIR=backend
WEBGUI_DIR=webgui

PY_CONST_FILE=${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/python/const.py
ADDON_ID_ORIGIN=webgui
ADDON_NAME_ORIGIN=Webgui
ADDON_KEY_ID=ADDON_ID
ADDON_KEY_NAME=ADDON_NAME


TS_CONST_FILE=${WORKING_DIR}/${FRONTEND_DIR}/nuxt.config.ts
ADDON_PATH=/addons/${ADDON_ID}
ADDON_PATH_ORIGIN=/addons/${ADDON_ID_ORIGIN}

ENV_CONFD_PORT="OPSICONFD_PORT"
DEFAULT_PORT=4447
PORT_VALUE="${!ENV_CONFD_PORT:-$DEFAULT_PORT}"
echo "PORT_VALUE: $PORT_VALUE"


cleanup() {
    echo 'Undo changes and exiting'
    git restore ${WORKING_DIR}/backend/addon/${WEBGUI_DIR}/python/const.py || exit 70
    sed -i "s|const ADDON_PATH: string = .*|const ADDON_PATH: string = '$ADDON_PATH_ORIGIN'|" "$TS_CONST_FILE" || exit 13
}

trap cleanup EXIT
trap cleanup ERR


# replace the ADDON_ID and ADDON_NAME in const.py
echo "> update ${PY_CONST_FILE}...."
sed -i "s/${ADDON_KEY_ID} = .*/${ADDON_KEY_ID} = \"${ADDON_ID}\"/" ${PY_CONST_FILE} || exit 11
sed -i "s/${ADDON_KEY_NAME} = .*/${ADDON_KEY_NAME} = \"${ADDON_NAME}\"/" ${PY_CONST_FILE} || exit 12
# cat ${PY_CONST_FILE}

# replace "const ADDON_PATH"  in TS_CONST_FILE
echo "> update ${TS_CONST_FILE}...."
sed -i "s|const ADDON_PATH: string = .*|const ADDON_PATH: string = '$ADDON_PATH'|" "$TS_CONST_FILE" || exit 14
# cat ${TS_CONST_FILE} | grep ADDON_PATH

cd ${WORKING_DIR}/${FRONTEND_DIR}/
rm -rf ${WORKING_DIR}/${FRONTEND_DIR}/dist || exit 20
echo "WORKING FRONTEND DIR: ${WORKING_DIR}/${FRONTEND_DIR}"
echo "WORKING BACKEND DIR: ${WORKING_DIR}/${BACKEND_DIR}"

echo "> npm generate..."
npm run generate || exit 1
# npm run generate-nossl
# npm run generate-with-ssl
echo "> npm generate done"

mkdir -p webgui  || exit 30
rm -rf opsi-${ADDON_ID}.zip  || exit 21

# chmod 770 ${WORKING_DIR}/${BACKEND_DIR}/addon/changelogs.md
# chown 998:1000 ${WORKING_DIR}/${BACKEND_DIR}/addon/changelogs.md


mkdir -p ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/data  || exit 31
mkdir -p ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/data/app  || exit 32
echo "> copy frontend to backend"
cp -r ${WORKING_DIR}/${FRONTEND_DIR}/dist/* ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/data/app/  || exit 40
echo "> copy frontend to backend done"

echo "> packaging..."
mkdir -p ${ADDON_ID}  || exit 7
cp -r ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/* ${ADDON_ID}/  || exit 33
chown 1000:1000 -R ${ADDON_ID}  || exit 50
chown 1000:1000 -R ${ADDON_ID}/*  || exit 51
apt install -y zip  || exit 60
zip -r -q opsi-${ADDON_ID}.zip ${ADDON_ID}  || exit 61
chown 1000:1000 opsi-${ADDON_ID}.zip || exit 52
echo "> packaging done"

echo "> check if also install locally"
# if [ $4 -eq 0 ]; then
if [ $4 "$variable" ]; then
    echo ".....install locally"
    # rm -rf /var/lib/opsiconfd/addons/webgui
    # mv -f webgui/ /var/lib/opsiconfd/addons/.
    rm -rf /data/opsiconfd/addons/${ADDON_ID} || exit 22
    mv -f ${ADDON_ID}/ /data/opsiconfd/addons/. || exit 34
    git restore ${WORKING_DIR}/backend/addon/${WEBGUI_DIR}/data/app/README.md || exit 71
    # git restore ${WORKING_DIR}/backend/addon/${WEBGUI_DIR}/python/const.py
    # git restore ${WORKING_DIR}/backend/addon/${ADDON_ID}/data/app/README.md
    echo "> local install done"

    # docker exec -u root opsi-webgui_devcontainer-opsi-server-1 supervisorctl reload
    CONTAINER=$(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)
    echo "> reload supervisorctl in container: $CONTAINER"
    docker exec -u root ${CONTAINER} supervisorctl reload || exit 80

else
    echo "> local install skipped"
fi


# # replace the ADDON_ID and ADDON_NAME in const.py
# sed -i "s/${ADDON_KEY_ID} = .*/${ADDON_KEY_ID} = \"${ADDON_ID_ORIGIN}\"/" ${PY_CONST_FILE}
# sed -i "s/${ADDON_KEY_NAME} = .*/${ADDON_KEY_NAME} = \"${ADDON_NAME_ORIGIN}\"/" ${PY_CONST_FILE}
# sed -i "s|const ADDON_PATH: string = .*|const ADDON_PATH: string = '$ADDON_PATH_ORIGIN'|" "$TS_CONST_FILE"

echo ""
echo "IMPORTANT: Access your webgui at: https://....:${PORT_VALUE}${ADDON_PATH}/app"
echo ""
cd -