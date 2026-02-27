/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

interface StateStoreState {
  configServer: string
  depots: string[]
  clients: string[]
  products: string[]
  _initialized: boolean
}

export const useStateStore = defineStore('state', {
  persist: { key: 'opsi-webgui-state', storage: localStorage },
  state: (): StateStoreState => ({
    configServer: '',
    depots: [],
    clients: [],
    products: [],
    _initialized: false,
  }),
  getters: {
    selectedDepots: (state: StateStoreState): string[] => state.depots,
    selectedClients: (state: StateStoreState): string[] => state.clients,
    selectedProducts: (state: StateStoreState): string[] => state.products,
    isInitialized: (state: StateStoreState): boolean => state._initialized,
    /** Returns selectedDepots formatted for API calls: [depot1,depot2] */
    selectedDepotsParam: (state: StateStoreState): string => `[${state.depots.join(',')}]`,
  },
  actions: {
    setConfigServer(server: string) {
      this.configServer = server
      // If no depots selected, default to configserver
      if (this.depots.length === 0 && server) {
        this.depots = [server]
      }
    },
    setDepots(depots: string[]) {
      this.depots = depots
    },
    setClients(clients: string[]) {
      this.clients = clients
    },
    setProducts(products: string[]) {
      this.products = products
    },
    setInitialized(value: boolean) {
      this._initialized = value
    },
    clearAll() {
      this.depots = []
      this.clients = []
      this.products = []
    },
    /** Ensure at least the configserver is selected */
    async ensureDepotsSelected() {
      if (this.depots.length > 0) return true
      if (this.configServer) {
        this.depots = [this.configServer]
        return true
      }
      return false
    },
  },
})
