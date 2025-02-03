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
  // persist: {
  //   key: 'opsi-auth',
  //   storage: localStorage,
  //   // storage: sessionStorage,
  // },
  state: () => ({
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

// export const storeMBus = defineStore('mbus', () => {
//   // need to return the states / getters/ actions in the end of the setup
//   // states
//   let _bus: WebSocket|undefined = undefined
//   let _busterminal: WebSocket|undefined = undefined
//   let _bus_last_msg: any = undefined

//   // getter
//   const bus = computed(() => _bus)
//   const busterminal = computed(() => _busterminal)
//   const wsBusMsg = computed(() => _bus_last_msg)

//   // actions

//   function setBus (bus: WebSocket|undefined) {
//     _bus = bus
//   }

//   function setBusTerminal (bus: WebSocket|undefined) {
//     _busterminal = bus
//   }

//   function setBusLastMsg (obj: any) {
//     _bus_last_msg = obj
//   }

//   return {
//     /* states */
//     /* getters */ bus, busterminal, wsBusMsg
//     /* actions */ , setBus, setBusTerminal, setBusLastMsg
//   }
// }, { persist: true } as any)
