interface ApiResponse<T> {
  data: T | null
  error: Error | null
  total: number | null
}

export function useApiHelpers() {
  const { $customFetch } = useNuxtApp() as unknown as {
    $customFetch: typeof $fetch
  }

  // ---------------------------------------------------------------------------
  // Core HTTP helpers
  // ---------------------------------------------------------------------------

  async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const qs = params
        ? '?' +
          new URLSearchParams(
            Object.entries(params).map(([k, v]) => [
              k,
              typeof v === 'object' ? JSON.stringify(v) : String(v),
            ])
          ).toString()
        : ''
      const response = await $customFetch.raw<T>(url + qs)
      const total = response.headers.get('X-Total-Count')
      return {
        data: response._data ?? null,
        error: null,
        total: total ? parseInt(total, 10) : null,
      }
    } catch (e) {
      return { data: null, error: e as Error, total: null }
    }
  }

  async function apiPost<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await $customFetch.raw<T>(url, {
        method: 'POST',
        body: body as Record<string, unknown>,
      })
      const total = response.headers.get('X-Total-Count')
      return {
        data: response._data ?? null,
        error: null,
        total: total ? parseInt(total, 10) : null,
      }
    } catch (e) {
      return { data: null, error: e as Error, total: null }
    }
  }

  async function apiPut<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<T>(url, {
        method: 'PUT',
        body: body as Record<string, unknown>,
      })
      return { data, error: null, total: null }
    } catch (e) {
      return { data: null, error: e as Error, total: null }
    }
  }

  async function apiDelete<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<T>(url, {
        method: 'DELETE',
        body: body as Record<string, unknown>,
      })
      return { data, error: null, total: null }
    } catch (e) {
      return { data: null, error: e as Error, total: null }
    }
  }

  // ---------------------------------------------------------------------------
  // Auth & User (login.vue, plugins/init.ts, dashboard.vue)
  // ---------------------------------------------------------------------------

  const getConfigServer = () => apiGet<string>('/user/opsiserver')

  const callLogin = (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return apiPost<{ result: string }>('/auth/login', formData)
  }

  const callLogout = () => apiPost('/auth/logout')

  const getUserSettings = () =>
    apiGet<{ username: string; expertmode: boolean; recentactivityexpiry: number }>(
      '/user/getsettings'
    )

  const getUserConfiguration = () =>
    apiGet<{
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
    }>('/user/configuration')

  const getDisabledFeatures = () => apiGet<string[]>('/opsidata/server/disabled-features')

  const getChangelogs = () => apiGet<string>('/opsidata/changelogs')

  // ---------------------------------------------------------------------------
  // Servers / Depots (servers/index.vue, quickpanel, plugins/init.ts)
  // ---------------------------------------------------------------------------

  const getServers = (params?: Record<string, unknown>) =>
    apiGet<
      Array<{
        depotId: string
        description: string
        type: string
        depotRemoteUrl: string
        depotWebdavUrl: string
        repositoryRemoteUrl: string
        workbenchRemoteUrl: string
      }>
    >('/opsidata/depots', params)

  const getServerIds = () => apiGet<string[]>('/opsidata/depot_ids')

  const getDiagnosticData = () => apiGet<Record<string, unknown>>('/opsidata/server/diagnostic')

  const getServerAttributes = (serverId: string) =>
    apiGet<Array<Record<string, unknown>>>(`/opsidata/servers?servers=[${serverId}]`)

  const updateServerAttributes = (serverId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/servers/${serverId}`, attrs)

  // ---------------------------------------------------------------------------
  // Clients (clients/index.vue, AddForm, CloneForm, RowActionsDropdown, QuickActionsDropdown)
  // ---------------------------------------------------------------------------

  const getClients = (params?: Record<string, unknown>) =>
    apiGet<
      Array<{
        clientId: string
        description: string
        macAddress: string
        ipAddress: string
        lastSeen: string
        depotId: string
        notes: string
        uefi: boolean
      }>
    >('/opsidata/clients', params)

  const getClientIds = (servers: string[]) =>
    apiGet<string[]>(`/opsidata/depots/clients?selectedDepots=[${servers.join(',')}]`)

  const createClient = (request: {
    client: {
      hostId: string
      description?: string
      inventoryNumber?: string
      hardwareAddress?: string | null
      ipAddress?: string | null
      notes?: string | null
    }
    depot: string
  }) => apiPost<Record<string, unknown>>('/opsidata/clients', request)

  const deleteClient = (clientId: string) => apiDelete<void>(`/opsidata/clients/${clientId}`)

  const renameClient = (clientId: string, newHostId: string) =>
    apiPut<Record<string, unknown>>(`/opsidata/clients/${clientId}`, { hostId: newHostId })

  const cloneClient = (
    clientId: string,
    target: { hostId: string; ipAddress?: string; hardwareAddress?: string; systemUUID?: string },
    options: { configs?: boolean; products?: boolean; productProperties?: boolean }
  ) => apiPost<void>(`/opsidata/clients/${clientId}/clone`, { target, options })

  const updateClientAttributes = (clientId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/clients/${clientId}`, attrs)

  const getHostAttributes = (hostId: string) =>
    apiGet<Array<Record<string, unknown>>>(`/opsidata/hosts?hosts=${hostId}`)

  const checkClientReachable = (clientIds: string[]) =>
    apiGet<Record<string, boolean>>('/opsidata/clients/reachable', {
      selectedClients: `[${clientIds.join(',')}]`,
    })

  const deployClientAgent = (agentData: {
    clients: string[]
    username: string
    password: string
    type: 'windows' | 'linux' | 'mac'
  }) => apiPost<void>('/opsidata/clients/deploy', agentData)

  const addClientToGroups = (clientId: string, groupIds: string[]) =>
    apiPost<void>(`/opsidata/clients/${clientId}/groups`, groupIds)

  const removeClientFromGroups = (clientId: string, groupIds: string[]) =>
    apiDelete(`/opsidata/clients/${clientId}/groups`, groupIds)

  const getClientLogs = (clientId: string, logType: string, params?: Record<string, unknown>) =>
    apiGet<{ content: string; marker: number }>('/opsidata/log', {
      selectedClient: clientId,
      selectedLogType: logType,
      ...params,
    })

  // Client RPC actions (RowActionsDropdown, QuickActionsDropdown)
  interface OpsiclientdRpcResult {
    [clientId: string]: { error?: string | null; result?: string | null }
  }

  const opsiclientdRpc = (clientIds: string[], method: string, params: unknown[] = []) =>
    apiPost<OpsiclientdRpcResult>('/command/opsiclientd_rpc', {
      client_ids: clientIds,
      method,
      params,
    })

  const triggerOnDemand = (clientIds: string[]) =>
    opsiclientdRpc(clientIds, 'fireEvent', ['on_demand'])

  const sendNotification = (clientIds: string[], message: string) =>
    opsiclientdRpc(clientIds, 'showPopup', [message])

  const rebootClients = (clientIds: string[]) => opsiclientdRpc(clientIds, 'reboot', [])

  const shutdownClients = (clientIds: string[]) => opsiclientdRpc(clientIds, 'shutdown', [])

  // ---------------------------------------------------------------------------
  // Products (products/MainView.vue, ConfigTabs, QuickActionsDropdown)
  // ---------------------------------------------------------------------------

  const getProducts = (params?: Record<string, unknown>) =>
    apiGet<
      Array<{
        productId: string
        name: string
        description: string
        version: string
        type: string
        productVersion: string
        packageVersion: string
      }>
    >('/opsidata/products', params)

  const getServersProducts = (selectedServers: string[], productType?: string) => {
    const params: Record<string, unknown> = {
      selectedDepots: `[${selectedServers.join(',')}]`,
    }
    if (productType) params.productType = productType
    return apiGet<Array<{ productId: string; [k: string]: unknown }>>(
      '/opsidata/depots/products',
      params
    )
  }

  const setClientProductActions = (data: {
    clientIds: string[]
    productIds: string[]
    actionRequest?: string
    installationStatus?: string
    actionResult?: string
  }) => apiPost<void>('/opsidata/clients/products', data)

  const getProductIcons = () =>
    apiGet<{ result: Record<string, unknown> }>('/opsidata/producticons')

  const getInstallationStatuses = () => apiGet<string[]>('/opsidata/products/installation-status')

  const getActionResults = () => apiGet<string[]>('/opsidata/products/action-result')

  const processActionRequests = (
    clientIds: string[],
    productIds?: string[],
    visibility?: '' | 'visible' | 'hidden'
  ) =>
    apiPost<Record<string, Record<string, unknown>>>('/command/process_action', {
      client_ids: clientIds,
      product_ids: productIds,
      visibility,
    })

  const bulkProductAction = (params: {
    action: string
    demoMode: boolean
    outdated: boolean
    installation_status: string | null
    action_result: string | null
    selectedClients: string[] | null
    selectedDepots: string[] | null
  }) => apiPost<Record<string, unknown>>('/opsidata/clients/action', params)

  // Product properties & dependencies (products/ConfigTabs)
  const getProductProperties = (
    productId: string,
    params?: { selectedClients?: string[]; selectedServers?: string[] }
  ) => {
    const qp: Record<string, unknown> = {}
    if (params?.selectedClients?.length)
      qp.selectedClients = `[${params.selectedClients.join(',')}]`
    if (params?.selectedServers?.length) qp.selectedDepots = `[${params.selectedServers.join(',')}]`
    return apiGet<{
      properties: Record<string, unknown>
      productVersions: Record<string, string | undefined>
      productDescription: string
      productDescriptionDetails: Record<string, string>
      productAdvice: string
      productAdviceDetails: Record<string, string>
    }>(`/opsidata/products/${productId}/properties`, qp)
  }
  const saveProductProperties = (
    productId: string,
    data: {
      clientIds?: string[]
      depotIds?: string[]
      properties: Record<string, string | boolean | string[]>
    }
  ) =>
    apiPost<{ status: number; data: Record<string, unknown> }>(
      `/opsidata/products/${productId}/properties`,
      data
    )

  const getProductDependencies = (productId: string, params?: { selectedClients?: string[] }) => {
    const qp: Record<string, unknown> = {}
    if (params?.selectedClients?.length)
      qp.selectedClients = `[${params.selectedClients.join(',')}]`
    return apiGet<{
      dependencies: Array<{
        productId: string
        productAction: string | null
        version: string
        requiredProductId: string
        requiredVersion: string | null
        requiredAction: string | null
        requiredInstallationStatus: string | null
        requirementType: string | null
      }>
      productVersions: Record<string, string | undefined>
      productDescription: string
      productDescriptionDetails: Record<string, string>
      productAdvice: string
      productAdviceDetails: Record<string, string>
    }>(`/opsidata/products/${productId}/dependencies`, qp)
  }

  // ---------------------------------------------------------------------------
  // Groups (groups/index.vue, quickpanel/GroupSelectionTree, selectionStore)
  // ---------------------------------------------------------------------------

  const getHostGroups = (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/opsidata/hosts/groups', params)

  const getProductGroups = () =>
    apiGet<{ groups?: Record<string, unknown> }>('/opsidata/products/groups')

  const getHostGroupIds = () => apiGet<string[]>('/opsidata/hosts/groups/id')

  const createHostGroup = (groupData: {
    groupId: string
    parentGroupId?: string
    description?: string
    notes?: string
  }) => apiPost('/opsidata/hosts/groups', groupData)

  const createProductGroup = (groupData: {
    groupId: string
    parentGroupId?: string
    description?: string
    notes?: string
  }) => apiPost('/opsidata/products/groups', groupData)

  const updateHostGroup = (
    groupId: string,
    updateData: { parent?: string; description?: string; note?: string }
  ) => apiPut(`/opsidata/hosts/groups/${groupId}`, updateData)

  const updateProductGroup = (
    groupId: string,
    updateData: { parent?: string; description?: string; note?: string }
  ) => apiPut(`/opsidata/products/groups/${groupId}`, updateData)

  const deleteHostGroup = (groupId: string) => apiDelete(`/opsidata/hosts/groups/${groupId}`)

  // TODO: Backend bug: product group deletion uses GET instead of DELETE
  const deleteProductGroup = (groupId: string) => apiGet(`/opsidata/products/groups/${groupId}`)

  const addClientsToGroup = (groupId: string, clientIds: string[]) =>
    apiPost(`/opsidata/hosts/groups/${groupId}/clients`, clientIds)

  const removeClientsFromGroup = (groupId: string) =>
    apiDelete(`/opsidata/hosts/groups/${groupId}/clients`)

  const addProductsToGroup = (groupId: string, productIds: string[]) =>
    apiPost(`/opsidata/products/groups/${groupId}/products`, productIds)

  const removeProductsFromGroup = (groupId: string) =>
    apiDelete(`/opsidata/products/groups/${groupId}/products`)

  const removeProductFromGroup = (groupId: string, productId: string) =>
    apiDelete(`/opsidata/products/groups/${groupId}/${productId}`)

  // ---------------------------------------------------------------------------
  // Config (hosts/ConfigTabs, products/ConfigTabs)
  // ---------------------------------------------------------------------------

  const getServerConfig = (params?: Record<string, unknown>) =>
    apiGet<
      Record<
        string,
        Array<{
          configId: string
          description: string
          type: string
          value: unknown
          possibleValues: string
          multiValue: boolean
          editable: boolean
        }>
      >
    >('/opsidata/config/server', params)

  const getServerDefaultConfig = (filterQuery?: string) =>
    apiGet<
      Record<
        string,
        Array<{
          configId: string
          description: string
          type: 'BoolConfig' | 'UnicodeConfig'
          defaultValues: unknown[]
          possibleValues: unknown[]
          multiValue: boolean
          editable: boolean
          objects: Record<string, unknown>
        }>
      >
    >('/opsidata/config', filterQuery ? { filterQuery } : undefined)

  const getHostConfigObjects = (hostId: string) =>
    apiGet<
      Record<
        string,
        Array<{
          configId: string
          description: string
          type: 'BoolConfig' | 'UnicodeConfig'
          defaultValues: unknown[]
          possibleValues: unknown[]
          multiValue: boolean
          editable: boolean
          objects: Record<string, unknown>
          newValue?: string
          newValues?: unknown[]
        }>
      >
    >(`/opsidata/config/objects/${hostId}`)

  const saveHostConfigState = (
    hostId: string,
    configs: Array<{ configId: string; value: unknown }>
  ) =>
    apiPost<string>('/opsidata/config/values/objects', {
      objectIds: [hostId],
      configs: configs.map((c) => ({ configId: c.configId, value: c.value })),
    })

  const saveServerConfigValues = (configs: Array<{ configId: string; value: unknown }>) =>
    apiPost<string>('/opsidata/config/values', configs)

  const createConfig = (config: {
    configId: string
    editable?: boolean
    multiValue?: boolean
    description?: string
    possibleValues?: string[]
    defaultValues?: string[]
    type?: 'UnicodeConfig' | 'BoolConfig'
  }) => apiPost<Record<string, unknown>>('/opsidata/config', config)

  // ---------------------------------------------------------------------------
  // Admin / Maintenance (admin/maintenance.vue, admin/diagnostics)
  // ---------------------------------------------------------------------------

  const getBlockedClients = () =>
    apiGet<string[] | Record<string, string>>('/opsidata/blocked-clients')

  const unblockClient = (clientId: string) => apiPost<void>(`/opsidata/clients/${clientId}/unblock`)

  const unblockAllClients = () => apiPost<void>('/opsidata/clients/unblock')

  const getLockedProducts = () => apiGet<Record<string, string>>('/opsidata/locked-products')

  const unlockProduct = (productId: string) =>
    apiPost<void>(`/opsidata/products/${productId}/unlock`)

  const unlockAllProducts = () => apiPost<void>('/opsidata/products/unlock')

  const getAppState = () =>
    apiGet<{ type: 'normal' | 'maintenance'; address_exceptions: string[]; retry_after: number }>(
      '/app-state'
    )

  const setAppState = (state: {
    type: string
    address_exceptions?: string[]
    retry_after?: number
  }) => apiPost<{ type: string }>('/app-state', state)

  const createBackup = (options: {
    config_files?: boolean
    redis_data?: boolean
    maintenance_mode?: boolean
    password?: string
  }) => apiPost<string>('/backup/create', options)

  const restoreBackup = (options: {
    file_id: string
    config_files?: boolean
    redis_data?: boolean
    server_id?: string
    password?: string
  }) => apiPost<void>('/backup/restore', options)

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // Core
    apiGet,
    apiPost,
    apiPut,
    apiDelete,

    // Auth & User
    getConfigServer,
    callLogin,
    callLogout,
    getUserSettings,
    getUserConfiguration,
    getDisabledFeatures,
    getChangelogs,

    // Servers / Depots
    getServers,
    getServerIds,
    getDiagnosticData,
    getServerAttributes,
    updateServerAttributes,

    // Clients
    getClients,
    getClientIds,
    createClient,
    deleteClient,
    renameClient,
    cloneClient,
    updateClientAttributes,
    getHostAttributes,
    checkClientReachable,
    deployClientAgent,
    addClientToGroups,
    removeClientFromGroups,
    getClientLogs,
    triggerOnDemand,
    sendNotification,
    rebootClients,
    shutdownClients,

    // Products
    getProducts,
    getServersProducts,
    setClientProductActions,
    getProductIcons,
    getInstallationStatuses,
    getActionResults,
    processActionRequests,
    bulkProductAction,
    getProductProperties,
    saveProductProperties,
    getProductDependencies,

    // Groups
    getHostGroups,
    getProductGroups,
    getHostGroupIds,
    createHostGroup,
    createProductGroup,
    updateHostGroup,
    updateProductGroup,
    deleteHostGroup,
    deleteProductGroup,
    addClientsToGroup,
    removeClientsFromGroup,
    addProductsToGroup,
    removeProductsFromGroup,
    removeProductFromGroup,

    // Config
    getServerConfig,
    getServerDefaultConfig,
    getHostConfigObjects,
    saveHostConfigState,
    saveServerConfigValues,
    createConfig,

    // Admin / Maintenance
    getBlockedClients,
    unblockClient,
    unblockAllClients,
    getLockedProducts,
    unlockProduct,
    unlockAllProducts,
    getAppState,
    setAppState,
    createBackup,
    restoreBackup,
  }
}
