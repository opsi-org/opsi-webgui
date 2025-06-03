#!/bin/bash

echo -e "==========================================Installing webgui dependencies==========================================="
cd /workspace/frontend/
npm install
npx nuxi cleanup

echo -e "==========================================Installing Playwright===================================================="
npx playwright install-deps

echo -e "==========================================Starting opsiconfd-docker container===================================================="
echo -e "======Configure opsiconfd-docker container commands======"
CONTAINER_NAME_DOCKER=$(sudo docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)
echo "alias opsiconfd-docker-restart=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER supervisorctl reload\"" >> ~/.zshrc
echo "alias opsiconfd-docker-container=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER\"" >> ~/.zshrc

echo -e "======Configure backend container commands======"
CONTAINER_NAME_BACKEND=$(sudo docker ps --format "{{.Names}}" | grep webgui | grep backend | grep opsi)
echo "alias opsi-webgui-backend-container=\"sudo docker exec -u root -it $CONTAINER_NAME_BACKEND\"" >> ~/.zshrc

OPSICONFD_CMD="sudo python /workspace/docker/backend/start_opsiconfd.py" # needs to be in a variable!
echo "alias opsiconfd-backend-start=\"sudo docker exec -u root -it ${CONTAINER_NAME_BACKEND} sh -c '$OPSICONFD_CMD'\"" >> ~/.zshrc
