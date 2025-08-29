/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const storeMBus = defineStore('mbus', {
  persist: false,
  state: () => ({
    retries: 0,
    retriesMax: 3,
    _bus: undefined as WebSocket | undefined,
    _busterminal: undefined as WebSocket | undefined,
    _bus_last_msg: undefined as any,
  }),
  getters: {
    bus: ({ _bus }) => _bus,
    busterminal: ({ _busterminal }) => _busterminal,
    wsBusMsg: ({ _bus_last_msg }) => _bus_last_msg,
  },
  actions: {
    $reset() {
      this._bus = undefined
      this._busterminal = undefined
      this._bus_last_msg = undefined
    },
    setBus(bus: WebSocket | undefined) {
      this._bus = bus
    },
    setBusTerminal(bus: WebSocket | undefined) {
      this._busterminal = bus
    },
    setBusLastMsg(obj: any) {
      this._bus_last_msg = obj
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeMBus, import.meta.hot))
}
