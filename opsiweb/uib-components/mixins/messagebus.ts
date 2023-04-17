import { encode, decode } from '@msgpack/msgpack'
import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import msgpk from 'msgpack5'

// var msgpack = require('msgpack5')() // namespace our extensions
//   , a       = new MyType(2, 'a')
//   , encode  = msgpack.encode
//   , decode  = msgpack.decode

const mbus = namespace('messagebus')

@Component export class MBus extends Vue {
  uid: String = this.createUUID()

  @mbus.Getter public bus!: WebSocket|undefined
  @mbus.Getter public wsBusMsg!: any
  @mbus.Mutation public setBus!: (bus: WebSocket|undefined) => void
  @mbus.Mutation public setBusLastMsg!: (obj: any) => void

  // check events / channels and trigger actions in concrete classes
  // e.g. currently View/VClients.vue
  // example:
  // @Component({ mixins: [MBus] })
  // ....
  //  wsBusMsg: any // mixin // store
  //  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
  //     const msg = this.wsBusMsg
  //     console.log('MessageBus: receive-watch: ', msg)
  //     if (msg && msg.channel === 'event:host_created') {
  //        const ref = (this.$root.$children[1].$refs.messageBusInfo as any) || (this.$root.$children[2].$refs.messageBusInfo as any)
  //        ref.alert(`MessageBus received:  host_created ${msg.data.id}`, 'info')
  //        await this.$fetch()
  //     }
  //  }
  get wsBus () { return this.bus }

  createUUID () {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // eslint-disable-next-line one-var, no-var, eqeqeq
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  async wsInit (reconnect: boolean = false) {
    if (!reconnect && this.bus !== undefined) {
      console.debug('MessageBud: already connecting/connected')
      return
    }

    const host = window.location.hostname
    const url = 'wss://' + host + ':4447/messagebus/v1?'
    const _bus = new WebSocket(url)
    this.setBus(_bus)
    if (this.bus === undefined) { throw new Error('MessageBus shouldnt be undefined') }
    this.bus.binaryType = 'arraybuffer'
    this.bus.onopen = () => {
      this.wsNotification('MessageBus websocket opened')
      this.wsSubscribeChannel([
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
    this._setBus(this.bus, this.setBusLastMsg)
    console.debug('MessageBus: connected')
    await this.wsWait(1000)
  }

  wsWait (milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }

  wsSend (msg: any) { // obj == function with param 'message'
    if (this.bus === undefined) { return }
    this._waitForSocketConnection(this.bus, () => {
      if (this.bus === undefined) { return }
      let data = ''
      if (msg.data) { data = String.fromCharCode(...msg.data) }
      // console.debug('MessageBus send "' + msg.type + '": "' + data + '"', msg)
      this.bus.send(encode(msg))
    })
  }

  // @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
  //   const msg = this.wsBusMsg
  //   let data = ''
  //   if (msg.data) { data = String.fromCharCode(...msg.data) }
  //   console.debug('MessageBus received "' + msg.type + '": "' + data + '"', msg)
  // }

  wsSubscribeChannel (channels: Array<string>) {
    console.log('subscribe channels ', channels)
    const message = this.wsCreateMsgTemplate()
    message.type = 'channel_subscription_request'
    message.channel = 'service:messagebus'
    message.operation = 'add'
    message.channels = channels
    this.wsSend(message)
  }

  async wsTerminalOpen (uid:string, terminal) {
    if (uid) {
      terminal.terminalId = uid
    } else { terminal.terminalId = this.createUUID() }
    terminal.terminalChannel = 'service:config:terminal'
    terminal.terminalSessionChannel = 'session:' + uid
    this.wsSubscribeChannel([terminal.terminalSessionChannel])
    await this.wsWait(2000)
    const message = this.wsCreateMsgTemplate()
    message.type = 'terminal_open_request'
    message.terminal_id = terminal.terminalId
    message.channel = terminal.terminalChannel
    message.back_channel = terminal.terminalSessionChannel
    message.cols = terminal.cols
    message.rows = terminal.rows
    this.wsSend(message)
  }

  wsTerminalClose (terminal) {
    const message = this.wsCreateMsgTemplate()
    message.type = 'terminal_close_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    this.wsSend(message)
  }

  wsTerminalSend (msg: any, terminal:any) { // obj == function with param 'message'
    if (this.bus === undefined) { return }
    // console.debug('MessageBus: send: ', msg)
    this._waitForSocketConnection(this.bus, () => {
      this._wsTerminalSend(msg, terminal)
    })
  }

  _wsTerminalSend (msg:any, terminal: any) {
    if (this.bus === undefined) { return }
    const utf8Encode = new TextEncoder()
    const message = this.wsCreateMsgTemplate()
    message.type = 'terminal_data_write'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.data = utf8Encode.encode(msg)
    this.wsSend(message)
    console.log('send: ', message)
  }

  wsTerminalResize (rows: any, cols: any, terminal: any) {
    if (this.bus === undefined) { return }

    const message = this.wsCreateMsgTemplate()
    message.type = 'terminal_resize_request'
    message.channel = terminal.terminalChannel
    message.terminal_id = terminal.terminalId
    message.back_channel = terminal.terminalSessionChannel
    message.rows = rows
    message.cols = cols

    this.wsSend(message)
  }

  wsCreateMsgTemplate (): any {
    return {
      type: 'xxx',
      channel: 'yyy',
      sender: '@',
      id: this.createUUID(),
      created: Date.now(),
      expires: Date.now() + 10000
    }
  }

  wsNotification (text: any) {
    const stringtext = JSON.stringify(text)
    // console.debug('MessageBus: ', stringtext)
    // const ref = (this.$root.$children[1].$refs.messageBusInfo as any) || (this.$root.$children[2].$refs.messageBusInfo as any)
    // // const ref = (this.$refs.alertConfigurationError as any)
    // ref.alert(`MessageBus: ${stringtext}`, 'danger')
  }

  _setBus (bus: WebSocket, setBusLastMsgMethod: any) {
    bus.onclose = () => {
      this.wsNotification('MessageBus websocket closed')
      this.setBus(undefined)
    }
    bus.onerror = (err:any) => {
      this.wsNotification('MessageBus websocket error ' + JSON.stringify(err))
      this.setBus(undefined)
    }
    bus.onmessage = (event) => {
      const message = decode(event.data)
      // console.debug('MessageBus: receive: ', message)

      // this.setBusLastMsg(message)
      setBusLastMsgMethod(message)
      this.wsNotification(message)
    }
  }

  // Make the function wait until the connection is made...
  _waitForSocketConnection (socket, callback) {
    setTimeout(() => {
      if (socket.readyState === 1) {
        if (callback != null) { callback() }
      } else {
        this._waitForSocketConnection(socket, callback)
      }
    }, 5) // wait 5 milisecond for the connection...
  }
}
