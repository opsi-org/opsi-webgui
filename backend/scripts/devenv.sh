#!/bin/sh

FORCE=false
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
WORKSPACE_DIR="$(pwd)"
#ENVFILE=$SCRIPT_DIR/.env
#ENVFILE=.env


DOCKERDIR0=$WORKSPACE_DIR/docker/backend

ENVFILE=$DOCKERDIR0/.env



#echo "################# backend: parsing arguments"
for arg in "$@"
do
    case "$arg" in
        -f|--force)
            FORCE=true
            ;;
        -y|--yes)
            ASK_FOR_CONFIRMATION=false
            ;;
        # only an internal option to skip frontend setup
        -i|--ignore-other-envs)
            IGNORE_OTHER_ENV=true
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -f, --force                Force overwrite of existing .env file"
            echo "  -h, --help                 Show this help message"
            exit 0
            ;;
    esac
done


echo "################# backend: setup backend if needed" # (IGNORE_OTHER_ENV is set to false)
ENVFILE_FRONTEND=$WORKSPACE_DIR/docker/frontend/.env
DEVENVSCRIPT=$WORKSPACE_DIR/.devcontainer/opsi-webgui-container-frontend/devenv.sh

if [ "$IGNORE_OTHER_ENV" = "true" ]; then
    echo "Skipping backend setup because --ignore-other-envs is set."
elif [ "$FORCE" = "true" ]; then
    bash $DEVENVSCRIPT --force --ignore-other-envs --yes        
else
    bash $DEVENVSCRIPT --ignore-other-envs --yes
fi



echo "################# backend: check existing / force $FORCE"
if [ -e "$ENVFILE" ] && [ "$FORCE" = "false" ]; then
    echo "Warning: File '$ENVFILE' already exists. To overwrite use -f or --force."
    exit 0
fi

echo "################# backend: setup opsiconfd"
DOCKERDIR=$DOCKERDIR0/opsiconfd
if cd $DOCKERDIR; then git pull; else git clone git@gitlab.uib.gmbh:uib/opsiconfd.git $DOCKERDIR; fi


echo "################# backend: env for backend"
echo OPSICONFD_GRAFANA_EXTERNAL_URL=http://$(hostname -f):3000 > $ENVFILE
echo OPSI_HOSTNAME=$(hostname -f) >> $ENVFILE
echo OPSI_DOMAIN=$(hostname -d) >> $ENVFILE
echo OPSICONFD_PORT=44472 >> $ENVFILE
echo OPSICONFD_PORT_UDP=692 >> $ENVFILE


if [ -z ${USER+x} ]; then
	echo DEV_USER=$DEV_USER >> $ENVFILE
else
	echo DEV_USER=$USER >> $ENVFILE
fi

echo JEMALLOC_VERSION=5.2.1 >> $ENVFILE
echo OPSILICSRV_URL=$OPSILICSRV_URL  >> $ENVFILE
echo OPSILICSRV_TOKEN=$OPSILICSRV_TOKEN  >> $ENVFILE
