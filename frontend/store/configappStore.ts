import { defineStore } from 'pinia'
import { computed } from 'vue'
// import { Module, VuexModule, VuexMutation } from 'nuxt-property-decorator'
import type { IObjectString2Boolean } from '@/types/tgeneral'

export const storeChanges = defineStore('config-app', () => {
  // need to return the states / getters/ actions in the end of the setup
  // states
  let _config: IObjectString2Boolean|undefined = undefined

  // getter
  const config = computed(() => _config)

  // actions
  function setConfig (obj: IObjectString2Boolean) {
    _config = obj
  }

  return {
    /* states */
    /* getters */ config
    /* actions */, setConfig
  }
}, { persist: true } as any)
