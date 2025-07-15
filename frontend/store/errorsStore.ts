/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
import type { IObjectString2Any, IObjectString2ArrayAny } from '~/types/tgeneral'
export const storeErrors = defineStore('errors', {
  persist: false,
  state: () => ({
    _time_combine_notifications_ms: 6 * 1000, // 3 seconds
    _combine_notifications: {
      error: true, // combine errors
      warning: true, // combine warnings
      warn: false, // combine warnings
      info: false, // combine info
      debug: false, // combine debug messages
    },
    _last_error: {} as IObjectString2Any,
    _error_log: {} as IObjectString2ArrayAny, // { type: 'products', error: {}, timestamp: 1234567890, showed: false, notificationInstance: null }

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
