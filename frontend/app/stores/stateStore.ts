/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineStore } from 'pinia'
import type { IChangeProducts, IChangeProductsFlat } from '~/types/tobjects'

export const useStateStore = defineStore('state', {
  persist: { key: 'opsi-webgui-state', storage: localStorage },
  state: () => ({
    configServer: '',
    // Selections
    depots: [] as string[],
    clients: [] as string[],
    products: [] as string[],

    // Product changes
    changes: {} as IChangeProducts,
    trigger: 0,
  }),
  getters: {
    selectedDepots: (state) => state.depots,
    selectedClients: (state) => state.clients,
    selectedProducts: (state) => state.products,
    flatChanges: ({ changes }) => {
      const flat: Array<IChangeProductsFlat> = []
      for (const clientId in changes) {
        const grouped: { [actionRequest: string]: string[] } = {}
        for (const productId in changes[clientId]) {
          const change = changes[clientId][productId]
          if (!grouped[change.actionRequest]) grouped[change.actionRequest] = []
          if (!grouped[change.actionRequest].includes(productId))
            grouped[change.actionRequest].push(productId)
        }
        for (const actionRequest in grouped) {
          flat.push({
            clientIds: [clientId],
            productIds: grouped[actionRequest],
            actionRequest,
          })
        }
      }
      return flat
    },
    changedProducts: ({ changes }) => {
      const products: string[] = []
      for (const clientId in changes) {
        for (const productId in changes[clientId]) {
          if (!products.includes(productId)) products.push(productId)
        }
      }
      return products
    },
    hasChanges({ changes }) {
      return Object.keys(changes).some((clientId) => Object.keys(changes[clientId]).length > 0)
    },
  },
  actions: {
    setConfigServer(s: string) {
      this.configServer = s
    },
    // Selection actions
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

    // Product change actions
    clearChanges() {
      this.changes = {}
      this.trigger += 1
    },
    removeChange(flat: IChangeProductsFlat) {
      for (const clientId of flat.clientIds) {
        if (this.changes[clientId]) {
          for (const productId of flat.productIds) {
            delete this.changes[clientId][productId]
          }
          if (Object.keys(this.changes[clientId]).length === 0) {
            delete this.changes[clientId]
          }
        }
      }
      this.trigger += 1
    },
    pushChange(
      clientIds: string[],
      productIds: string[],
      newActionRequest: string,
      oldActionRequest: string,
      cleanup = true
    ) {
      if (newActionRequest === oldActionRequest) {
        if (cleanup) {
          for (const clientId of clientIds) {
            if (this.changes[clientId]) {
              for (const productId of productIds) {
                delete this.changes[clientId][productId]
              }
              if (Object.keys(this.changes[clientId]).length === 0) {
                delete this.changes[clientId]
              }
            }
          }
        }
        return false
      }
      for (const clientId of clientIds) {
        for (const productId of productIds) {
          if (!this.changes[clientId]) this.changes[clientId] = {}
          this.changes[clientId][productId] = {
            actionRequest: newActionRequest,
            old: oldActionRequest,
          }
        }
      }
      this.trigger += 1
      return true
    },
  },
})
