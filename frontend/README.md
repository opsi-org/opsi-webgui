# opsi-webgui frontend

## installation for development

- run devenv.sh `./scripts/devenv.sh`
- (optional) update environment file
- (optional) put a opsi lisence into `<project>/docker/.` (it will be copied to correct place)
- start container
- Start webgui using following commands or through VSCode Run and Debug (F5)
  - use `npm run dev` to use backend started with this container with opsi-docker (opsiconfd port 44471 per default; To restart it use `opsiconfd-docker-restart`)
  - use `npm run dev-backend` to use backend from the backend container (opsiconfd port 4447 per default; Need to be started manually: `opsiconfd-backend-start`)

## workflows

### working only on frontend (container)

- simply use `npm run dev` in the frontend folder to run local webgui (`localhost:8888/addons/webgui/app/`)
- building using `buildDist` button in the bottom creates an productive app (`localhost:44471/addons/webgui-dev/app`). Make sure the feature/bug/change works in productive!

### working only on backend (container)

- local opsiconfd currently broken because of redis (?)

### working on frontend and backend simultaneously

- use frontend container
- run `npm run dev` in frontend folder (usually has hot reload)
- backend:
  - after making changes in backend files: use 'copyBackendFiles' bottom button (copes backend files to opsi-docker `44471/addons/webgui/...` and restarts opsiconfd)
  - log files: `tail -f /data/log/opsiconfd/<hostname>.log` (keep loglevel in mind)
  - opsiconfd config: `/data/etc/opsiconfd.conf` (after change restart opsiconfd)

## known bugs:

- command aliase not found (e.g. opsiconfd-docker-restart). run `zsh` and try again
- if you switched containers and the section "Run and Debug" show the old launch configuration, just open "launch.json" once. after that vscode updates the cache and should show the new configuration.
