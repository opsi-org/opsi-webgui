/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/*import { useCookie } from 'nuxt/app'
import { defineStore } from 'pinia'
import { set } from 'zod'
import type { TTimeDiff } from '~/types/Datatypes'

const expirySec = 60 * 30 // Default=30min=60s*30

export const storeFetch = defineStore('fetch', {
  // persist keeps username in localStorage.. even if logged out. No need for that here
  state: () => ({
    headers: {} as { [key: string]: string },
  }),
  getters: {
    headers(): { [key: string]: string } {
      return this.headers
    },
  },
  actions: {
    clearSession() {
      this.$reset()
    },
    $reset() {
      this.headers = {}
    },
    get(key: string, defaultValue: string = ''): string {
      return this.headers[key] || defaultValue
    },
    set(key: string, value: string) {
      this.headers[key] = value
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeAuth, import.meta.hot))
}
*/
