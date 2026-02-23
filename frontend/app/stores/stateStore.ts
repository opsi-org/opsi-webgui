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
}

export const useStateStore = defineStore('state', {
  persist: { key: 'opsi-webgui-state', storage: localStorage },
  state: (): StateStoreState => ({
    configServer: '',
    depots: [],
    clients: [],
    products: [],
  }),
  getters: {
    selectedDepots: (state: StateStoreState): string[] => state.depots,
    selectedClients: (state: StateStoreState): string[] => state.clients,
    selectedProducts: (state: StateStoreState): string[] => state.products,
  },
  actions: {
    setConfigServer(this: StateStoreState, s: string) {
      this.configServer = s
    },
    setDepots(this: StateStoreState, depots: string[]) {
      this.depots = depots
    },
    setClients(this: StateStoreState, clients: string[]) {
      this.clients = clients
    },
    setProducts(this: StateStoreState, products: string[]) {
      this.products = products
    },
    clearAll(this: StateStoreState) {
      this.depots = []
      this.clients = []
      this.products = []
    },
  },
})
