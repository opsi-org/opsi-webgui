import { defineStore } from 'pinia'
import { computed } from 'vue'


export const storeCache = defineStore('data-cache', () => {
  // need to return the states / getters/ actions in the end of the setup
  // states
  let _opsiconfigserver: string = ''

  // getter
  const opsiconfigserver = computed(() => _opsiconfigserver)

  // actions
  function setOpsiconfigserver (s: string) {
    _opsiconfigserver = s
  }

  return {
    /* states */
    /* getters */ opsiconfigserver
    /* actions */, setOpsiconfigserver
  }
}, { persist: true } as any)
