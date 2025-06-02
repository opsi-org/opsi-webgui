# opsi-webgui backend

## installation for development
* run devenv.sh `./scripts/devenv.sh`
* (optional) update environment file `docker/backend/.env`
* (optional) put a opsi lisence into `<project>/docker/.` (it will be copied to correct place)
* start container
* use F5 to (re)start opsiconfd service (for restarting sometimes need to run twice, since the script tries to kill running opsiconfd processes)
* You can start the webgui (frontend) connected to
    * this backend using `npm-run-dev-backend`
    * the opsi-docker backend using `npm-run-dev`
