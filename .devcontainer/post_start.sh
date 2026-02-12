echo "* Running as $(whoami)"
echo "ADDON_NAME is ${ADDON_NAME}"

/workspace/scripts/setup-hosts.sh

echo "* Fetch a test license"
sudo mkdir -p /etc/opsi/licenses
sudo wget --header="Authorization: Bearer ${OPSILICSRV_TOKEN}" "https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiconfd-addon-dev-container-$ADDON_ID" -O /etc/opsi/licenses/test.opsilic || true

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
git clone git@gitlab.uib.gmbh:uib/opsi-git-hooks.git .opsi-git-hooks
cd /workspace
opsi-dev-tool git-hooks --install


echo "* clone opsiconfd"
OPSICONFD_GIT_REPO=${OPSICONFD_GIT_REPO:-/workspace/docker/opsiconfd}
if cd $OPSICONFD_GIT_REPO; then
  git checkout -- .
  git pull;
  cd ..
else
  git clone git@gitlab.uib.gmbh:uib/opsiconfd.git $OPSICONFD_GIT_REPO;
fi
