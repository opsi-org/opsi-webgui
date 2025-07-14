#!/bin/zsh
set -ex
shopt -s expand_aliases

sudo rm -r /data/opsiconfd/addons/webgui/python
sudo cp -rf /workspace/backend/addon/webgui/python/ /data/opsiconfd/addons/webgui/.
sudo chown $(whoami):$(whoami) -R /data/opsiconfd/addons/