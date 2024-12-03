import { defineStore } from 'pinia'
// import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
import type { IObjectString2Boolean } from '@/types/tgeneral'

export const storeConfigapp = defineStore('config-app', {
  persist: {
    key: 'opsi-configs',
    storage: localStorage,
    // storage: sessionStorage,
  },
  state: () => ({
    _config: undefined as IObjectString2Boolean | undefined,
  }),
  getters: {
    config: ({ _config }) => _config,
  },
  actions: {
    setConfig(obj: IObjectString2Boolean) {
      this._config = obj
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeConfigapp, import.meta.hot))
}

// export const storeConfigapp = defineStore('config-app', () => {
//   // need to return the states / getters/ actions in the end of the setup
//   // states
//   let _config: IObjectString2Boolean|undefined = undefined

//   // getter
//   const config = computed(() => _config)

//   // actions
//   function setConfig (obj: IObjectString2Boolean) {
//     _config = obj
//   }

//   return {
//     /* states */
//     /* getters */ config
//     /* actions */, setConfig
//   }
// }, { persist: true } as any)
