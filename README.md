# Installation (Production)
## Quick install (only intern-obs)
* optional: use development/experimental/testing branch of obs e.g. content of `/etc/apt/sources.list.d/opsi.list`: `deb http://obs.uib.gmbh:82/home:/uibmz:/opsi:/4.3:/development/xUbuntu_20.04 ./`
* oprional: may add key: `wget -q -O - http://obs.uib.gmbh:82/home:/uibmz:/opsi:/4.3:/development/xUbuntu_20.04/Release.key | sudo apt-key add -`
* run `sudo apt update && sudo apt install opsi-webgui`
* restart opsiconfd: `sudo systemctl restart opsiconfd`

# Create Release / Tag
Use following command to create a webgui release/tag:

```bash
# cs /workspace                          # directory where opsi-dev-tool.yml is located
# git tag -d $(git tag -l) && git fetch  # removes all local tags and fetches all from origin # only neccassary if you overwrite a existing tag
opsi-dev-cli git-tag                     # will overwrite opsi-dev-tool.yml and opsiweb/package.json (defined in opsi-dev-tool.yml)

```


# Development
See [wiki](https://gitlab.uib.gmbh/uib/opsiweb-ui/-/wikis/Usage-webgui-with-components-lib) for detailed information about file-structure, installation, workflow, testing, ...
## Important
## Quick install: DevEnviroment
* Requirements: VisualStudioCode with 'Remote - Container' extension
* **Clone project and open** it in VSCode with `git clone git@gitlab.uib.gmbh:uib/opsiweb-ui.git`
* **run `.devcontainer/devenv.sh`** in terminal (from Workspace-folder!)
  * check if .env-file contains your fqdn (like 'host.uib.local')
  * if it only contains 'host': edit your local /etc/hosts file to contain `127.0.0.1       host.uib.local host localhost` and run devenv.sh again
* **Reopen** the project in remote-container (as vscode suggests)
  (Hint: Strg + Shift + P opens command palette; search for: `(rebuild and) reopen in container` )
    > the container starts automaticly the complete develepment enviroment including webgui(nuxt), storybook and playwright
    > but currently NOT opsiconfd! (see next steps)
* optional: import backend (e.g `opsi-backup restore --new-server-id=host.uib.local backend/opsibackup/opsi.bak` or with task)
* At least two applications should start automaticly (visible in 'Run and Debug' or 'debug console'): opsiconfd, webgui
  If it is not the case the following commands can be run in the terminal inside the container (every command in own terminal):
  * opsiconfd: `opsiconfd l5`
  * webgui: `cd /workspace/opsiweb/ && npm run dev`
* Accept certificate of opsiconfd: `https://localhost:4447/admin`
* Open: `https://localhost:8888/` for webgui


