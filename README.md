# Quick install (Development)
* [Install opsiconfd](https://gitlab.uib.gmbh/uib/opsiconfd/-/tree/v4.2#devcontainer) (in devcontainer) and start it
* Open opsiweb-ui-project in vscode
  * Optional: Replace `remoteUser` in file `.devcontainer/devcontainer.json` with the id of your local user (for this run in terminal: `id -u <your-username>`)
* Reopen the project in remote-container (as vscode suggests)
  (Hint: Strg + Shift + P opens command palette; search for: `(rebuild and) reopen in container` )
* Accept certificate of opsiconfd: `https://localhost:4447/webgui/api/user/opsiserver`
* Open: `https://localhost:8888/`

# Quick install (production)
* use development branch of obs e.g. content of `/etc/apt/sources.list.d/opsi.list`: `deb http://obs.uib.gmbh:82/home:/uibmz:/opsi:/4.2:/development/xUbuntu_20.04 ./`
* run `sudo apt update && sudo apt install opsi-webgui`
