/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
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

  // Server/Auth endpoints
  const getConfigServer = () => apiGet<string>('/user/opsiserver')
  const checkAuth = () => apiGet<{ authenticated: boolean; username: string }>('/auth/session')
  const callLogin = (username: string, password: string) =>
    apiPost<{ success: boolean }>('/auth/login', { username, password })
  const callLogout = () => apiPost('/auth/logout')

  // Depots/Servers endpoints
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

  // Clients endpoints
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

  // Products endpoints
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

  // Groups endpoints
  const getGroups = (params?: Record<string, unknown>) =>
    apiGet<Array<{
      groupId: string
      description: string
      notes: string
      parentGroupId: string | null
    }>>('/opsidata/groups', params)
  const getHostGroups = (params?: Record<string, unknown>) =>
    apiGet<{ data: Record<string, unknown>; total: number }>('/opsidata/hosts/groups', params)
  const getProductGroups = () =>
    apiGet<{ data: Record<string, unknown>; total: number }>('/opsidata/products/groups')

  // RPC call helper for direct backend RPC access
  async function callRpc<T>(method: string, params: unknown[] = []): Promise<ApiResponse<T>> {
    try {
      const data = await $customFetch<{ result: T; error?: { message: string } }>('/../../rpc', {
        method: 'POST',
        body: {
          jsonrpc: '2.0',
          method,
          params,
          id: 1
        }
      })
      if (data.error) {
        return { data: null, error: new Error(data.error.message), headers: null }
      }
      return { data: data.result, error: null, headers: null }
    } catch (e) {
      return { data: null, error: e as Error, headers: null }
    }
  }

  // Group RPC methods (fallback when REST endpoints fail)
  const getGroupsViaRpc = async (groupType: 'HostGroup' | 'ProductGroup') => {
    const groupsRes = await callRpc<Array<{
      id: string
      description: string
      notes: string
      parentGroupId: string | null
      type: string
    }>>('group_getObjects', [[], { type: groupType }])

    const membersRes = await callRpc<Array<{
      groupId: string
      objectId: string
      groupType: string
    }>>('objectToGroup_getObjects', [[], { groupType }])

    return { groups: groupsRes.data || [], members: membersRes.data || [] }
  }

  // Generic API call that can be used for any endpoint
  async function callApi<T>(endpoint: string, options?: FetchOptions): Promise<T | null> {
    try {
      const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
      return await $customFetch<T>(url, options)
    } catch (e) {
      console.error(`API call to ${endpoint} failed:`, e)
      return null
    }
  }

  // Admin endpoints
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

  // Logs endpoint
  const getClientLogs = (clientId: string, logType: string, params?: Record<string, unknown>) =>
    apiGet<{ content: string; marker: number }>(`/opsidata/clients/${clientId}/logs/${logType}`, params)

  // Admin: Blocked clients & Locked products
  const getBlockedClients = () => apiGet<Record<string, string>>('/opsidata/blocked-clients')
  const unblockClient = (clientId: string) => apiPost<void>(`/opsidata/clients/${clientId}/unblock`)
  const unblockAllClients = () => apiPost<void>('/opsidata/clients/unblock')
  const getLockedProducts = () => apiGet<Record<string, string>>('/opsidata/locked-products')
  const unlockProduct = (productId: string) => apiPost<void>(`/opsidata/products/${productId}/unlock`)
  const unlockAllProducts = () => apiPost<void>('/opsidata/products/unlock')

  // Admin: App state
  const getAppState = () => apiGet<{
    type: 'normal' | 'maintenance'
    address_exceptions: string[]
    retry_after: number
  }>('/app-state')
  const setAppState = (state: { type: string; address_exceptions?: string[]; retry_after?: number }) =>
    apiPost<{ type: string }>('/app-state', state)

  // Admin: Backup & Restore
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

  // Admin: Modules
  const getModulesContent = () => apiPost<{ result: string[] }>('/opsidata/modulesContent')

  // Admin: Disabled features
  const getDisabledFeatures = () => apiGet<string[]>('/opsidata/server/disabled-features')

  // Product Properties & Dependencies
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

  return {
    apiGet,
    apiPost,
    callApi,
    callRpc,
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
    getGroupsViaRpc,
    getServerInfo,
    getHealthcheck,
    getDiagnosticData,
    getServerConfig,
    getClientLogs,
    // Admin APIs
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
    // Product properties & dependencies
    getProductProperties,
    saveProductProperties,
    getProductDependencies,
  }
}
