# opsi-webgui backend

## installation for development
* run devenv.sh `./scripts/devenv.sh`
* (optional) put a opsi lisence into `<project>/docker/.` (it will be copied to correct place)
* start container
* (optional) update environment file
* use F5 to (re)start opsiconfd service (for restarting sometimes need to run twice, since the script tries to kill running opsiconfd processes)