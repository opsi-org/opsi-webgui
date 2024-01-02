import { defineStore } from 'pinia'
import { computed } from 'vue'

export const storeErrors = defineStore('errors', {
  persist: true,
  state: () => ({
    _errorsProducts: [] as Array<any>,
    _errorsHostParam: [] as Array<any>,
  }),
  getters: {
    errorsProducts: ({ _errorsProducts }) => _errorsProducts,
    errorsHostParam: ({ _errorsHostParam }) => _errorsHostParam,
  },
  actions: {
    pushToErrorsProducts (obj: object) {
      this._errorsProducts.push(obj)
    },
    clearErrorsProducts () {
      this._errorsProducts = []
    },
    pushToErrorsHostParam (obj: object) {
      this._errorsHostParam.push(obj)
    },
    clearErrorsHostParam () {
      this._errorsHostParam = []
    },
  },
})


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeErrors, import.meta.hot));
}

// export const storeErrors = defineStore('errors', () => {
//   // need to return the states / getters/ actions in the end of the setup
//   // states
//   let _errorsProducts: Array<any> = []
//   let _errorsHostParam: Array<any> = []

//   // getter
//   const errorsProducts = computed(() => _errorsProducts)
//   const errorsHostParam = computed(() => _errorsHostParam)

//   // actions

//   function pushToErrorsProducts (obj: object) {
//     _errorsProducts.push(obj)
//   }

//   function clearErrorsProducts () {
//     _errorsProducts = []
//   }

//   function pushToErrorsHostParam (obj: object) {
//     _errorsHostParam.push(obj)
//   }

//   function clearErrorsHostParam () {
//     _errorsHostParam = []
//   }

//   return {
//     /* states */
//     /* getters */ errorsProducts, errorsHostParam
//     /* actions */ , pushToErrorsProducts, clearErrorsProducts, pushToErrorsHostParam, clearErrorsHostParam
//   }
// }, { persist: true } as any)
