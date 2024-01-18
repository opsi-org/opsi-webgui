import { encode, decode } from '@msgpack/msgpack'
import { useNotification } from './useComponent'
import _ from 'lodash'

// import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { AlertToast } from './component'
// const mbus = namespace('messagebus')

export const useMBus = () => {
  // @Component({ mixins: [AlertToast] }) export class MBus extends Vue {
  // showToastMbus: any // mixin
  const { t } = useI18n()
  const showToastMbus = useNotification().infoMbus
  // const uid: string = createUUID()
  let channels: any // from importing component?
  const wsBus = ref<WebSocket|undefined>(storeMBus().bus)
  const wsBusMsg = ref(storeMBus().wsBusMsg)
  const setBus = (_bus: WebSocket|undefined)=> {
    console.debug('MessageBus: setBus', _bus)
    storeMBus().setBus(_bus)
    wsBus.value = _bus
  }
  const setBusLastMsg = (_msg: any)=>{
    // console.log(`MessageBus: setBusLastMsg\n\ttype:${_msg.type}\n\tchannel:${_msg.channel}\n\tdata:`, _msg)
    storeMBus().setBusLastMsg(_msg)
    wsBusMsg.value = _msg
  }

  const wsIsConnected = computed(() => {
    const r = (wsBus.value !== undefined && wsBus.value.readyState === 1) // 1 = 'open'
    console.log('MessageBus: connected ? ', r)
    return r
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
  // const wsbus = computed(()=> wsBus.value)
  // get wsBus () { return bus }

  function wsDisconnect () {
    console.log('MessageBus: disconnect')
    const _ws: WebSocket = wsBus.value as WebSocket
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
    console.group('MessageBus: onMounted')
    console.log('MessageBus: wsBus', wsBus.value)
    await wsInit()
    if (channels) {
      console.log('MessageBus subscribe channel', channels)
      wsSubscribeChannel(channels)
    }
    console.log('MessageBus: onMounted end')
    console.groupEnd()
  })

  onUnmounted(() => {
    console.log('MessageBus: onUnmounted')
    wsDisconnect()
  })

  async function wsInit (reconnect: boolean = false) {
    if (!reconnect && wsIsConnected.value) {
      wsNotification('already connecting/connected', wsBus.value)
      return
    }

    wsNotification('connecting')
    const host = window.location.hostname
    const port = (process.env.NODE_ENV === 'production') ? window.location.port : 4447
    const url = 'wss://' + host + ':' + port + '/messagebus/v1?'
    console.log('MessageBus: connecting to ', url)
    const _bus = new WebSocket(url)
    console.log('MessageBus: connected _bus ', _bus)
    setBus(undefined)
    setBus(_bus)
    if (_bus === undefined) {
      useNotification().error('MessageBus: connected _bus undefined')
      throw new Error('_MessageBus shouldnt be undefined')
    }
    if (wsBus.value === undefined) {
      useNotification().error('MessageBus: connected wsBus undefined')
      throw new Error('MessageBus shouldnt be undefined')
    }
    wsBus.value.binaryType = 'arraybuffer'
    wsBus.value.onopen = () => {
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
    // console.debug('MessageBus: connected')
    await wsWait(1000)
    if (wsIsConnected.value){

      useNotification().success('MessageBus: connected')
      console.log('MessageBus: wsbus', wsBus.value)
    }

  }

  function wsWait (milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }

  function wsSend (msg: any) { // obj == function with param 'message'
    // console.log('MessageBus: send: bus ', wsBus.value)
    if (!wsBus.value) { return }
    if (!wsIsConnected.value) { return }
    _waitForSocketConnection(wsBus.value, () => {
      if (wsBus.value === undefined) { return }
      console.log('MessageBus: send: ', msg)
      wsBus.value.send(encode(msg))
    })
  }

  function wsSubscribeChannel (channels: Array<string>) {
    // console.log('subscribe channels ', channels)
    console.log('MessageBus: subscribe channels ', channels)
    wsNotification('subscribe: ', channels)
    const message = wsCreateMsgTemplate()
    message.type = 'channel_subscription_request'
    message.channel = 'service:messagebus'
    message.operation = 'add'
    message.channels = channels
    wsSend(message)
  }

  async function wsTerminalOpen (suid:string, terminal: any) {
    console.log('MessageBus: terminal open', suid)
    if (suid) {
      terminal.terminalId = suid
    } else { terminal.terminalId = createUUID() }
    terminal.terminalChannel = 'service:config:terminal'
    terminal.terminalSessionChannel = 'session:' + suid
    wsSubscribeChannel([terminal.terminalSessionChannel])
    console.log('MessageBus: terminal open: wait 2sec should receive channel_subscription_event')
    await wsWait(2000)
    console.log('MessageBus: terminal open: send terminal open request')
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
    console.log('MessageBus: terminal close')
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_close_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    wsSend(message)
  }

  function wsTerminalSend (msg: any, terminal:any) { // obj == function with param 'message'
    console.log('MessageBus: terminal send: bus ', wsBus.value)
    if (wsBus.value === undefined) { return }
    // console.debug('MessageBus: send: ', msg)
    _waitForSocketConnection(wsBus.value, () => {
      _wsTerminalSend(msg, terminal)
    })
  }

  function _wsTerminalSend (msg:any, terminal: any) {
    console.log('MessageBus: _terminal send: ', msg)
    if (wsBus.value === undefined) { return }
    const utf8Encode = new TextEncoder()
    const message = wsCreateMsgTemplate()
    message.type = 'terminal_data_write'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.data = utf8Encode.encode(msg)
    wsSend(message)
    // console.log('send: ', message)
  }

  // TODO: resize is called too often
  const listSizes = ref<Array<any>>([])
  function wsTerminalResize (rows: any, cols: any, terminal: any) {
    if (wsBus.value === undefined) { return }
    if (!wsIsConnected.value) { return }
    console.log('MessageBus: terminal Resize: ', rows, cols)
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

  function _setBusMethods (_bus: WebSocket, setBusLastMsgMethod: any) {
    _bus.onclose = () => {
      // wsNotificationWarn('Websocket:', 'Connection closed.')
      console.log('MessageBus: Handler: setbus closed')
      console.log('Websocket:', 'Connection closed.')
      useNotification().info('MessageBus: Connection closed.')
      setBus(undefined)
    }
    _bus.onerror = (err:any) => {
      console.log('MessageBus: Handler: setbus error: ', err)
      wsNotificationWarn('Websocket:', 'Connection error: ' + JSON.stringify(err))
      // wsNotificationWarn('websocket error ', err)
      useNotification().error('MessageBus: Connection error: ' + JSON.stringify(err))
      setBus(undefined)
    }
    _bus.onmessage = (event) => {
      // console.log('MessageBus: setbus received: ', event.data)
      const message:any = decode(event.data)
      console.log(`MessageBus: Handler: received: \n\tsender:\t${message.sender}\n\tchannel:\t${message.channel}`, message)
      const msgIsValid = message.expires > Date.now() // new Date().getTime()
      // console.log('MessageBus: setbus received isvalid: ', msgIsValid)
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
