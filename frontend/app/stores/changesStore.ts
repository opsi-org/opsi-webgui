/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
import type { IChangeProducts, IChangeProductsFlat } from '~/types/tobjects'

export const storeChanges = defineStore('changes', {
  // not persisted, as this is only used during the session
  state: () => ({
    _changesProducts: {} as IChangeProducts,
    _changesHostParam: [] as Array<any>, // is that in use?
    triggerChangesProducts: 0, // used to trigger changes in the UI
  }),
  getters: {
    changesProducts: ({ _changesProducts }) => _changesProducts,
    changesHostParam: ({ _changesHostParam }) => _changesHostParam,
    changesProductsFlat: ({ _changesProducts }) => {
      const flat: Array<IChangeProductsFlat> = []
      for (const clientId in _changesProducts) {
        const productsWithSameActionRequest: { [actionRequest: string]: string[] } = {}
        for (const productId in _changesProducts[clientId]) {
          const change = _changesProducts[clientId][productId]
          if (change === undefined) {
            continue
          }
          if (!productsWithSameActionRequest[change.actionRequest]) {
            productsWithSameActionRequest[change.actionRequest] = []
          }
          if (!productsWithSameActionRequest[change.actionRequest]?.includes(productId)) {
            productsWithSameActionRequest[change.actionRequest]?.push(productId)
          }
        }

        for (const actionRequest in productsWithSameActionRequest) {
          flat.push({
            clientIds: [clientId],
            productIds: productsWithSameActionRequest[actionRequest] as any,
            actionRequest: actionRequest,
          })
        }
      }

      return flat
    },
    changesProductsProducts: ({ _changesProducts }) => {
      const products: string[] = []
      for (const clientId in _changesProducts) {
        for (const productId in _changesProducts[clientId]) {
          if (!products.includes(productId)) {
            products.push(productId)
          }
        }
      }
      return products
    },
    changesProductsExists({ _changesProducts }) {
      const anyChanges =
        Object.keys(_changesProducts).length > 0 &&
        Object.keys(_changesProducts).some(
          (clientId) => Object.keys(_changesProducts[clientId] as any).length > 0
        )
      return anyChanges
    },
  },
  actions: {
    delFromChangesProducts(obj: IChangeProductsFlat) {
      this.triggerChangesProducts += 1 // increment to trigger UI updates
      //this._changesProducts.splice(this._changesProducts.indexOf(obj), 1)
      for (const clientId of obj.clientIds) {
        if (this._changesProducts[clientId]) {
          for (const productId of obj.productIds) {
            delete this._changesProducts?.[clientId]?.[productId]
          }
          // remove client if no products left
          if (Object.keys(this._changesProducts[clientId]).length === 0) {
            delete this._changesProducts?.[clientId]
          }
        }
      }
    },

    delCProductByProductId(clientIds: string[], productId: string) {
      // remove changes of productId from all clients in _changesProducts
      for (const client of clientIds) {
        delete this._changesProducts?.[client]?.[productId]
      }
      this.triggerChangesProducts += 1 // increment to trigger UI updates
    },
    delFromChangesHostParam(obj: object) {
      this._changesHostParam.splice(this._changesHostParam.indexOf(obj), 1)
    },
    clearChangesProducts() {
      this.triggerChangesProducts += 1 // increment to trigger UI updates
      this._changesProducts = {}
    },
    clearChangesHostParam() {
      this._changesHostParam = []
    },
    pushChangesProduct(
      clientIds: string[],
      productIds: string[],
      newActionRequest: string,
      oldActionRequest: string,
      cleanup: boolean = true
    ) {
      if (newActionRequest === oldActionRequest) {
        // no change, don't add to changes
        if (cleanup) {
          for (const clientId of clientIds) {
            if (this._changesProducts[clientId]) {
              for (const productId of productIds) {
                delete this._changesProducts?.[clientId]?.[productId]
              }
              // remove client if no products left
              if (Object.keys(this._changesProducts[clientId]).length === 0) {
                delete this._changesProducts?.[clientId]
              }
            }
          }
        }
        return false
      }
      let anyReset = false
      for (const clientId of clientIds) {
        for (const productId of productIds) {
          if (!this._changesProducts[clientId]) {
            this._changesProducts[clientId] = {}
          }
          const obj = this._changesProducts[clientId][productId]
          if (cleanup && obj?.old === newActionRequest) {
            anyReset = true
          }
          this._changesProducts[clientId][productId] = {
            actionRequest: newActionRequest,
            old: oldActionRequest,
          }
        }
      }
      this.triggerChangesProducts += 1 // increment to trigger UI updates
      return anyReset
    },

    /*setChangeActionRequest(selectedClients: any, productId: string, newrequest: string) {
      const idx = this._changesProducts.findIndex(
        (c) => c.productIds.length === 1 && c.productIds[0] === productId
      )
      // TODO: check if same clients are selected
      if (idx !== -1) {
        const oldActionRequest = this._changesProducts[idx].oldActionRequest

        if (newrequest === oldActionRequest) {
          // no change, remove from changes
          this._changesProducts.splice(idx, 1)
        }
        return true
      }
      return idx
    },
    */
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeChanges, import.meta.hot))
}
