/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * usePanelRouter - Shared composable for panel routing, unsaved-changes guards, and URL state sync.
 */

interface PanelRouterOptions {
  entityQueryKey: string
  hasUnsavedChanges: () => boolean
  discardAllChanges: () => void
  additionalQueryKeys?: string[]
}

export function usePanelRouter(options: PanelRouterOptions) {
  const router = useRouter()
  const route = useRoute()

  const showLeaveWarning = ref(false)
  const pendingAction = ref<(() => void) | null>(null)
  let resolveRouteLeave: ((ok: boolean) => void) | null = null

  function checkUnsavedAndDo(action: () => void) {
    if (options.hasUnsavedChanges()) {
      pendingAction.value = action
      showLeaveWarning.value = true
      return
    }
    action()
  }

  function confirmLeave() {
    options.discardAllChanges()
    showLeaveWarning.value = false
    if (resolveRouteLeave) {
      resolveRouteLeave(true)
      resolveRouteLeave = null
    }
    if (pendingAction.value) {
      pendingAction.value()
      pendingAction.value = null
    }
  }

  function cancelLeave() {
    showLeaveWarning.value = false
    if (resolveRouteLeave) {
      resolveRouteLeave(false)
      resolveRouteLeave = null
    }
    pendingAction.value = null
  }

  function setPanelQuery(entityId: string, extra?: Record<string, string>) {
    const query: Record<string, string> = {
      ...(route.query as Record<string, string>),
      [options.entityQueryKey]: entityId,
      view: 'panel',
      ...extra,
    }
    router.replace({ query })
  }

  function clearPanelQuery() {
    const keysToRemove = new Set([options.entityQueryKey, 'view', 'panelType', 'configType', ...(options.additionalQueryKeys || [])])
    const rest: Record<string, string> = {}
    for (const [k, v] of Object.entries(route.query)) {
      if (!keysToRemove.has(k) && v != null) rest[k] = String(v)
    }
    router.replace({ query: rest })
  }

  onBeforeRouteLeave(() => {
    if (!options.hasUnsavedChanges()) return true
    showLeaveWarning.value = true
    return new Promise<boolean>((resolve) => {
      resolveRouteLeave = resolve
    })
  })

  return {
    showLeaveWarning,
    checkUnsavedAndDo,
    confirmLeave,
    cancelLeave,
    setPanelQuery,
    clearPanelQuery,
  }
}
