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
    return []
  })

  return {
    data: computed(() => diagnosticsState.data),
    loading: computed(() => diagnosticsState.loading),
    fetched: computed(() => diagnosticsState.fetched),
    healthCheckData,
    healthCounts,
    modules,
    fetchDiagnostics,
    refresh,
  }
}
