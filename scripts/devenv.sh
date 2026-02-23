#!/bin/sh
# Copyright (c) 2026 uib GmbH <info@uib.de>
# All rights reserved.
# License: AGPL-3.0

FORCE=false
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
WORKSPACE_DIR="$(pwd)"
DOCKERDIR0=$WORKSPACE_DIR/docker
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

echo "################# backend: setup opsiconfd"
DOCKERDIR=$DOCKERDIR0/opsiconfd
if cd $DOCKERDIR; then git pull; else git clone git@gitlab.uib.gmbh:uib/opsiconfd.git $DOCKERDIR; fi
# evtl muss hier noch ein uv sync o.ä. passieren

echo "################# backend: check existing / force $FORCE"
if [ -e "$ENVFILE" ] && [ "$FORCE" = "false" ]; then
    # outdated if OPSICONFD_MYSQL_INTERNAL_URL not in .env file...
    CURRENT_ENV_OUTDATED=$(grep -q "OPSICONFD_MYSQL_INTERNAL_URL" "$ENVFILE" && echo "false" || echo "true")
    if [ "$CURRENT_ENV_OUTDATED" = "false" ]; then
        echo "Warning: File '$ENVFILE' already exists and is up to date."
        exit 0
    fi
    echo "Warning: File '$ENVFILE' already exists and will be overwritten (because its outdated)"
    echo "We store a backup of the old file as '$ENVFILE.bak'."
    cp "$ENVFILE" "$ENVFILE.bak"
fi

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
echo OPSICONFD_CORS_ORIGIN=* >> $ENVFILE
echo OPSICONFD_ADDON_DIRS=["/var/lib/opsiconfd/addons","/usr/lib/opsiconfd/addons"] >> $ENVFILE
echo OPSICONFD_MYSQL_INTERNAL_URL=mysql://opsi:opsi@localhost:3306/opsi >> $ENVFILE
echo MYSQL_HOST=localhost >> $ENVFILE
echo MYSQL_DATABASE=opsi >> $ENVFILE
echo MYSQL_USER=opsi >> $ENVFILE
echo MYSQL_PASSWORD=opsi >> $ENVFILE
echo MYSQL_PORT=3306 >> $ENVFILE
echo REDIS_HOST=redis >> $ENVFILE
echo GRAFANA_HOST=grafana >> $ENVFILE
echo OPSI_ADMIN_USER=adminuser >> $ENVFILE
echo OPSI_ADMIN_PW=adminuser >> $ENVFILE

echo OPSICONFD_RESTORE_BACKUP_URL=$OPSICONFD_RESTORE_BACKUP_URL >> $ENVFILE
echo PYTHONWARNINGS="ignore:Unverified HTTPS request" >> $ENVFILE