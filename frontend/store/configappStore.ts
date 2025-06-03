/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
import type { IObjectString2Boolean } from '@/types/tgeneral'

export const storeConfigapp = defineStore('config-app', {
  persist: {
    key: 'opsi-configs',
    storage: localStorage,
  },
  state: () => ({
    _config: undefined as IObjectString2Boolean | undefined,
  }),
  getters: {
    config: ({ _config }) => _config,
  },
  actions: {
    setConfig(obj: IObjectString2Boolean) {
      this._config = obj
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeConfigapp, import.meta.hot))
}
