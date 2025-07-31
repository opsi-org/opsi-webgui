#!/bin/bash
set -ex
#shopt -s expand_aliases # seems not to work, cause it tries to load bash aliases, but we use zsh aliases

#opsiconfd-docker-container rm -rf /usr/lib/opsiconfd/addons/webgui
sudo rm -r /data/opsiconfd/addons/webgui/python

#cp -r ${WORKING_DIR}/${BACKEND_DIR}/addon/${WEBGUI_DIR}/* ${ADDON_ID}/
sudo cp -r /workspace/backend/addon/webgui/python /data/opsiconfd/addons/webgui/.
sudo chown $(whoami):$(whoami) -R /data/opsiconfd/addons
sudo chown $(whoami):$(whoami) -R /data/opsiconfd/addons/*

#opsiconfd-docker-restart