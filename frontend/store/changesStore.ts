/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

export const storeChanges = defineStore('changes', {
  // not persisted, as this is only used during the session
  state: () => ({
    _changesProducts: [] as Array<any>,
    _changesHostParam: [] as Array<any>, // is that in use?
    triggerChangesProducts: 0, // used to trigger changes in the UI
  }),
  getters: {
    changesProducts: ({ _changesProducts }) => _changesProducts,
    changesHostParam: ({ _changesHostParam }) => _changesHostParam,
  },
  actions: {
    delFromChangesProducts(obj: object) {
      this.triggerChangesProducts += 1 // increment to trigger UI updates
      this._changesProducts.splice(this._changesProducts.indexOf(obj), 1)
    },
    delFromChangesHostParam(obj: object) {
      this._changesHostParam.splice(this._changesHostParam.indexOf(obj), 1)
    },
    delFromChangesProductsByIds(clientIds: string[], productId: string) {},
    clearChangesProducts() {
      this.triggerChangesProducts += 1 // increment to trigger UI updates
      this._changesProducts = []
    },
    clearChangesHostParam() {
      this._changesHostParam = []
    },
    pushChangesProduct(obj: object) {
      if (!this._changesProducts.includes(obj)) {
        this._changesProducts.push(obj)
      }
      this.triggerChangesProducts += 1 // increment to trigger UI updates
    },

    setChangeActionRequest(selectedClients: any, productId: string, newrequest: string) {
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
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeChanges, import.meta.hot))
}
