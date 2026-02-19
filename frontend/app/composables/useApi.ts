/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { useRuntimeConfig, useFetch, type UseFetchOptions } from 'nuxt/app'
import { ref } from 'vue'
import { useNotification } from './useComponent'
import { _getI18nInComposable } from './helper-i18n'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ApiResult<T> = {
  pending: boolean
  data: T | undefined
  error: any
  status: number
  headers: Headers
}

function getBaseUrl(prePath?: string) {
  const config = useRuntimeConfig()
  return config.public.NUXT_PUBLIC_API_BASE + (prePath ?? config.public.API_PATH)
}

async function apiRequest<T>(
  method: HTTPMethod,
  url: string,
  body?: any,
  opts: UseFetchOptions<T> = {},
  prePath?: string,
  showError = true
): Promise<ApiResult<T>> {
  const fullURL = getBaseUrl(prePath) + url
  const { notifyError } = useNotification()
  let responseData: T | undefined
  let responseError: any
  let status = 0
  let headers = new Headers()
  let pending = true

  try {
    const {
      data,
      error,
      status: fetchStatus,
      headers: fetchHeaders,
    } = await useFetch<T>(fullURL, {
      method,
      body: method !== 'GET' ? body : undefined,
      ...opts,
    })
    responseData = data.value
    responseError = error.value
    status = fetchStatus.value ?? 0
    headers = fetchHeaders.value ?? new Headers()
    pending = false
    if (error.value && showError) {
      notifyError({ title: 'API Error', message: error.value })
    }
  } catch (e) {
    responseError = e
    pending = false
    if (showError) notifyError({ title: 'API Exception', message: String(e) })
  }

  return { pending, data: responseData, error: responseError, status, headers }
}

// Domain-specific helpers
export function useApi() {
  // Generic
  async function get<T>(url: string, opts?: UseFetchOptions<T>, prePath?: string) {
    return apiRequest<T>('GET', url, undefined, opts, prePath)
  }
  async function post<T>(url: string, body?: any, opts?: UseFetchOptions<T>, prePath?: string) {
    return apiRequest<T>('POST', url, body, opts, prePath)
  }
  async function put<T>(url: string, body?: any, opts?: UseFetchOptions<T>, prePath?: string) {
    return apiRequest<T>('PUT', url, body, opts, prePath)
  }
  async function del<T>(url: string, body?: any, opts?: UseFetchOptions<T>, prePath?: string) {
    return apiRequest<T>('DELETE', url, body, opts, prePath)
  }

  // Configserver
  async function getConfigServer() {
    return get('/user/opsiserver')
  }

  // Depot
  async function getDepotIds() {
    return get('/opsidata/depot_ids')
  }

  // Client
  async function getClientIds(selectedDepots: string[]) {
    return get(`/opsidata/depots/clients?selectedDepots=[${selectedDepots}]`)
  }
  async function getClientToDepot(selectedClients: string[]) {
    return get(`/opsidata/clientsdepots?selectedClients=[${selectedClients}]`)
  }

  // Logout
  async function callLogout() {
    return post('/auth/logout')
  }

  // Group
  async function addClientToGroups(client: string, groupsList: string[]) {
    return post(`/opsidata/clients/${client}/groups`, groupsList)
  }

  // UEFI
  async function setUEFI(clientId: string, uefi: string) {
    return post(`/api/opsidata/clients/${clientId}/uefi`, uefi)
  }

  // Save helpers
  async function saveParameters(url: string, request: any) {
    return post(url, request)
  }
  async function saveProductAction(change: object) {
    return post('/opsidata/clients/products', change)
  }
  async function saveProductProperties(id: string, change: any) {
    return post(`/opsidata/products/${id}/properties`, change)
  }

  return {
    get,
    post,
    put,
    del,
    getConfigServer,
    getDepotIds,
    getClientIds,
    getClientToDepot,
    callLogout,
    addClientToGroups,
    setUEFI,
    saveParameters,
    saveProductAction,
    saveProductProperties,
  }
}
