#!/bin/bash



echo "========================================== Install dev-tools"

wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/installer.sh
chmod +x installer.sh
./installer.sh
opsi-dev-cli self upgrade
rm -f installer.sh*

opsi-dev-cli self upgrade
opsi-dev-cli git-hook install


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
