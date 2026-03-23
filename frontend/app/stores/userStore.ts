import { defineStore } from 'pinia'
import { useCookie } from 'nuxt/app'

const SESSION_EXPIRY_SEC = 60 * 30 // 30 minutes
const SESSION_COOKIE_NAME = 'opsiconfd-session'

export const useUserStore = defineStore('user', {
  persist: {
    key: 'opsi-user',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    pick: ['username', 'usernameUpdated', 'sessionExpiry', 'sessionEndTime'],
  },
  state: () => ({
    username: '',
    usernameUpdated: null as number | null,
    sessionExpiry: SESSION_EXPIRY_SEC,
    sessionEndTime: '',
    errorLoggedOutShown: false,
    authMethods: '',
    globalError: undefined as string | undefined,
    config: undefined as unknown,
    readOnly: false,
    serverWriteAccess: true,
    serverAccess: true,
    hostGroupAccess: true,
    productGroupAccess: true,
    clientCreation: true,
    disabledFeatures: [] as string[],
    healthCounts: {} as Record<string, number>,
    healthWorstCase: 'ok' as string,
  }),
  getters: {
    isUsernameOutdated(s): boolean {
      if (!s.usernameUpdated) return true
      return Date.now() - s.usernameUpdated > 1000 * SESSION_EXPIRY_SEC
    },
    isAuthenticated(s): boolean {
      const sessionCookie = useCookie(SESSION_COOKIE_NAME)
      return Boolean(sessionCookie.value && s.username && !this.isUsernameOutdated)
    },
  },
  actions: {
    login(username: string) {
      this.errorLoggedOutShown = false
      this.username = username
      this.usernameUpdated = Date.now()
      this.setSession()
    },
    setSession(expiryInSec?: number) {
      const expiry = expiryInSec ?? this.sessionExpiry ?? SESSION_EXPIRY_SEC
      this.sessionExpiry = expiry
      this.sessionEndTime = new Date(Date.now() + expiry * 1000).toISOString()
    },
    logout() {
      this.username = ''
      this.usernameUpdated = null
      this.sessionEndTime = ''
      this.errorLoggedOutShown = false
    },
    setConfig(config: unknown) {
      this.config = config
    },
    setUserConfiguration(cfg: {
      read_only?: boolean
      server_write_access?: boolean
      depot_access?: boolean
      host_group_access?: boolean
      product_group_access?: boolean
      client_creation?: boolean
      health?: { counts: Record<string, number>; worst_case: string }
    }) {
      this.readOnly = cfg.read_only ?? false
      this.serverWriteAccess = cfg.server_write_access ?? true
      this.serverAccess = cfg.depot_access ?? true
      this.hostGroupAccess = cfg.host_group_access ?? true
      this.productGroupAccess = cfg.product_group_access ?? true
      this.clientCreation = cfg.client_creation ?? true
      if (cfg.health) {
        this.healthCounts = cfg.health.counts ?? {}
        this.healthWorstCase = cfg.health.worst_case ?? 'ok'
      }
    },
    setErrorLoggedOutShown(val: boolean) {
      this.errorLoggedOutShown = val
    },
    setDisabledFeatures(features: string[]) {
      this.disabledFeatures = features
    },
  },
})
