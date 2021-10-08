# Quick install (Development)
## webgui
* Requirement: [Install opsiconfd](https://gitlab.uib.gmbh/uib/opsiconfd/-/tree/v4.2#devcontainer) (in devcontainer) and start it
* Open opsiweb-ui-project in vscode
* Reopen the project in remote-container (as vscode suggests)
  (Hint: Strg + Shift + P opens command palette; search for: `(rebuild and) reopen in container` )
    > the container starts automaticly the complete develepment enviroment including webgui(nuxt), storybook and playwright
* Accept certificate of opsiconfd: `https://localhost:4447/webgui/api/user/opsiserver`
* Open: `https://localhost:8888/`

## testing
* for unit test run: `npm run test:unit`
* for integration tests run: `npm run test:integration`
* for e2e tests run: `npm run test:e2e`
* for all tests run: `npm run test`
> Attention: integration and e2e tests could create snapshots. The result of these tests depends on the hardware and used system - so it can happen (at least currently) that they fail even if everything is ok.

# Quick install (Production)
* use development branch of obs e.g. content of `/etc/apt/sources.list.d/opsi.list`: `deb http://obs.uib.gmbh:82/home:/uibmz:/opsi:/4.2:/development/xUbuntu_20.04 ./`
* run `sudo apt update && sudo apt install opsi-webgui`
