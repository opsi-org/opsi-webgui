import { useMessageBusStore } from '~/stores/messageBusStore'

type RefreshCallback = () => void | Promise<void>

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
  const isConnected = computed(() => wsBus.value?.readyState === 1)
  const autoRefreshEnabled = computed({
    get: () => mbStore.autoRefresh,
    set: (val: boolean) => mbStore.setAutoRefresh(val),
  })

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

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
