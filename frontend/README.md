# opsi-webgui frontend

## installation for development
* run devenv.sh `./scripts/devenv.sh`
* (optional) put a opsi lisence into `<project>/docker/.` (it will be copied to correct place)
* start container
* (optional) update environment file
* Start webgui:
    * use `npm run dev` to use backend started with this container with opsi-docker (opsiconfd port 44471 per default). This opsiconfd is automatically started.
    * use `npm run dev-backend` to use backend from the backend container (opsiconfd port 4447 per default). In this case its neccessay to also run the webgui-backend container in parallel.
    * does not work not: use F5 to (re)start tasks