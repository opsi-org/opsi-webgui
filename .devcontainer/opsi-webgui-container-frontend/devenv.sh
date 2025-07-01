#!/bin/sh

FORCE=false
WORKSPACE_DIR="$(pwd)"
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

DOCKERDIR0=$WORKSPACE_DIR/docker/frontend/
ENVFILE=$DOCKERDIR0/.env
DOCKERDIR=$DOCKERDIR0/opsi-docker
ASK_FOR_CONFIRMATION=true

#echo "################# parsing arguments"
for arg in "$@"
do
    case "$arg" in
        -f|--force)
            FORCE=true
            ;;
        -y|--yes)
            # This is a shortcut to set FORCE to true and IGNORE_OTHER_ENV to true
            ASK_FOR_CONFIRMATION=false
            ;;
        # only an internal option to skip backend setup
        -i|--ignore-other-envs)
            IGNORE_OTHER_ENV=true
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -f, --force                Force overwrite of existing .env file"
            echo "  -y, --yes                  Skip confirmation prompts and use defaults"
            echo "  -h, --help                 Show this help message"
            exit 0
            ;;
    esac
done

echo "################# frontend: setup opsi-docker"
mkdir -p $DOCKERDIR0
if cd $DOCKERDIR; then git pull; else git clone git@gitlab.uib.gmbh:uib/opsi-docker.git $DOCKERDIR; fi

echo "################# frontend: setup backend if needed" # (IGNORE_OTHER_ENV is set to false)
DEVENVSCRIPT=$WORKSPACE_DIR/backend/scripts/devenv.sh
ENVFILE_BACKEND=$DOCKERDIR1/docker/backend/.env

if [ "$IGNORE_OTHER_ENV" = "true" ]; then
    echo "Skipping backend setup because --ignore-other-envs is set."
elif [ "$FORCE" = "true" ]; then
    bash $DEVENVSCRIPT --force --ignore-other-envs --yes
else
    bash $DEVENVSCRIPT --ignore-other-envs --yes
fi



echo "################# frontend: setup environment"

# exit if file exists
if [ -e "$ENVFILE" ] && [ "$FORCE" = "false" ]; then
    echo "Warning: File '$ENVFILE' already exists. To overwrite use -f or --force."
    exit 0
fi

#echo "################# frontend: env for webgui" > $ENVFILE
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
if [ "$ASK_FOR_CONFIRMATION" = "true" ]; then
  read -p "Enter git username (default: '$defGitUser'): " GITUSER
fi
GITUSER="${GITUSER:=$defGitUser}"
echo DEV_GIT_NAME=$GITUSER >> $ENVFILE

defGitEmail=$(git config user.email)
if [ "$ASK_FOR_CONFIRMATION" = "true" ]; then
  read -p "Enter git email (default: '$defGitEmail'): " GITEMAIL
fi
GITEMAIL="${GITEMAIL:=$defGitEmail}"
echo DEV_GIT_EMAIL=$GITEMAIL >> $ENVFILE

echo WEBGUI_DEV_PORT=8888 >> $ENVFILE

#echo "################# frontend: env for opsi-server" >> $ENVFILE
echo DOCKER_IMAGE_OPSI_SERVER=uibmz/opsi-server:4.3-development >> $ENVFILE
echo RESTART_POLICY=no >> $ENVFILE
# TODO: check hostname
# - check if .env-file contains your fqdn (like 'HOST.YOUR.DOMAIN')
# - if it only contains 'HOST': edit your local /etc/hosts file to contain `127.0.0.1       host.your.domain host localhost` and run devenv.sh again
defHostname=$(hostname -f)

if [ "$ASK_FOR_CONFIRMATION" = "true" ]; then
    read -p "Enter your hostname (default: '$defHostname'): " HOSTNAME
fi

HOSTNAME="${HOSTNAME:=$defHostname}"
echo HOSTNAME=$HOSTNAME >> $ENVFILE

defDomainname=$(hostname -f)

if [ "$ASK_FOR_CONFIRMATION" = "true" ]; then
    read -p "Enter your domain (default: '$defDomainname'): " DOMAINNAME
fi
DOMAINNAME="${DOMAINNAME:=$defDomainname}"
echo DOMAINNAME=$DOMAINNAME >> $ENVFILE

echo OPSICONFD_GRAFANA_EXTERNAL_URL=http://$(hostname -f):3000 >> $ENVFILE
echo OPSICONFD_PORT=44471 >> $ENVFILE
echo OPSICONFD_PORT_UDP=691 >> $ENVFILE
echo OPSICONFD_LOG_LEVEL=6 >> $ENVFILE
echo OPSICONFD_LOG_LEVEL_FILE=4 >> $ENVFILE
echo OPSI_ADMIN_PASSWORD=adminuser >> $ENVFILE
echo OPSICONFD_RESTORE_BACKUP_URL=https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json  >> $ENVFILE
echo OPSICONFD_RESTORE_BACKUP_ALWAYS="true" >> $ENVFILE
echo OPSILICSRV_URL=$OPSILICSRV_URL  >> $ENVFILE
echo OPSILICSRV_TOKEN=$OPSILICSRV_TOKEN  >> $ENVFILE

echo "MYSQL_DATABASE=opsi" >> $ENVFILE
echo "MYSQL_USER=opsi" >> $ENVFILE
echo "MYSQL_PASSWORD=opsi" >> $ENVFILE