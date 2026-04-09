/**
 * Shared cached data composable.
 * Caches slow-changing data (diagnostics, user configuration, disabled features,
 * product icons, changelogs, host groups, product groups) so they are fetched
 * once and shared across pages.
 * Data is refetched only on manual refresh, force flag, or full app refresh.
 */
import type { GroupTreeNodeData } from '~/types'
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

// ---------------------------------------------------------------------------
// Host groups (client groups) cache
// ---------------------------------------------------------------------------
const clientGroupsState = reactive({
  tree: [] as GroupTreeNodeData[],
  loading: false,
  error: null as string | null,
  fetched: false,
  expanded: [] as string[],
})
let clientGroupsPromise: Promise<void> | null = null

// ---------------------------------------------------------------------------
// Product groups cache
// ---------------------------------------------------------------------------
const productGroupsState = reactive({
  tree: [] as GroupTreeNodeData[],
  loading: false,
  error: null as string | null,
  fetched: false,
  expanded: [] as string[],
})
let productGroupsPromise: Promise<void> | null = null

// ---------------------------------------------------------------------------
// transformApiToTree – converts raw API group data to GroupTreeNodeData[]
// ---------------------------------------------------------------------------
function transformApiToTree(
  data: Record<string, unknown>,
  groupType: 'client' | 'product',
  level = 0
): GroupTreeNodeData[] {
  if (!data || typeof data !== 'object') return []
  const processNode = (
    key: string,
    value: unknown,
    parentId?: string,
    nodeLevel = 0
  ): GroupTreeNodeData | null => {
    if (!value || typeof value !== 'object') return null
    const obj = value as Record<string, unknown>
    const rawId = (obj.id as string) || key
    const nodeId = rawId ? rawId.split(';')[0] : ''
    const nodeText = (obj.text as string) || nodeId || ''
    const nodeType = obj.type as string
    if (nodeType === 'ObjectToGroup' || !nodeId) return null
    const isSpecial = nodeText === 'not_assigned' || nodeId.includes('not_assigned')
    const isRoot =
      nodeText === 'clientdirectory' || nodeText === 'groups' || nodeText === 'productgroups'
    let memberCount = 0
    const members: string[] = []
    const childNodes: GroupTreeNodeData[] = []
    if (obj.children && typeof obj.children === 'object') {
      const children = obj.children as Record<string, unknown> | unknown[]
      const entries = Array.isArray(children)
        ? children.map((c, i) => [String(i), c])
        : Object.entries(children)
      for (const [childKey, childValue] of entries) {
        const childObj = childValue as Record<string, unknown>
        if (childObj?.type === 'ObjectToGroup') {
          memberCount++
          const memberId = (childObj.text as string) || (childObj.id as string)?.split(';')[0]
          if (memberId) members.push(memberId)
        } else {
          const subNode = processNode(childKey as string, childValue, nodeId, nodeLevel + 1)
          if (subNode) childNodes.push(subNode)
        }
      }
    }
    return {
      id: nodeId,
      label: nodeText,
      parentId: parentId || null,
      type: groupType === 'client' ? 'HostGroup' : 'ProductGroup',
      memberCount,
      members,
      children: childNodes.length > 0 ? childNodes : undefined,
      isRoot,
      isSpecial,
      level: nodeLevel,
    }
  }
  const rootData = data as Record<string, unknown>
  if (rootData.id) {
    const rootNode = processNode(rootData.id as string, rootData, undefined, level)
    return rootNode ? [rootNode] : []
  }
  const nodes: GroupTreeNodeData[] = []
  for (const [key, value] of Object.entries(rootData)) {
    const node = processNode(key, value, undefined, level)
    if (node) nodes.push(node)
  }
  return nodes
}

export function useCachedData() {
  const {
    getDiagnosticData,
    getUserConfiguration,
    getDisabledFeatures,
    getProductIcons,
    getChangelogs,
    getHostGroups,
    getProductGroups,
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
  // Host groups (client groups)
  // -------------------------------------------------------------------------

  async function fetchClientGroups(force = false, selectedServers: string[] = []) {
    if (clientGroupsState.fetched && !force) return
    // Deduplicate concurrent calls
    if (clientGroupsPromise && !force) {
      await clientGroupsPromise
      return
    }
    clientGroupsState.loading = true
    clientGroupsState.error = null
    const doFetch = async () => {
      try {
        const params: Record<string, unknown> = {}
        if (selectedServers.length > 0) params.selectedServers = `[${selectedServers.join(',')}]`
        const result = await getHostGroups(params)
        if (result.data) {
          clientGroupsState.tree = transformApiToTree(result.data, 'client')
          clientGroupsState.fetched = true
          const first = clientGroupsState.tree[0]
          if (first && !clientGroupsState.expanded.includes(first.id))
            clientGroupsState.expanded = [first.id]
        }
      } catch (e) {
        clientGroupsState.error = e instanceof Error ? e.message : 'Failed to load groups'
      } finally {
        clientGroupsState.loading = false
        clientGroupsPromise = null
      }
    }
    clientGroupsPromise = doFetch()
    await clientGroupsPromise
  }

  // -------------------------------------------------------------------------
  // Product groups
  // -------------------------------------------------------------------------

  async function fetchProductGroups(force = false) {
    if (productGroupsState.fetched && !force) return
    if (productGroupsPromise && !force) {
      await productGroupsPromise
      return
    }
    productGroupsState.loading = true
    productGroupsState.error = null
    const doFetch = async () => {
      try {
        const result = await getProductGroups()
        if (result.data) {
          const rawData = (result.data as Record<string, unknown>).groups || result.data
          productGroupsState.tree = transformApiToTree(
            rawData as Record<string, unknown>,
            'product'
          )
          productGroupsState.fetched = true
          const first = productGroupsState.tree[0]
          if (first && !productGroupsState.expanded.includes(first.id))
            productGroupsState.expanded = [first.id]
        }
      } catch (e) {
        productGroupsState.error = e instanceof Error ? e.message : 'Failed to load groups'
      } finally {
        productGroupsState.loading = false
        productGroupsPromise = null
      }
    }
    productGroupsPromise = doFetch()
    await productGroupsPromise
  }

  // -------------------------------------------------------------------------
  // Group tree helper actions
  // -------------------------------------------------------------------------

  function toggleGroupExpand(groupType: 'client' | 'product', groupId: string) {
    const arr = groupType === 'client' ? clientGroupsState.expanded : productGroupsState.expanded
    const idx = arr.indexOf(groupId)
    if (idx > -1) arr.splice(idx, 1)
    else arr.push(groupId)
  }

  function expandAllGroups(groupType: 'client' | 'product') {
    const tree = groupType === 'client' ? clientGroupsState.tree : productGroupsState.tree
    const allIds: string[] = []
    const collect = (nodes: GroupTreeNodeData[]) => {
      for (const n of nodes) {
        if (n.children?.length || n.members?.length) {
          allIds.push(n.id)
          if (n.children) collect(n.children)
        }
      }
    }
    collect(tree)
    if (groupType === 'client') clientGroupsState.expanded = allIds
    else productGroupsState.expanded = allIds
  }

  function collapseAllGroups(groupType: 'client' | 'product') {
    const tree = groupType === 'client' ? clientGroupsState.tree : productGroupsState.tree
    const rootId = tree[0]?.id
    if (groupType === 'client') clientGroupsState.expanded = rootId ? [rootId] : []
    else productGroupsState.expanded = rootId ? [rootId] : []
  }

  function getGroupMembers(groupId: string, groupType: 'client' | 'product'): string[] {
    const tree = groupType === 'client' ? clientGroupsState.tree : productGroupsState.tree
    const find = (nodes: GroupTreeNodeData[]): GroupTreeNodeData | null => {
      for (const n of nodes) {
        if (n.id === groupId) return n
        if (n.children) {
          const f = find(n.children)
          if (f) return f
        }
      }
      return null
    }
    return find(tree)?.members || []
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

    // Host groups (client groups)
    clientGroupsTree: computed(() => clientGroupsState.tree),
    clientGroupsLoading: computed(() => clientGroupsState.loading),
    clientGroupsError: computed(() => clientGroupsState.error),
    clientGroupsExpanded: computed(() => clientGroupsState.expanded),
    clientGroupsFetched: computed(() => clientGroupsState.fetched),
    fetchClientGroups,

    // Product groups
    productGroupsTree: computed(() => productGroupsState.tree),
    productGroupsLoading: computed(() => productGroupsState.loading),
    productGroupsError: computed(() => productGroupsState.error),
    productGroupsExpanded: computed(() => productGroupsState.expanded),
    productGroupsFetched: computed(() => productGroupsState.fetched),
    fetchProductGroups,

    // Group tree helpers
    toggleGroupExpand,
    expandAllGroups,
    collapseAllGroups,
    getGroupMembers,

    // Batch
    fetchPostLoginData,
    refreshAll,
  }
}
