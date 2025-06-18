#!/bin/bash


# echo 'Setup /etc/hosts' 1>&2
# echo "127.0.0.1       $HOSTNAME $(hostname) mysql redis grafana localhost" > /tmp/hosts
# grep -v "127.0.0.1" /etc/hosts | grep -v $HOSTNAME >> /tmp/hosts
# cp /tmp/hosts /etc/hosts
# rm /tmp/hosts

# # echo "========================================== Install nodejs"
# npm install -g n
# n lts
# # echo "========================================== Install playwright"
# # cd /workspace/opsiweb/scripts
# # ./install.sh

echo "========================================== Install dev-tools"
wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.16.3.tar.gz
tar -xf opsi-dev-tools_linux_x64_1.16.3.tar.gz
./opsi-dev-tool --self-install
rm -f opsi-dev-tools_linux_x64_1.16.3.tar.gz opsi-dev-tools_linux_x64_1.16.3.tar.gz.1
rm -f opsi-dev-tool

# pwd
# # pip3 install --trusted-host pypi.uib.gmbh --index-url http://pypi.uib.gmbh:8080/simple opsi-dev-tools
# cd /workspace
opsi-dev-cli self upgrade
# # opsi-dev-tool --self-install
opsi-dev-tool git-hooks --install
# echo "=========================================="
# # ./opsi-dev-tools git-hooks --install

# # su - node <<SHT

echo -e "======Configure opsiconfd-docker container commands======"
CONTAINER_NAME_DOCKER=$(sudo docker ps --format "{{.Names}}" | grep gui-43 | grep server | grep opsi)
CMD_RESTART="supervisorctl reload"
echo "alias opsiconfd-docker-restart=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER $CMD_RESTART\"" >> ~/.zshrc
echo "alias opsiconfd-docker-container=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER\"" >> ~/.zshrc

CMD_CP_PY="cp -rf /workspace/backend/addon/webgui/python/ /data/opsiconfd/addons/webgui/python/"
                  #/workspace/backend/addon/webgui/python/
echo "alias cp-backend=\"$CMD_CP_PY\"" >> ~/.zshrc
echo "alias opsiconfd-docker-update-py=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER sh -c '$CMD_CP_PY'\"" >> ~/.zshrc

echo "alias opsiconfd-update-webgui-backend=\"$CMD_CP_PY && opsiconfd-docker-restart\"" >> ~/.zshrc
