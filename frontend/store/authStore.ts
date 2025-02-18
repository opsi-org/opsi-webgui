/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { useCookie } from 'nuxt/app'
import { defineStore } from 'pinia'
import type { TTimeDiff } from '~/types/Datatypes'

const expirySec = 60 * 30 // Default=30min=60s*30

export const storeAuth = defineStore('auth', {
  state: () => ({
    username: '',
    sessionExpiry: expirySec, // sec
    sessionExpiresIn: {
      diff: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    } as TTimeDiff, // will be updated by interval/counter
    sessionEndTime: '',
  }),
  getters: {
    isAuthenticated: ({ username }) =>
      Boolean(useCookie('opsiconfd-session') && username),
  },
  actions: {
    $reset() {
      this.username = ''
      this.sessionEndTime = ''
    },
    login(_username: string) {
      this.username = _username
    },
    logout() {
      this.$reset()
      storeMBus().$reset()
      storeTablesettings().$reset()
      this.username = ''
    },
    setUser(username: string) {
      this.username = username
    },
    setExpiredMin(m: number) {
      this.sessionExpiry = m
    },
    setExpiresIn(t: TTimeDiff) {
      this.sessionExpiresIn = t
    },
    setSession() {
      let expiryInSec = this.sessionExpiry
      if (!expiryInSec) {
        expiryInSec = this.sessionExpiry
      }
      if (!expiryInSec) {
        expiryInSec = expirySec
      }

      const expiryTime = new Date(new Date().getTime() + expiryInSec * 1000)
      this.sessionEndTime = expiryTime as unknown as string
    },
    clearSession() {
      this.sessionEndTime = ''
      this.username = ''
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeAuth, import.meta.hot))
}
