# Development on opsi-webgui

## Start applications
* Starting webgui: `cd /workspace/frontend/ && npm run dev` or Start 'webgui' in 'Run and Debug' section (same as F5)
* opsiconfd is running in another container with the naming `opsi-webgui_devcontainer-opsi-server-1` (or similar). This means that the opsiconfd cannot be accessed directly. To access the opsiconfd container, use `opsiconfdcontainer ....` (e.g. `opsiconfdcontainer apt update -y`) or `opsiconfdrestart` to restart the service.

## Access applications
* Accept certificate of opsiconfd: `https://localhost:4447/admin`
* Open: `https://localhost:8888/addons/webgui/app` for webgui
