#!/bin/bash

echo "\n================================ configure .vscode for frontend container =====================================\n"
rm -rf /workspace/.vscode
ln -s /workspace/frontend/.vscode /workspace/.vscode

#SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# echo 'Setup /etc/hosts' 1>&2
# echo "127.0.0.1       $HOSTNAME $(hostname) mysql redis grafana localhost" > /tmp/hosts
# grep -v "127.0.0.1" /etc/hosts | grep -v $HOSTNAME >> /tmp/hosts
# cp /tmp/hosts /etc/hosts
# rm /tmp/hosts


echo -e "\n==========================================\nInstalling webgui dependencies\n==========================================="
cd /workspace/frontend/
npm install
npx nuxi clean

echo -e "\n==========================================\nInstalling Playwright\n===================================================="
npx playwright install-deps

echo -e "\n==========================================\nStarting opsiconfd-docker container\n===================================================="


echo -e "\n==========================================\nConfigure opsiconfd-docker container commands\n===================================================="
CONTAINER_NAME_DOCKER=$(sudo docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)
echo "alias opsiconfd-docker-restart=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER supervisorctl reload\"" >> /root/.zshrc
echo "alias opsiconfd-docker-container=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER\"" >> /root/.zshrc

echo -e "\n==========================================\nConfigure backend container commands\n===================================================="
CONTAINER_NAME_BACKEND=$(sudo docker ps --format "{{.Names}}" | grep webgui | grep backend | grep opsi)
echo "alias opsi-webgui-backend-container=\"sudo docker exec -u root -it $CONTAINER_NAME_BACKEND\"" >> /root/.zshrc

OPSICONFD_CMD="sudo python /workspace/docker/backend/start_opsiconfd.py" # needs to be in a variable!
echo "alias opsiconfd-backend-start=\"sudo docker exec -u root -it ${CONTAINER_NAME_BACKEND} sh -c '$OPSICONFD_CMD'\"" >> /root/.zshrc


#echo 'alias opsiconfdrestart="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi) supervisorctl reload"' >>/etc/bash.bashrc
#echo 'alias opsiconfdcontainer="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)" >>/etc/bash.bashrc'

exec zsh
