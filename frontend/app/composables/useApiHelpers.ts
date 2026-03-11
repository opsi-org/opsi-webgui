/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
*/

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

  // Generic GET request
  async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const queryString = params ? '?' + new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
      ).toString() : ''
      const data = await $customFetch<T>(url + queryString)
      return { data, error: null, headers: null }
    } catch (e) {
      return { data: null, error: e as Error, headers: null }
    }
  }

  // Generic POST request
  async function apiPost<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<T>(url, { method: 'POST', body })
      return { data, error: null, headers: null }
    } catch (e) {
      return { data: null, error: e as Error, headers: null }
    }
  }

  // Generic PUT request
  async function apiPut<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<T>(url, { method: 'PUT', body })
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

  const getDepots = (params?: Record<string, unknown>) =>
    apiGet<Array<{
      depotId: string
      description: string
      type: string
      depotRemoteUrl: string
      depotWebdavUrl: string
      repositoryRemoteUrl: string
      workbenchRemoteUrl: string
    }>>('/opsidata/depots', params)
  const getDepotIds = () => apiGet<string[]>('/opsidata/depot_ids')

  const getClients = (params?: Record<string, unknown>) =>
    apiGet<Array<{
      clientId: string
      description: string
      macAddress: string
      ipAddress: string
      lastSeen: string
      depotId: string
      notes: string
      uefi: boolean
    }>>('/opsidata/clients', params)
  const getClientIds = (depots: string[]) =>
    apiGet<string[]>(`/opsidata/depots/clients?selectedDepots=[${depots.join(',')}]`)
  const getClientConfig = (clientId: string) =>
    apiGet<Array<{ id: string; type: string; value: unknown }>>(`/opsidata/clients/${clientId}/config`)

  const getProducts = (params?: Record<string, unknown>) =>
    apiGet<Array<{
      productId: string
      name: string
      description: string
      version: string
      type: string
      productVersion: string
      packageVersion: string
    }>>('/opsidata/products', params)

  const getGroups = (params?: Record<string, unknown>) =>
    apiGet<Array<{
      groupId: string
      description: string
      notes: string
      parentGroupId: string | null
    }>>('/opsidata/groups', params)
  const getHostGroups = (params?: Record<string, unknown>) =>
    apiGet<{ groups: Record<string, unknown>; clientdirectory: Record<string, unknown> }>('/opsidata/hosts/groups', params)
  const getProductGroups = () =>
    apiGet<{ groups: Record<string, unknown> }>('/opsidata/products/groups')


  const getServerInfo = () => apiGet<{
    opsiVersion: string
    hostname: string
    pythonVersion: string
    uptime: number
    os: string
    computerName: string
    ip: string
  }>('/user/opsiserver')
  const getHealthcheck = () => apiGet<Array<{
    check_id: string
    check_name: string
    check_status: 'ok' | 'warning' | 'error'
    check_description: string
    message: string
    upgrade_issue: string | null
    partial_results: Array<{ message: string; check_status: string }>
  }>>('/opsidata/server/health')
  const getDiagnosticData = () => apiGet<Record<string, unknown>>('/opsidata/server/diagnostic')
  const getServerConfig = (params?: Record<string, unknown>) =>
    apiGet<Record<string, Array<{ configId: string; description: string; type: string; value: unknown; possibleValues: string; multiValue: boolean; editable: boolean }>>>('/opsidata/config/server', params)

  const getClientLogs = (clientId: string, logType: string, params?: Record<string, unknown>) =>
    apiGet<{ content: string; marker: number }>(`/opsidata/clients/${clientId}/logs/${logType}`, params)

  const getBlockedClients = () => apiGet<Record<string, string>>('/opsidata/blocked-clients')
  const unblockClient = (clientId: string) => apiPost<void>(`/opsidata/clients/${clientId}/unblock`)
  const unblockAllClients = () => apiPost<void>('/opsidata/clients/unblock')
  const getLockedProducts = () => apiGet<Record<string, string>>('/opsidata/locked-products')
  const unlockProduct = (productId: string) => apiPost<void>(`/opsidata/products/${productId}/unlock`)
  const unlockAllProducts = () => apiPost<void>('/opsidata/products/unlock')

  const getAppState = () => apiGet<{
    type: 'normal' | 'maintenance'
    address_exceptions: string[]
    retry_after: number
  }>('/app-state')
  const setAppState = (state: { type: string; address_exceptions?: string[]; retry_after?: number }) =>
    apiPost<{ type: string }>('/app-state', state)

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

  const getProductProperties = (productId: string, params?: { selectedClients?: string[]; selectedDepots?: string[] }) => {
    const queryParams: Record<string, unknown> = {}
    if (params?.selectedClients?.length) {
      queryParams.selectedClients = `[${params.selectedClients.join(',')}]`
    }
    if (params?.selectedDepots?.length) {
      queryParams.selectedDepots = `[${params.selectedDepots.join(',')}]`
    }
    return apiGet<{
      properties: Record<string, {
        productId: string
        propertyId: string
        type: 'UnicodeProductProperty' | 'BoolProductProperty'
        version: string
        description: string
        multiValue: boolean
        editable: boolean
        default: (string | boolean)[]
        possibleValues: Record<string, (string | boolean)[]>
        allValues: (string | boolean)[]
        depots: Record<string, (string | boolean)[]>
        clients: Record<string, (string | boolean)[]>
        defaultDetails?: Record<string, (string | boolean)[]>
        versionDetails?: Record<string, string>
        descriptionDetails?: Record<string, string>
        multiValueDetails?: Record<string, boolean>
        editableDetails?: Record<string, boolean>
        allClientValuesEqual: boolean
        anyDepotDifferentFromDefault: boolean
        anyClientDifferentFromDepot: boolean
      }>
      productVersions: Record<string, string | undefined>
      productDescription: string
      productDescriptionDetails: Record<string, string>
      productAdvice: string
      productAdviceDetails: Record<string, string>
    }>(`/opsidata/products/${productId}/properties`, queryParams)
  }

  const saveProductProperties = (productId: string, data: {
    clientIds?: string[]
    depotIds?: string[]
    properties: Record<string, string | boolean | string[]>
  }) => apiPost<{ status: number; data: Record<string, unknown> }>(`/opsidata/products/${productId}/properties`, data)

  const getProductDependencies = (productId: string, params?: { selectedClients?: string[] }) => {
    const queryParams: Record<string, unknown> = {}
    if (params?.selectedClients?.length) {
      queryParams.selectedClients = `[${params.selectedClients.join(',')}]`
    }
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
    }>(`/opsidata/products/${productId}/dependencies`, queryParams)
  }

  /** Get config parameters for a specific host (client or server) */
  const getHostConfigObjects = (hostId: string) =>
    apiGet<Record<string, Array<{
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
    }>>>(`/opsidata/config/objects/${hostId}`)

  /** Save host-specific config state overrides (CONFIG_STATE table) */
  const saveHostConfigState = (hostId: string, configs: Array<{ configId: string; value: unknown }>) =>
    apiPost<string>('/opsidata/config/values/objects', {
      objectIds: [hostId],
      configs: configs.map(c => ({ configId: c.configId, value: c.value })),
    })

  /** Save server-level config default values (CONFIG_VALUE table) */
  const saveServerConfigValues = (configs: Array<{ configId: string; value: unknown }>) =>
    apiPost<string>('/opsidata/config/values', configs)

  /** Get host attributes via /opsidata/hosts */
  const getHostAttributes = (hostId: string) =>
    apiGet<Array<Record<string, unknown>>>(`/opsidata/hosts?hosts=${hostId}`)

  /** Get server/depot attributes via /opsidata/servers */
  const getServerAttributes = (serverId: string) =>
    apiGet<Array<Record<string, unknown>>>(`/opsidata/servers?servers=[${serverId}]`)

  /** Get server-wide default config (same format as getHostConfigObjects but without objects) */
  const getServerDefaultConfig = (filterQuery?: string) =>
    apiGet<Record<string, Array<{
      configId: string
      description: string
      type: 'BoolConfig' | 'UnicodeConfig'
      defaultValues: unknown[]
      possibleValues: unknown[]
      multiValue: boolean
      editable: boolean
      objects: Record<string, unknown>
    }>>>('/opsidata/config', filterQuery ? { filterQuery } : undefined)

  /** Update client attributes via PUT /opsidata/clients/{id} */
  const updateClientAttributes = (clientId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/clients/${clientId}`, attrs)

  /** Update server attributes via PUT /opsidata/servers/{id} */
  const updateServerAttributes = (serverId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/servers/${serverId}`, attrs)

  /** Get depot/server list (alias for getDepots, for clarity in server contexts) */
  const getServers = (params?: Record<string, unknown>) => getDepots(params)

  // Client Actions API
  interface OpsiclientdRpcResult {
    [clientId: string]: {
      error?: string | null
      result?: string | null
    }
  }

  /** Execute opsiclientd RPC method on selected clients */
  const opsiclientdRpc = (clientIds: string[], method: string, params: unknown[] = []) =>
    apiPost<OpsiclientdRpcResult>('/command/opsiclientd_rpc', {
      client_ids: clientIds,
      method,
      params,
    })

  /** Trigger on_demand event on clients */
  const triggerOnDemand = (clientIds: string[]) =>
    opsiclientdRpc(clientIds, 'fireEvent', ['on_demand'])

  /** Send notification popup to clients */
  const sendNotification = (clientIds: string[], message: string) =>
    opsiclientdRpc(clientIds, 'showPopup', [message])

  /** Reboot clients */
  const rebootClients = (clientIds: string[]) =>
    opsiclientdRpc(clientIds, 'reboot', [''])

  /** Shutdown clients */
  const shutdownClients = (clientIds: string[]) =>
    opsiclientdRpc(clientIds, 'shutdown', [''])

  /** Deploy opsi client agent to clients */
  const deployClientAgent = (clientIds: string[], options: { username: string; password: string; type: string }) =>
    apiPost<OpsiclientdRpcResult>('/opsidata/clients/deploy', {
      clients: clientIds,
      ...options,
    })

  /** Delete a client */
  const deleteClient = (clientId: string) =>
    apiPost<void>(`/opsidata/clients/${clientId}/delete`, {})

  /** Check client reachability */
  const checkClientReachable = (clientIds: string[]) =>
    apiPost<Record<string, boolean>>('/opsidata/clients/reachable', { selectedClients: clientIds })

  /** Execute client action via general endpoint */
  const executeClientAction = (clientIds: string[], action: string, params?: Record<string, unknown>) =>
    apiPost<OpsiclientdRpcResult>('/opsidata/clients/action', { clientIds, action, ...params })

  return {
    apiGet,
    apiPost,
    apiPut,
    getConfigServer,
    checkAuth,
    callLogin,
    callLogout,
    getDepots,
    getDepotIds,
    getClients,
    getClientIds,
    getClientConfig,
    getProducts,
    getGroups,
    getHostGroups,
    getProductGroups,
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
    updateClientAttributes,
    updateServerAttributes,
    getServers,
    getServerDefaultConfig,
    // Client Actions
    opsiclientdRpc,
    triggerOnDemand,
    sendNotification,
    rebootClients,
    shutdownClients,
    deployClientAgent,
    deleteClient,
    checkClientReachable,
    executeClientAction,
  }
}
