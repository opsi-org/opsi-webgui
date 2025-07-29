/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { encode, decode } from '@msgpack/msgpack'
import { useNotification } from './useComponent'

const { notifyInfo, notifySuccess, notifyWarning, notifyError } = useNotification()

export const useMBus = (
  watchFn: ((msg: any) => Promise<void>) | undefined = undefined,
  showStartNotifications = false,
  _t: any = undefined,
  _channels: any = []
) => {
  const $config = useRuntimeConfig()
  let url_host = ''
  let $t = _t
  if (!$t) {
    $t = useI18n().t
  }

  const channels: any = _channels || undefined // from importing component?
  const wsBus = ref<WebSocket | undefined>(storeMBus().bus)
  const wsBusMsg = ref(storeMBus().wsBusMsg)

  const setBus = (_bus: WebSocket | undefined) => {
    storeMBus().setBus(_bus)
    wsBus.value = _bus
  }
  const setBusLastMsg = (_msg: any) => {
    storeMBus().setBusLastMsg(_msg)
    wsBusMsg.value = _msg
  }

  const wsIsConnected = computed(() => {
    return wsBus.value !== undefined && wsBus.value.readyState === 1 // 1 = 'open'
  })
  watch(
    () => wsBusMsg.value,
    async () => {
      if (watchFn !== undefined) {
        await watchFn(wsBusMsg.value)
      } else {
        wsNotification(
          '(info) received unhandled message "' + JSON.stringify(wsBusMsg.value) + '"',
          wsBusMsg.value
        )
      }
    },
    { deep: true }
  )

  function wsDisconnect() {
    if (wsBus.value === undefined) {
      return
    }
    wsBus.value.close()
    setBus(undefined)
  }

  function createUUID() {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
  async function mount() {
    //onMounted(async () => {
    await wsInit()
    if (channels) {
      wsSubscribeChannel(channels)
    }
    //})
  }

  onUnmounted(() => {
    wsDisconnect()
  })

  async function wsInit(reconnect: boolean = false) {
    if (!reconnect && wsIsConnected.value) {
      return
    }

    const host = window.location.hostname
    const port =
      process.env.NODE_ENV === 'production'
        ? window.location.port
        : Number(($config as any).public.OPSICONFD_PORT) || 4447
    url_host = 'wss://' + host + ':' + port + '/messagebus/v1?'
    const _bus = new WebSocket(url_host)

    setBus(undefined)
    setBus(_bus)
    if (_bus === undefined) {
      notifyError({ message: 'MessageBus: connected _bus undefined' })
      throw new Error('_MessageBus shouldnt be undefined')
    }
    if (wsBus.value === undefined) {
      notifyError({ message: 'MessageBus: connected wsBus undefined' })
      throw new Error('MessageBus shouldnt be undefined')
    }
    wsBus.value.binaryType = 'arraybuffer'
    wsBus.value.onopen = () => {
      if (showStartNotifications) wsNotification('websocket opened')
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
    _setBusMethods(wsBus.value, setBusLastMsg)
    await wsWait(1000)
    if (wsIsConnected.value) {
      if (showStartNotifications) notifySuccess({ message: 'MessageBus: connected' })
    }
  }

  function wsWait(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }

  function wsSend(msg: any) {
    // obj == function with param 'message'
    if (!wsBus.value) {
      console.error('wsBus is undefined')
      return
    }
    if (!wsIsConnected.value) {
      console.error('wsBus is not connected')
      wsInit(true)
      return
    }
    _waitForSocketConnection(wsBus.value, () => {
      if (wsBus.value === undefined) {
        console.error('msgBus is undefined (2)')
        return
      }
      wsBus.value.send(encode(msg))
    })
  }

  function wsSubscribeChannel(channels: Array<string>) {
    const message = wsCreateMsgTemplate()
    message.type = 'channel_subscription_request'
    message.channel = 'service:messagebus'
    message.operation = 'add'
    message.channels = channels
    wsSend(message)
  }

  async function wsTerminalOpen(suid: string, terminal: any) {
    if (suid) {
      terminal.terminalId = suid
    } else {
      terminal.terminalId = createUUID()
    }
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
    // obj == function with param 'message'
    if (wsBus.value === undefined) {
      return
    }
    _waitForSocketConnection(wsBus.value, () => {
      _wsTerminalSend(msg, terminal)
    })
  }

  function _wsTerminalSend(msg: any, terminal: any) {
    if (wsBus.value === undefined) {
      return
    }
    const utf8Encode = new TextEncoder()
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_data_write'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.data = utf8Encode.encode(msg)
    wsSend(message)
  }

  // TODO: resize is called too often
  const listSizes = ref<Array<any>>([])
  function wsTerminalResize(rows: any, cols: any, terminal: any) {
    if (wsBus.value === undefined) {
      return
    }
    if (!wsIsConnected.value) {
      return
    }
    const rowNew = rows
    const colNew = cols
    // if res is 0 => resize list didnt change in last second. send last resize request
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_resize_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.back_channel = terminal.terminalSessionChannel
    message.rows = rowNew
    message.cols = colNew

    wsSend(message)
    listSizes.value = []
    return true
  }

  function wsCreateMsgTemplate(): any {
    return {
      type: 'xxx',
      channel: 'yyy',
      sender: '@',
      id: createUUID(),
      created: Date.now(),
      expires: Date.now() + 10000,
    }
  }

  function wsNotification(text: any, data: any = '') {
    // eslint-disable-next-line no-console
    console.debug('MessageBus:', text, data)
  }

  function wsNotificationWarn(text: any, data: any = '') {
    notifyWarning({ message: text + ' ' + data })
  }

  function _setBusMethods(_bus: WebSocket, setBusLastMsgMethod: any) {
    _bus.onclose = () => {
      if (showStartNotifications) notifyInfo({ message: 'MessageBus: Connection closed.' })
      setBus(undefined)
    }
    _bus.onerror = (err: any) => {
      wsNotificationWarn('Websocket:', 'Connection error: ' + JSON.stringify(err))

      if (showStartNotifications)
        notifyError({
          message: 'MessageBus: Connection error: ' + JSON.stringify(err),
        })
      setBus(undefined)
    }
    _bus.onmessage = (event) => {
      const message: any = decode(event.data)
      const msgIsValid = message.expires > Date.now() // new Date().getTime()
      if (!msgIsValid) {
        wsNotification('Message is expired', message)
        return
      }
      setBusLastMsgMethod(message)
    }
  }

  // Make the function wait until the connection is made...
  function _waitForSocketConnection(socket: WebSocket, callback: any) {
    setTimeout(() => {
      if (socket.readyState === 1) {
        if (callback != null) {
          callback()
        }
      } else {
        _waitForSocketConnection(socket, callback)
      }
    }, 5) // wait 5 milisecond for the connection...
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
