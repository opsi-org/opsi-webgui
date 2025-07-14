#!/bin/zsh
set -ex
shopt -s expand_aliases

sudo rm -r /data/opsiconfd/addons/webgui/python

#cp -r ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/* ${ADDON_ID}/
sudo cp -r /workspace/backend/addon/webgui/python /data/opsiconfd/addons/webgui/.
sudo chown $(whoami):$(whoami) -R /data/opsiconfd/addons
sudo chown $(whoami):$(whoami) -R /data/opsiconfd/addons/*
