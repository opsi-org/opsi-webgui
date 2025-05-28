# opsi-webgui backend

## installation for development
* run devenv.sh `./scripts/devenv.sh`
* (optional) put a opsi lisence into `<project>/docker/.` (it will be copied to correct place)
* start container
* (optional) update environment file
* use F5 to (re)start opsiconfd service (for restarting sometimes need to run twice, since the script tries to kill running opsiconfd processes)
* You can start the webgui (frontend) connected to this backend using `npm-run-dev-backend` (optionally, use `npm-run-dev` runs the frontend with the opsi-docker backend)