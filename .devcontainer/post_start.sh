#!/bin/bash
echo "* Running post_start as $(whoami)"
/workspace/scripts/setup-hosts.sh

echo "* Fetch a test license"
sudo mkdir -p /etc/opsi/licenses
sudo wget --header="Authorization: Bearer ${OPSILICSRV_TOKEN}" "https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiconfd-addon-dev-container-webgui" -O /etc/opsi/licenses/test.opsilic 2>/dev/null || true

echo "* Upgrade opsi-dev-tool"
sudo opsi-dev-tool --self-upgrade 2>/dev/null || true

echo "* Start services"
sudo supervisorctl status redis-server | grep RUNNING >/dev/null || sudo supervisorctl start redis-server
sudo supervisorctl status mariadb-server | grep RUNNING >/dev/null || sudo supervisorctl start mariadb-server

sudo chown -R ${DEV_USER:-$USER} /workspace
sudo opsi-set-rights 2>/dev/null || true

echo "* Clone/update opsiconfd"
OPSICONFD_DIR=/workspace/docker/opsiconfd
if [ -d "$OPSICONFD_DIR/.git" ]; then
    cd $OPSICONFD_DIR
    git checkout -- . 2>/dev/null || true
    git pull 2>/dev/null || true
else
    git clone git@gitlab.uib.gmbh:uib/opsiconfd.git $OPSICONFD_DIR 2>/dev/null || echo "Could not clone opsiconfd - you may need to clone manually or the dir already exists"
fi

echo "* Sync opsiconfd dependencies with Python 3.14.0"
cd $OPSICONFD_DIR
rm -rf .venv/ 2>/dev/null || true
uv sync --python 3.14.0

echo "* Symlink static directory"
rm -rf $OPSICONFD_DIR/static 2>/dev/null || true
ln -sf $OPSICONFD_DIR/opsiconfd_data/static $OPSICONFD_DIR/static

echo ""
echo "=========================================="
echo "* To start opsiconfd:"
echo "    sudo supervisorctl start opsiconfd"
echo "* To view logs:"
echo "    sudo tail -f /var/log/opsi/opsiconfd/stderr.log"
echo "=========================================="
echo ""
echo "* Test endpoints:"
echo "  https://localhost:4447/docs"
echo "  https://localhost:4447/addons/webgui/api/user/opsiserver"
echo ""
