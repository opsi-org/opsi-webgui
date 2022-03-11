
# Installation Production
## Quick install (only intern-obs)
* use development branch of obs e.g. content of `/etc/apt/sources.list.d/opsi.list`: `deb http://obs.uib.gmbh:82/home:/uibmz:/opsi:/4.2:/development/xUbuntu_20.04 ./`
* run `sudo apt update && sudo apt install opsi-webgui`

# Development
See [wiki](https://gitlab.uib.gmbh/uib/opsiweb-ui/-/wikis/Usage-webgui-with-components-lib) for detailed information about file-structure, installation, workflow, testing, ...
## Important
* This repository needs a sup-repository [opsiweb-ui-components](https://gitlab.uib.gmbh/uib/opsiweb-ui-components) (as directory opsiweb/uib-components). It will be cloned automaticly, by running the devenv.sh (See Quick install)

  *HINT for development*:
  Use the defined `gitall` command to e.g. automaticly change also the branch of sub-repository.
  > Examples:
  >  * `gitall pull`, `gitall add .`, `gitall commit -m "[fix] some msg"` will automaticly execute the given command in the main repository and in the submodule (if possible) !
  >  * `gitallcheckout 123-feature-awesome-feature` will automaticly checkout the given branch in the main repo (opsiweb-ui) and create a branch in opsiweb-ui-components and change into this branch.
## Quick install: DevEnviroment
* Requirements: VisualStudioCode with 'Remote - Container' extension
* **Clone project and open** it in VSCode with `git clone git@gitlab.uib.gmbh:uib/opsiweb-ui.git`
* **run `.devcontainer/devenv.sh`** in terminal (from Workspace-folder!)
  * check if .env-file contains your fqdn (like 'host.uib.local')
  * if it only contains 'host': edit your local /etc/hosts file to contain `127.0.0.1       host.uib.local host localhost` and run devenv.sh again
  * the script also pulls the sub-repository using ssh. If this step fail - pull it manually !
    `git clone git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git opsiweb/components`
* **Reopen** the project in remote-container (as vscode suggests)
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


