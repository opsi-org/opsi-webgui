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
wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.27.0.tar.gz
tar -xf opsi-dev-tools_linux_x64_1.27.0.tar.gz
./opsi-dev-tool --self-install
opsi-dev-tool --self-upgrade
rm -f opsi-dev-tools_linux_x64_1.27.0.tar.gz opsi-dev-tools_linux_x64_1.27.0.tar.gz.1
rm -f opsi-dev-tool

echo "========================================== Install webgui dependencies"
cd /workspace/frontend/
npm i
npx nuxi clean



echo 'alias opsiconfdrestart="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi) supervisorctl reload"' >> /etc/bash.bashrc
echo 'alias opsiconfdcontainer="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)"'  >> /etc/bash.bashrc
