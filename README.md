# Development
## Important
* This repository has a submodule [opsiweb-ui-components](https://gitlab.uib.gmbh/uib/opsiweb-ui-components) (in directory opsiweb/components). It will be loaded automaticly, but for adding/commiting/pushing it is important to know it.
  HINT: Use the defined `gitall` command to e.g. automaticly change also the branch of submodules.
  > Examples:
  >  * `gitall pull`, `gitall add .`, `gitall commit -m "[fix] some msg"` will automaticly execute the given command in the main repository and in the submodule (if possible) !
  >  * `gitall checkout -B 123-feature-awesome-feature` will automaticly checkout the given branch in the main repo (opsiweb-ui) and create a branch in opsiweb-ui-components and change into this branch.
## Quick install: DevEnviroment
* Requirements: VisualStudioCode with 'Remote - Container' extension
* Clone project recursive(!)  and open it in VSCode with `git clone --recursive git@gitlab.uib.gmbh:uib/opsiweb-ui.git`
    > It should automaticly clone the sub-repository "opsiweb-ui-components" into opsiweb/components
    > You can also clone the subdirectory later with `git submodule update --init --recursive`
* run `.devcontainer/devenv.sh` in terminal
  * check if .env-file contains your fqdn (like 'host.uib.local')
  * if it only contains 'host': edit your local /etc/hosts file to contain `127.0.0.1       host.uib.local host localhost` and run devenv.sh again
* Reopen the project in remote-container (as vscode suggests)
  (Hint: Strg + Shift + P opens command palette; search for: `(rebuild and) reopen in container` )
    > the container starts automaticly the complete develepment enviroment including webgui(nuxt), storybook and playwright
    > but currently NOT opsiconfd! (see next steps)
* optional: import backend (e.g `opsi-backup restore --new-server-id=host.uib.local backend/opsibackup/opsi.bak` or with task)
* start opsiconfd (last command in terminal e.g `opsiconfd l5`)
* Accept certificate of opsiconfd: `https://localhost:4447/admin`
* Open: `https://localhost:8888/`


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
