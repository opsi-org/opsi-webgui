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

  return {
    apiGet,
    apiPost,
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
  }
}
