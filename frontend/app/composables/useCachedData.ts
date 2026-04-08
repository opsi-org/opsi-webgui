/**
 * Shared cached data composable.
 * Caches slow-changing data (diagnostics, user configuration, disabled features,
 * product icons, changelogs) so they are fetched once and shared across pages.
 * Data is refetched only on manual refresh, force flag, or full app refresh.
 */
import { useUserStore } from '~/stores/userStore'

// ---------------------------------------------------------------------------
// Diagnostics cache
// ---------------------------------------------------------------------------
const diagnosticsState = reactive({
  data: null as Record<string, unknown> | null,
  loading: false,
  fetched: false,
})

// ---------------------------------------------------------------------------
// User configuration cache
// ---------------------------------------------------------------------------
const userConfigState = reactive({
  data: null as {
    user: string
    configuration: {
      read_only: boolean
      server_write_access: boolean
      depot_access: boolean
      host_group_access: boolean
      product_group_access: boolean
      client_creation: boolean
      health: { counts: { ok?: number; warning?: number; error?: number }; worst_case: string }
    }
  } | null,
  loading: false,
  fetched: false,
})

// ---------------------------------------------------------------------------
// Disabled features cache
// ---------------------------------------------------------------------------
const disabledFeaturesState = reactive({
  data: null as string[] | null,
  loading: false,
  fetched: false,
})

// ---------------------------------------------------------------------------
// Product icons cache
// ---------------------------------------------------------------------------
const productIconsState = reactive({
  data: null as Record<string, unknown> | null,
  loading: false,
  fetched: false,
})

// ---------------------------------------------------------------------------
// Changelogs cache
// ---------------------------------------------------------------------------
const changelogsState = reactive({
  data: null as string | null,
  loading: false,
  fetched: false,
})

export function useCachedData() {
  const {
    getDiagnosticData,
    getUserConfiguration,
    getDisabledFeatures,
    getProductIcons,
    getChangelogs,
  } = useApiHelpers()
  const userStore = useUserStore()

  // -------------------------------------------------------------------------
  // Diagnostics
  // -------------------------------------------------------------------------

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
    const licenses = d.licenses as Record<string, unknown> | undefined
    if (licenses?.modules) {
      const mods = licenses.modules as Record<string, { available: boolean }>
      return Object.keys(mods)
        .filter((k) => mods[k]?.available)
        .sort()
    }
    return []
  })

  const modulesDetailed = computed(
    (): Record<string, { available: boolean; state: string; client_number: number }> => {
      if (!diagnosticsState.data) return {}
      const licenses = diagnosticsState.data.licenses as Record<string, unknown> | undefined
      if (!licenses?.modules) return {}
      return licenses.modules as Record<
        string,
        { available: boolean; state: string; client_number: number }
      >
    }
  )

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
    return licenses.client_numbers as {
      macos: number
      linux: number
      windows: number
      inactive: number
      all: number
    }
  })

  // -------------------------------------------------------------------------
  // User configuration
  // -------------------------------------------------------------------------

  async function fetchUserConfig(force = false) {
    if (userConfigState.fetched && !force) return userConfigState.data
    userConfigState.loading = true
    try {
      const { data, error } = await getUserConfiguration()
      if (!error && data) {
        userConfigState.data = data
        userConfigState.fetched = true
        if (data.configuration) {
          userStore.setUserConfiguration(data.configuration)
        }
      }
    } finally {
      userConfigState.loading = false
    }
    return userConfigState.data
  }

  // -------------------------------------------------------------------------
  // Disabled features
  // -------------------------------------------------------------------------

  async function fetchDisabledFeatures(force = false) {
    if (disabledFeaturesState.fetched && !force) return disabledFeaturesState.data
    disabledFeaturesState.loading = true
    try {
      const { data, error } = await getDisabledFeatures()
      if (!error && data && Array.isArray(data)) {
        disabledFeaturesState.data = data
        disabledFeaturesState.fetched = true
        userStore.setDisabledFeatures(data)
      }
    } finally {
      disabledFeaturesState.loading = false
    }
    return disabledFeaturesState.data
  }

  // -------------------------------------------------------------------------
  // Product icons
  // -------------------------------------------------------------------------

  async function fetchProductIcons(force = false) {
    if (productIconsState.fetched && !force) return productIconsState.data
    productIconsState.loading = true
    try {
      const { data, error } = await getProductIcons()
      if (!error && data?.result) {
        productIconsState.data = data.result as Record<string, unknown>
        productIconsState.fetched = true
      }
    } finally {
      productIconsState.loading = false
    }
    return productIconsState.data
  }

  // -------------------------------------------------------------------------
  // Changelogs
  // -------------------------------------------------------------------------

  async function fetchChangelogs(force = false) {
    if (changelogsState.fetched && !force) return changelogsState.data
    changelogsState.loading = true
    try {
      const { data, error } = await getChangelogs()
      if (!error && data) {
        changelogsState.data = data as string
        changelogsState.fetched = true
      }
    } finally {
      changelogsState.loading = false
    }
    return changelogsState.data
  }

  // -------------------------------------------------------------------------
  // Batch fetchers & refresh
  // -------------------------------------------------------------------------

  /** Fetch user config + disabled features together (used after login and in init plugin). */
  async function fetchPostLoginData(force = false) {
    await Promise.all([fetchUserConfig(force), fetchDisabledFeatures(force)])
  }

  /** Refresh all cached data (used by dashboard refresh button). */
  async function refreshAll() {
    await Promise.all([fetchDiagnostics(true), fetchUserConfig(true), fetchDisabledFeatures(true)])
  }

  return {
    // Diagnostics
    diagnosticsData: computed(() => diagnosticsState.data),
    diagnosticsLoading: computed(() => diagnosticsState.loading),
    diagnosticsFetched: computed(() => diagnosticsState.fetched),
    healthCheckData,
    healthCounts,
    modules,
    modulesDetailed,
    obsoleteModules,
    freeModules,
    licenseClientNumbers,
    fetchDiagnostics,

    // User configuration
    userConfigData: computed(() => userConfigState.data),
    userConfigLoading: computed(() => userConfigState.loading),
    fetchUserConfig,

    // Disabled features
    disabledFeatures: computed(() => disabledFeaturesState.data ?? []),
    disabledFeaturesLoading: computed(() => disabledFeaturesState.loading),
    fetchDisabledFeatures,

    // Product icons
    productIcons: computed(() => productIconsState.data),
    productIconsLoading: computed(() => productIconsState.loading),
    fetchProductIcons,

    // Changelogs
    changelogs: computed(() => changelogsState.data),
    changelogsLoading: computed(() => changelogsState.loading),
    fetchChangelogs,

    // Batch
    fetchPostLoginData,
    refreshAll,
  }
}
