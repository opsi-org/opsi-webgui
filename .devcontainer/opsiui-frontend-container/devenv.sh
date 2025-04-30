#!/bin/sh

FORCE=false
WORKSPACE_DIR="$(pwd)"
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

DOCKERDIR0=$WORKSPACE_DIR/docker/frontend/

ENVFILE=$DOCKERDIR0/.env
#ENVFILE=$SCRIPT_DIR/.env
#DOCKERDIR=$SCRIPT_DIR/opsi-docker
DOCKERDIR=$DOCKERDIR0/opsi-docker

#echo "################# pparsing arguments"
for arg in "$@"
do
    case "$arg" in
        -f|--force)
            FORCE=true
            ;;
    esac
done

echo "################# setup opsi-docker"
mkdir -p $DOCKERDIR0
if cd $DOCKERDIR; then git pull; else git clone git@gitlab.uib.gmbh:uib/opsi-docker.git $DOCKERDIR; fi

echo "################# setup environment"

# exit if file exists
if [ -e "$ENVFILE" ] && [ "$FORCE" = "false" ]; then
    echo "Warning: File '$ENVFILE' already exists. To overwrite use -f or --force."
    exit 0
fi

echo "################# env for webgui" > $ENVFILE
username=""
if [ -z ${USER+x} ]; then
	echo DEV_USER=$DEV_USER >> $ENVFILE
	username=$DEV_USER
else
	echo DEV_USER=$USER >> $ENVFILE
	username=$USER
fi

echo "> setup git config (read data from git)"
defGitUser=$(git config user.name)
read -p "Enter git username (default: '$defGitUser'): " GITUSER
GITUSER="${GITUSER:=$defGitUser}"
echo DEV_GIT_NAME=$GITUSER >> $ENVFILE

defGitEmail=$(git config user.email)
read -p "Enter git email (default: '$defGitEmail'): " GITEMAIL
GITEMAIL="${GITEMAIL:=$defGitEmail}"
echo DEV_GIT_EMAIL=$GITEMAIL >> $ENVFILE

echo WEBGUI_DEV_PORT=8888 >> $ENVFILE

echo "################# env for opsi-server" >> $ENVFILE
echo DOCKER_IMAGE_OPSI_SERVER=uibmz/opsi-server:4.3-development >> $ENVFILE
echo RESTART_POLICY=no >> $ENVFILE

echo HOSTNAME=$(hostname -f) >> $ENVFILE
echo DOMAINNAME=$(hostname -d) >> $ENVFILE
echo OPSICONFD_GRAFANA_EXTERNAL_URL=http://$(hostname -f):3000 >> $ENVFILE
echo OPSICONFD_PORT=44471 >> $ENVFILE
echo OPSICONFD_PORT_UDP=691 >> $ENVFILE
echo OPSICONFD_LOG_LEVEL=6 >> $ENVFILE
echo OPSICONFD_LOG_LEVEL_FILE=4 >> $ENVFILE
echo OPSI_ADMIN_PASSWORD=adminuser >> $ENVFILE
echo OPSICONFD_RESTORE_BACKUP_URL=https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json  >> $ENVFILE
echo OPSICONFD_RESTORE_BACKUP_ALWAYS="true" >> $ENVFILE
echo OPSILICSRV_URL=https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiwebui-dev-container  >> $ENVFILE

# echo "token: $OPSILICSRV_TOKEN"
echo "OPSILICSRV_TOKEN=$OPSILICSRV_TOKEN"  >> $ENVFILE

echo "MYSQL_DATABASE=opsi" >> $ENVFILE
echo "MYSQL_USER=opsi" >> $ENVFILE
echo "MYSQL_PASSWORD=opsi" >> $ENVFILE