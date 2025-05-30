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
  persist: {
    key: 'opsi-auth',
    storage: localStorage,
  },
  // persist keeps username in localStorage.. even if logged out. No need for that here
  state: () => ({
    _username: '',
    _usernameUpdated: null as Date | null,
    errorLoggedOutShown: false,
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
    username(): string {
      return this._username
    },
    // https://github.com/vuejs/pinia/discussions/1151
    isUsernameOutdated({ _usernameUpdated }): boolean {
      if (_usernameUpdated == undefined || _usernameUpdated == null) {
        return true
      }
      // if username is older than expiredTime, it is outdated (e.g. if user didnt logout successfully)
      const now = new Date()
      console.warn(
        'isUsernameOutdated now',
        now.valueOf(),
        'usernameUpdated',
        _usernameUpdated.valueOf()
      )
      const __expired = now.valueOf() - _usernameUpdated.valueOf() > 1000 * expirySec
      if (__expired) {
        console.warn('isUsernameOutdated expired')
      }
      return __expired
      // return now.valueOf() - _usernameUpdated.valueOf() > 1000 * expirySec
    },
    isAuthenticated({ _username }): boolean {
      return Boolean(useCookie('opsiconfd-session') && _username && !this.isUsernameOutdated)
    },
  },
  actions: {
    clearSession() {
      this.$reset()
    },
    $reset() {
      this.sessionEndTime = ''
      this.setUser('')
      // this.errorLoggedOutShown = false
    },
    login(_username: string) {
      this.errorLoggedOutShown = false
      this.setUser(_username)
      // localStorage.setItem('_username', _username)
    },
    logout() {
      this.$reset()
      storeMBus().$reset()
      storeTablesettings().$reset()
    },
    setUser(username: string) {
      this._username = username
      if (username && username.length > 0) {
        this._usernameUpdated = new Date()
      } else {
        this._usernameUpdated = null
      }
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
    setErrorLoggedOutShown(val: boolean) {
      this.errorLoggedOutShown = val
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeAuth, import.meta.hot))
}
