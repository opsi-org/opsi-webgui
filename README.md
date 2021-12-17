# Development
## Important
* This repository needs a sup-repository [opsiweb-ui-components](https://gitlab.uib.gmbh/uib/opsiweb-ui-components) (in directory opsiweb/components). It will be cloned automaticly, by running the devend.sh.
  HINT: Use the defined `gitall` command to e.g. automaticly change also the branch of submodules.
  > Examples:
  >  * `gitall pull`, `gitall add .`, `gitall commit -m "[fix] some msg"` will automaticly execute the given command in the main repository and in the submodule (if possible) !
  >  * `gitall checkout -B 123-feature-awesome-feature` will automaticly checkout the given branch in the main repo (opsiweb-ui) and create a branch in opsiweb-ui-components and change into this branch.
## Quick install: DevEnviroment
* Requirements: VisualStudioCode with 'Remote - Container' extension
* Clone project recursive(!)  and open it in VSCode with `git clone git@gitlab.uib.gmbh:uib/opsiweb-ui.git`
* run `.devcontainer/devenv.sh` in terminal
  * check if .env-file contains your fqdn (like 'host.uib.local')
  * if it only contains 'host': edit your local /etc/hosts file to contain `127.0.0.1       host.uib.local host localhost` and run devenv.sh again
  * the script also pulls the sub-repository using ssh. If this step fail - pull it manually !
    `git clone git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git opsiweb/components`
* Reopen the project in remote-container (as vscode suggests)
  (Hint: Strg + Shift + P opens command palette; search for: `(rebuild and) reopen in container` )
    > the container starts automaticly the complete develepment enviroment including webgui(nuxt), storybook and playwright
    > but currently NOT opsiconfd! (see next steps)
* optional: import backend (e.g `opsi-backup restore --new-server-id=host.uib.local backend/opsibackup/opsi.bak` or with task)
* Three applications should start automaticly (visible in 'Run and Debug' or 'debug console'): opsiconfd, webgui, webgui-storybook
  If it is not the case the following commands can be run in the terminal inside the container (every command in own terminal):
  * opsiconfd: `opsiconfd l5`
  * webgui: `cd /workspace/opsiweb/ && npm run dev`
  * webgui-storybook: `cd /workspace/opsiweb/ && npm run story`
* Accept certificate of opsiconfd: `https://localhost:4447/admin`
* Open: `https://localhost:8888/` for webgui
* Optional open: `http://localhost:3003/` for webgui-storybook


## Frontend-Testing
> In container-directory /workspace/webgui
* run for unit test: `npm run test:unit`
* run for integration tests: `npm run test:integration`
* run for e2e tests: `npm run test:e2e`
* run for all tests: `npm run test`
> Attention: integration and e2e tests could create snapshots. The result of these tests depends on the hardware and used system - so it can happen (at least currently) that they fail even if everything is ok.

# Production
## Quick install (only intern-obs)
* use development branch of obs e.g. content of `/etc/apt/sources.list.d/opsi.list`: `deb http://obs.uib.gmbh:82/home:/uibmz:/opsi:/4.2:/development/xUbuntu_20.04 ./`
* run `sudo apt update && sudo apt install opsi-webgui`
