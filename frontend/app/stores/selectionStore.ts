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
      const next = new Set(this.selectedServers)
      if (next.has(serverId)) next.delete(serverId)
      else next.add(serverId)
      this.selectedServers = [...next]
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
      const next = new Set(this.selectedClients)
      if (next.has(clientId)) next.delete(clientId)
      else next.add(clientId)
      this.selectedClients = [...next]
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
      const next = new Set(this.selectedProducts)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      this.selectedProducts = [...next]
      this.selectionSource = source
    },
    clearProducts() {
      this.selectedProducts = []
    },

    setClientGroups(groups: string[]) {
      this.selectedClientGroups = groups
    },
    toggleClientGroup(groupId: string) {
      const next = new Set(this.selectedClientGroups)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      this.selectedClientGroups = [...next]
    },
    clearClientGroups() {
      this.selectedClientGroups = []
    },

    setProductGroups(groups: string[]) {
      this.selectedProductGroups = groups
    },
    toggleProductGroup(groupId: string) {
      const next = new Set(this.selectedProductGroups)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      this.selectedProductGroups = [...next]
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
      const existing = new Set(this.selectedClients)
      const toAdd = clientIds.filter((id) => !existing.has(id))
      if (toAdd.length > 0) this.selectedClients = this.selectedClients.concat(toAdd)
      this.selectionSource = source
    },
    addProducts(productIds: string[], source: SelectionSource = 'groups') {
      const existing = new Set(this.selectedProducts)
      const toAdd = productIds.filter((id) => !existing.has(id))
      if (toAdd.length > 0) this.selectedProducts = this.selectedProducts.concat(toAdd)
      this.selectionSource = source
    },
    removeClients(clientIds: string[], source: SelectionSource = 'groups') {
      const toRemove = new Set(clientIds)
      this.selectedClients = this.selectedClients.filter((id) => !toRemove.has(id))
      this.selectionSource = source
    },
    removeProducts(productIds: string[], source: SelectionSource = 'groups') {
      const toRemove = new Set(productIds)
      this.selectedProducts = this.selectedProducts.filter((id) => !toRemove.has(id))
      this.selectionSource = source
    },
  },
})
