#!/bin/sh
# devenv.sh - Initial setup script (run BEFORE opening in devcontainer)
# Creates docker/.env file from current environment

FORCE=false
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
WORKSPACE_DIR="$(pwd)"
DOCKERDIR=$WORKSPACE_DIR/docker
ENVFILE=$DOCKERDIR/.env

for arg in "$@"; do
    case "$arg" in
        -f|--force)
            FORCE=true
            ;;
        -y|--yes)
            ASK_FOR_CONFIRMATION=false
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -f, --force    Force overwrite of existing .env file"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
    esac
done

echo "[INFO] Setting up opsiconfd..."
OPSICONFD_DIR=$DOCKERDIR/opsiconfd
if cd $OPSICONFD_DIR 2>/dev/null; then
    git pull
else
    git clone git@gitlab.uib.gmbh:uib/opsiconfd.git $OPSICONFD_DIR
fi

echo "[INFO] Checking existing .env (force=$FORCE)..."
if [ -e "$ENVFILE" ] && [ "$FORCE" = "false" ]; then
    echo "[WARN] File '$ENVFILE' already exists. Use -f to force overwrite."
    exit 0
fi

echo "[INFO] Creating .env file..."
echo "OPSI_HOSTNAME=$(hostname -f)" > $ENVFILE
echo "OPSI_DOMAIN=$(hostname -d)" >> $ENVFILE
echo "OPSICONFD_PORT=4447" >> $ENVFILE

if [ -z ${USER+x} ]; then
    echo "USER=$DEV_USER" >> $ENVFILE
else
    echo "USER=$USER" >> $ENVFILE
fi

echo "UID=$(id -u)" >> $ENVFILE
echo "ADDON_NAME=webgui" >> $ENVFILE
echo "ADDON_ID=webgui" >> $ENVFILE
echo "OPSILICSRV_URL=$OPSILICSRV_URL" >> $ENVFILE
echo "OPSILICSRV_TOKEN=$OPSILICSRV_TOKEN" >> $ENVFILE
echo "OPSICONFD_CORS_ORIGIN=*" >> $ENVFILE
echo "OPSICONFD_ADDON_DIRS=[\"/var/lib/opsiconfd/addons\"]" >> $ENVFILE
echo "OPSICONFD_MYSQL_INTERNAL_URL=mysql://opsi:opsi@localhost:3306/opsi" >> $ENVFILE
echo "MYSQL_HOST=localhost" >> $ENVFILE
echo "MYSQL_DATABASE=opsi" >> $ENVFILE
echo "MYSQL_USER=opsi" >> $ENVFILE
echo "MYSQL_PASSWORD=opsi" >> $ENVFILE
echo "MYSQL_PORT=3306" >> $ENVFILE
echo "REDIS_HOST=localhost" >> $ENVFILE
echo "OPSI_ADMIN_USER=adminuser" >> $ENVFILE
echo "OPSI_ADMIN_PW=adminuser" >> $ENVFILE
echo "UV_PYTHON=${UV_PYTHON:-3.14}" >> $ENVFILE
echo "OPSI_BACKUP_URL=https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json" >> $ENVFILE

echo "[INFO] .env file created at $ENVFILE"
