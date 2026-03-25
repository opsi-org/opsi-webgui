export type HostConfigTabsRef = {
  refresh?: () => void
  hasAnyChanges?: boolean
  isSaving?: boolean
  changedCount?: number
  changedParams?: Map<string, unknown>
  changedAttributesList?: Array<{
    key: string
    label: string
    oldValue: unknown
    newValue: unknown
  }>
  saveAll?: () => void
  discardAll?: () => void
  discardSingleParam?: (key: string) => void
  discardSingleAttribute?: (key: string) => void
  getOriginalParamValue?: (key: string) => unknown
  fmtVal?: (v: unknown) => string
}

export function useHostConfigPage(onCancelLeave?: () => void) {
  const { t: $t } = useI18n()
  const loading = ref(false)
  const paramSearch = ref('')

  const configTabs = computed(() => [
    { label: String($t('parameters')), value: 'parameters' },
    { label: String($t('attributes')), value: 'attributes' },
  ])

  const hostConfigTabsRef = ref<HostConfigTabsRef | null>(null)

  function refresh() {
    hostConfigTabsRef.value?.refresh?.()
  }

  function saveAll() {
    hostConfigTabsRef.value?.saveAll?.()
  }

  function discardAll() {
    hostConfigTabsRef.value?.discardAll?.()
  }

  function handleSaved() {}

  const showLeaveWarning = ref(false)
  let resolveLeave: ((ok: boolean) => void) | null = null

  onBeforeRouteLeave(() => {
    if (!hostConfigTabsRef.value?.hasAnyChanges) return true
    showLeaveWarning.value = true
    return new Promise<boolean>((resolve) => {
      resolveLeave = resolve
    })
  })

  function confirmLeave() {
    showLeaveWarning.value = false
    hostConfigTabsRef.value?.discardAll?.()
    resolveLeave?.(true)
    resolveLeave = null
  }

  function cancelLeave() {
    showLeaveWarning.value = false
    resolveLeave?.(false)
    resolveLeave = null
    onCancelLeave?.()
  }

  return {
    loading,
    paramSearch,
    configTabs,
    hostConfigTabsRef,
    refresh,
    saveAll,
    discardAll,
    handleSaved,
    showLeaveWarning,
    confirmLeave,
    cancelLeave,
  }
}
