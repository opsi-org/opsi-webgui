#!/bin/sh
ENVFILE=.env

echo "################# env for webgui" > $ENVFILE
if [ -z ${USER+x} ]; then
	echo DEV_USER=$DEV_USER >> $ENVFILE
else
	echo DEV_USER=$USER >> $ENVFILE
fi

read -p "Enter git username (example: 'sucher'): " GITUSER
echo DEV_GIT_NAME=$GITEMAIL >> $ENVFILE

read -p "Enter git email (example: 'a.sucher@uib.de'): " GITEMAIL
echo DEV_GIT_EMAIL=$GITEMAIL >> $ENVFILE



echo "################# env for opsi-server" >> $ENVFILE
echo DOCKER_IMAGE_OPSI_SERVER=uibmz/opsi-server:4.3-development >> $ENVFILE
echo RESTART_POLICY=no >> $ENVFILE

echo HOSTNAME=$(hostname -f) >> $ENVFILE
echo DOMAINNAME=$(hostname -d) >> $ENVFILE
echo OPSICONFD_GRAFANA_EXTERNAL_URL=http://$(hostname -f):3000 >> $ENVFILE
echo OPSICONFD_PORT=4447 >> $ENVFILE

echo OPSICONFD_LOG_LEVEL=6 >> $ENVFILE
echo OPSICONFD_LOG_LEVEL_FILE=4 >> $ENVFILE
echo OPSI_ADMIN_PASSWORD=adminuser >> $ENVFILE
echo OPSICONFD_RESTORE_BACKUP_URL=https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json  >> $ENVFILE
echo OPSICONFD_RESTORE_BACKUP_ALWAYS=true >> $ENVFILE
echo OPSILICSRV_URL=https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiwebui-dev-container  >> $ENVFILE

# echo "token: $OPSILICSRV_TOKEN"
echo "OPSILICSRV_TOKEN=$OPSILICSRV_TOKEN"  >> $ENVFILE
