/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Composable that integrates opsi-messagebus events with auto-refresh for pages.
When the messagebus detects changes (host_created, host_updated, productOnClient_updated, etc.),
it can either auto-refresh the page data or show a notification to the user.
*/

import { useMessageBusStore } from '~/stores/messageBusStore'

type RefreshCallback = () => void | Promise<void>

interface AutoRefreshOptions {
  /** Event types to watch for (e.g., 'host_created', 'host_updated') */
  watchEvents?: string[]
  /** Debounce delay in ms before triggering refresh */
  debounceMs?: number
}

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
  options: AutoRefreshOptions = {}
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

    // Check if this event matches our watch list
    const matchesWatch = watchEvents.some(ev => {
      // Match event:xxx pattern or just the event type
      return ev === msgType || ev === `event:${msgType}` || msgType.startsWith(ev.replace('event:', ''))
    })

    if (matchesWatch) {
      changesDetected.value = true
      lastChangeEvent.value = msgType
      mbStore.setLastEvent(msgType)

      if (autoRefreshEnabled.value) {
        // Debounce to avoid multiple rapid refreshes
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
    /** Whether the messagebus is connected */
    isConnected,
    /** Whether auto-refresh is enabled (persisted in store) */
    autoRefreshEnabled,
    /** Whether changes have been detected since last refresh */
    changesDetected,
    /** The last event type that triggered a change */
    lastChangeEvent,
    /** Manually trigger refresh and clear changes flag */
    manualRefresh,
    /** Dismiss the changes notification without refreshing */
    dismissChanges,
  }
}

/** Pre-configured for client pages */
export function useAutoRefreshClients(refreshCallback: RefreshCallback) {
  return useAutoRefresh(refreshCallback, { watchEvents: HOST_EVENTS })
}

/** Pre-configured for product pages */
export function useAutoRefreshProducts(refreshCallback: RefreshCallback) {
  return useAutoRefresh(refreshCallback, { watchEvents: PRODUCT_EVENTS })
}
