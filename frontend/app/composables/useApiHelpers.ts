interface FetchOptions {
  method?: string
  body?: unknown
  params?: Record<string, unknown>
}

interface ApiResponse<T> {
  data: T | null
  error: Error | null
  headers: Headers | null
}

export function useApiHelpers() {
  const { $customFetch } = useNuxtApp() as unknown as {
    $customFetch: <T>(url: string, opts?: FetchOptions) => Promise<T>
  }

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
      const data = await $customFetch<T>(url + qs)
      return { data, error: null, headers: null }
    } catch (e) {
      return { data: null, error: e as Error, headers: null }
    }
  }

  async function apiPost<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<T>(url, { method: 'POST', body })
      return { data, error: null, headers: null }
    } catch (e) {
      return { data: null, error: e as Error, headers: null }
    }
  }

  async function apiPut<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<T>(url, { method: 'PUT', body })
      return { data, error: null, headers: null }
    } catch (e) {
      return { data: null, error: e as Error, headers: null }
    }
  }

  async function apiDelete<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<T>(url, { method: 'DELETE', body })
      return { data, error: null, headers: null }
    } catch (e) {
      return { data: null, error: e as Error, headers: null }
    }
  }

  const getConfigServer = () => apiGet<string>('/user/opsiserver')
  const checkAuth = () => apiGet<{ authenticated: boolean; username: string }>('/auth/session')
  const callLogin = (username: string, password: string) =>
    apiPost<{ success: boolean }>('/auth/login', { username, password })
  const callLogout = () => apiPost('/auth/logout')
  const getChangelogs = () => apiGet<string>('/opsidata/changelogs')

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
  const getClientConfig = (clientId: string) =>
    apiGet<Array<{ id: string; type: string; value: unknown }>>(
      `/opsidata/clients/${clientId}/config`
    )

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

  const getHostGroups = (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/opsidata/hosts/groups', params)
  const getProductGroups = () =>
    apiGet<{ groups?: Record<string, unknown> }>('/opsidata/products/groups')

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
  const deleteProductGroup = (groupId: string) => apiGet(`/opsidata/products/groups/${groupId}`)
  const removeClientsFromGroup = (groupId: string) =>
    apiDelete(`/opsidata/hosts/groups/${groupId}/clients`)
  const removeProductsFromGroup = (groupId: string) =>
    apiDelete(`/opsidata/products/groups/${groupId}/products`)
  const addClientsToGroup = (groupId: string, clientIds: string[]) =>
    apiPost(`/opsidata/hosts/groups/${groupId}/clients`, clientIds)
  const addProductsToGroup = (groupId: string, productIds: string[]) =>
    apiPost(`/opsidata/products/groups/${groupId}/products`, productIds)
  const removeProductFromGroup = (groupId: string, productId: string) =>
    apiDelete(`/opsidata/products/groups/${groupId}/${productId}`)
  const removeClientFromGroups = (clientId: string, groupIds: string[]) =>
    apiDelete(`/opsidata/clients/${clientId}/groups`, groupIds)
  const addClientToMultipleGroups = (clientId: string, groupIds: string[]) =>
    apiPost(`/opsidata/clients/${clientId}/groups`, groupIds)

  const getServerInfo = () =>
    apiGet<{
      opsiVersion: string
      hostname: string
      pythonVersion: string
      uptime: number
      os: string
      computerName: string
      ip: string
    }>('/user/opsiserver')
  const getHealthcheck = () =>
    apiGet<
      Array<{
        check_id: string
        check_name: string
        check_status: 'ok' | 'warning' | 'error'
        check_description: string
        message: string
        upgrade_issue: string | null
        partial_results: Array<{ message: string; check_status: string }>
      }>
    >('/opsidata/server/health')
  const getDiagnosticData = () => apiGet<Record<string, unknown>>('/opsidata/server/diagnostic')
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

  const getClientLogs = (clientId: string, logType: string, params?: Record<string, unknown>) =>
    apiGet<{ content: string; marker: number }>(
      `/opsidata/clients/${clientId}/logs/${logType}`,
      params
    )

  const getBlockedClients = () => apiGet<Record<string, string>>('/opsidata/blocked-clients')
  const unblockClient = (clientId: string) => apiPost<void>(`/opsidata/clients/${clientId}/unblock`)
  const unblockAllClients = () => apiPost<void>('/opsidata/clients/unblock')
  const getLockedProducts = () => apiGet<Record<string, string>>('/opsidata/locked-products')
  const unlockProduct = (productId: string) =>
    apiPost<void>(`/opsidata/products/${productId}/unlock`)
  const unlockAllProducts = () => apiPost<void>('/opsidata/products/unlock')

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
  const deployClientAgent = (agentData: {
    clients: string[]
    username: string
    password: string
    type: 'windows' | 'linux' | 'mac'
  }) => apiPost<void>('/opsidata/clients/deploy', agentData)
  const setClientUefi = (clientId: string, uefi: boolean) =>
    apiPost<void>(`/opsidata/clients/${clientId}/uefi`, { uefi })
  const addClientToGroups = (clientId: string, groupIds: string[]) =>
    apiPost<void>(`/opsidata/clients/${clientId}/groups`, groupIds)
  const cloneClient = (
    clientId: string,
    target: { hostId: string; ipAddress?: string; hardwareAddress?: string; systemUUID?: string },
    options: { configs?: boolean; products?: boolean; productProperties?: boolean }
  ) => apiPost<void>(`/opsidata/clients/${clientId}/clone`, { target, options })
  const getClientServerMapping = (clientIds: string[]) =>
    apiGet<Record<string, string>>('/opsidata/clientsdepots', {
      selectedClients: `[${clientIds.join(',')}]`,
    })

  const getHostGroupIds = () => apiGet<string[]>('/opsidata/hosts/groups/id')
  const getHostGroupsDynamic = (params?: {
    selectedServers?: string[]
    parentGroup?: string
    selectedClients?: string[]
    withClients?: boolean
  }) => {
    const qp: Record<string, unknown> = {}
    if (params?.selectedServers?.length) qp.selectedDepots = `[${params.selectedServers.join(',')}]`
    if (params?.parentGroup) qp.parentGroup = params.parentGroup
    if (params?.selectedClients?.length)
      qp.selectedClients = `[${params.selectedClients.join(',')}]`
    if (params?.withClients !== undefined) qp.withClients = params.withClients
    return apiGet<{ groups: Record<string, unknown> }>('/opsidata/hosts/groups-dynamic', qp)
  }

  const getProductsOnServers = (type: string, selectedServers: string[]) =>
    apiGet<Record<string, string[]>>('/opsidata/products/depots', {
      type,
      selectedDepots: `[${selectedServers.join(',')}]`,
    })
  const getProductCount = (type: string, selectedServers: string[]) =>
    apiGet<number>('/opsidata/products/count', {
      type,
      selectedDepots: `[${selectedServers.join(',')}]`,
    })
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

  const getConfigForClients = (selectedClients: string[], filterQuery?: string) => {
    const params: Record<string, unknown> = { selectedClients: `[${selectedClients.join(',')}]` }
    if (filterQuery) params.filterQuery = filterQuery
    return apiGet<Record<string, unknown>>('/opsidata/config/clients', params)
  }
  const checkConfigExists = (configId: string) =>
    apiGet<boolean>(`/opsidata/config/exists/${configId}`)
  const deleteConfig = (configId: string) =>
    apiPost<void>(`/opsidata/config/delete/${configId}`, {})
  const createConfig = (config: {
    configId: string
    editable?: boolean
    multiValue?: boolean
    description?: string
    possibleValues?: string[]
    defaultValues?: string[]
    type?: 'UnicodeConfig' | 'BoolConfig'
  }) => apiPost<Record<string, unknown>>('/opsidata/config', config)

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

  const getServersProducts = (selectedServers: string[], productType?: string) =>
    apiPost<Array<{ productId: string; [k: string]: unknown }>>('/opsidata/depots/products', {
      selectedDepots: selectedServers,
      productType,
    })

  const getHomeData = () => apiPost<{ groups: Record<string, unknown> }>('/opsidata/home', {})
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

  const getModulesContent = () => apiPost<{ result: string[] }>('/opsidata/modulesContent')
  const getDisabledFeatures = () => apiGet<string[]>('/opsidata/server/disabled-features')

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

  const getHostAttributes = (hostId: string) =>
    apiGet<Array<Record<string, unknown>>>(`/opsidata/hosts?hosts=${hostId}`)

  const getServerAttributes = (serverId: string) =>
    apiGet<Array<Record<string, unknown>>>(`/opsidata/servers?servers=[${serverId}]`)

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

  const updateClientAttributes = (clientId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/clients/${clientId}`, attrs)
  const updateServerAttributes = (serverId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/servers/${serverId}`, attrs)

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
  const rebootClients = (clientIds: string[]) => opsiclientdRpc(clientIds, 'reboot', [''])
  const shutdownClients = (clientIds: string[]) => opsiclientdRpc(clientIds, 'shutdown', [''])
  const deleteClient = (clientId: string) =>
    apiPost<void>(`/opsidata/clients/${clientId}/delete`, {})
  const checkClientReachable = (clientIds: string[]) =>
    apiPost<Record<string, boolean>>('/opsidata/clients/reachable', { selectedClients: clientIds })
  const executeClientAction = (
    clientIds: string[],
    action: string,
    params?: Record<string, unknown>
  ) => apiPost<OpsiclientdRpcResult>('/opsidata/clients/action', { clientIds, action, ...params })

  return {
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    getConfigServer,
    checkAuth,
    callLogin,
    callLogout,
    getChangelogs,
    getServers,
    getServerIds,
    getClients,
    getClientIds,
    getClientConfig,
    getProducts,
    getHostGroups,
    getProductGroups,
    createHostGroup,
    updateHostGroup,
    deleteHostGroup,
    createProductGroup,
    updateProductGroup,
    deleteProductGroup,
    addClientsToGroup,
    removeClientsFromGroup,
    addClientToMultipleGroups,
    addProductsToGroup,
    removeProductsFromGroup,
    removeProductFromGroup,
    removeClientFromGroups,
    getServerInfo,
    getHealthcheck,
    getDiagnosticData,
    getServerConfig,
    getClientLogs,
    getBlockedClients,
    unblockClient,
    unblockAllClients,
    getLockedProducts,
    unlockProduct,
    unlockAllProducts,
    getUserSettings,
    getUserConfiguration,
    createClient,
    deployClientAgent,
    setClientUefi,
    addClientToGroups,
    cloneClient,
    getClientServerMapping,
    getHostGroupIds,
    getHostGroupsDynamic,
    getProductsOnServers,
    getProductCount,
    setClientProductActions,
    getProductIcons,
    getInstallationStatuses,
    getActionResults,
    getConfigForClients,
    checkConfigExists,
    deleteConfig,
    createConfig,
    processActionRequests,
    getServersProducts,
    getHomeData,
    getAppState,
    setAppState,
    createBackup,
    restoreBackup,
    getModulesContent,
    getDisabledFeatures,
    getProductProperties,
    saveProductProperties,
    getProductDependencies,
    getHostConfigObjects,
    saveHostConfigState,
    saveServerConfigValues,
    getHostAttributes,
    getServerAttributes,
    getServerDefaultConfig,
    updateClientAttributes,
    updateServerAttributes,
    opsiclientdRpc,
    triggerOnDemand,
    sendNotification,
    rebootClients,
    shutdownClients,
    deleteClient,
    checkClientReachable,
    executeClientAction,
  }
}
