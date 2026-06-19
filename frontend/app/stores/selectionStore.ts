/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * selectionStore - Pinia store for selected servers, groups, and global selection state.
 */
import { defineStore } from 'pinia'

export type SelectionSource = 'table' | 'quickpanel' | 'groups' | null

export const useSelectionStore = defineStore('selection', {
  persist: {
    key: 'opsi-webgui-selection',
    storage: localStorage,
    pick: [
      'configServer',
      '_initialized',
      'selectedServers',
      'selectedClients',
      'selectedProducts',
      'selectedClientGroups',
      'selectedProductGroups',
    ],
  },
  state: () => ({
    configServer: '',
    _initialized: false,
    selectedServers: [] as string[],
    selectedClients: [] as string[],
    selectedProducts: [] as string[],
    selectedClientGroups: [] as string[],
    selectedProductGroups: [] as string[],
    selectionSource: null as SelectionSource,
  }),
  getters: {
    serverCount: (s) => s.selectedServers.length,
    clientCount: (s) => s.selectedClients.length,
    productCount: (s) => s.selectedProducts.length,
    hasAnySelection: (s) =>
      s.selectedServers.length > 0 ||
      s.selectedClients.length > 0 ||
      s.selectedProducts.length > 0 ||
      s.selectedClientGroups.length > 0 ||
      s.selectedProductGroups.length > 0,
    selectedServersParam: (s): string => `[${s.selectedServers.join(',')}]`,
    isInitialized: (s): boolean => s._initialized,
  },
  actions: {
    setConfigServer(server: string) {
      this.configServer = server
      if (this.selectedServers.length === 0 && server) this.selectedServers = [server]
    },
    async ensureServersSelected() {
      if (this.selectedServers.length > 0) return true
      if (this.configServer) {
        this.selectedServers = [this.configServer]
        return true
      }
      return false
    },
    setInitialized(value: boolean) {
      this._initialized = value
    },

    setServers(servers: string[], source: SelectionSource = 'table') {
      this.selectedServers =
        servers.length === 0 && this.configServer ? [this.configServer] : servers
      this.selectionSource = source
    },
    toggleServer(serverId: string, source: SelectionSource = 'table') {
      const i = this.selectedServers.indexOf(serverId)
      if (i > -1) this.selectedServers.splice(i, 1)
      else this.selectedServers.push(serverId)
      this.selectionSource = source
    },
    clearServers() {
      this.selectedServers = this.configServer ? [this.configServer] : []
    },

    setClients(clients: string[], source: SelectionSource = 'table') {
      this.selectedClients = clients
      this.selectionSource = source
    },
    toggleClient(clientId: string, source: SelectionSource = 'table') {
      const i = this.selectedClients.indexOf(clientId)
      if (i > -1) this.selectedClients.splice(i, 1)
      else this.selectedClients.push(clientId)
      this.selectionSource = source
    },
    clearClients() {
      this.selectedClients = []
    },

    setProducts(products: string[], source: SelectionSource = 'table') {
      this.selectedProducts = products
      this.selectionSource = source
    },
    toggleProduct(productId: string, source: SelectionSource = 'table') {
      const i = this.selectedProducts.indexOf(productId)
      if (i > -1) this.selectedProducts.splice(i, 1)
      else this.selectedProducts.push(productId)
      this.selectionSource = source
    },
    clearProducts() {
      this.selectedProducts = []
    },

    setClientGroups(groups: string[]) {
      this.selectedClientGroups = groups
    },
    toggleClientGroup(groupId: string) {
      const i = this.selectedClientGroups.indexOf(groupId)
      if (i > -1) this.selectedClientGroups.splice(i, 1)
      else this.selectedClientGroups.push(groupId)
    },
    clearClientGroups() {
      this.selectedClientGroups = []
    },

    setProductGroups(groups: string[]) {
      this.selectedProductGroups = groups
    },
    toggleProductGroup(groupId: string) {
      const i = this.selectedProductGroups.indexOf(groupId)
      if (i > -1) this.selectedProductGroups.splice(i, 1)
      else this.selectedProductGroups.push(groupId)
    },
    clearProductGroups() {
      this.selectedProductGroups = []
    },

    clearAll() {
      this.selectedServers = []
      this.selectedClients = []
      this.selectedProducts = []
      this.selectedClientGroups = []
      this.selectedProductGroups = []
      this.selectionSource = null
    },

    addClients(clientIds: string[], source: SelectionSource = 'groups') {
      for (const id of clientIds)
        if (!this.selectedClients.includes(id)) this.selectedClients.push(id)
      this.selectionSource = source
    },
    addProducts(productIds: string[], source: SelectionSource = 'groups') {
      for (const id of productIds)
        if (!this.selectedProducts.includes(id)) this.selectedProducts.push(id)
      this.selectionSource = source
    },
    removeClients(clientIds: string[]) {
      this.selectedClients = this.selectedClients.filter((id) => !clientIds.includes(id))
    },
    removeProducts(productIds: string[]) {
      this.selectedProducts = this.selectedProducts.filter((id) => !productIds.includes(id))
    },
  },
})
