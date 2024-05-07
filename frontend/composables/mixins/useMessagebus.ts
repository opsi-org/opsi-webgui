import { encode, decode } from '@msgpack/msgpack'
import { useNotification } from './useComponent'
import _ from 'lodash'

export const useMBus = (watchFn: Function|undefined = undefined, showStartNotifications=false, _t: any=undefined, _channels: any = []) => {
  // @Component({ mixins: [AlertToast] }) export class MBus extends Vue {
  // showToastMbus: any // mixin
  const $config = useRuntimeConfig()
  let t = _t
  if (!t) { t = useI18n().t }
  const showToastMbus = useNotification(t).infoMbus

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
  // @mbus.Getter public bus!: WebSocket|undefined
  // @mbus.Getter public wsBusMsg!: any
  // @mbus.Mutation public setBus!: (bus: WebSocket|undefined) => void
  // @mbus.Mutation public setBusLastMsg!: (obj: any) => void

  // // check events / channels and trigger actions in concrete classes
  // // e.g. currently View/VClients.vue
  // // example:
  // @Component({ mixins: [MBus, AlertToast] })
  // // ....
  //  wsBusMsg: any // mixin // store
  //  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
  //     const msg = wsBusMsg
  //     if (msg && msg.channel === 'event:host_created') {
  //         showToastMbus(
  //           $t('message.info.event'),
  //           $t('message.info.event.client_updated', { clientId: msg.data.id })
  //         )
  //        await $fetch()
  //     }
  // }
  watch(()=> wsBusMsg.value, async ()=>{
    if (watchFn !== undefined) {
      wsNotification('(info) received a message "' + wsBusMsg.value + '"', wsBusMsg.value)
      await watchFn(wsBusMsg.value)

    }
    // await watchFn()
  }, { deep: true})

  // @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged () {
  //   // triggered before specific Watch method e.g. in VClients, VProductsLocalboot, ...
  //   // wsNotification('(info) received a message "' + wsBusMsg.channel + '"', wsBusMsg)
  //   // const msg = wsBusMsg
  //   // let data = ''
  //   // if (msg.data) { data = String.fromCharCode(...msg.data) }
  //   // wsNotification('MessageBus received "' + msg.type + '": "' + data + '"', msg)
  // }
  // const wsbus = computed(()=> wsBus.value)
  // get wsBus () { return bus }

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
      useNotification(t).error('MessageBus: connected _bus undefined')
      throw new Error('_MessageBus shouldnt be undefined')
    }
    if (wsBus.value === undefined) {
      useNotification(t).error('MessageBus: connected wsBus undefined')
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
      // useNotification().success('MessageBus: opened')
    }
    _setBusMethods(wsBus.value, setBusLastMsg)
    await wsWait(1000)
    if (wsIsConnected.value){

      if (showStartNotifications)
        useNotification().success('MessageBus: connected')
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
    // const len = listSizes.value.push({ rows, cols }) // returns length
    // // sleep 1sec and send only last resize request
    // let res = 0
    // setTimeout(() => {
    //   if (listSizes.value.length === 0) { res = -1; return }
    //   if (listSizes.value.length === len) { res = 0; return }
    //   // still resizing
    //   if (listSizes.value.length >= len) { res = 1; return }
    // }, 500)
    // if (res === -1) { return } // already resized
    // else if (res === 1) { // still resizing
    //   return
    // }
    // const rowNew = listSizes.value[len - 1].rows
    // const colNew = listSizes.value[len - 1].cols
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
    showToastMbus(
      t('message.info.event'),
      text + ' ' + data
    )
  }

  function wsNotificationWarn (text: any, data: any = '') {
    // const stringtext = JSON.stringify(data)
    showToastMbus(text, data)
    console.warn('MessageBus:', text, data)
    // ref?.alert(`MessageBus: ${stringtext}`, 'warning', text)
  }

  function _setBusMethods (_bus: WebSocket, setBusLastMsgMethod: any) {
    _bus.onclose = () => {
      // wsNotificationWarn('Websocket:', 'Connection closed.')

      if (showStartNotifications)
        useNotification().info('MessageBus: Connection closed.')
      setBus(undefined)
    }
    _bus.onerror = (err:any) => {
      wsNotificationWarn('Websocket:', 'Connection error: ' + JSON.stringify(err))
      // wsNotificationWarn('websocket error ', err)

      if (showStartNotifications)
        useNotification(t).error('MessageBus: Connection error: ' + JSON.stringify(err))
      setBus(undefined)
    }
    _bus.onmessage = (event) => {
      const message:any = decode(event.data)
      const msgIsValid = message.expires > Date.now() // new Date().getTime()
      if (!msgIsValid) {
        wsNotification('Message is expired', message)
        return
      }
      // setBusLastMsg(message)
      setBusLastMsgMethod(message)
      // useNotification().info('MessageBus: received: ' + JSON.stringify(message))
      // wsNotification('received: ' + JSON.stringify(message))
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
