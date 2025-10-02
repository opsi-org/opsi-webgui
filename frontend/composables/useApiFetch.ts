/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { useRuntimeConfig, type UseFetchOptions } from 'nuxt/app'
import type { IObjectString2Any } from '~/types/tgeneral'
import { useNotification } from './mixins/useComponent'
import { _getI18nInComposable } from './mixins/helper-i18n'

const urlsWithoutAuthentication = ['/auth/logout', '/user/configuration']
type tmethod =
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'get'
  | 'head'
  | 'patch'
  | 'post'
  | 'put'
  | 'delete'
  | 'connect'
  | 'options'
  | 'trace'
interface terror {
  response: {
    data: {
      class: string
      message: string
      details?: string
    }
  }
}

interface ApiResult<T> {
  readonly pending: Ref<boolean>
  readonly data: Ref<T | undefined>
  readonly error: terror | undefined
  readonly headers: Headers
  readonly status: number
}

function define_vars<T>(prePath: string | undefined) {
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = prePath ?? config.public.API_PATH

  const responseData = ref<T | undefined>()
  const responseError = ref<terror | undefined>(undefined)
  const responseHeaders = ref<Headers | undefined>(undefined)
  const pendingState = ref<boolean>(true)
  return { baseUrl, basePath, responseData, responseError, pendingState, responseHeaders }
}
async function useAPI2<T>(
  method: tmethod,
  url: string,
  body: FormData | object | undefined = undefined,
  opts: UseFetchOptions<T> = {},
  prePath: string | undefined = undefined,
  synced: boolean = true, // possibility to wait for the fetch in component and have "pending" state available, otherwise pending is always false
  showError: boolean = true
): Promise<ApiResult<T>> {
  const { baseUrl, basePath, responseData, responseError, pendingState, responseHeaders } =
    define_vars<T>(prePath)
  let fullURL = baseUrl + basePath + url
  let status: any = null
  let fullBody: any = body

  if (method === 'GET' && body != undefined) {
    fullURL = fullURL + '?' + _getBodyParams(body)
    fullBody = undefined
  }

  // const fetch = $fetch<T>(fullURL, {  // does not work (now) if session expired
  //const fetch = useFetch<T>(fullURL, {
  const useFetchInterceptors = {
    onRequest({ options }: any) {
      console.log('fetching  onrequest', 'synced', synced, method, fullURL)
      // Set the request headers
      const headers: IObjectString2Any = { ...opts?.headers }

      if (!urlsWithoutAuthentication.includes(url)) {
        // const authStore = storeAuth()
        headers['X-opsi-session-lifetime'] = storeAuth().sessionExpiry
        storeAuth().setSession()
      }
      if (method !== 'GET' && body != undefined && url !== '/auth/login') {
        if (headers['Content-Type'] === undefined) headers['Content-Type'] = 'application/json'
        if (headers['Accept'] === undefined) headers['Accept'] = 'application/json, text/plain, */*'

        fullBody = JSON.stringify(body)
      }
      if (method === 'GET' && body != undefined) {
        fullBody = undefined
      }

      options.credentials = 'include'
      options.method = method
      options.body = fullBody
      options.baseURL = baseUrl
      options.headers = headers
      options.key = Date.now()
    },
    onRequestError({ response, error }: any) {
      // Handle the request errors
      responseError.value = {
        response: { data: { class: '', message: String(error) } },
      }
      if (showError) {
        const { notifyError } = useNotification()
        const { class: _, ...rest } = responseError.value.response.data
        rest.message = rest.message + ` (${basePath + url})`
        notifyError({
          title: responseError.value?.response?.data?.class,
          message: rest,
        })
      }

      responseHeaders.value = _checkUsername(response.headers, fullURL, response.status)
    },
    onResponse({ response, options }: any) {
      // Process the response data
      responseData.value = (response._data as T) || (response.body as T) || ({} as T)
      status = response.status
      responseHeaders.value = _checkUsername(response.headers, fullURL, status)
      pendingState.value = false
    },
    onResponseError({ response }: any) {
      // Handle the response errors
      console.error('fetching  onResponseError', method, fullURL, response)
      const res: any = response?._data as any
      responseError.value = {
        response: {
          data: {
            class: res?.class,
            message: res?.message,
            // message: response?._data?.message,
          },
        },
      }
      if (res?.details) {
        responseError.value.response.data.details = res.details
      }
      pendingState.value = false
      status = response.status
      responseHeaders.value = response.headers
      const { class: _, ...rest } = responseError.value.response.data
      rest.message = rest.message + ` (${basePath + url})`

      if (showError) {
        const { notifyError } = useNotification()
        notifyError({
          title: responseError.value.response?.data?.class,
          message: rest,
        })
      }
      // if status is 401
      _logout_on_specific_error(fullURL, status)
      console.error('onResponseError responseError', responseError.value)
    },
  }
  const result = {
    pending: pendingState,
    data: responseData,
    error: responseError.value,
    headers: responseHeaders.value !== undefined ? responseHeaders.value : new Headers(),
    status,
  }
  if (synced) {
    const { data, error, status } = await useFetch<T>(fullURL, useFetchInterceptors)
    result.data.value = data.value as T | undefined
    result.error = responseError.value as terror | undefined
    result.pending.value = pendingState.value
    result.status = status
    result.headers = responseHeaders.value !== undefined ? responseHeaders.value : new Headers()
  } else {
    useFetch<T>(fullURL, useFetchInterceptors)
    pendingState.value = false
    if (responseData.value === undefined) {
      responseError.value = {
        response: { data: { class: 'error', message: 'EMPTY. no response' } },
      }
    }
  }

  return result
}

function _checkUsername(headers: Headers | undefined, fullURL: string, status: number) {
  // check username in headers
  const headerusername = headers?.get(opsiheaders.xopsiuserid)
  if (!headerusername) {
    console.warn('No username in headers. Clearing session')
    storeAuth().clearSession()
    return headers
  }

  const username = headerusername.split('user:')[1]
  if (username) {
    storeAuth().setUser(username)
  } else {
    storeAuth().clearSession()
  }
  return headers
}
const _logout_on_specific_error = (url: string, status: number) => {
  const authStore = storeAuth()
  useNotification().closeAll()
  if (status === 401) {
    console.error(`401 unauthorized. url ${url}`)
    // 401 unauthorized
    let loginQuery = ''
    if (!url.includes('/auth/login')) {
      loginQuery = '?expired=true'
      authStore.setErrorLoggedOutShown(true)
    }
    authStore.logout()
    navigateTo('/login' + loginQuery)
  } else if (status === 403) {
    // 403 forbidden
    let loginQuery = ''
    console.error(`403 forbidden. url ${url}`)
    if (!url.includes('/auth/login')) {
      loginQuery = '?expired=true'
      authStore.setErrorLoggedOutShown(true)
    }
    authStore.setUser('')
    navigateTo('/login' + loginQuery)
  } else {
    authStore.setErrorLoggedOutShown(false)
  }
}
const _getBodyParams = (params: any) => {
  return new URLSearchParams(params).toString()
}

async function useApiGET<ResultDataType>(
  url: string,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
  showError: boolean = true
) {
  return useAPI2<ResultDataType>('GET', url, undefined, opts, prePath, synced, showError)
}

interface T_KWARGS {
  prePath?: string
  params?: any
  opts?: UseFetchOptions<any>
  synced?: boolean
  showError?: boolean
  body?: any // for POST, PUT, DELETE
}
const KWARGS = {
  prePath: undefined as string | undefined,
  params: undefined as any,
  body: undefined as any,
  opts: {} as UseFetchOptions<any>,
  synced: true as boolean,
  showError: false as boolean,
}
function valueOrDefault(value: any, defaultValue: any): T_KWARGS {
  const result: T_KWARGS = { ...defaultValue }
  if (value.prePath !== undefined) {
    result.prePath = value.prePath
  }
  if (value.params !== undefined) {
    result.params = value.params
  }
  if (value.body !== undefined) {
    result.body = value.body
  }
  if (value.opts !== undefined) {
    result.opts = value.opts
  }
  if (value.synced !== undefined) {
    result.synced = value.synced
  }
  if (value.showError !== undefined) {
    result.showError = value.showError
  }
  return result
}
async function useApiGETkwargs<ResultDataType>(url: string, options: T_KWARGS = KWARGS) {
  const kwargs = valueOrDefault(options, KWARGS)
  return useAPI2<ResultDataType>(
    'GET',
    url,
    undefined,
    kwargs.opts,
    kwargs.prePath,
    kwargs.synced,
    kwargs.showError
  )
}

async function useApiGETBody<ResultDataType>(
  url: string,
  params: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
  showError: boolean = true
) {
  return useAPI2<ResultDataType>('GET', url, params, opts, prePath, synced, showError)
}

async function useApiGETBodykwargs<ResultDataType>(url: string, options: T_KWARGS = KWARGS) {
  const kwargs = valueOrDefault(options, KWARGS)
  return useAPI2<ResultDataType>(
    'GET',
    url,
    kwargs.params,
    kwargs.opts,
    kwargs.prePath,
    kwargs.synced,
    kwargs.showError
  )
}
async function useApiPOST<ResultDataType>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
  showError: boolean = true
) {
  return useAPI2<ResultDataType>('POST', url, body, opts, prePath, synced, showError)
}

async function useApiPOSTkwargs<ResultDataType>(url: string, options: T_KWARGS = KWARGS) {
  const kwargs = valueOrDefault(options, KWARGS)
  return useAPI2<ResultDataType>(
    'POST',
    url,
    kwargs.body,
    kwargs.opts,
    kwargs.prePath,
    kwargs.synced,
    kwargs.showError
  )
}

// For following need to add types: (like useApiGET)
// const useApiPUT = async (url: string, body:any=undefined, opts: UseFetchOptions<any> = {}, prePath: string|undefined = undefined) => useAPI2('PUT', url, body, opts, prePath)
// const useApiDELETE = async (url: string, body:any=undefined, opts: UseFetchOptions<any> = {}, prePath: string|undefined = undefined) => useAPI2('DELETE', url, body, opts, prePath)

async function useApiDELETE<ResultDataType>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
  showError: boolean = true
) {
  return useAPI2<ResultDataType>('DELETE', url, body, opts, prePath, synced, showError)
}

async function useApiDELETEkwargs<ResultDataType>(url: string, options: T_KWARGS = KWARGS) {
  const kwargs = valueOrDefault(options, KWARGS)
  return useAPI2<ResultDataType>(
    'DELETE',
    url,
    kwargs.body,
    kwargs.opts,
    kwargs.prePath,
    kwargs.synced,
    kwargs.showError
  )
}

async function useApiPUT<ResultDataType>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
  showError: boolean = true
) {
  return useAPI2<ResultDataType>('PUT', url, body, opts, prePath, synced, showError)
}

async function useApiPUTkwargs<ResultDataType>(url: string, options: T_KWARGS = KWARGS) {
  const kwargs = valueOrDefault(options, KWARGS)
  return useAPI2<ResultDataType>(
    'PUT',
    url,
    kwargs.body,
    kwargs.opts,
    kwargs.prePath,
    kwargs.synced,
    kwargs.showError
  )
}

function useFullUrlPath(path: string, prepath: string | undefined) {
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = prepath ?? config.public.API_PATH
  return baseUrl + basePath + path
}

export {
  useApiGET,
  useApiGETBody,
  useApiPOST,
  useApiDELETE,
  useApiPUT,
  useFullUrlPath,
  useApiGETkwargs,
  useApiGETBodykwargs,
  useApiPOSTkwargs,
  useApiDELETEkwargs,
  useApiPUTkwargs,
}
