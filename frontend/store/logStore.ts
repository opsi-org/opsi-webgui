/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const storeLogs = defineStore('logs', {
  // persist: false,
  persist: {
    key: 'opsi-logs',
    storage: localStorage,
    pick: ['_logmarker'],
  },
  state: () => ({
    _logmarker: '-1;;instlog', // format: rowNr;clientId;logtype
    loglevel: 5,
    logtype: 'instlog',
    autofetch: false,
    autoscroll: true,
    syncSelection: true,
  }),
  getters: {
    logmarkerNr: (state: any): number => {
      return state._logmarker.split(';')[0] ? parseInt(state._logmarker.split(';')[0]) : -1
    },
    logmarkerId: (state: any): string => {
      return state._logmarker.split(';')[1] ? state._logmarker.split(';')[1] : ''
    },
    logmarkerType: (state: any): string => {
      return state._logmarker.split(';')[2] ? state._logmarker.split(';')[2] : ''
    },
  },
  actions: {
    setLogmarker(nr: number, id: string) {
      this._logmarker = `${nr};${id};${this.logtype}`
    },
    // setExpiresInterval(int: NodeJS.Timer | undefined) {
    //   if ((int === null || int === undefined) && this.expiresInterval) {
    //     clearInterval(this.expiresInterval)
    //     window.clearInterval(this.expiresInterval)
    //   }
    //   this.expiresInterval = int
    // },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeSettings, import.meta.hot))
}
