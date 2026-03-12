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
  servers: string[]
  clientGroups: string[]
  productGroups: string[]
  _initialized: boolean
}

export const useStateStore = defineStore('state', {
  persist: { key: 'opsi-webgui-state', storage: localStorage },
  state: (): StateStoreState => ({
    configServer: '',
    depots: [],
    clients: [],
    products: [],
    servers: [],
    clientGroups: [],
    productGroups: [],
    _initialized: false,
  }),
  getters: {
    selectedDepots: (state: StateStoreState): string[] => state.depots,
    selectedClients: (state: StateStoreState): string[] => state.clients,
    selectedProducts: (state: StateStoreState): string[] => state.products,
    selectedServers: (state: StateStoreState): string[] => state.servers,
    selectedClientGroups: (state: StateStoreState): string[] => state.clientGroups,
    selectedProductGroups: (state: StateStoreState): string[] => state.productGroups,
    isInitialized: (state: StateStoreState): boolean => state._initialized,
    hasAnySelections: (state: StateStoreState): boolean =>
      state.depots.length > 0 ||
      state.clients.length > 0 ||
      state.products.length > 0 ||
      state.servers.length > 0 ||
      state.clientGroups.length > 0 ||
      state.productGroups.length > 0,
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
    setServers(servers: string[]) {
      this.servers = servers
    },
    setClientGroups(groups: string[]) {
      this.clientGroups = groups
    },
    setProductGroups(groups: string[]) {
      this.productGroups = groups
    },
    toggleServer(serverId: string) {
      const index = this.servers.indexOf(serverId)
      if (index > -1) {
        this.servers.splice(index, 1)
      } else {
        this.servers.push(serverId)
      }
    },
    toggleClient(clientId: string) {
      const index = this.clients.indexOf(clientId)
      if (index > -1) {
        this.clients.splice(index, 1)
      } else {
        this.clients.push(clientId)
      }
    },
    toggleProduct(productId: string) {
      const index = this.products.indexOf(productId)
      if (index > -1) {
        this.products.splice(index, 1)
      } else {
        this.products.push(productId)
      }
    },
    toggleClientGroup(groupId: string) {
      const index = this.clientGroups.indexOf(groupId)
      if (index > -1) {
        this.clientGroups.splice(index, 1)
      } else {
        this.clientGroups.push(groupId)
      }
    },
    toggleProductGroup(groupId: string) {
      const index = this.productGroups.indexOf(groupId)
      if (index > -1) {
        this.productGroups.splice(index, 1)
      } else {
        this.productGroups.push(groupId)
      }
    },
    toggleDepot(depotId: string) {
      const index = this.depots.indexOf(depotId)
      if (index > -1) {
        this.depots.splice(index, 1)
      } else {
        this.depots.push(depotId)
      }
    },
    clearServers() {
      this.servers = []
    },
    clearClients() {
      this.clients = []
    },
    clearProducts() {
      this.products = []
    },
    clearClientGroups() {
      this.clientGroups = []
    },
    clearProductGroups() {
      this.productGroups = []
    },
    setInitialized(value: boolean) {
      this._initialized = value
    },
    clearAll() {
      this.depots = []
      this.clients = []
      this.products = []
      this.servers = []
      this.clientGroups = []
      this.productGroups = []
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
