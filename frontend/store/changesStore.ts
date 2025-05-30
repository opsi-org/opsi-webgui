/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const storeChanges = defineStore('changes', {
  persist: {
    key: 'opsi-localchanges',
    storage: localStorage,
  },
  state: () => ({
    _changesProducts: [] as Array<any>,
    _changesHostParam: [] as Array<any>,
  }),
  getters: {
    changesProducts: ({ _changesProducts }) => _changesProducts,
    changesHostParam: ({ _changesHostParam }) => _changesHostParam,
  },
  actions: {
    delFromChangesProducts(obj: object) {
      this._changesProducts.splice(this._changesProducts.indexOf(obj), 1)
    },
    delFromChangesHostParam(obj: object) {
      this._changesHostParam.splice(this._changesHostParam.indexOf(obj), 1)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeChanges, import.meta.hot))
}
