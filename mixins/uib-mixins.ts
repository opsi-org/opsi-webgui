import Cookie from 'js-cookie'
import { encode, decode } from '@msgpack/msgpack'
import { Component, namespace, Vue, Watch } from 'nuxt-property-decorator'
// import msgpk from 'msgpack5'

// var msgpack = require('msgpack5')() // namespace our extensions
//   , a       = new MyType(2, 'a')
//   , encode  = msgpack.encode
//   , decode  = msgpack.decode

const auth = namespace('auth')
const selections = namespace('selections')
const settings = namespace('settings')
const mbus = namespace('messagebus')

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

@Component export class MBus extends Vue {
  uid: String = createUUID()

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

  wsSubscribe (channels: Array<string>) {
    const dataMessage = {
      type: 'channel_subscription_request',
      id: this.uid,
      sender: '@',
      channel: 'service:messagebus',
      created: Date.now(),
      expires: Date.now() + 10000,
      operation: 'add',
      channels
    }
    this.wsSend(dataMessage)
  }

  wsInit (reconnect: boolean = false) {
    if (!reconnect && this.bus !== undefined) { return }

    const host = window.location.hostname
    const url = 'wss://' + host + ':4447/messagebus/v1?'
    const _bus = new WebSocket(url)
    this.setBus(_bus)
    if (this.bus === undefined) { throw new Error('MessageBus shouldnt be undefined') }
    this.bus.binaryType = 'arraybuffer'
    this.bus.onopen = () => {
      this.wsNotification('MessageBus websocket opened')
      this.wsSubscribe([
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

    this.bus.onclose = () => {
      this.wsNotification('MessageBus websocket closed')
      this.setBus(undefined)
    }
    this.bus.onerror = (err:any) => {
      this.wsNotification('MessageBus websocket error ' + JSON.stringify(err))
      this.setBus(undefined)
    }
    this.bus.onmessage = (event) => {
      const message = decode(event.data)
      console.log('MessageBus: receive: ', message)
      // this.wsSetMsgObject(message)

      this.setBusLastMsg(message)
      // filterValues().forEach((f) => { f(message) })
      this.wsNotification(message)
    }
  }

  wsSend (msg: any) { // obj == function with param 'message'
    if (this.bus === undefined) { return }
    console.debug('MessageBus: send: ', msg)
    this.bus.send(encode(msg))
  }

  wsNotification (text: any) {
    const stringtext = JSON.stringify(text)
    console.debug('MessageBus: ', stringtext)
    // const ref = (this.$root.$children[1].$refs.messageBusInfo as any) || (this.$root.$children[2].$refs.messageBusInfo as any)
    // // const ref = (this.$refs.alertConfigurationError as any)
    // ref.alert(`MessageBus: ${stringtext}`, 'danger')
  }
}

@Component export class CallLogout extends Vue {
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void
  @selections.Mutation public clearAllSelection!: () => void
  @settings.Mutation public setExpiresInterval!: (any) => void

  async callLogout () {
    const response = await this.$axios.$post('/api/auth/logout')
    if (response.result === 'logout success') {
      this.logout()
      this.clearSession()
      this.setExpiresInterval(undefined)
      this.clearAllSelection()
      if (this.$route.name !== 'login') {
        this.$router.push({ path: '/login' })
      }
    }
  }
}

@Component export class HoverDropdown extends Vue {
  onOver (ref) {
    if (ref) {
      ref.visible = true
    }
  }

  onLeave (ref) {
    if (ref) {
      ref.visible = false
    }
  }
}

@Component export class Synchronization extends Vue {
  syncSort (fromSort, toSort, emitToSort, id) {
    if (fromSort.filterQuery && toSort.filterQuery !== fromSort.filterQuery) {
      toSort.filterQuery = fromSort.filterQuery
    }
    if (fromSort.sortBy && toSort.sortBy !== fromSort.sortBy) {
      toSort.sortBy = fromSort.sortBy
      Cookie.set('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (fromSort.sortDesc !== undefined && toSort.sortDesc !== fromSort.sortDesc) {
      toSort.sortDesc = fromSort.sortDesc
      Cookie.set('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (emitToSort) { this.$emit('update:sort', toSort) }
  }
}

@Component export class Constants extends Vue {
  // iconnames: any = _icons
  iconnames: any = {
    language: 'globe2',
    depot: 'server',
    client: 'laptop',
    // product: 'grid',
    product: 'box-seam',
    changes: 'list-check',
    support: 'headset',
    settings: 'gear',
    settingsobject: 'gear',
    menu: 'three-dots-vertical',
    log: 'file-earmark-text',
    columns: 'grid3x3',
    x: 'x',
    add: 'plus',
    menuOpen: 'list',
    delete: 'trash',
    loading: 'three-dots',
    save: 'check2',
    trackchanges: 'card-checklist',
    sort: 'sort-up',
    sortDesc: 'sort-down',
    arrowDoubleDown: 'chevron-double-down',
    arrowDoubleLeft: 'chevron-double-left',
    arrowDoubleRight: 'chevron-double-right',
    arrowFillDown: 'caret-down-fill',
    valueShow: 'eye-slash',
    valueHide: 'eye',
    productInstallationStatus: 'box-seam',
    productInstallationStatusInstalled: 'laptop',
    productInstallationStatusUnknown: 'question',
    productActionResult: 'hourglass-bottom',
    productActionResultSuccessful: 'check',
    productActionResultFailed: 'x',
    productsOutdated: 'cloud-arrow-down',
    productsFailedActionResult: 'x-circle',
    // productsFailedActionResult: 'exclamation-triangle',
    group: 'diagram2',
    reset: 'arrow-counterclockwise',
    refresh: 'arrow-repeat',
    ondemand: 'collection-play',
    message: 'envelope',
    reboot: 'bootstrap-reboot',
    // reset: 'brush',
    clear: 'brush',
    help: 'question-circle',
    info: 'info-circle',
    tablerowSelected: 'check2',
    tablerowNotSelected: 'dash',
    logout: 'power',
    themelight: 'sun',
    themedark: 'moon',
    _stackedIcons: {
      readonly: [
        { icon: 'pencil', scale: '0.55' },
        { icon: 'slash-circle', attr: { 'flip-h': true, variant: 'danger' } } // variant/color need also be defined in css of IconIReadOnly
      ]
    }
  }
}
