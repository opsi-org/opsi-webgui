/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const useLogStore = defineStore('log', {
  persist: { key: 'opsi-log', storage: localStorage },
  state: () => ({
    logmarker: '-1;;instlog',
    loglevel: 5,
    logtype: 'instlog',
    autofetch: false,
    autoscroll: true,
    syncSelection: true,
  }),
  getters: {
    logmarkerNr: (state) => parseInt(state.logmarker.split(';')[0]) || -1,
    logmarkerId: (state) => state.logmarker.split(';')[1] || '',
    logmarkerType: (state) => state.logmarker.split(';')[2] || '',
  },
  actions: {
    setLogmarker(nr: number, id: string) {
      this.logmarker = `${nr};${id};${this.logtype}`
    },
  },
})
