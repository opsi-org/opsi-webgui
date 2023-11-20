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
wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.16.3.tar.gz
tar -xf opsi-dev-tools_linux_x64_1.16.3.tar.gz
./opsi-dev-tool --self-install
rm -f opsi-dev-tools_linux_x64_1.16.3.tar.gz opsi-dev-tools_linux_x64_1.16.3.tar.gz.1
rm -f opsi-dev-tool

# pwd
# # pip3 install --trusted-host pypi.uib.gmbh --index-url http://pypi.uib.gmbh:8080/simple opsi-dev-tools
# cd /workspace
# opsi-dev-cli self upgrade --system
# # opsi-dev-tool --self-install
# opsi-dev-tool git-hooks --install
# echo "=========================================="
# # ./opsi-dev-tools git-hooks --install

# # su - node <<SHT
