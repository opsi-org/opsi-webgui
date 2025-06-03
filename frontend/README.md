# opsi-webgui frontend

## installation for development
* run devenv.sh `./scripts/devenv.sh`
* (optional) update environment file
* (optional) put a opsi lisence into `<project>/docker/.` (it will be copied to correct place)
* start container
* Start webgui using following commands or through VSCode Run and Debug (F5)
    * use `npm run dev` to use backend started with this container with opsi-docker (opsiconfd port 44471 per default;  To restart it use `opsiconfd-docker-restart`)
    * use `npm run dev-backend` to use backend from the backend container (opsiconfd port 4447 per default;  Need to be started manually: `opsiconfd-backend-start`)

## known bugs:
* if you switched containers and the section "Run and Debug" show the old launch configuration, just open "launch.json" once. after that vscode updates the cache and should show the new configuration.