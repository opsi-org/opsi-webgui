import { encode, decode } from '@msgpack/msgpack'
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
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
type MsgTemplate = Record<string, unknown>
type RefreshCallback = () => void | Promise<void>

// ── Event Constants ──
const HOST_EVENTS = [
  'event:host_created',
  'event:host_updated',
  'event:host_deleted',
  'event:host_connected',
  'event:host_disconnected',
]

const PRODUCT_EVENTS = [
  'event:productOnClient_created',
  'event:productOnClient_updated',
  'event:productOnClient_deleted',
]

const ALL_DATA_EVENTS = [...HOST_EVENTS, ...PRODUCT_EVENTS]

// Default channels to subscribe on connect
const DEFAULT_CHANNELS = [
  '@',
  '$',
  'event:app_state_changed',
  'event:user_connected',
  'event:user_disconnected',
  ...HOST_EVENTS.map((e) => e),
  ...PRODUCT_EVENTS.map((e) => e),
]

// ── Core MessageBus composable ──
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

  const wsIsConnected = computed(() => wsBus.value?.readyState === 1)
  const { retries, retriesMax } = storeToRefs(store)

  watch(
    () => busMsg.value,
    async () => {
      if (onMessage) {
        if (!wsBus.value || !wsIsConnected.value) await mount()
        await onMessage(busMsg.value)
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
        : Number(($config as { public: { OPSICONFD_PORT?: string } }).public.OPSICONFD_PORT) || 4447
    const bus = new WebSocket(`wss://${host}:${port}/messagebus/v1`)
    setBus(undefined)
    setBus(bus)
    if (!bus || !wsBus.value) throw new Error('MessageBus connection failed')
    wsBus.value.binaryType = 'arraybuffer'
    wsBus.value.onopen = () => {
      store.resetRetries()
      wsSubscribeChannel(DEFAULT_CHANNELS)
    }
    setBusMethods(wsBus.value, setLastMsg)
    await wsWait(1000)
    if (wsIsConnected.value) {
      retries.value = 0
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
    if (!wsBus.value || !wsIsConnected.value) {
      wsInit(true)
      return
    }
    waitForSocket(wsBus.value, () => wsBus.value?.send(encode(msg)))
  }

  function wsSubscribeChannel(chs: string[]) {
    const m = createMsgTemplate()
    m.type = 'channel_subscription_request'
    m.channel = 'service:messagebus'
    m.operation = 'add'
    m.channels = chs
    wsSend(m)
  }

  async function wsTerminalOpen(suid: string, terminal: Terminal) {
    terminal.terminalId = suid || createUUID()
    terminal.terminalChannel = 'service:config:terminal'
    terminal.terminalSessionChannel = 'session:' + suid
    wsSubscribeChannel([terminal.terminalSessionChannel])
    await wsWait(2000)
    const m = createMsgTemplate()
    m.type = 'terminal_open_request'
    m.terminal_id = terminal.terminalId
    m.channel = terminal.terminalChannel
    m.back_channel = terminal.terminalSessionChannel
    m.cols = terminal.cols
    m.rows = terminal.rows
    wsSend(m)
  }

  function wsTerminalClose(terminal: Terminal) {
    const m = createMsgTemplate()
    m.type = 'terminal_close_request'
    m.channel = terminal.terminalChannel
    m.terminal_id = terminal.terminalId
    wsSend(m)
  }

  function wsTerminalSend(msg: string, terminal: Terminal) {
    if (!wsBus.value) return
    waitForSocket(wsBus.value, () => {
      if (!wsBus.value) return
      const m = createMsgTemplate()
      m.type = 'terminal_data_write'
      m.channel = terminal.terminalChannel
      m.terminal_id = terminal.terminalId
      m.data = new TextEncoder().encode(msg)
      wsSend(m)
    })
  }

  function wsTerminalResize(rows: number, cols: number, terminal: Terminal) {
    if (!wsBus.value || !wsIsConnected.value) return
    const m = createMsgTemplate()
    m.type = 'terminal_resize_request'
    m.channel = terminal.terminalChannel
    m.terminal_id = terminal.terminalId
    m.back_channel = terminal.terminalSessionChannel
    m.rows = rows
    m.cols = cols
    wsSend(m)
    return true
  }

  function createMsgTemplate(): MsgTemplate {
    return {
      type: 'xxx',
      channel: 'yyy',
      sender: '@',
      id: createUUID(),
      created: Date.now(),
      expires: Date.now() + 10000,
    }
  }

  function wsWait(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }

  function createUUID() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  function setBusMethods(bus: WebSocket, setMsg: (msg: unknown) => void) {
    bus.onclose = () => setBus(undefined)
    bus.onerror = () => setBus(undefined)
    bus.onmessage = (event: MessageEvent) => {
      const message = decode(event.data)
      if (
        (message as { expires?: number }).expires &&
        (message as { expires: number }).expires > Date.now()
      )
        setMsg(message)
    }
  }

  function waitForSocket(socket: WebSocket, cb: () => void) {
    setTimeout(() => {
      if (socket.readyState === 1) cb()
      else waitForSocket(socket, cb)
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

// ── Auto-Refresh composable (integrates with MessageBus) ──
export function useAutoRefresh(
  refreshCallback: RefreshCallback,
  options: { watchEvents?: string[]; debounceMs?: number } = {}
) {
  const mbStore = useMessageBusStore()
  const { mount, busMsg, wsBus } = useMessageBus(handleMessage, false, [])

  const watchEvents = options.watchEvents || ALL_DATA_EVENTS
  const debounceMs = options.debounceMs || 2000

  const changesDetected = ref(false)
  const lastChangeEvent = ref('')
  const lastChangeDescription = ref('')
  const isConnected = computed(() => wsBus.value?.readyState === 1)
  const autoRefreshEnabled = computed({
    get: () => mbStore.autoRefresh,
    set: (val: boolean) => mbStore.setAutoRefresh(val),
  })

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function getEventDescription(msgType: string): string {
    const map: Record<string, string> = {
      host_created: 'Client created',
      host_updated: 'Client updated',
      host_deleted: 'Client deleted',
      host_connected: 'Client connected',
      host_disconnected: 'Client disconnected',
      productOnClient_created: 'Product action created',
      productOnClient_updated: 'Product action updated',
      productOnClient_deleted: 'Product action deleted',
    }
    const cleanType = msgType.replace('event:', '')
    return map[cleanType] || cleanType
  }

  async function handleMessage(msg: unknown) {
    if (!msg || typeof msg !== 'object') return
    const msgType = (msg as Record<string, unknown>).type as string
    if (!msgType) return

    const matches = watchEvents.some(
      (ev) =>
        ev === msgType || ev === `event:${msgType}` || msgType.startsWith(ev.replace('event:', ''))
    )

    if (matches) {
      changesDetected.value = true
      lastChangeEvent.value = msgType
      lastChangeDescription.value = getEventDescription(msgType)
      mbStore.setLastEvent(msgType)
      if (autoRefreshEnabled.value) {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(async () => {
          await refreshCallback()
          changesDetected.value = false
          mbStore.setChangesDetected(false)
        }, debounceMs)
      }
    }
  }

  function manualRefresh() {
    changesDetected.value = false
    mbStore.setChangesDetected(false)
    refreshCallback()
  }

  function dismissChanges() {
    changesDetected.value = false
    mbStore.setChangesDetected(false)
  }

  onMounted(() => {
    mount()
  })

  return {
    isConnected,
    autoRefreshEnabled,
    changesDetected,
    lastChangeEvent,
    lastChangeDescription,
    manualRefresh,
    dismissChanges,
  }
}

export function useAutoRefreshClients(cb: RefreshCallback) {
  return useAutoRefresh(cb, { watchEvents: HOST_EVENTS })
}

export function useAutoRefreshProducts(cb: RefreshCallback) {
  return useAutoRefresh(cb, { watchEvents: PRODUCT_EVENTS })
}

// Re-export event constants for external use
export { HOST_EVENTS, PRODUCT_EVENTS, ALL_DATA_EVENTS }
