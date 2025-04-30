#!/bin/sh

FORCE=false
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
WORKSPACE_DIR="$(pwd)"
#ENVFILE=$SCRIPT_DIR/.env
#ENVFILE=.env


DOCKERDIR0=$WORKSPACE_DIR/docker/backend/

ENVFILE=$DOCKERDIR0/.env

#echo "################# pparsing arguments"
for arg in "$@"
do
    case "$arg" in
        -f|--force)
            FORCE=true
            ;;
    esac
done

# exit if file exists
if [ -e "$ENVFILE" ] && [ "$FORCE" = "false" ]; then
    echo "Warning: File '$ENVFILE' already exists. To overwrite use -f or --force."
    exit 0
fi

echo OPSICONFD_GRAFANA_EXTERNAL_URL=http://$(hostname -f):3000 > $ENVFILE
echo OPSI_HOSTNAME=$(hostname -f) >> $ENVFILE
echo OPSI_DOMAIN=$(hostname -d) >> $ENVFILE

if [ -z ${USER+x} ]; then
	echo DEV_USER=$DEV_USER >> $ENVFILE
else
	echo DEV_USER=$USER >> $ENVFILE
fi

echo JEMALLOC_VERSION=5.2.1 >> $ENVFILE
echo OPSILICSRV_TOKEN=  >> $ENVFILE
