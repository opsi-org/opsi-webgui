#!/bin/bash
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

echo -e "\n==========================================\nStarting opsiconfd container\n===================================================="
echo 'alias opsiconfdrestart="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi) supervisorctl reload"' >>/etc/bash.bashrc
echo 'alias opsiconfdcontainer="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)" >>/etc/bash.bashrc'

exec zsh
