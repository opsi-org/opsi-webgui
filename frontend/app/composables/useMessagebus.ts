/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { encode, decode } from '@msgpack/msgpack'
// import { useNotification } from './useComponentHelpers'
import { ref, computed, watch, onUnmounted } from 'vue'
import { useMessageBusStore } from '~/stores/messageBusStore'
// const { notifyInfo, notifySuccess, notifyWarning, notifyError } = useNotification()

export function useMessageBus(
  onMessage: ((msg: any) => Promise<void>) | undefined = undefined,
  showStartNotifications = false,
  _t: any = undefined,
  _channels: string[] = []
) {
  // State
  const $config = useRuntimeConfig()
  const wsBus = ref<WebSocket | undefined>(useMessageBusStore().bus)
  const wsBusMsg = ref(useMessageBusStore().wsBusMsg)
  const channels = _channels || []
  let urlHost = ''

  // Store sync
  const setBus = (bus: WebSocket | undefined) => {
    useMessageBusStore().setBus(bus)
    wsBus.value = bus
  }
  const setBusLastMsg = (msg: any) => {
    useMessageBusStore().setBusLastMsg(msg)
    wsBusMsg.value = msg
  }

  // Connection state
  const wsIsConnected = computed(() => wsBus.value?.readyState === 1)
  const { retries, retriesMax } = storeToRefs(useMessageBusStore())

  // Watch for new messages
  watch(
    () => wsBusMsg.value,
    async () => {
      if (onMessage) {
        if (!wsBus.value || !wsIsConnected.value) await mount()
        await onMessage(wsBusMsg.value)
      } else {
        wsNotification('(info) received unhandled message', wsBusMsg.value)
      }
    },
    { deep: true }
  )

  // Lifecycle
  onUnmounted(() => wsDisconnect())

  // WebSocket Management
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
        : Number(($config as any).public.OPSICONFD_PORT) || 4447
    urlHost = `wss://${host}:${port}/messagebus/v1?`
    const bus = new WebSocket(urlHost)
    setBus(undefined)
    setBus(bus)
    if (!bus || !wsBus.value) {
      // notifyError({ message: 'MessageBus: connection failed' })
      throw new Error('MessageBus connection failed')
    }
    wsBus.value.binaryType = 'arraybuffer'
    wsBus.value.onopen = () => {
      if (showStartNotifications) wsNotification('WebSocket opened')
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
    setBusMethods(wsBus.value, setBusLastMsg)
    await wsWait(1000)
    if (wsIsConnected.value) {
      retries.value = 0
      if (showStartNotifications) console.info('MessageBus: connected')
    }
  }

  function wsDisconnect() {
    wsBus.value?.close()
    setBus(undefined)
  }

  // Messaging
  function wsSend(msg: any) {
    if (!wsBus.value) return console.error('wsBus is undefined')
    if (!wsIsConnected.value) {
      console.error('wsBus is not connected')
      wsInit(true)
      return
    }
    waitForSocketConnection(wsBus.value, () => wsBus.value?.send(encode(msg)))
  }

  function wsSubscribeChannel(channels: string[]) {
    const message = wsCreateMsgTemplate()
    message.type = 'channel_subscription_request'
    message.channel = 'service:messagebus'
    message.operation = 'add'
    message.channels = channels
    wsSend(message)
  }

  // Terminal helpers
  async function wsTerminalOpen(suid: string, terminal: any) {
    terminal.terminalId = suid || createUUID()
    terminal.terminalChannel = 'service:config:terminal'
    terminal.terminalSessionChannel = 'session:' + suid
    wsSubscribeChannel([terminal.terminalSessionChannel])
    await wsWait(2000)
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_open_request'
    message.terminal_id = terminal.terminalId
    message.channel = terminal.terminalChannel
    message.back_channel = terminal.terminalSessionChannel
    message.cols = terminal.cols
    message.rows = terminal.rows
    wsSend(message)
  }

  function wsTerminalClose(terminal: any) {
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_close_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    wsSend(message)
  }

  function wsTerminalSend(msg: any, terminal: any) {
    if (!wsBus.value) return
    waitForSocketConnection(wsBus.value, () => _wsTerminalSend(msg, terminal))
  }

  function _wsTerminalSend(msg: any, terminal: any) {
    if (!wsBus.value) return
    const utf8Encode = new TextEncoder()
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_data_write'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.data = utf8Encode.encode(msg)
    wsSend(message)
  }

  function wsTerminalResize(rows: number, cols: number, terminal: any) {
    if (!wsBus.value || !wsIsConnected.value) return
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_resize_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.back_channel = terminal.terminalSessionChannel
    message.rows = rows
    message.cols = cols
    wsSend(message)
    return true
  }

  // Utilities
  function wsCreateMsgTemplate() {
    return {
      type: 'xxx',
      channel: 'yyy',
      sender: '@',
      id: createUUID(),
      created: Date.now(),
      expires: Date.now() + 10000,
    }
  }

  function wsNotification(text: string, data: any = '') {
    console.debug('MessageBus:', text, data)
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

  function setBusMethods(bus: WebSocket, setBusLastMsgMethod: any) {
    bus.onclose = () => {
      // if (showStartNotifications) notifyInfo({ message: 'MessageBus: Connection closed.' })
      setBus(undefined)
    }
    bus.onerror = (err: any) => {
      // notifyWarning({ message: 'WebSocket error: ' + JSON.stringify(err) })
      if (showStartNotifications)
        // notifyError({ message: 'MessageBus: Connection error: ' + JSON.stringify(err) })
        setBus(undefined)
    }
    bus.onmessage = (event) => {
      const message: any = decode(event.data)
      if (message.expires > Date.now()) setBusLastMsgMethod(message)
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
    wsBusMsg,
    setBus,
    wsTerminalResize,
    wsTerminalSend,
    wsTerminalClose,
    wsTerminalOpen,
    wsDisconnect,
  }
}
