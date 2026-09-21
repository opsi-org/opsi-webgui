/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useApiHelpers - API helper functions wrapping backend FastAPI endpoints.
 */
interface ApiResponse<T> {
  data: T | null
  error: Error | null
  total: number | null
}

interface ApiRequestOptions {
  signal?: AbortSignal
}

function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    const responseData = (error as Error & { data?: unknown }).data
    if (responseData && typeof responseData === 'object') {
      const detail = (responseData as Record<string, unknown>).detail
      if (typeof detail === 'string' && detail) return detail
      if (Array.isArray(detail)) return detail.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join('; ')
      const message = (responseData as Record<string, unknown>).message
      const details = (responseData as Record<string, unknown>).details
      if (typeof message === 'string' && message && typeof details === 'string' && details) return `${message}: ${details}`
      if (typeof message === 'string' && message) return message
      if (typeof details === 'string' && details) return details
    }
    return error.message
  }
  return String(error)
}

export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return ''
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)] as [string, string])
  const query = new URLSearchParams(entries).toString()
  return query ? `?${query}` : ''
}

export function useApiHelpers() {
  const { $customFetch } = useNuxtApp() as unknown as {
    $customFetch: typeof $fetch
  }

  // ---------------------------------------------------------------------------
  // Core HTTP helpers
  // ---------------------------------------------------------------------------

  async function apiGet<T>(url: string, params?: Record<string, unknown>, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await $customFetch.raw<T>(url + buildQueryString(params), options)
      const total = response.headers.get('X-Total-Count')
      return {
        data: response._data ?? null,
        error: null,
        total: total ? parseInt(total, 10) : null,
      }
    } catch (e) {
      return { data: null, error: new Error(getApiErrorMessage(e)), total: null }
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
      return { data: null, error: new Error(getApiErrorMessage(e)), total: null }
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
      return { data: null, error: new Error(getApiErrorMessage(e)), total: null }
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
      return { data: null, error: new Error(getApiErrorMessage(e)), total: null }
    }
  }

  async function apiGetBlob(url: string, params?: Record<string, unknown>): Promise<{ blob: Blob | null; error: Error | null }> {
    try {
      const blob = await $customFetch<Blob>(url + buildQueryString(params), { responseType: 'blob' })
      return { blob, error: null }
    } catch (e) {
      return { blob: null, error: new Error(getApiErrorMessage(e)) }
    }
  }

  // ---------------------------------------------------------------------------
  // Auth & User
  // ---------------------------------------------------------------------------

  const getConfigServer = () => apiGet<string>('/user/opsiserver')

  const callLogin = (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return apiPost<{ result: string }>('/auth/login', formData)
  }

  const callLogout = () => apiPost('/auth/logout')

  const getUserSettings = () => apiGet<{ username: string; expertmode: boolean; recentactivityexpiry: number }>('/user/getsettings')

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
  // Servers / Depots
  // ---------------------------------------------------------------------------

  const getServers = (params?: Record<string, unknown>, options?: ApiRequestOptions) =>
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
    >('/opsidata/depots', params, options)

  const getServerIds = () => apiGet<string[]>('/opsidata/depot_ids')

  const getDepotClientCounts = (selectedDepots?: string[]) =>
    apiGet<Array<{ depotId: string; clientCount: number }>>(
      '/opsidata/depots/client-counts',
      selectedDepots?.length ? { selectedDepots: `[${selectedDepots.join(',')}]` } : undefined,
    )

  const getDiagnosticData = () => apiGet<Record<string, unknown>>('/opsidata/server/diagnostic')

  const getServerAttributes = (serverId: string) => apiGet<Array<Record<string, unknown>>>(`/opsidata/servers?servers=[${serverId}]`)

  const updateServerAttributes = (serverId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/servers/${serverId}`, attrs)

  // ---------------------------------------------------------------------------
  // Clients
  // ---------------------------------------------------------------------------

  const getClients = (params?: Record<string, unknown>, options?: ApiRequestOptions) =>
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
        uefi_value?: boolean | null
        version_outdated?: number
        version_outdated_netboot?: number
        installationStatus_unknown?: number
        installationStatus_installed?: number
        actionRequest_set?: number
        actionResult_failed?: number
        actionResult_successful?: number
        selected?: boolean
        reachable?: boolean | null
      }>
    >('/opsidata/clients', params, options)

  const getClientIds = (servers: string[]) => apiGet<string[]>(`/opsidata/depots/clients?selectedDepots=[${servers.join(',')}]`)

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
    options: { configs?: boolean; products?: boolean; productProperties?: boolean },
  ) => apiPost<void>(`/opsidata/clients/${clientId}/clone`, { target, options })

  const updateClientAttributes = (clientId: string, attrs: Record<string, unknown>) =>
    apiPut<Record<string, unknown>>(`/opsidata/clients/${clientId}`, attrs)

  const getHostAttributes = (hostId: string) => apiGet<Array<Record<string, unknown>>>(`/opsidata/hosts?hosts=${hostId}`)

  const deployClientAgent = (agentData: { clients: string[]; username: string; password: string; type: 'windows' | 'linux' | 'mac' }) =>
    apiPost<void>('/opsidata/clients/deploy', agentData)

  const addClientToGroups = (clientId: string, groupIds: string[]) => apiPost<void>(`/opsidata/clients/${clientId}/groups`, groupIds)

  const removeClientFromGroups = (clientId: string, groupIds: string[]) => apiDelete(`/opsidata/clients/${clientId}/groups`, groupIds)

  const getClientLogs = (clientId: string, logType: string, params?: Record<string, unknown>) =>
    apiGet<{ content: string; marker: number }>('/opsidata/log', {
      selectedClient: clientId,
      selectedLogType: logType,
      ...params,
    })

  interface OpsiclientdRpcResult {
    [clientId: string]: { error?: string | null; result?: string | null }
  }

  const opsiclientdRpc = (clientIds: string[], method: string, params: unknown[] = []) =>
    apiPost<OpsiclientdRpcResult>('/command/opsiclientd_rpc', {
      client_ids: clientIds,
      method,
      params,
    })

  const triggerClientEvent = (clientIds: string[], eventName: string) => opsiclientdRpc(clientIds, 'fireEvent', [eventName])

  const triggerOnDemand = (clientIds: string[]) => triggerClientEvent(clientIds, 'on_demand')

  const triggerTimerEvent = (clientIds: string[]) => triggerClientEvent(clientIds, 'timer')

  const sendNotification = (clientIds: string[], message: string) => opsiclientdRpc(clientIds, 'showPopup', [message])

  const rebootClients = (clientIds: string[]) => opsiclientdRpc(clientIds, 'reboot', [])

  const shutdownClients = (clientIds: string[]) => opsiclientdRpc(clientIds, 'shutdown', [])

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  const getProducts = (params?: Record<string, unknown>, options?: ApiRequestOptions) =>
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
    >('/opsidata/products', params, options)

  const getServersProducts = (selectedServers: string[], productType?: string) => {
    const params: Record<string, unknown> = {
      selectedDepots: `[${selectedServers.join(',')}]`,
    }
    if (productType) params.productType = productType
    return apiGet<Array<{ productId: string; [k: string]: unknown }>>('/opsidata/depots/products', params)
  }

  const setClientProductActions = (data: {
    clientIds: string[]
    productIds: string[]
    actionRequest?: string
    installationStatus?: string
    actionResult?: string
  }) => apiPost<void>('/opsidata/clients/products', data)

  const getProductIcons = () => apiGet<{ result: Record<string, unknown> }>('/opsidata/producticons')

  const getInstallationStatuses = () => apiGet<string[]>('/opsidata/products/installation-status')

  const getActionResults = () => apiGet<string[]>('/opsidata/products/action-result')

  const processActionRequests = (clientIds: string[], productIds?: string[], visibility?: '' | 'visible' | 'hidden') =>
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

  const getProductProperties = (productId: string, params?: { selectedClients?: string[]; selectedServers?: string[] }) => {
    const qp: Record<string, unknown> = {}
    if (params?.selectedClients?.length) qp.selectedClients = `[${params.selectedClients.join(',')}]`
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
    },
  ) => apiPost<{ status: number; data: Record<string, unknown> }>(`/opsidata/products/${productId}/properties`, data)

  const getProductDependencies = (productId: string, params?: { selectedClients?: string[] }) => {
    const qp: Record<string, unknown> = {}
    if (params?.selectedClients?.length) qp.selectedClients = `[${params.selectedClients.join(',')}]`
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
  // Groups
  // ---------------------------------------------------------------------------

  const getHostGroups = (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/opsidata/hosts/groups', params)

  const getHostGroupsDynamic = (params: {
    parentGroup: string
    withClients?: boolean
    selectedDepots?: string
    selectedClients?: string
    recursiveMembers?: boolean
  }) => apiGet<{ groups: Record<string, unknown> }>('/opsidata/hosts/groups-dynamic', params as Record<string, unknown>)

  const getHostGroupMembersRecursive = (params: { parentGroup: string; selectedDepots?: string }) =>
    apiGet<{ groups: Record<string, unknown>; members?: string[] }>('/opsidata/hosts/groups-dynamic', {
      ...params,
      recursiveMembers: true,
      withClients: true,
    })

  const getProductGroups = (params?: Record<string, unknown>) =>
    apiGet<{ groups?: Record<string, unknown> }>('/opsidata/products/groups', params)

  const getProductGroupsDynamic = (params: { parentGroup: string; withProducts?: boolean; recursiveMembers?: boolean }) =>
    apiGet<{ groups: Record<string, unknown> }>('/opsidata/products/groups-dynamic', params as Record<string, unknown>)

  const getProductGroupMembersRecursive = (params: { parentGroup: string }) =>
    apiGet<{ groups: Record<string, unknown>; members?: string[] }>('/opsidata/products/groups-dynamic', {
      ...params,
      recursiveMembers: true,
      withProducts: true,
    })

  const getHostGroupIds = () => apiGet<string[]>('/opsidata/hosts/groups/id')

  const createHostGroup = (groupData: { groupId: string; parentGroupId?: string; description?: string; notes?: string }) =>
    apiPost('/opsidata/hosts/groups', groupData)

  const createProductGroup = (groupData: { groupId: string; parentGroupId?: string; description?: string; notes?: string }) =>
    apiPost('/opsidata/products/groups', groupData)

  const updateHostGroup = (groupId: string, updateData: { parent?: string; description?: string; note?: string }) =>
    apiPut(`/opsidata/hosts/groups/${groupId}`, updateData)

  const updateProductGroup = (groupId: string, updateData: { parent?: string; description?: string; note?: string }) =>
    apiPut(`/opsidata/products/groups/${groupId}`, updateData)

  const deleteHostGroup = (groupId: string) => apiDelete(`/opsidata/hosts/groups/${groupId}`)

  // TODO: Backend bug: product group deletion uses GET instead of DELETE
  const deleteProductGroup = (groupId: string) => apiDelete(`/opsidata/products/groups/${groupId}`)

  const addClientsToGroup = (groupId: string, clientIds: string[]) => apiPost(`/opsidata/hosts/groups/${groupId}/clients`, clientIds)

  const removeClientsFromGroup = (groupId: string) => apiDelete(`/opsidata/hosts/groups/${groupId}/clients`)

  const addProductsToGroup = (groupId: string, productIds: string[]) => apiPost(`/opsidata/products/groups/${groupId}/products`, productIds)

  const removeProductsFromGroup = (groupId: string) => apiDelete(`/opsidata/products/groups/${groupId}/products`)

  const removeProductFromGroup = (groupId: string, productId: string) => apiDelete(`/opsidata/products/groups/${groupId}/${productId}`)

  // ---------------------------------------------------------------------------
  // Config
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

  const saveHostConfigState = (hostId: string, configs: Array<{ configId: string; value: unknown }>) =>
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
  // Admin / Maintenance
  // ---------------------------------------------------------------------------

  const getBlockedClients = () => apiGet<string[] | Record<string, string>>('/opsidata/blocked-clients')

  const getClientOperatingSystems = () => apiGet<string[]>('/opsidata/clients/operating-systems')

  const unblockClient = (clientId: string) => apiPost<void>(`/opsidata/clients/${clientId}/unblock`)

  const unblockAllClients = () => apiPost<void>('/opsidata/clients/unblock')

  const getLockedProducts = () => apiGet<Record<string, unknown>>('/opsidata/locked-products')

  const unlockProduct = (productId: string) => apiPost<void>(`/opsidata/products/${productId}/unlock`)

  const unlockAllProducts = () => apiPost<void>('/opsidata/products/unlock')

  const getAppState = () => apiGet<{ type: 'normal' | 'maintenance'; address_exceptions: string[]; retry_after: number }>('/app-state')

  const setAppState = (state: { type: string; address_exceptions?: string[]; retry_after?: number }) =>
    apiPost<{ type: string }>('/app-state', state)

  // ---------------------------------------------------------------------------
  // Client inventory (hardware/software audit data, read-only)
  // ---------------------------------------------------------------------------

  const getClientInventorySummary = (clientId: string) =>
    apiGet<import('~/types').InventorySummary>(`/opsidata/clients/${clientId}/inventory/summary`)

  const getClientHardwareInventory = (
    clientId: string,
    params?: {
      hardwareClass?: string[]
      filterQuery?: string
      includeAbsent?: boolean
      sortBy?: string
      sortDesc?: boolean
      page?: number
      perPage?: number
    },
    options?: ApiRequestOptions,
  ) => apiGet<import('~/types').HardwareInventoryResponse>(`/opsidata/clients/${clientId}/inventory/hardware`, params, options)

  const getClientSoftwareInventory = (
    clientId: string,
    params?: {
      filterQuery?: string
      includeKbUpdates?: boolean
      includeAbsent?: boolean
      sortBy?: string
      sortDesc?: boolean
      page?: number
      perPage?: number
    },
    options?: ApiRequestOptions,
  ) => apiGet<import('~/types').SoftwareInventoryResponse>(`/opsidata/clients/${clientId}/inventory/software`, params, options)

  const exportHardwareInventoryCsv = (
    clientId: string,
    params?: { hardwareClass?: string[]; filterQuery?: string; includeAbsent?: boolean; sortBy?: string; sortDesc?: boolean },
  ) => apiGetBlob(`/opsidata/clients/${clientId}/inventory/hardware/csv`, params)

  const exportSoftwareInventoryCsv = (
    clientId: string,
    params?: { filterQuery?: string; includeKbUpdates?: boolean; includeAbsent?: boolean; sortBy?: string; sortDesc?: boolean },
  ) => apiGetBlob(`/opsidata/clients/${clientId}/inventory/software/csv`, params)

  const createBackup = (options: { config_files?: boolean; redis_data?: boolean; maintenance_mode?: boolean; password?: string }) =>
    apiPost<string>('/backup/create', options)

  const restoreBackup = (options: {
    file_id: string
    config_files?: boolean
    redis_data?: boolean
    server_id?: string
    password?: string
  }) => apiPost<void>('/backup/restore', options)

  return {
    // Core
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    apiGetBlob,

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
    getDepotClientCounts,
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
    deployClientAgent,
    addClientToGroups,
    removeClientFromGroups,
    getClientLogs,
    triggerClientEvent,
    triggerOnDemand,
    triggerTimerEvent,
    sendNotification,
    rebootClients,
    shutdownClients,
    getClientInventorySummary,
    getClientHardwareInventory,
    getClientSoftwareInventory,
    exportHardwareInventoryCsv,
    exportSoftwareInventoryCsv,

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
    getHostGroupsDynamic,
    getHostGroupMembersRecursive,
    getProductGroups,
    getProductGroupsDynamic,
    getProductGroupMembersRecursive,
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
    getClientOperatingSystems,
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
