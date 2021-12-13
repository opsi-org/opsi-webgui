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

# echo 'Setup /etc/hosts' 1>&2
# echo "127.0.0.1       $OPSI_HOSTNAME $(hostname) mysql redis grafana localhost" > /tmp/hosts
# grep -v "127.0.0.1" /etc/hosts | grep -v $OPSI_HOSTNAME >> /tmp/hosts
# cp /tmp/hosts /etc/hosts
# rm /tmp/hosts

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
echo "addon-dirs = /workspace/backend" >>/etc/opsi/opsiconfd.conf

chown -R opsiconfd /workspace/backend

service opsiconfd restart

# su - node <<SHT
cd /workspace/opsiweb
./install.sh