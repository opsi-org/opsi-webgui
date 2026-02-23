/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineStore } from 'pinia'

interface MessageBusState {
  retries: number
  retriesMax: number
  bus?: WebSocket
  terminal?: WebSocket
  lastMsg?: unknown
}

export const useMessageBusStore = defineStore('messageBus', {
  state: (): MessageBusState => ({
    retries: 0,
    retriesMax: 3,
    bus: undefined,
    terminal: undefined,
    lastMsg: undefined,
  }),
  getters: {
    isConnected: (state: MessageBusState): boolean => state.bus?.readyState === 1,
  },
  actions: {
    reset(this: MessageBusState) {
      this.bus = undefined
      this.terminal = undefined
      this.lastMsg = undefined
      this.retries = 0
    },
    setBus(this: MessageBusState, bus: WebSocket | undefined) {
      this.bus = bus
    },
    setTerminal(this: MessageBusState, terminal: WebSocket | undefined) {
      this.terminal = terminal
    },
    setLastMsg(this: MessageBusState, msg: unknown) {
      this.lastMsg = msg
    },
    incRetries(this: MessageBusState) {
      this.retries += 1
    },
    resetRetries(this: MessageBusState) {
      this.retries = 0
    },
  },
})
