# Official opsi-webgui

This is the source of the official opsi-webgui for the open source client management solution opsi.

The opsi-webgui is a web-based graphical user interface for managing the opsi system. It simplifies the deployment and management tasks, without installing an application on your device. With opsi-webgui, you can configure the opsi-servers, set up new opsi-clients, deploy products, inspect logs from any device with a web browser and more.

For further information about the webgui technology, installation or the usage checkout opsi docs [en](https://docs.opsi.org/opsi-docs-en/4.3/gui/webgui.html)/[de](https://docs.opsi.org/opsi-docs-de/4.3/gui/webgui.html)

Further links:

- https://docs.opsi.org
- https://opsi.org/ https://opsi.org/de/blog/
- https://www.uib.de/
- LinkedIn: uib GmbH
- Twitter/X: @opsi_org @uibDE

## Quick installation guide (Production)

This project espacially the devcontainer is not for production usage. To install the webgui from official sources see this chapter.

### Installation from sources

- optional: use `experimental`/`testing`/`stable` branch by editiing the content of `/etc/apt/sources.list.d/opsi.list`
- run `sudo apt update && sudo apt install opsi-webgui`
- restart opsiconfd: `sudo systemctl restart opsiconfd`
- checkout https://YOUROPSISERVER:OPSICONFD_PORT/addons/webgui/app

### Installation using Zip

- get zip from https://tools.43.opsi.org/stable/opsi-webgui.zip
- upload zip through https://YOUROPSISERVER:OPSICONFD_PORT/admin/#addons
- checkout https://YOUROPSISERVER:OPSICONFD_PORT/addons/webgui/app

## Development

### Environment

- Requirements: Docker, VisualStudioCode with 'Remote - Container' extension

### Structure

- `.devcontainer/`: VSCode devcontainer configuration files and installation files of tools (zsh, uv, opsi-dev-cli)
- `docker/`: Docker related files \
  `docker/opsiconfd/`: Local opsiconfd from git for development
- `frontend/`: Webgui frontend source code (Nuxt)
- `backend/`: Webgui backend source code (Python FastAPI)

### Build development environment

- **Clone project and open** it in VSCode with `git clone https://github.com/opsi-org/opsi-webgui.git`
- **Reopen** the project in remote-container (as vscode suggests) and select your primary container
  (Hint: `Strg + Shift + P` opens command palette; search for: `(rebuild and) reopen in container` )
  - the container starts and creates an environment file `docker/.env` \
    during the first initial setup you might need to update this file/s depending on your environment and needs (e.g. git username/email, hostname, domain, etc)
    ATTENTION: This file/s may be a source of building errors if not configured properly! Espacially the following properties must be set correctly:
    - `HOSTNAME`: The hostname of your development machine (e.g. `mydevmachine.localdomain`)
    - `OPSI_DOMAIN` / `DOMAIN`: The domain of your development machine (e.g. `localdomain`)
  - You may want to update this file/s. After this you will be able to start container and the applications

### Start applications

- **opsiconfd (44472)**:
  - First you need to start the opsiconfd server: `sudo bash /workspace/docker/run_opsiconfd.sh`. This will start opsiconfd on port $OPSICONFD_PORT (default 44472)
  - server data at folder `/etc/opsi/...`
  - Accept certificate of opsiconfd: `https://localhost:44472/admin`
  - Updating: `cd /workspace/docker/opsiconfd && git pull` (not tested yet)
  - Hints:
    - Be patient with cancelling the opsiconfd command (uv -> Ctrl + C), it may take some time to shutdown properly. Otherwise it may keep running in background. You could use `"kill $(lsof -t -i:$OPSICONFD_PORT)"` to kill the process.
- **webgui (8888)**:
  - Then you can start the development webgui: `cd /workspace/frontend/ && npm run dev`. This will start the webgui on port $WEBGUI_DEV_PORT (default 8889)
  - Access webgui at: `https://localhost:8888/`
  - The webgui is connected to the opsiconfd server started before
  - ATTENTION: Playwright tests do not work currently in the devcontainer! (opsiconfd uses a deb10 container, but playwright needs at least deb12)

### Contributing

For information on how to contribute to this project, please see the [CONTRIBUTING.md](CONTRIBUTING.md) file.
