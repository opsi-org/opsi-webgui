/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
import { useCookie } from 'nuxt/app'

const SESSION_EXPIRY_SEC = 60 * 30 // Default 30 minutes
const SESSION_COOKIE_NAME = 'opsiconfd-session'

interface UserState {
  username: string
  usernameUpdated: number | null
  sessionExpiry: number
  sessionEndTime: string
  errorLoggedOutShown: boolean
  authMethods: string
  globalError?: string
  config?: unknown
}

export const useUserStore = defineStore('user', {
  persist: {
    key: 'opsi-user',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    pick: ['username', 'usernameUpdated', 'sessionExpiry', 'sessionEndTime'],
  },
  state: (): UserState => ({
    username: '',
    usernameUpdated: null,
    sessionExpiry: SESSION_EXPIRY_SEC,
    sessionEndTime: '',
    errorLoggedOutShown: false,
    authMethods: '',
    globalError: undefined,
    config: undefined,
  }),
  getters: {
    /**
     * Check if username has expired (user didn't logout properly)
     */
    isUsernameOutdated(state): boolean {
      if (!state.usernameUpdated) return true
      const now = Date.now()
      const expired = now - state.usernameUpdated > 1000 * SESSION_EXPIRY_SEC
      if (expired) console.warn('Username expired - session timeout')
      return expired
    },
    /**
     * User is authenticated if:
     * 1. Has the opsiconfd-session cookie (set by backend after login)
     * 2. Has a username stored
     * 3. Username hasn't expired
     */
    isAuthenticated(state): boolean {
      const sessionCookie = useCookie(SESSION_COOKIE_NAME)
      return Boolean(sessionCookie.value && state.username && !this.isUsernameOutdated)
    },
  },
  actions: {
    /**
     * Called after successful login
     */
    login(username: string) {
      this.errorLoggedOutShown = false
      this.username = username
      this.usernameUpdated = Date.now()
      this.setSession()
    },
    /**
     * Set/refresh the session end time
     */
    setSession(expiryInSec?: number) {
      const expiry = expiryInSec ?? this.sessionExpiry ?? SESSION_EXPIRY_SEC
      this.sessionExpiry = expiry
      const expiryTime = new Date(Date.now() + expiry * 1000)
      this.sessionEndTime = expiryTime.toISOString()
    },
    /**
     * Clear session and logout
     */
    logout() {
      this.username = ''
      this.usernameUpdated = null
      this.sessionEndTime = ''
      this.errorLoggedOutShown = false
    },
    setConfig(config: unknown) {
      this.config = config
    },
    setErrorLoggedOutShown(val: boolean) {
      this.errorLoggedOutShown = val
    },
  },
})
