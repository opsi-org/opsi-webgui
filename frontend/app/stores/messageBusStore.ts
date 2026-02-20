/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineStore } from 'pinia'

export const useMessageBusStore = defineStore('messageBus', {
  state: () => ({
    retries: 0,
    retriesMax: 3,
    bus: undefined as WebSocket | undefined,
    terminal: undefined as WebSocket | undefined,
    lastMsg: undefined as any,
  }),
  getters: {
    isConnected: (state) => state.bus?.readyState === 1,
  },
  actions: {
    reset() {
      this.bus = undefined
      this.terminal = undefined
      this.lastMsg = undefined
      this.retries = 0
    },
    setBus(bus: WebSocket | undefined) {
      this.bus = bus
    },
    setTerminal(terminal: WebSocket | undefined) {
      this.terminal = terminal
    },
    setLastMsg(msg: any) {
      this.lastMsg = msg
    },
    incRetries() {
      this.retries += 1
    },
    resetRetries() {
      this.retries = 0
    },
  },
})
