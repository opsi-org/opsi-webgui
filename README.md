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
This project includes a development setup using multiple DevContainers (Docker containers). Only one container can serve as the primary container, while the others run in the background and can be controlled via specific commands when needed.
Container Configuration Overview

If the frontend is set as the primary container, you can choose between two backend options:
* **opsi-docker as the backend (recommended):**
  Ideal if you're primarily working on the frontend and don't need detailed backend output or logging.
  * Default port: 44471
  * Start the web GUI with: `npm run dev` (`https://localhost:8888`)

  * **opsiconfd from Git:**
    Use this if you need a live version of opsiconfd from the repository.
    * Default port: 44472
    * Start opsiconfd manually using `opsiconfd-frontend-start` or via "Run and Debug" `https://localhost:8889`
    * Then launch the webgui with: npm run dev-backend

    Note: This setup offers minimal advantages for typical frontend development.

If you're mainly working on the backend, it should be run as the primary container. In this case, opsi-docker is not required.
  * Start opsiconfd in debug mode via "Run and Debug"
  * Launch the webgui with: `npm-run-dev-backend` or through "Run and Debug"

For more detailed setup and usage instructions, please refer to the respective README.md files in the `frontend` and `backend` directories.

The opsiconfd will be available at the address https://localhost:44472 and the webgui at https://localhost:8888 with the username `adminuser` and password `adminuser` (changeable through `docker/<frontend|backend>/.env` file)


### Build devcontainer
- **Clone project and open** it in VSCode with `git clone https://github.com/opsi-org/opsi-webgui.git`
- **Reopen** the project in remote-container (as vscode suggests) and select your primary container
  (Hint: `Strg + Shift + P` opens command palette; search for: `(rebuild and) reopen in container` )
  * You will be asked which container you want to open (backend/frontend)
  * the container starts which creating an environment file `dockter/(backend|frontend)/.env` \
    this script may ask you questions (e.g. git username/email, hostname, etc)
  * after this you will be able to start the applications

### Start applications
- opsiconfd will be available at `https://localhost:44471` (automatically started), `htpps://localhost:44472` (needs manual start) and webgui at `https://localhost:8888` / `https://localhost:8889`
- **Re-starting webgui**: `cd /workspace/frontend/ && npm run dev` or Start 'webgui' in 'Run and Debug' section (same as F5)
  * Re-starting from backend container: `npm-run-dev` (for webgui 8888 accessing opsi-docker 44471) and `npm-run-dev-backend` (for webgui 8889 accessing local opsiconfd 44472)
- **opsiconfd from opsi-docker (44471)**:
  * server data at folder/volume `/data`
  * Accept certificate of opsiconfd: `https://localhost:44471/admin`
  * Restarting from both containers: `opsiconfd-docker-restart` or `opsiconfdcontainer supervisorctl reload`
  * Updating from both containers: `opsiconfd-docker-container apt update -y`
* **opsiconfd from git (4447)**:
  * server data at folder `/etc/opsi/...`
  * Accept certificate of opsiconfd: `https://localhost:44472/admin`
  * Restarting: Stop opsiconfd via "Run and Debug" or cancel the command
  * Updating: `cd /workspace/docker/backend/opsiconfd && git pull` (not tested yet)

### Contributing

For information on how to contribute to this project, please see the [CONTRIBUTING.md](CONTRIBUTING.md) file.
