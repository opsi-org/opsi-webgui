# Development on opsi-webgui
## Start applications
* At least two applications should start automaticly (visible in 'Run and Debug' or 'debug console'): webgui and opsiconfd
  If it is not the case the following commands can be run in the terminal inside the container (every command in own terminal):
  * opsiconfd: `opsiconfdrestart`
  * webgui: `cd /workspace/frontend/ && npm run dev` or use Run&Debug section and start webgui3
* Accept certificate of opsiconfd: `https://localhost:4447/admin`
* Open: `https://localhost:8888/` for webgui

## Opsiconfd
opsiconfd is running in another container with the naming `opsi-webgui_devcontainer-opsi-server-1` (or similar). This means that the opsiconfd cannot be accessed directly.

To access the opsiconfd container, the following command can be used:
```bash
docker exec -u root opsi-webgui_devcontainer-opsi-server-1 ...
# e.g.
docker exec -u root opsi-webgui_devcontainer-opsi-server-1 opsiconfd --version
docker exec -u root opsi-webgui_devcontainer-opsi-server-1 apt update -y
docker exec -u root opsi-webgui_devcontainer-opsi-server-1 apt upgrade -y
```

To restart the opsiconfd service the following command can be used:
```bash
opsiconfdrestart
# or
docker exec -u root opsi-webgui_devcontainer-opsi-server-1 supervisorctl reload
```
