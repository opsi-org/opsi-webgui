echo "* Running as $(whoami)"

/workspace/backend/scripts/setup-hosts.sh

echo "* Fetch a test license"
sudo mkdir -p /etc/opsi/licenses
sudo wget --header="Authorization: Bearer ${OPSILICSRV_TOKEN}" "https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiconfd-dev-container" -O /etc/opsi/licenses/test.opsilic || true

echo "* Upgrade opsi-dev-tool"
sudo opsi-dev-tool --self-upgrade || true

echo "* Start services"
sudo supervisorctl status redis-server | grep RUNNING >/dev/null || sudo supervisorctl start redis-server
sudo supervisorctl status mariadb-server | grep RUNNING >/dev/null || sudo supervisorctl start mariadb-server
sudo supervisorctl status grafana-server | grep RUNNING >/dev/null || sudo supervisorctl start grafana-server

sudo chown -R $DEV_USER /workspace
sudo opsi-set-rights

echo "* Install git hooks"
cd $HOME
git clone https://oauth2:UqZXUJsgG4dBGLBbTjDM@gitlab.uib.gmbh/uib/opsi-git-hooks.git .opsi-git-hooks
cd /workspace
opsi-dev-tool git-hooks --install


echo "* clone opsiconfd"


DOCKERDIR=/workspace/docker/backend/opsiconfd
if cd $DOCKERDIR; then git pull; else git clone git@gitlab.uib.gmbh:uib/opsiconfd.git $DOCKERDIR; fi

echo "* Setup poetry venv"
#poetry lock --no-update
#poetry install --no-interaction --no-ansi
uv sync --frozen



echo -e "\n==========================================\nStarting opsiconfd container\n===================================================="
CONTAINER_NAME_DOCKER=$(sudo docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)
echo "alias opsiconfd-docker-restart=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER supervisorctl reload\"" >> ~/.bashrc
echo "alias opsiconfd-docker-container=\"sudo docker exec -u root -it $CONTAINER_NAME_DOCKER\"" >> ~/.bashrc

#echo -e "\n==========================================\nStarting opsiconfd container\n===================================================="
CONTAINER_NAME_FRONTEND=$(sudo docker ps --format "{{.Names}}" | grep webgui | grep frontend | grep opsi)
echo "alias opsi-webgui-frontend-container=\"sudo docker exec -u root -it $CONTAINER_NAME_FRONTEND\"" >>~/.bashrc

NPM_RUN_DEV="npm run dev" # needs to be in a variable!
echo "alias npm-run-dev=\"sudo docker exec -u root -it ${CONTAINER_NAME_FRONTEND} sh -c '$NPM_RUN_DEV'\"" >>~/.bashrc

NPM_RUN_DEV_BACKEND="npm run dev-backend" # needs to be in a variable!
echo "alias npm-run-dev-backend=\"sudo docker exec -u root -it $CONTAINER_NAME_FRONTEND sh -c '$NPM_RUN_DEV_BACKEND'\"" >>~/.bashrc





