/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

FACADE STORE - delegates all selection state to selectionStore.
Only owns: configServer, _initialized.
All selection getters/actions proxy to useSelectionStore() for backward compatibility.
*/
import { defineStore } from 'pinia'
import { useSelectionStore } from './selectionStore'

interface StateStoreState {
  configServer: string
  _initialized: boolean
}

export const useStateStore = defineStore('state', {
  persist: { key: 'opsi-webgui-state', storage: localStorage },
  state: (): StateStoreState => ({
    configServer: '',
    _initialized: false,
  }),
  getters: {
    /** @deprecated Use selectionStore.selectedDepots */
    depots(): string[] { return useSelectionStore().selectedDepots },
    /** @deprecated Use selectionStore.selectedClients */
    clients(): string[] { return useSelectionStore().selectedClients },
    /** @deprecated Use selectionStore.selectedProducts */
    products(): string[] { return useSelectionStore().selectedProducts },
    /** @deprecated Use selectionStore.selectedDepots */
    servers(): string[] { return useSelectionStore().selectedDepots },
    /** @deprecated Use selectionStore.selectedDepots */
    selectedDepots(): string[] { return useSelectionStore().selectedDepots },
    /** @deprecated Use selectionStore.selectedClients */
    selectedClients(): string[] { return useSelectionStore().selectedClients },
    /** @deprecated Use selectionStore.selectedProducts */
    selectedProducts(): string[] { return useSelectionStore().selectedProducts },
    /** @deprecated Use selectionStore.selectedDepots */
    selectedServers(): string[] { return useSelectionStore().selectedDepots },
    /** @deprecated Use selectionStore.selectedClientGroups */
    selectedClientGroups(): string[] { return useSelectionStore().selectedClientGroups },
    /** @deprecated Use selectionStore.selectedProductGroups */
    selectedProductGroups(): string[] { return useSelectionStore().selectedProductGroups },
    isInitialized: (state: StateStoreState): boolean => state._initialized,
    hasAnySelections(): boolean { return useSelectionStore().hasAnySelection },
    /** @deprecated Use selectionStore.selectedDepotsParam */
    selectedDepotsParam(): string { return useSelectionStore().selectedDepotsParam },
  },
  actions: {
    setConfigServer(server: string) {
      this.configServer = server
      const sel = useSelectionStore()
      if (sel.selectedDepots.length === 0 && server) {
        sel.setDepots([server])
      }
    },
    setDepots(depots: string[]) {
      const sel = useSelectionStore()
      if (depots.length === 0 && this.configServer) {
        sel.setDepots([this.configServer])
      } else {
        sel.setDepots(depots)
      }
    },
    setClients(clients: string[]) { useSelectionStore().setClients(clients) },
    setProducts(products: string[]) { useSelectionStore().setProducts(products) },
    setServers(servers: string[]) { useSelectionStore().setDepots(servers) },
    setClientGroups(groups: string[]) { useSelectionStore().setClientGroups(groups) },
    setProductGroups(groups: string[]) { useSelectionStore().setProductGroups(groups) },
    toggleServer(serverId: string) { useSelectionStore().toggleDepot(serverId) },
    toggleClient(clientId: string) { useSelectionStore().toggleClient(clientId) },
    toggleProduct(productId: string) { useSelectionStore().toggleProduct(productId) },
    toggleClientGroup(groupId: string) { useSelectionStore().toggleClientGroup(groupId) },
    toggleProductGroup(groupId: string) { useSelectionStore().toggleProductGroup(groupId) },
    toggleDepot(depotId: string) { useSelectionStore().toggleDepot(depotId) },
    clearServers() {
      const sel = useSelectionStore()
      if (this.configServer) {
        sel.setDepots([this.configServer])
      } else {
        sel.clearDepots()
      }
    },
    clearClients() { useSelectionStore().clearClients() },
    clearProducts() { useSelectionStore().clearProducts() },
    clearClientGroups() { useSelectionStore().clearClientGroups() },
    clearProductGroups() { useSelectionStore().clearProductGroups() },
    setInitialized(value: boolean) { this._initialized = value },
    clearAll() { useSelectionStore().clearAll() },
    async ensureDepotsSelected() {
      const sel = useSelectionStore()
      if (sel.selectedDepots.length > 0) return true
      if (this.configServer) {
        sel.setDepots([this.configServer])
        return true
      }
      return false
    },
  },
})
