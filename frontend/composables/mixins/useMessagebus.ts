import { encode, decode } from '@msgpack/msgpack'
import { useNotification } from './useComponent'

// import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { AlertToast } from './component'
// const mbus = namespace('messagebus')

export const useMBus = () => {
  // @Component({ mixins: [AlertToast] }) export class MBus extends Vue {
  // showToastMbus: any // mixin
  const { t } = useI18n()
  const showToastMbus = useNotification().infoMbus
  const uid: string = createUUID()
  let channels: any // from importing component?
  const bus = storeMBus().bus
  const wsBusMsg = storeMBus().wsBusMsg
  const setBus = storeMBus().setBus
  const setBusLastMsg = storeMBus().setBusLastMsg
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
  //     console.log('MessageBus: receive-watch: ', msg)
  //     if (msg && msg.channel === 'event:host_created') {
  //         showToastMbus(
  //           $t('message.info.event'),
  //           $t('message.info.event.client_updated', { clientId: msg.data.id })
  //         )
  //        await $fetch()
  //     }
  // }

  // @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged () {
  //   // triggered before specific Watch method e.g. in VClients, VProductsLocalboot, ...
  //   // wsNotification('(info) received a message "' + wsBusMsg.channel + '"', wsBusMsg)
  //   // const msg = wsBusMsg
  //   // let data = ''
  //   // if (msg.data) { data = String.fromCharCode(...msg.data) }
  //   // wsNotification('MessageBus received "' + msg.type + '": "' + data + '"', msg)
  // }
  const wsbus = computed(()=> bus)
  // get wsBus () { return bus }

  function wsDisconnect () { return bus?.close() }

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
      console.log('MessageBus subscribe channel', channels)
      wsSubscribeChannel(channels)
    }
  })

  async function wsInit (reconnect: boolean = false) {
    if (!reconnect && bus !== undefined) {
      wsNotification('already connecting/connected')
      return
    }

    wsNotification('connecting')
    const host = window.location.hostname
    const port = (process.env.NODE_ENV === 'production') ? window.location.port : 4447
    const url = 'wss://' + host + ':' + port + '/messagebus/v1?'
    const _bus = new WebSocket(url)
    setBus(_bus)
    if (bus === undefined) { throw new Error('MessageBus shouldnt be undefined') }
    bus.binaryType = 'arraybuffer'
    bus.onopen = () => {
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
    _setBus(bus, setBusLastMsg)
    // console.debug('MessageBus: connected')
    await wsWait(1000)
  }

  function wsWait (milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }

  function wsSend (msg: any) { // obj == function with param 'message'
    if (bus === undefined) { return }
    _waitForSocketConnection(bus, () => {
      if (bus === undefined) { return }
      bus.send(encode(msg))
    })
  }

  function wsSubscribeChannel (channels: Array<string>) {
    // console.log('subscribe channels ', channels)
    wsNotification('subscribe: ', channels)
    const message = wsCreateMsgTemplate()
    message.type = 'channel_subscription_request'
    message.channel = 'service:messagebus'
    message.operation = 'add'
    message.channels = channels
    wsSend(message)
  }

  async function wsTerminalOpen (uid:string, terminal: any) {
    if (uid) {
      terminal.terminalId = uid
    } else { terminal.terminalId = createUUID() }
    terminal.terminalChannel = 'service:config:terminal'
    terminal.terminalSessionChannel = 'session:' + uid
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
    if (bus === undefined) { return }
    // console.debug('MessageBus: send: ', msg)
    _waitForSocketConnection(bus, () => {
      _wsTerminalSend(msg, terminal)
    })
  }

  function _wsTerminalSend (msg:any, terminal: any) {
    if (bus === undefined) { return }
    const utf8Encode = new TextEncoder()
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_data_write'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.data = utf8Encode.encode(msg)
    wsSend(message)
    // console.log('send: ', message)
  }

  function wsTerminalResize (rows: any, cols: any, terminal: any) {
    if (bus === undefined) { return }

    const message = wsCreateMsgTemplate()
    message.type = 'terminal_resize_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.back_channel = terminal.terminalSessionChannel
    message.rows = rows
    message.cols = cols

    wsSend(message)
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
    // console.debug('MessageBus:', text, data)
    showToastMbus(
      t('message.info.event'),
      text + ' ' + data
    )
  }

  function wsNotificationWarn (text: any, data: any = '') {
    // const stringtext = JSON.stringify(data)
    showToastMbus(text, data)
    // console.debug('MessageBus: ', stringtext)
    console.warn('MessageBus:', text, data)
    // ref?.alert(`MessageBus: ${stringtext}`, 'warning', text)
  }

  function _setBus (bus: WebSocket, setBusLastMsgMethod: any) {
    bus.onclose = () => {
      // wsNotificationWarn('Websocket:', 'Connection closed.')
      console.log('Websocket:', 'Connection closed.')
      setBus(undefined)
    }
    bus.onerror = (err:any) => {
      wsNotificationWarn('Websocket:', 'Connection error: ' + JSON.stringify(err))
      // wsNotificationWarn('websocket error ', err)
      setBus(undefined)
    }
    bus.onmessage = (event) => {
      const message:any = decode(event.data)
      const msgIsValid = message.expires > Date.now() // new Date().getTime()
      if (!msgIsValid) {
        wsNotification('Message is expired', message)
        return
      }
      // setBusLastMsg(message)
      setBusLastMsgMethod(message)
      // wsNotification('received: ' + JSON.stringify(message))
    }
  }

  // Make the function wait until the connection is made...
  function _waitForSocketConnection (socket: any, callback: any) {
    setTimeout(() => {
      if (socket.readyState === 1) {
        if (callback != null) { callback() }
      } else {
        _waitForSocketConnection(socket, callback)
      }
    }, 5) // wait 5 milisecond for the connection...
  }

  return {
    // wsbus,
    // wsBusMsg,
    // wsInit,
    // wsWait,
    // wsSend,
    // wsTerminalResize,
    // wsTerminalSend,
    // wsTerminalClose,
    // wsTerminalOpen,
    // wsSubscribeChannel,
    wsDisconnect,

    // wsNotification,
    // wsNotificationWarn,
    // wsNotificationInfo,
    // wsCreateMsgTemplate,
  }
}
