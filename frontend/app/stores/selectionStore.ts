import { defineStore } from 'pinia'

export const useSelectionStore = defineStore('selection', {
  persist: { key: 'opsi-selection', storage: localStorage },
  state: () => ({
    depots: [] as string[],
    clients: [] as string[],
    products: [] as string[],
    logClient: '',
    logType: 'instlog',
    logLevel: 5,
  }),
  getters: {
    selectedDepots: (state) => state.depots,
    selectedClients: (state) => state.clients,
    selectedProducts: (state) => state.products,
  },
  actions: {
    setDepots(depots: string[]) {
      this.depots = depots
    },
    setClients(clients: string[]) {
      this.clients = clients
    },
    setProducts(products: string[]) {
      this.products = products
    },
    clearAll() {
      this.depots = []
      this.clients = []
      this.products = []
    },
    toggleDepot(item: string) {
      const idx = this.depots.indexOf(item)
      idx === -1 ? this.depots.push(item) : this.depots.splice(idx, 1)
    },
    toggleClient(item: string) {
      const idx = this.clients.indexOf(item)
      idx === -1 ? this.clients.push(item) : this.clients.splice(idx, 1)
    },
    toggleProduct(item: string) {
      const idx = this.products.indexOf(item)
      idx === -1 ? this.products.push(item) : this.products.splice(idx, 1)
    },
  },
})
