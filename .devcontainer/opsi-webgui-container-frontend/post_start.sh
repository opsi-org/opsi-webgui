#!/bin/bash

echo -e "==========================================Installing webgui dependencies==========================================="
cd /workspace/frontend/
npm install
npx nuxi cleanup

# echo -e "==========================================Installing Playwright===================================================="
# npx playwright install-deps


echo -e "==========================================Starting opsiconfd-docker container===================================================="
ENV_FILE_DIR=/workspace/docker/frontend/.env
echo "export \$(cat ${ENV_FILE_DIR} | xargs)" >> ~/.zshrc

echo -e "======Configure opsiconfd-docker container commands======"
CONTAINER_NAME_DOCKER=$(sudo docker ps --format "{{.Names}}" | grep gui | grep -v gui-43 | grep server | grep opsi)
echo "alias opsiconfd-docker-restart=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER supervisorctl reload\"" >> ~/.zshrc
echo "alias opsiconfd-docker-container=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER\"" >> ~/.zshrc

echo -e "======Configure backend container commands======"
CONTAINER_NAME_BACKEND=$(sudo docker ps --format "{{.Names}}" | grep webgui | grep backend | grep opsi)
echo "alias opsi-webgui-backend-container=\"sudo docker exec -u root -it $CONTAINER_NAME_BACKEND\"" >> ~/.zshrc

OPSICONFD_CMD_PYTHON=/workspace/docker/backend/opsiconfd/.venv/bin/python
#OPSICONFD_CMD="sudo ${OPSICONFD_CMD_PYTHON} /workspace/docker/backend/start_opsiconfd.py" # needs to be in a variable!
OPSICONFD_CMD="sudo /workspace/docker/backend/run_opsiconfd.sh" # needs to be in a variable!
echo "alias opsiconfd-backend-start=\"sudo docker exec -u root -it ${CONTAINER_NAME_BACKEND} sh -c '$OPSICONFD_CMD'\"" >> ~/.zshrc

