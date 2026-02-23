/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { encode, decode } from '@msgpack/msgpack'
import { ref, computed, watch, onUnmounted } from 'vue'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { storeToRefs } from 'pinia'

type MessageHandler = (msg: unknown) => Promise<void>
type Terminal = {
  terminalId: string
  terminalChannel: string
  terminalSessionChannel: string
  cols: number
  rows: number
}
type MessageTemplate = Record<string, unknown>

export function useMessageBus(
  onMessage?: MessageHandler,
  showNotifications = false,
  _channels: string[] = []
) {
  const $config = useRuntimeConfig()
  const store = useMessageBusStore()
  const wsBus = ref<WebSocket | undefined>(store.bus)
  const busMsg = ref(store.lastMsg)
  const channels = _channels || []
  let urlHost = ''

  const wsIsConnected = computed(() => wsBus.value?.readyState === 1)
  const { retries, retriesMax } = storeToRefs(store)

  watch(
    () => busMsg.value,
    async () => {
      if (onMessage) {
        if (!wsBus.value || !wsIsConnected.value) await mount()
        await onMessage(busMsg.value)
      } else {
        wsNotification('Received unhandled message', busMsg.value)
      }
    },
    { deep: true }
  )

  onUnmounted(wsDisconnect)

  async function mount() {
    await wsInit()
    if (channels.length) wsSubscribeChannel(channels)
  }

  async function wsInit(reconnect = false) {
    if ((!reconnect && wsIsConnected.value) || retries.value >= retriesMax.value) return
    retries.value += 1
    const host = window.location.hostname
    const port =
      process.env.NODE_ENV === 'production'
        ? window.location.port
        : Number(($config as { public: { OPSICONFD_PORT?: number } }).public.OPSICONFD_PORT) || 4447
    urlHost = `wss://${host}:${port}/messagebus/v1?`
    const bus = new WebSocket(urlHost)
    setBus(undefined)
    setBus(bus)
    if (!bus || !wsBus.value) throw new Error('MessageBus connection failed')
    wsBus.value.binaryType = 'arraybuffer'
    wsBus.value.onopen = () => {
      if (showNotifications) wsNotification('WebSocket opened')
      wsSubscribeChannel([
        '@',
        '$',
        'event:app_state_changed',
        'event:user_connected',
        'event:user_disconnected',
        'event:host_created',
        'event:host_updated',
        'event:host_deleted',
        'event:host_connected',
        'event:host_disconnected',
        'event:productOnClient_created',
        'event:productOnClient_updated',
        'event:productOnClient_deleted',
      ])
    }
    setBusMethods(wsBus.value, setLastMsg)
    await wsWait(1000)
    if (wsIsConnected.value) {
      retries.value = 0
      if (showNotifications) wsNotification('MessageBus: connected')
    }
  }

  function setBus(bus?: WebSocket) {
    store.setBus(bus)
    wsBus.value = bus
  }

  function setLastMsg(msg: unknown) {
    store.setLastMsg(msg)
    busMsg.value = msg
  }

  function wsDisconnect() {
    wsBus.value?.close()
    setBus(undefined)
  }

  function wsSend(msg: unknown) {
    if (!wsBus.value) {
      if (showNotifications) wsNotification('wsBus is undefined')
      return
    }
    if (!wsIsConnected.value) {
      if (showNotifications) wsNotification('wsBus is not connected')
      wsInit(true)
      return
    }
    waitForSocketConnection(wsBus.value, () => wsBus.value?.send(encode(msg)))
  }

  function wsSubscribeChannel(channels: string[]) {
    const message: MessageTemplate = wsCreateMsgTemplate()
    message.type = 'channel_subscription_request'
    message.channel = 'service:messagebus'
    message.operation = 'add'
    message.channels = channels
    wsSend(message)
  }

  // Terminal helpers
  async function wsTerminalOpen(suid: string, terminal: Terminal) {
    terminal.terminalId = suid || createUUID()
    terminal.terminalChannel = 'service:config:terminal'
    terminal.terminalSessionChannel = 'session:' + suid
    wsSubscribeChannel([terminal.terminalSessionChannel])
    await wsWait(2000)
    const message: MessageTemplate = wsCreateMsgTemplate()
    message.type = 'terminal_open_request'
    message.terminal_id = terminal.terminalId
    message.channel = terminal.terminalChannel
    message.back_channel = terminal.terminalSessionChannel
    message.cols = terminal.cols
    message.rows = terminal.rows
    wsSend(message)
  }

  function wsTerminalClose(terminal: Terminal) {
    const message: MessageTemplate = wsCreateMsgTemplate()
    message.type = 'terminal_close_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    wsSend(message)
  }

  function wsTerminalSend(msg: string, terminal: Terminal) {
    if (!wsBus.value) return
    waitForSocketConnection(wsBus.value, () => _wsTerminalSend(msg, terminal))
  }

  function _wsTerminalSend(msg: string, terminal: Terminal) {
    if (!wsBus.value) return
    const utf8Encode = new TextEncoder()
    const message: MessageTemplate = wsCreateMsgTemplate()
    message.type = 'terminal_data_write'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.data = utf8Encode.encode(msg)
    wsSend(message)
  }

  function wsTerminalResize(rows: number, cols: number, terminal: Terminal) {
    if (!wsBus.value || !wsIsConnected.value) return
    const message: MessageTemplate = wsCreateMsgTemplate()
    message.type = 'terminal_resize_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.back_channel = terminal.terminalSessionChannel
    message.rows = rows
    message.cols = cols
    wsSend(message)
    return true
  }

  function wsCreateMsgTemplate(): MessageTemplate {
    return {
      type: 'xxx',
      channel: 'yyy',
      sender: '@',
      id: createUUID(),
      created: Date.now(),
      expires: Date.now() + 10000,
    }
  }

  function wsNotification(text: string, data: unknown = '') {
    if (showNotifications) {
      // eslint-disable-next-line no-console
      console.info(`MessageBus: ${text}`, data)
      // TODO: Replace this with a UI notification
    }
  }

  function wsWait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  function createUUID() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  function setBusMethods(bus: WebSocket, setLastMsgMethod: (msg: unknown) => void) {
    bus.onclose = () => setBus(undefined)
    bus.onerror = () => {
      if (showNotifications) setBus(undefined)
    }
    bus.onmessage = (event: MessageEvent) => {
      const message = decode(event.data)
      if (
        (message as { expires?: number }).expires &&
        (message as { expires: number }).expires > Date.now()
      )
        setLastMsgMethod(message)
      else wsNotification('Message is expired', message)
    }
  }

  function waitForSocketConnection(socket: WebSocket, callback: () => void) {
    setTimeout(() => {
      if (socket.readyState === 1) callback()
      else waitForSocketConnection(socket, callback)
    }, 5)
  }

  return {
    mount,
    channels,
    wsBus,
    busMsg,
    setBus,
    wsTerminalResize,
    wsTerminalSend,
    wsTerminalClose,
    wsTerminalOpen,
    wsDisconnect,
  }
}
