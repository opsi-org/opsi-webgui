#!/bin/sh

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
WORKSPACE_DIR="$SCRIPT_DIR/.."


ALL=false
#echo "################# backend: parsing arguments"
for arg in "$@"
do
    case "$arg" in
        -a|--all)
            ALL=true
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Cleanup script for opsi-webgui docker environment."
            echo "Removes .env files, opsiconfd/opsi-docker directories, and optionally all related docker containers and volumes."
            echo "This files will be created again on next start of the docker containers."
            
            echo "Options:"
            echo "  -a, --all                  Remove all related docker containers and images"
            echo "  -h, --help                 Show this help message"
            exit 0
            ;;
    esac
done

echo "################# cleanup: remove .env files"
rm -f $WORKSPACE_DIR/docker/frontend/.env
rm -f $WORKSPACE_DIR/docker/backend/.env
echo "################# cleanup: remove docker directories"
rm -rf $WORKSPACE_DIR/docker/frontend/opsi-docker
rm -rf $WORKSPACE_DIR/docker/backend/opsiconfd


if [ "$ALL" = "true" ]; then
    CONTAINER_NAME_DOCKER=$(sudo docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)
    CONTAINER_NAME_FRONTEND=$(sudo docker ps --format "{{.Names}}" | grep webgui | grep frontend | grep opsi)
    CONTAINER_NAME_BACKEND=$(sudo docker ps --format "{{.Names}}" | grep webgui | grep backend | grep opsi)
    echo "################# cleanup: remove docker containers: $CONTAINER_NAME_DOCKER, $CONTAINER_NAME_FRONTEND, $CONTAINER_NAME_BACKEND"
    if [ -n "$CONTAINER_NAME_DOCKER" ]; then
        sudo docker rm -f $CONTAINER_NAME_DOCKER || true
    fi
    if [ -n "$CONTAINER_NAME_FRONTEND" ]; then
        sudo docker rm -f $CONTAINER_NAME_FRONTEND || true
    fi
    if [ -n "$CONTAINER_NAME_BACKEND" ]; then
        sudo docker rm -f $CONTAINER_NAME_BACKEND || true
    fi
    echo "################# cleanup: remove docker volumes related to opsi-webgui"
    V_FRONTEND=$(sudo docker volume ls -q --filter "name=opsi-webgui-frontend")
    if [ -n "$V_FRONTEND" ]; then
        sudo docker volume rm $V_FRONTEND || true
    fi
    V_BACKEND=$(sudo docker volume ls -q --filter "name=opsi-webgui-backend")
    if [ -n "$V_BACKEND" ]; then
        sudo docker volume rm $V_BACKEND || true
    fi
fi