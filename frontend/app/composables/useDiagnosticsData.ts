/**
 * Shared diagnostics data composable.
 * Fetches diagnostics/healthcheck data once and caches it.
 * Both dashboard and diagnostics pages use this to avoid duplicate fetches.
 * Data is refetched only on manual refresh or full app refresh.
 */
const diagnosticsState = reactive({
  data: null as Record<string, unknown> | null,
  loading: false,
  fetched: false,
})

export function useDiagnosticsData() {
  const { getDiagnosticData } = useApiHelpers()

  async function fetchDiagnostics(force = false) {
    if (diagnosticsState.fetched && !force) return diagnosticsState.data
    diagnosticsState.loading = true
    try {
      const { data, error } = await getDiagnosticData()
      if (!error && data) {
        diagnosticsState.data = data as Record<string, unknown>
        diagnosticsState.fetched = true
      }
    } finally {
      diagnosticsState.loading = false
    }
    return diagnosticsState.data
  }

  async function refresh() {
    return fetchDiagnostics(true)
  }

  const healthCheckData = computed(() => {
    const hc = diagnosticsState.data?.health_check as Array<Record<string, unknown>> | undefined
    return hc || []
  })

  const healthCounts = computed(() => {
    const result = { ok: 0, warning: 0, error: 0 }
    for (const check of healthCheckData.value) {
      const status =
        (check.check_status as string) ||
        ((check.check as Record<string, unknown>)?.status as string)
      if (status === 'ok') result.ok++
      else if (status === 'warning') result.warning++
      else if (status === 'error') result.error++
    }
    return result
  })

  const modules = computed(() => {
    if (!diagnosticsState.data) return []
    const d = diagnosticsState.data
    if (Array.isArray(d.modules)) return d.modules as string[]
    if (Array.isArray(d.available_modules)) return d.available_modules as string[]
    // Extract from licenses.modules if available (diagnostic API response)
    const licenses = d.licenses as Record<string, unknown> | undefined
    if (licenses?.modules) {
      const mods = licenses.modules as Record<string, { available: boolean }>
      return Object.keys(mods).filter(k => mods[k]?.available).sort()
    }
    return []
  })

  const modulesDetailed = computed((): Record<string, { available: boolean; state: string; client_number: number }> => {
    if (!diagnosticsState.data) return {}
    const licenses = diagnosticsState.data.licenses as Record<string, unknown> | undefined
    if (!licenses?.modules) return {}
    return licenses.modules as Record<string, { available: boolean; state: string; client_number: number }>
  })

  const obsoleteModules = computed(() => {
    if (!diagnosticsState.data) return [] as string[]
    const licenses = diagnosticsState.data.licenses as Record<string, unknown> | undefined
    return (licenses?.obsolete_modules as string[]) || []
  })

  const freeModules = computed(() => {
    if (!diagnosticsState.data) return [] as string[]
    const licenses = diagnosticsState.data.licenses as Record<string, unknown> | undefined
    return (licenses?.free_modules as string[]) || []
  })

  const licenseClientNumbers = computed(() => {
    if (!diagnosticsState.data) return null
    const licenses = diagnosticsState.data.licenses as Record<string, unknown> | undefined
    if (!licenses?.client_numbers) return null
    return licenses.client_numbers as { macos: number; linux: number; windows: number; inactive: number; all: number }
  })

  return {
    data: computed(() => diagnosticsState.data),
    loading: computed(() => diagnosticsState.loading),
    fetched: computed(() => diagnosticsState.fetched),
    healthCheckData,
    healthCounts,
    modules,
    modulesDetailed,
    obsoleteModules,
    freeModules,
    licenseClientNumbers,
    fetchDiagnostics,
    refresh,
  }
}
