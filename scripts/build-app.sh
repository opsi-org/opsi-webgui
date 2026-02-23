#!/bin/bash -e
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0


# apt update
# apt -y install debhelper osc
# wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/installer.sh
# chmod +x installer.sh
# ./installer.sh

# IMPORTANT: NAME OF ADDON
ADDON_DEV_ID=$1
ADDON_DEV_NAME=$2

WORKING_DIR=$3
INSTALL=$4
SHOULD_KEEP_DATA_UIFOLDER=no-install
SHOULD_INSTALL_DATA=install
SHOULD_INSTALL_USR=installusr
SHOULD_COPY_DATA_CICD=copydata
#PATH_DATA="/data/opsiconfd/addons"
PATH_DATA="/var/lib/opsiconfd/addons"
PATH_USR="/workspace/backend/src"
FRONTEND_DIR=frontend
BACKEND_DIR=backend
IS_CICD=${CI:-false}
#if is cicd that sudo="" else sudo="sudo"

SUDO=""
if [ "$IS_CICD" = "false" ]; then
    SUDO="sudo"
fi

PY_CONST_FILE=${WORKING_DIR}/${BACKEND_DIR}/src/python/const.py
ADDON_ID_ORIGIN=$ADDON_ID
ADDON_NAME_ORIGIN=$ADDON_NAME
ADDON_KEY_ID=ADDON_ID
ADDON_KEY_NAME=ADDON_NAME

TS_CONST_FILE=${WORKING_DIR}/${FRONTEND_DIR}/nuxt.config.ts
ADDON_PATH=/addons/${ADDON_DEV_ID}
ADDON_PATH_ORIGIN=/addons/${ADDON_ID_ORIGIN}

ADDON_DIR=${WORKING_DIR}/${ADDON_DEV_ID}

cleanup() {
    echo 'Undo changes and exiting'
    if command -v git 2>&1 >/dev/null; then
        if [ "$IS_CICD" = "false" ]; then
            git checkout -- ${WORKING_DIR}/backend/src/python/const.py || exit 70
        fi
    fi
    sed -i "s|const ADDON_PATH: string = .*|const ADDON_PATH: string = '$ADDON_PATH_ORIGIN'|" "$TS_CONST_FILE" || exit 13
    $SUDO chown 1000:1000 -R ${WORKING_DIR} || exit 90
}

trap cleanup EXIT
trap cleanup ERR

## check if working directory is set correctly (includes frontend and backend)
echo "> check working directory: ${WORKING_DIR}"
if [ -z "$WORKING_DIR" ]; then
    echo "WORKING_DIR is not set. Please provide the working directory as the third argument."
    exit 1
fi
if [ ! -d "${WORKING_DIR}/${FRONTEND_DIR}" ] || [ ! -d "${WORKING_DIR}/${BACKEND_DIR}" ]; then
    echo "WORKING_DIR does not contain the required frontend and backend directories."
    exit 2
fi


#### change owner of working directory
$SUDO chown 1000:1000 -R ${WORKING_DIR} || exit 90

# replace the ADDON_ID and ADDON_NAME in const.py
echo "> update ${PY_CONST_FILE}...."
sed -i "s/${ADDON_KEY_ID} = .*/${ADDON_KEY_ID} = \"${ADDON_DEV_ID}\"/" ${PY_CONST_FILE} || exit 11
sed -i "s/${ADDON_KEY_NAME} = .*/${ADDON_KEY_NAME} = \"${ADDON_DEV_NAME}\"/" ${PY_CONST_FILE} || exit 12

# replace "const ADDON_PATH"  in TS_CONST_FILE
echo "> update ${TS_CONST_FILE}...."
sed -i "s|const ADDON_PATH: string = .*|const ADDON_PATH: string = '$ADDON_PATH'|" "$TS_CONST_FILE" || exit 14

cd ${WORKING_DIR}/${FRONTEND_DIR}/
$SUDO rm -rf ${WORKING_DIR}/${FRONTEND_DIR}/dist || exit 20
echo "WORKING FRONTEND DIR: ${WORKING_DIR}/${FRONTEND_DIR}"
echo "WORKING BACKEND DIR: ${WORKING_DIR}/${BACKEND_DIR}"

echo "> npm generate..."
npm run generate || exit 1
echo "> npm generate done"

$SUDO rm -rf opsi-${ADDON_DEV_ID}.zip  || exit 21
#ADDON_DIR=${WORKING_DIR}/addon/${ADDON_DEV_ID}
mkdir -p $ADDON_DIR  || exit 30
mkdir -p $ADDON_DIR/data  || exit 31
mkdir -p $ADDON_DIR/data/app  || exit 32
mkdir -p $ADDON_DIR/python  || exit 32
# copy backend
echo "> copy backend to app"
cp -r ${WORKING_DIR}/${BACKEND_DIR}/src/python/* ${ADDON_DIR}/python/. || exit 39
echo "> copy frontend to app"
cp -r ${WORKING_DIR}/${FRONTEND_DIR}/dist/* ${ADDON_DIR}/data/app/  || exit 40

echo "> packaging..."
#mkdir -p ${ADDON_DEV_ID}  || exit 7
#cp -r ${WORKING_DIR}/${BACKEND_DIR}/addon/${ADDON}/* ${ADDON_DEV_ID}/  || exit 33
chown $(whoami):$(whoami) -R ${ADDON_DIR}  || exit 50
chown $(whoami):$(whoami) -R ${ADDON_DIR}/*  || exit 51
$SUDO apt install -y zip  || exit 60
zip -r -q opsi-${ADDON_DEV_ID}.zip ${ADDON_DIR}  || exit 61
$SUDO chown $(whoami):$(whoami) opsi-${ADDON_DEV_ID}.zip || exit 52

echo "> packaging done: $(pwd)/opsi-${ADDON_DEV_ID}.zip"

echo "> check if also install locally: ${INSTALL}"
port=0000
if [ "$INSTALL" = "$SHOULD_INSTALL_DATA" ]; then
    port=${OPSICONFD_PORT:-44472}
    echo ".....install locally to ${PATH_DATA}"
    $SUDO rm -rf ${PATH_DATA}/${ADDON_DEV_ID} || exit 22
    $SUDO mv -f ${ADDON_DIR}/ ${PATH_DATA}/. || exit 34

    if [ "$IS_CICD" = "false" ]; then
        git checkout -- ${WORKING_DIR}/backend/src/${ADDON}/data/app/README.md || exit 71
    fi
    echo "> local install done"

    echo "> reload opsiconfd"
    curl -I -u ${OPSI_ADMIN_USER:adminuser}:${OPSI_ADMIN_PW:adminuser} https://localhost:$OPSICONFD_PORT/admin/reload
    echo ""
    echo "IMPORTANT: Access your application at: https://....:${port}${ADDON_PATH}/app"
    echo "e.g. https://$(hostname -f):${port}${ADDON_PATH}/app"
elif [ "$INSTALL" = "$SHOULD_COPY_DATA_CICD" ]; then
    # not sure why..
    #$SUDO rm -rf ${WORKING_DIR}/${BACKEND_DIR}/addon/${ADDON_DEV_ID} || exit 22
    #$SUDO mv -f ${ADDON_DEV_ID}/ ${WORKING_DIR}/${BACKEND_DIR}/addon/. || exit 34
    ls -lah ${ADDON_DIR}
    #ls -lah ${WORKING_DIR}/${BACKEND_DIR}/addon/${ADDON_DEV_ID}


    #if [ "$IS_CICD" = "false" ]; then
    #    git checkout -- ${WORKING_DIR}/backend/addon/${ADDON}/data/app/README.md || exit 71
    #fi
    echo "> local copy done"
elif [ "$INSTALL" = "$SHOULD_KEEP_DATA_UIFOLDER" ]; then
    # move $(pwd)/${ADDON_DEV_ID} to working directory (used in cicd)
    #mv -f ${ADDON_DEV_ID}/ ${WORKING_DIR}/${ADDON_DEV_ID}/ || exit 36
    echo "> local install skipped, but data folder kept in ${ADDON_DIR}"
else
    port="-1"
    echo "> local install skipped. Please upload the ZIP file to your opsi server and install it manually."
fi

echo ""
echo "IMPORTANT: ZIP file created: $(pwd)/opsi-${ADDON_DEV_ID}.zip"
echo ""
cd -