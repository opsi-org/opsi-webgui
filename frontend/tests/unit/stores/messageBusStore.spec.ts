/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { decode } from '@msgpack/msgpack'
import { useMessageBusStore } from '~/stores/messageBusStore'

class MockWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3
  static instances: MockWebSocket[] = []

  readyState = MockWebSocket.CONNECTING
  binaryType = 'blob'
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  sent: Uint8Array[] = []

  constructor(_url: string) {
    MockWebSocket.instances.push(this)
  }

  send(data: Uint8Array) {
    this.sent.push(data)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({} as CloseEvent)
  }

  open() {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.({} as Event)
  }
}

function lastSubscription(socket: MockWebSocket): Record<string, unknown> {
  return decode(socket.sent[socket.sent.length - 1]!) as Record<string, unknown>
}

describe('messageBusStore subscriptions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('WebSocket', MockWebSocket)
    vi.stubGlobal('window', { location: { hostname: 'opsi.example.test', port: '4447' } })
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { OPSICONFD_PORT: '4447' } }))
    MockWebSocket.instances = []
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('replays dynamic subscriptions after reconnect', async () => {
    const store = useMessageBusStore()
    store.subscribeChannels(['session:terminal-1'])

    const firstSocket = MockWebSocket.instances[0]!
    firstSocket.open()
    const initial = lastSubscription(firstSocket)
    expect(initial.channels).toContain('session:terminal-1')
    expect(initial.channels).toContain('event:log_updated')

    firstSocket.readyState = MockWebSocket.CLOSED
    firstSocket.onclose?.({} as CloseEvent)
    await vi.advanceTimersByTimeAsync(1000)

    const reconnectedSocket = MockWebSocket.instances[1]!
    reconnectedSocket.open()
    expect(lastSubscription(reconnectedSocket).channels).toContain('session:terminal-1')
    expect(store.reconnectGeneration).toBe(1)

    store.disconnect()
  })

  it('removes a dynamic channel only after its last consumer releases it', () => {
    const store = useMessageBusStore()
    store.connect()
    const socket = MockWebSocket.instances[0]!
    socket.open()

    store.subscribeChannels(['session:terminal-1'])
    store.subscribeChannels(['session:terminal-1'])
    store.unsubscribeChannels(['session:terminal-1'])
    expect(lastSubscription(socket).operation).toBe('add')

    store.unsubscribeChannels(['session:terminal-1'])
    expect(lastSubscription(socket).operation).toBe('remove')
    expect(lastSubscription(socket).channels).toEqual(['session:terminal-1'])

    store.disconnect()
  })
})
