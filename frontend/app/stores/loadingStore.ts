/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

interface TActions {
  [key: string]: Record<string, any>
}
export const storeLoading = defineStore('loading', {
  state: () => ({
    actions: {} as TActions,
  }),
  getters: {
    anyActionIsLoading: (state) => {
      for (const action in state.actions) {
        // Check if any client is loading True for this action
        if (Object.values(state.actions[action] as any).some((isLoading) => isLoading)) {
          return true
        }
      }
      return false
    },
  },
  actions: {
    setIsLoadingClients(action: string, clientIds: string[], value: boolean = true) {
      for (const clientId of clientIds) {
        if (!this.actions?.[action]) {
          this.actions[action] = {}
        }
        this.actions[action][clientId] = value
      }
    },
    setIsLoadingClient(action: string, clientId: string, value: boolean = true) {
      if (!this.actions?.[action]) {
        this.actions[action] = {}
      }
      this.actions[action][clientId] = value
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeLoading, import.meta.hot))
}
