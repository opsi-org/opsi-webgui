import { encode, decode } from '@msgpack/msgpack'
import { useNotification } from './useComponent'
import _ from 'lodash'
const { notifyInfo, notifySuccess, notifyWarning, notifyError } = useNotification()
export const useMBus = (watchFn: Function|undefined = undefined, showStartNotifications=false, _t: any=undefined, _channels: any = []) => {
  const $config = useRuntimeConfig()
  let $t = _t
  if (!$t) { $t = useI18n().t }

  let channels: any = _channels || undefined// from importing component?
  const wsBus = ref<WebSocket|undefined>(storeMBus().bus)
  const wsBusMsg = ref(storeMBus().wsBusMsg)
  const setBus = (_bus: WebSocket|undefined)=> {
    storeMBus().setBus(_bus)
    wsBus.value = _bus
  }
  const setBusLastMsg = (_msg: any)=>{
    storeMBus().setBusLastMsg(_msg)
    wsBusMsg.value = _msg
  }

  const wsIsConnected = computed(() => {
    return wsBus.value !== undefined && wsBus.value.readyState === 1 // 1 = 'open'
  })
  watch(()=> wsBusMsg.value, async ()=>{
    if (watchFn !== undefined) {
      wsNotification('(info) received a message "' + wsBusMsg.value + '"', wsBusMsg.value)
      await watchFn(wsBusMsg.value)

    }
    // await watchFn()
  }, { deep: true})

  function wsDisconnect () {
    const _ws: WebSocket = wsBus.value as WebSocket
    if (_ws === undefined) { return }
    _ws.close()
    setBus(undefined)
  }

  function createUUID () {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // eslint-disable-next-line one-var, no-var, eqeqeq
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  onMounted (async () => {
    await wsInit()
    if (channels) {
      wsSubscribeChannel(channels)
    }

  })

  onUnmounted(() => {
    wsDisconnect()
  })

  async function wsInit (reconnect: boolean = false) {
    if (!reconnect && wsIsConnected.value) {
      wsNotification('already connecting/connected', wsBus.value)
      return
    }

    wsNotification('connecting')
    const host = window.location.hostname
    const port = (process.env.NODE_ENV === 'production') ? window.location.port : (Number($config.public.OPSICONFD_PORT) || 4447)
    const url = 'wss://' + host + ':' + port + '/messagebus/v1?'
    const _bus = new WebSocket(url)

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
      if (showStartNotifications)
        wsNotification('websocket opened')
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
        'event:productOnClient_deleted'
      ])
    }
    _setBusMethods(wsBus.value, setBusLastMsg)
    await wsWait(1000)
    if (wsIsConnected.value){

      if (showStartNotifications)
        notifySuccess({ message: 'MessageBus: connected' })
    }

  }

  function wsWait (milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }

  function wsSend (msg: any) { // obj == function with param 'message'
    if (!wsBus.value) { return }
    if (!wsIsConnected.value) { return }
    _waitForSocketConnection(wsBus.value, () => {
      if (wsBus.value === undefined) { return }
      wsBus.value.send(encode(msg))
    })
  }

  function wsSubscribeChannel (channels: Array<string>) {
    wsNotification('subscribe: ', channels)
    const message = wsCreateMsgTemplate()
    message.type = 'channel_subscription_request'
    message.channel = 'service:messagebus'
    message.operation = 'add'
    message.channels = channels
    wsSend(message)
  }

  async function wsTerminalOpen (suid:string, terminal: any) {
    if (suid) {
      terminal.terminalId = suid
    } else { terminal.terminalId = createUUID() }
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

  function wsTerminalClose (terminal: any) {
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_close_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    wsSend(message)
  }

  function wsTerminalSend (msg: any, terminal:any) { // obj == function with param 'message'
    if (wsBus.value === undefined) { return }
    _waitForSocketConnection(wsBus.value, () => {
      _wsTerminalSend(msg, terminal)
    })
  }

  function _wsTerminalSend (msg:any, terminal: any) {
    if (wsBus.value === undefined) { return }
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
  function wsTerminalResize (rows: any, cols: any, terminal: any) {
    if (wsBus.value === undefined) { return }
    if (!wsIsConnected.value) { return }
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

  function wsCreateMsgTemplate (): any {
    return {
      type: 'xxx',
      channel: 'yyy',
      sender: '@',
      id: createUUID(),
      created: Date.now(),
      expires: Date.now() + 10000
    }
  }

  function wsNotification (text: any, data: any = '') {
    console.debug('MessageBus:', text, data)
  }

  function wsNotificationInfo (text: any, data: any = '') {
    notifyInfo({ title: $t('message.info.event'), message: text + ' ' + data})
  }

  function wsNotificationWarn (text: any, data: any = '') {
    notifyWarning({ message: text + ' ' + data})
    console.warn('MessageBus:', text, data)
  }

  function _setBusMethods (_bus: WebSocket, setBusLastMsgMethod: any) {
    _bus.onclose = () => {
      if (showStartNotifications)
        notifyInfo({ message: 'MessageBus: Connection closed.' })
      setBus(undefined)
    }
    _bus.onerror = (err:any) => {
      wsNotificationWarn('Websocket:', 'Connection error: ' + JSON.stringify(err))

      if (showStartNotifications)
        notifyError({ message: 'MessageBus: Connection error: ' + JSON.stringify(err) })
      setBus(undefined)
    }
    _bus.onmessage = (event) => {
      const message:any = decode(event.data)
      const msgIsValid = message.expires > Date.now() // new Date().getTime()
      if (!msgIsValid) {
        wsNotification('Message is expired', message)
        return
      }
      setBusLastMsgMethod(message)
    }
  }

  // Make the function wait until the connection is made...
  function _waitForSocketConnection (socket: WebSocket, callback: any) {
    setTimeout(() => {
      if (socket.readyState === 1) {
        if (callback != null) { callback() }
      } else {
        _waitForSocketConnection(socket, callback)
      }
    }, 5) // wait 5 milisecond for the connection...
  }

  return {
    wsBus,
    wsBusMsg,
    setBus,
    // wsInit,
    // wsWait,
    // wsSend,
    wsTerminalResize,
    wsTerminalSend,
    wsTerminalClose,
    wsTerminalOpen,
    // wsSubscribeChannel,
    wsDisconnect,

    // wsNotification,
    // wsNotificationWarn,
    // wsNotificationInfo,
    // wsCreateMsgTemplate,
  }
}
