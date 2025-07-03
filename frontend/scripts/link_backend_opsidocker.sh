#!/bin/bash -ex

sudo rm -r /data/opsiconfd/addons/webgui/python
sudo cp -rf /workspace/backend/addon/webgui/python/ /data/opsiconfd/addons/webgui/.
sudo chown $(whoami):$(whoami) -R /data/opsiconfd/addons/
opsiconfd-docker-restart