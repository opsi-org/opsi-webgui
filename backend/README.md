# opsi-webgui backend

## installation for development
* run devenv.sh `./scripts/devenv.sh`
* (optional) update environment file `docker/backend/.env`
* (optional) put a opsi lisence into `<project>/docker/.` (it will be copied to correct place)
* start container
* use F5 to (re)start opsiconfd service or manually `sudo python /workspace/docker/backend/start_opsiconfd.py`
* You can start the webgui-app (frontend) connected to following backends through with VSCodes' Run and Debug section or through commands:
    * connect to this backend using `npm-run-dev-backend`
    * connect the opsi-docker backend using `npm-run-dev`
