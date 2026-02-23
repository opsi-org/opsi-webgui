/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'

interface UserState {
  username: string
  usernameUpdated: number | null
  sessionExpiry: number
  sessionEndTime: string
  isAuth: boolean
  authMethods: string
  globalError?: string
  config?: unknown
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    username: '',
    usernameUpdated: null,
    sessionExpiry: 1800,
    sessionEndTime: '',
    isAuth: false,
    authMethods: '',
    globalError: undefined,
    config: undefined,
  }),
  getters: {
    isAuthenticated(state): boolean {
      return Boolean(state.username)
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
    setConfig(config: unknown) {
      this.config = config
    },
  },
})
