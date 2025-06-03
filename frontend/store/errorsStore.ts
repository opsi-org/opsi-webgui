/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
export const storeErrors = defineStore('errors', {
  persist: false,
  state: () => ({
    _errorsProducts: [] as Array<any>,
    _errorsHostParam: [] as Array<any>,
  }),
  getters: {
    errorsProducts: ({ _errorsProducts }) => _errorsProducts,
    errorsHostParam: ({ _errorsHostParam }) => _errorsHostParam,
  },
  actions: {
    pushToErrorsProducts(obj: object) {
      this._errorsProducts.push(obj)
    },
    pushToErrorsHostParam(obj: object) {
      this._errorsHostParam.push(obj)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeErrors, import.meta.hot))
}
