/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * messageBusStore - Pinia store for messagebus connection state and event handling.
 */
import { defineStore } from 'pinia'
import { encode, decode } from '@msgpack/msgpack'
import { markRaw } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { isAuthenticationFailure } from '../utils/requestHeaders'
import { safeLocalStorage } from '~/utils/storage'

const connectionPromises = new WeakMap<object, Promise<WebSocket>>()

const DEFAULT_CHANNELS = [
  '@',
  '$',
  'event:app_state_changed',
  'event:config_created',
  'event:config_deleted',
  'event:config_updated',
  'event:configState_created',
  'event:configState_deleted',
  'event:configState_updated',
  'event:user_connected',
  'event:user_disconnected',
  'event:host_created',
  'event:host_updated',
  'event:host_deleted',
  'event:host_connected',
  'event:host_disconnected',
  'event:log_updated',
  'event:productOnClient_created',
  'event:productOnClient_updated',
  'event:productOnClient_deleted',
]

export function createUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function createMsgTemplate(): Record<string, unknown> {
  return {
    type: 'xxx',
    channel: 'yyy',
    sender: '@',
    id: createUUID(),
    created: Date.now(),
    expires: Date.now() + 60000,
  }
}

export const useMessageBusStore = defineStore('messageBus', {
  persist: {
    key: 'opsi-webgui-messagebus',
    storage: safeLocalStorage,
    pick: ['autoRefresh'],
  },
  state: () => ({
    bus: undefined as WebSocket | undefined,
    lastMsg: undefined as unknown,
    autoRefresh: true,
    _reconnectTimer: null as ReturnType<typeof setTimeout> | null,
    _reconnectDelay: 1000,
    _connecting: false,
    _connected: false,
    _consecutiveFailures: 0,
    certWarning: false,
    certWarningUrl: '',
  }),
  getters: {
    isConnected: (s) => s._connected,
  },
  actions: {
    connect(): Promise<WebSocket> {
      if (!useUserStore().isAuthenticated) {
        return Promise.reject(new Error('Cannot connect to the messagebus without an authenticated session'))
      }
      if (this.bus?.readyState === WebSocket.OPEN) return Promise.resolve(this.bus)
      const existingConnection = connectionPromises.get(this)
      if (existingConnection) return existingConnection
      this._connecting = true

      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer)
        this._reconnectTimer = null
      }

      const runtimeConfig = useRuntimeConfig()
      const host = window.location.hostname
      const apiBaseUrl = String(runtimeConfig.public.NUXT_PUBLIC_API_BASE || '') + String(runtimeConfig.public.API_PATH || '')
      const port =
        process.env.NODE_ENV === 'production'
          ? window.location.port
          : Number((runtimeConfig as { public: { OPSICONFD_PORT?: string } }).public.OPSICONFD_PORT) || 4447
      const ws = markRaw(new WebSocket(`wss://${host}:${port}/messagebus/v1`))
      ws.binaryType = 'arraybuffer'

      let authenticationCheck: Promise<boolean> | undefined
      const checkAuthentication = () => {
        authenticationCheck ??= fetch(`${apiBaseUrl}/user/getsettings`, { credentials: 'include' })
          .then(async (response) => {
            const responseData = response.status === 403 ? await response.json() : undefined
            if (isAuthenticationFailure(response.status, responseData)) {
              const userStore = useUserStore()
              userStore.globalError = 'auth.required'
              userStore.logout()
              return false
            }
            return useUserStore().isAuthenticated
          })
          .catch(() => useUserStore().isAuthenticated)
        return authenticationCheck
      }

      let connectionTimeout: ReturnType<typeof setTimeout>
      const connectionPromise = new Promise<WebSocket>((resolve, reject) => {
        connectionTimeout = setTimeout(() => {
          this._connecting = false
          reject(new Error('Timed out connecting to the messagebus'))
          ws.close()
        }, 15000)

        ws.onopen = () => {
          clearTimeout(connectionTimeout)
          this._connecting = false
          this._reconnectDelay = 1000
          this._consecutiveFailures = 0
          this.certWarning = false
          this.bus = ws
          this._connected = true
          this._sendRaw(ws, {
            ...createMsgTemplate(),
            type: 'channel_subscription_request',
            channel: 'service:messagebus',
            operation: 'add',
            channels: DEFAULT_CHANNELS,
          })
          resolve(ws)
        }

        ws.onmessage = (event: MessageEvent) => {
          try {
            const message = decode(event.data as ArrayBuffer)
            if (
              message &&
              typeof message === 'object' &&
              (!(message as Record<string, unknown>).expires || ((message as Record<string, unknown>).expires as number) > Date.now())
            ) {
              const record = message as Record<string, unknown>
              this.lastMsg = record
            }
          } catch {
            // ignore decode errors
          }
        }

        ws.onclose = () => {
          clearTimeout(connectionTimeout)
          this._connecting = false
          const wasSameBus = this.bus === ws
          if (wasSameBus) {
            this.bus = undefined
            this._connected = false
          }
          if (wasSameBus) {
            void checkAuthentication().then((isAuthenticated) => {
              if (isAuthenticated && useUserStore().isAuthenticated) this._scheduleReconnect()
            })
          }
          reject(new Error('Messagebus connection closed before becoming ready'))
        }

        ws.onerror = () => {
          this._connecting = false
          void checkAuthentication()
          this._consecutiveFailures++
          if (this._consecutiveFailures >= 3 && !this.certWarning) {
            this.certWarning = true
            this.certWarningUrl = `https://${host}:${port}/`
          }
        }
      })

      connectionPromises.set(this, connectionPromise)
      connectionPromise.then(
        () => connectionPromises.delete(this),
        () => connectionPromises.delete(this),
      )
      this.bus = ws
      return connectionPromise
    },

    _scheduleReconnect() {
      if (!useUserStore().isAuthenticated) return
      if (this._reconnectTimer) return
      const delay = Math.min(this._reconnectDelay, 30000)
      this._reconnectTimer = setTimeout(() => {
        this._reconnectTimer = null
        void this.connect().catch(() => undefined)
      }, delay)
      this._reconnectDelay = Math.min(this._reconnectDelay * 2, 30000)
    },

    disconnect() {
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer)
        this._reconnectTimer = null
      }
      this._connecting = false
      this._consecutiveFailures = 0
      this.certWarning = false
      if (this.bus) {
        const ws = this.bus
        this.bus = undefined
        this._connected = false
        ws.close()
      }
    },

    async send(msg: Record<string, unknown>) {
      const ws = await this.connect()
      if (ws.readyState !== WebSocket.OPEN) throw new Error('Messagebus connection is not open')
      this._sendRaw(ws, msg)
    },

    async subscribeChannels(channels: string[]) {
      if (!channels.length) return
      await this.send({
        ...createMsgTemplate(),
        type: 'channel_subscription_request',
        channel: 'service:messagebus',
        operation: 'add',
        channels,
      })
    },

    _sendRaw(ws: WebSocket, msg: unknown) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(encode(msg))
      }
    },

    setAutoRefresh(val: boolean) {
      this.autoRefresh = val
    },
  },
})
