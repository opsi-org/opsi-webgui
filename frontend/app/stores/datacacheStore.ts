/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const storeCache = defineStore('data-cache', {
  persist: {
    key: 'opsi-data',
    storage: localStorage,
  },
  state: () => ({
    myopsiconfigserver: '',
  }),
  getters: {
    opsiconfigserver: ({ myopsiconfigserver }) => myopsiconfigserver,
  },
  actions: {
    setOpsiconfigserver(s: string) {
      this.myopsiconfigserver = s
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeCache, import.meta.hot))
}
