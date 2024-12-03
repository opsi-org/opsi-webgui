import { defineStore } from 'pinia'

export const storeChanges = defineStore('changes', {
  persist: {
    key: 'opsi-localchanges',
    storage: localStorage,
    // storage: sessionStorage,
  },
  state: () => ({
    _changesProducts: [] as Array<any>,
    _changesHostParam: [] as Array<any>,
  }),
  getters: {
    changesProducts: ({ _changesProducts }) => _changesProducts,
    changesHostParam: ({ _changesHostParam }) => _changesHostParam,
  },
  actions: {
    pushToChangesProducts(obj: object) {
      this._changesProducts.push(obj)
    },
    delWithIndexChangesProducts(index: number) {
      this._changesProducts.splice(index, 1)
    },
    delFromChangesProducts(obj: object) {
      this._changesProducts.splice(this._changesProducts.indexOf(obj), 1)
    },
    deleteFromProdChangesWhere(
      hostKV: Array<any>,
      objectKV: Array<any>,
      additionalKV: Array<any>,
    ) {
      let removeItems = this._changesProducts.filter(
        (item) => item.user === localStorage.getItem('username'),
      )
      // filter by hosts
      removeItems = removeItems.filter((item) =>
        hostKV[1].includes(item[hostKV[0]]),
      )
      // filter by e.g. productId
      if (objectKV) {
        removeItems = removeItems.filter(
          (item) => item[objectKV[0]] === hostKV[1],
        )
      }
      // filter by e.g. propertyId
      if (additionalKV) {
        removeItems = removeItems.filter(
          (item) => item[additionalKV[0]] === additionalKV[1],
        )
      }

      // remove filtered elements
      removeItems.forEach((f) =>
        this._changesProducts.splice(
          this._changesProducts.findIndex((item) => item === f),
          1,
        ),
      )
    },
    deleteAllProductChanges() {
      // this._changesProducts.splice(0, this._changesProducts.length)
      const removeItems = this._changesProducts.filter(
        (item) => item.user === localStorage.getItem('username'),
      )
      removeItems.forEach((f) =>
        this._changesProducts.splice(
          this._changesProducts.findIndex((item) => item.user === f.user),
          1,
        ),
      )
    },
    pushToChangesHostParam(obj: object) {
      this._changesHostParam.push(obj)
    },
    delWithIndexChangesHostParam(index: number) {
      this._changesHostParam.splice(index, 1)
    },
    delFromChangesHostParam(obj: object) {
      this._changesHostParam.splice(this._changesHostParam.indexOf(obj), 1)
    },
    deleteAllChangesHostParam() {
      // this._changesProducts.splice(0, this._changesProducts.length)
      const removeItems = this._changesHostParam.filter(
        (item) => item.user === localStorage.getItem('username'),
      )
      removeItems.forEach((f) =>
        this._changesHostParam.splice(
          this._changesHostParam.findIndex((item) => item.user === f.user),
          1,
        ),
      )
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeChanges, import.meta.hot))
}

// export const storeChanges = defineStore('changes', () => {
//   // need to return the states / getters/ actions in the end of the setup
//   // states
//   let _changesProducts: Array<any> = []
//   let _changesHostParam: Array<any> = []

//   // getter
//   const changesProducts = computed(() => _changesProducts)
//   const changesHostParam = computed(() => _changesHostParam)

//   // actions
//   function pushToChangesProducts (obj: object) {
//     _changesProducts.push(obj)
//   }

//   function delWithIndexChangesProducts (index: number) {
//     _changesProducts.splice(index, 1)
//   }

//   function delFromChangesProducts (obj: object) {
//     _changesProducts.splice(_changesProducts.indexOf(obj), 1)
//   }

//   function deleteFromProdChangesWhere (hostKV: Array<any>, objectKV:Array<any>, additionalKV: Array<any>) {
//     let removeItems = _changesProducts.filter(item => item.user === localStorage.getItem('username'))
//     // filter by hosts
//     removeItems = removeItems.filter(item => hostKV[1].includes(item[hostKV[0]]))
//     // filter by e.g. productId
//     if (objectKV) { removeItems = removeItems.filter(item => item[objectKV[0]] === hostKV[1]) }
//     // filter by e.g. propertyId
//     if (additionalKV) { removeItems = removeItems.filter(item => item[additionalKV[0]] === additionalKV[1]) }

//     // remove filtered elements
//     removeItems.forEach(f => _changesProducts.splice(_changesProducts.findIndex(item => item === f), 1))
//   }

//   function deleteAllProductChanges () {
//     // _changesProducts.splice(0, _changesProducts.length)
//     const removeItems = _changesProducts.filter(item => item.user === localStorage.getItem('username'))
//     removeItems.forEach(f => _changesProducts.splice(_changesProducts.findIndex(item => item.user === f.user), 1))
//   }

//   function pushToChangesHostParam (obj: object) {
//     _changesHostParam.push(obj)
//   }

//   function delWithIndexChangesHostParam (index: number) {
//     _changesHostParam.splice(index, 1)
//   }

//   function delFromChangesHostParam (obj: object) {
//     _changesHostParam.splice(_changesHostParam.indexOf(obj), 1)
//   }

//   function deleteAllChangesHostParam () {
//     // _changesProducts.splice(0, _changesProducts.length)
//     const removeItems = _changesHostParam.filter(item => item.user === localStorage.getItem('username'))
//     removeItems.forEach(f => _changesHostParam.splice(_changesHostParam.findIndex(item => item.user === f.user), 1))
//   }
//   return {
//     /* states */
//     /* getters */ changesProducts, changesHostParam
//     /* actions */
//       , pushToChangesProducts, delWithIndexChangesProducts, delFromChangesProducts, deleteFromProdChangesWhere, deleteAllProductChanges
//       , pushToChangesHostParam, delWithIndexChangesHostParam, delFromChangesHostParam, deleteAllChangesHostParam
//   }
// }, { persist: true } as any)
