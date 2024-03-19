# Official opsi-webgui
This is the source of the official opsi-webgui for the open source client management solution opsi.

The opsi-webgui is a web-based graphical user interface for managing the opsi system. It simplifies the deployment and management tasks, without installing an application on your device. With opsi-webgui, you can configure the opsi-servers, set up new opsi-clients, deploy products, inspect logs from any device with a web browser and more.

For further information about the webgui technology, installation or the usage checkout opsi docs https://docs.opsi.org/opsi-docs-en/4.3/gui/webgui.html

Further links:
* https://docs.opsi.org
* https://opsi.org/ https://opsi.org/de/blog/
* https://www.uib.de/
* LinkedIn: uib GmbH
* Twitter/X: @opsi_org @uibDE

## Quick installation guide (Production)
This project espacially the devcontainer is not for production usage. To install the webgui from official sources see this chapter.
### Installation from sources
* optional: use `development`/`experimental`/`testing`/`stable` branch by editiing the content of `/etc/apt/sources.list.d/opsi.list`
* run `sudo apt update && sudo apt install opsi-webgui`
* restart opsiconfd: `sudo systemctl restart opsiconfd`
* checkout https://YOUROPSISERVER:4447/addons/webgui/app

### Installation using Zip
* get zip from https://download.uib.de/opsi4.3/stable/opsiconfd-addons/
* upload zip through https://YOUROPSISERVER:4447/admin/#addons
* checkout https://YOUROPSISERVER:4447/addons/webgui/app


## Development
The development with this project includes a complete dev environment. The built container includes a opsiconfd and the webgui.
The opsiconfd will be available at the address https://localhost:4447 and the webgui at https://localhost:8888 with the username `adminuser` and password `adminuser`

### Environment
* Requirements: Docker, VisualStudioCode with 'Remote - Container' extension

### Build devcontainer
* **Clone project and open** it in VSCode with `git clone https://github.com/opsi-org/opsiweb-ui.git`
* **Clone opsi-docker** `git@gitlab.uib.gmbh:uib/opsi-docker.git` inside `.devcontainer`.
* **run `.devcontainer/devenv.sh`** in terminal (from Workspace-folder!)
  * check if .env-file contains your fqdn (like 'HOST.YOUR.DOMAIN')
  * if it only contains 'HOST': edit your local /etc/hosts file to contain `127.0.0.1       host.your.domain host localhost` and run devenv.sh again
* **Reopen** the project in remote-container (as vscode suggests)
  (Hint: Strg + Shift + P opens command palette; search for: `(rebuild and) reopen in container` )
    > the container starts automaticly the complete develepment enviroment including webgui(nuxt), storybook and playwright
    > but currently NOT opsiconfd! (see next steps)
* optional: import backend (e.g `opsi-backup restore --new-server-id=host.uib.local backend/opsibackup/opsi.bak` or with task)
  The backend will be overwritten by a rebuild of the container.

### Start applications
* At least two applications should start automaticly (visible in 'Run and Debug' or 'debug console'): opsiconfd, webgui
  If it is not the case the following commands can be run in the terminal inside the container (every command in own terminal):
  * opsiconfd: `opsiconfd l5`
  * webgui: `cd /workspace/opsiweb/ && npm run dev`
* Accept certificate of opsiconfd: `https://localhost:4447/admin`
* Open: `https://localhost:8888/` for webgui


