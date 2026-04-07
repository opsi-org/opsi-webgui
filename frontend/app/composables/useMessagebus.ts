import { encode } from '@msgpack/msgpack'
import { ref, computed, watch, onMounted } from 'vue'
import { useMessageBusStore, createUUID, createMsgTemplate } from '~/stores/messageBusStore'
import { storeToRefs } from 'pinia'

type MessageHandler = (msg: unknown) => Promise<void>
type Terminal = {
  terminalId: string
  terminalChannel: string
  terminalSessionChannel: string
  cols: number
  rows: number
}
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

function wsWait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Core MessageBus composable ──
// Uses the store's singleton WebSocket. Does NOT create competing connections.
export function useMessageBus(
  onMessage?: MessageHandler,
  _showNotifications = false,
  _channels: string[] = []
) {
  const store = useMessageBusStore()
  const channels = _channels || []

  // Watch store lastMsg for the onMessage callback
  if (onMessage) {
    const { lastMsg: storeLastMsg } = storeToRefs(store)
    watch(storeLastMsg, async (msg) => {
      if (msg) {
        // Ensure connection before processing
        if (!store.isConnected) store.connect()
        await onMessage(msg)
      }
    })
  }

  function mount() {
    store.connect()
    if (channels.length) store.subscribeChannels(channels)
  }

  function wsDisconnect() {
    store.disconnect()
  }

  function wsSend(msg: Record<string, unknown>) {
    store.send(msg)
  }

  async function wsTerminalOpen(suid: string, terminal: Terminal) {
    terminal.terminalId = suid || createUUID()
    terminal.terminalChannel = 'service:config:terminal'
    terminal.terminalSessionChannel = 'session:' + suid
    store.subscribeChannels([terminal.terminalSessionChannel])
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
    if (!store.isConnected) return
    const m = createMsgTemplate()
    m.type = 'terminal_data_write'
    m.channel = terminal.terminalChannel
    m.terminal_id = terminal.terminalId
    m.data = new TextEncoder().encode(msg)
    // Send directly via the store's bus for terminal data (low-latency)
    if (store.bus && store.bus.readyState === WebSocket.OPEN) {
      store.bus.send(encode(m))
    }
  }

  function wsTerminalResize(rows: number, cols: number, terminal: Terminal) {
    if (!store.isConnected) return
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

  return {
    mount,
    channels,
    wsBus: computed(() => store.bus),
    busMsg: computed(() => store.lastMsg),
    wsTerminalResize,
    wsTerminalSend,
    wsTerminalClose,
    wsTerminalOpen,
    wsDisconnect,
  }
}

// ── Auto-Refresh composable (integrates with MessageBus) ──
// Watches store messages reactively. Does NOT create its own WebSocket.
export function useAutoRefresh(
  refreshCallback: RefreshCallback,
  options: { watchEvents?: string[]; debounceMs?: number } = {}
) {
  const mbStore = useMessageBusStore()
  const { lastMsg: storeLastMsg } = storeToRefs(mbStore)

  const watchEvents = options.watchEvents || ALL_DATA_EVENTS
  const debounceMs = options.debounceMs || 2000

  const changesDetected = ref(false)
  const lastChangeEvent = ref('')
  const lastChangeDescription = ref('')
  const isConnected = computed(() => mbStore.isConnected)
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

  // Watch store's lastMsg reactively — no own WebSocket needed
  watch(storeLastMsg, (msg) => {
    if (msg) handleMessage(msg)
  })

  // Ensure connection is established (idempotent — store handles singleton)
  onMounted(() => {
    mbStore.connect()
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
