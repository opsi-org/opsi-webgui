#!/bin/bash

echo "========================================== Install dev-tools"
wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.16.3.tar.gz
tar -xf opsi-dev-tools_linux_x64_1.16.3.tar.gz
./opsi-dev-tool --self-install
rm -f opsi-dev-tools_linux_x64_1.16.3.tar.gz opsi-dev-tools_linux_x64_1.16.3.tar.gz.1
rm -f opsi-dev-tool
opsi-dev-tool git-hooks --install


echo "========================================== Install webgui dependencies"
cd /workspace/frontend/
npm i

npm i -D @playwright/test
npx playwright install
npx playwright install-deps
echo "========================================== Link webgui backend"

rm -rf /data/opsiconfd/addons/webgui
# ln -s /workspace/backend/addon/webgui /data/opsiconfd/addons/
# chown pwuser:pwuser /data/opsiconfd/addons/webgui
# ln -s $OPSI_ADDON_DIRS /data/opsiconfd/addons
cp -r /workspace/backend/addon/webgui /data/opsiconfd/addons/.


#https://stackoverflow.com/questions/49544215/it-is-possible-to-run-a-command-inside-a-docker-container-from-another-container
alias opsiconfdrestart="docker exec -u root opsiweb-ui_devcontainer-opsi-server-1 supervisorctl reload"
echo "alias opsiconfdrestart='docker exec -u root opsiweb-ui_devcontainer-opsi-server-1 supervisorctl reload'" > ~/.bash_aliases
echo "alias opsiconfdrestart='docker exec -u root opsiweb-ui_devcontainer-opsi-server-1 supervisorctl reload'" >> ~/.zshrc
zsh
# # Setup mariadb server
# id
# service mysql restart
# sleep 5
# awk -v var="password" -v new_val=$MYSQL_ROOT_PASSWORD 'BEGIN{FS=OFS="="}match($1, "^\\s*" var "\\s*") {$2=" " new_val}1' /etc/mysql/debian.cnf | sudo tee /etc/mysql/debian.cnf

# sleep 5

# echo "create opsi user"
# mysql -u root -e "CREATE USER $MYSQL_USER@localhost IDENTIFIED BY '$MYSQL_PASSWORD';"
# mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO $MYSQL_USER@localhost IDENTIFIED BY '$MYSQL_PASSWORD';"
# mysql -u root -e "FLUSH PRIVILEGES"
# echo "create database opsi" | mysql -u root
# zcat /workspace/docker/confd-dev-data.sql.gz | sed 's/dev-server.uib.local/'$OPSI_HOSTNAME'/g'  | mariadb -h localhost -u opsi --password=opsi opsi

# openssl req -x509 -newkey rsa:4096 -keyout /var/tmp/key.pem -out /var/tmp/cert.pem -sha256 -days 365 --nodes -subj '/CN=localhost'
# chown node:node /var/tmp/*
# chmod 750 /var/tmp/*

# npm install -g n
# n lts
# # bash
