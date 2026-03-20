import { defineStore } from 'pinia'
import { useSelectionStore } from './selectionStore'

export const useStateStore = defineStore('state', {
  persist: { key: 'opsi-webgui-state', storage: localStorage },
  state: () => ({ _legacy: true }),
  getters: {
    configServer(): string {
      return useSelectionStore().configServer
    },
    depots(): string[] {
      return useSelectionStore().selectedDepots
    },
    clients(): string[] {
      return useSelectionStore().selectedClients
    },
    products(): string[] {
      return useSelectionStore().selectedProducts
    },
    servers(): string[] {
      return useSelectionStore().selectedDepots
    },
    selectedDepots(): string[] {
      return useSelectionStore().selectedDepots
    },
    selectedClients(): string[] {
      return useSelectionStore().selectedClients
    },
    selectedProducts(): string[] {
      return useSelectionStore().selectedProducts
    },
    selectedServers(): string[] {
      return useSelectionStore().selectedDepots
    },
    selectedClientGroups(): string[] {
      return useSelectionStore().selectedClientGroups
    },
    selectedProductGroups(): string[] {
      return useSelectionStore().selectedProductGroups
    },
    isInitialized(): boolean {
      return useSelectionStore().isInitialized
    },
    hasAnySelections(): boolean {
      return useSelectionStore().hasAnySelection
    },
    selectedDepotsParam(): string {
      return useSelectionStore().selectedDepotsParam
    },
  },
  actions: {
    setConfigServer(server: string) {
      useSelectionStore().setConfigServer(server)
    },
    setDepots(depots: string[]) {
      useSelectionStore().setDepots(depots)
    },
    setClients(clients: string[]) {
      useSelectionStore().setClients(clients)
    },
    setProducts(products: string[]) {
      useSelectionStore().setProducts(products)
    },
    setServers(servers: string[]) {
      useSelectionStore().setDepots(servers)
    },
    setClientGroups(groups: string[]) {
      useSelectionStore().setClientGroups(groups)
    },
    setProductGroups(groups: string[]) {
      useSelectionStore().setProductGroups(groups)
    },
    toggleServer(serverId: string) {
      useSelectionStore().toggleDepot(serverId)
    },
    toggleClient(clientId: string) {
      useSelectionStore().toggleClient(clientId)
    },
    toggleProduct(productId: string) {
      useSelectionStore().toggleProduct(productId)
    },
    toggleClientGroup(groupId: string) {
      useSelectionStore().toggleClientGroup(groupId)
    },
    toggleProductGroup(groupId: string) {
      useSelectionStore().toggleProductGroup(groupId)
    },
    toggleDepot(depotId: string) {
      useSelectionStore().toggleDepot(depotId)
    },
    clearServers() {
      useSelectionStore().clearDepots()
    },
    clearClients() {
      useSelectionStore().clearClients()
    },
    clearProducts() {
      useSelectionStore().clearProducts()
    },
    clearClientGroups() {
      useSelectionStore().clearClientGroups()
    },
    clearProductGroups() {
      useSelectionStore().clearProductGroups()
    },
    addClients(clientIds: string[], source: 'table' | 'quickpanel' | 'groups' = 'groups') {
      useSelectionStore().addClients(clientIds, source)
    },
    addProducts(productIds: string[], source: 'table' | 'quickpanel' | 'groups' = 'groups') {
      useSelectionStore().addProducts(productIds, source)
    },
    setInitialized(value: boolean) {
      useSelectionStore().setInitialized(value)
    },
    clearAll() {
      useSelectionStore().clearAll()
    },
    async ensureDepotsSelected() {
      return useSelectionStore().ensureDepotsSelected()
    },
  },
})
