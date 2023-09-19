#!/bin/bash
# echo "[script.sh] install dependencies"
# npm install
# echo "setting permissions"
# echo "[script.sh] setting permissions"
# npm install npm@8.1.1
# npm install -g npm@8.1.1
# chown -f -R 1000:1000 /root/.npm
# chown -f -R 1000:1000 /root/.npm/*
# chown -f -R 1000:1000 /root/.cache/
# chown -f -R 1000:1000 /root/.cache/*

id
apt update && apt upgrade opsiconfd --yes

echo "* Fetch a test license"
if [ -n "${OPSILICSRV_TOKEN}" ]; then
    sudo mkdir -p /etc/opsi/licenses
    sudo wget --header="Authorization: Bearer ${OPSILICSRV_TOKEN}" "https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiweb-dev-container" -O /etc/opsi/licenses/test.opsilic || true
fi

echo 'Setup /etc/hosts' 1>&2
echo "127.0.0.1       $OPSI_HOSTNAME $(hostname) mysql redis grafana localhost" > /tmp/hosts
grep -v "127.0.0.1" /etc/hosts | grep -v $OPSI_HOSTNAME >> /tmp/hosts
cp /tmp/hosts /etc/hosts
rm /tmp/hosts

# Setup redis server
service redis-server restart

# mysql
service mysql restart


# Setup grafana server
grafana-cli plugins install grafana-simple-json-datasource
service grafana-server restart

# Setup opsi
echo '.* : mysql' > /etc/opsi/backendManager/dispatch.conf
opsi-set-rights
grep -v addon-dirs /etc/opsi/opsiconfd.conf > /tmp/opsiconfd.conf
mv /tmp/opsiconfd.conf /etc/opsi/opsiconfd.conf
echo "addon-dirs = /workspace/backend/addon" >>/etc/opsi/opsiconfd.conf

chown -R opsiconfd /workspace/backend

service opsiconfd restart

echo "========================================== Dev tools githook"
pwd
# pip3 install --trusted-host pypi.uib.gmbh --index-url http://pypi.uib.gmbh:8080/simple opsi-dev-tools
opsi-dev-tool --self-install
opsi-dev-tool git-hooks --install
echo "=========================================="
# ./opsi-dev-tools git-hooks --install

# su - node <<SHT
cd /workspace/opsiweb/scripts
./install.sh
