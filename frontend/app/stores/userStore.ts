/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineStore } from 'pinia'
import { useCookie } from 'nuxt/app'

const SESSION_EXPIRY_SEC = 60 * 30

interface SessionExpiresIn {
  diff: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface UserState {
  username: string
  usernameUpdated: number | null
  sessionExpiry: number
  sessionEndTime: string
  sessionExpiresIn: SessionExpiresIn
  isAuth: boolean
  authMethods: string
  globalError?: string
}

export const useUserStore = defineStore('user', {
  persist: { key: 'opsi-user', storage: localStorage },
  state: (): UserState => ({
    username: '',
    usernameUpdated: null,
    sessionExpiry: SESSION_EXPIRY_SEC,
    sessionEndTime: '',
    sessionExpiresIn: { diff: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
    isAuth: false,
    authMethods: '',
    globalError: undefined,
  }),
  getters: {
    isAuthenticated(state): boolean {
      return Boolean(useCookie('opsiconfd-session').value && state.username)
    },
    isUsernameOutdated(state): boolean {
      if (!state.usernameUpdated) return true
      return Date.now() - state.usernameUpdated > 1000 * state.sessionExpiry
    },
  },
  actions: {
    login(username: string) {
      this.username = username
      this.usernameUpdated = Date.now()
      this.isAuth = true
    },
    logout() {
      this.$reset()
    },
    setSession() {
      const expiry = this.sessionExpiry || SESSION_EXPIRY_SEC
      this.sessionEndTime = new Date(Date.now() + expiry * 1000).toISOString()
    },
    setExpiresIn(payload: SessionExpiresIn) {
      this.sessionExpiresIn = payload
    },
  },
})
