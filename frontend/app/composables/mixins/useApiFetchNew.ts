/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/*import { _getI18nInComposable } from './mixins/helper-i18n'
import { useNotification } from '~/composables/mixins/useComponent'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
type TMethod =
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

type UseFetchOptionsWithHeaders<TT, RR> = UseFetchOptions<TT, RR> & {
  responseHeaders?: Ref<Headers> | undefined
}
type UseFetchWithHeaders<TT, RR> = UseFetchOptions<TT, RR> & {
  headers: Ref<Headers>
}

type ReturnTypeUseFetch<TT> = ReturnType<typeof useFetch<TT, TError>>
interface TError {
  response: {
    data: {
      class: string
      message: string
      details?: string
    }
  }
}
type AsyncDataWithHeader<T, R> = AsyncData<T, R> & { headers: Ref<Headers> }
type ReturnTypeUseFetchWithHeader<T, R> = ReturnType<typeof useFetch<T, R>> & {
  headers: Ref<Headers>
}

async function useApi<T>(
  method: TMethod,
  url: string,
  body: any = undefined,
  options: UseFetchOptionsWithHeaders<T, TError> = {},
  prePath: string | undefined = undefined,
  showError: boolean = true
): Promise<AsyncDataWithHeader<T, TError>> {
  //): Promise<ReturnTypeUseFetchWithHeader<T, TError>> {
  // url
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = prePath ?? config.public.API_PATH
  let fullURL = baseUrl + basePath + url
  let fullBody: any = body

  if (method === 'GET' && body != undefined) {
    fullURL = fullURL + '?' + _getBodyParams(body)
    fullBody = undefined
  }

  const responseHeaders = ref(new Headers())
  const { onResponse, ...restOptions } = options
  //options.showError = showError
  options.body = fullBody
  options.headers = options.headers || {}

  const params: UseFetchOptions<T, TError> = {
    method,
    //immediate: false
    ...restOptions,
    $fetch: useNuxtApp().$customFetch,
    //responseHeaders: ref(new Headers()),
    onResponse(ctx: any) {
      _checkUsername(ctx.response.headers)
      const res = ref<any>()
      if (onResponse !== undefined && typeof onResponse === 'function') {
        res.value = onResponse(ctx)
      } else {
        res.value = ctx.response
      }

      responseHeaders.value = ctx.response.headers
      console.log('Response headers in useApi: ', responseHeaders.value)
      console.log(
        'Response header authmethods: ',
        responseHeaders.value.get(opsiheaders.xopsiauthmethods)
      )

      res.value.headers = responseHeaders.value
      return res
    },
  }

  // also return headers
  const result = (await useFetch<T, TError>(fullURL, params)) as AsyncDataWithHeader<T, TError>
  console.log('Result in useApi: ', result)
  console.log(
    'Result in useApi authmethod: ',
    result.headers?.get(opsiheaders.xopsiauthmethods),
    result.headers?.value?.get(opsiheaders.xopsiauthmethods),
    responseHeaders.value.get(opsiheaders.xopsiauthmethods)
  )

  result.headers = ref(responseHeaders.value)
  //return { ...result, headers: responseHeaders }
  return result
}

const _getBodyParams = (params: any) => {
  return new URLSearchParams(params).toString()
}

function useApiGET<T>(
  url: string,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
  showError: boolean = true
) {
  const options: UseFetchOptions<any> = { ...opts }
  //if (synced) options.initialCache = false
  return useApi<T>('GET', url, undefined, options, prePath, showError)
}
function useApiGETBody<T>(
  url: string,
  params: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
  showError: boolean = true
) {
  const options: UseFetchOptions<any> = { ...opts }
  //if (synced) options.initialCache = false
  return useApi<T>('GET', url, params, options, prePath, showError)
}

function useApiPOST<T>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  showError: boolean = true
) {
  const options: UseFetchOptions<any> = { ...opts }
  return useApi<T>('POST', url, body, options, prePath, showError)
}
function useApiDELETE<T>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  showError: boolean = true
) {
  const options: UseFetchOptions<any> = { ...opts }
  return useApi<T>('DELETE', url, body, options, prePath, showError)
}
function useApiPUT<T>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  showError: boolean = true
) {
  const options: UseFetchOptions<any> = { ...opts }
  return useApi<T>('PUT', url, body, options, prePath, showError)
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

function useApiGETkwargs<T>(url: string, kwargs: T_KWARGS = KWARGS) {
  const args = valueOrDefault(kwargs, KWARGS)
  return useApiGET<T>(url, args.prePath, args.opts, args.synced, args.showError)
}
function useApiGETBodykwargs<T>(url: string, kwargs: T_KWARGS = KWARGS) {
  const args = valueOrDefault(kwargs, KWARGS)
  return useApiGETBody<T>(url, args.params, args.prePath, args.opts, args.synced, args.showError)
}
function useApiPOSTkwargs<T>(url: string, kwargs: T_KWARGS = KWARGS) {
  const args = valueOrDefault(kwargs, KWARGS)
  return useApiPOST<T>(url, args.body, args.prePath, args.opts, args.showError)
}
function useApiDELETEkwargs<T>(url: string, kwargs: T_KWARGS = KWARGS) {
  const args = valueOrDefault(kwargs, KWARGS)
  return useApiDELETE<T>(url, args.body, args.prePath, args.opts, args.showError)
}
function useApiPUTkwargs<T>(url: string, kwargs: T_KWARGS = KWARGS) {
  const args = valueOrDefault(kwargs, KWARGS)
  return useApiPUT<T>(url, args.body, args.prePath, args.opts, args.showError)
}

function useFullUrlPath(path: string, prepath: string | undefined) {
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = prepath ?? config.public.API_PATH
  return baseUrl + basePath + path
}

const _checkUsername = (headers: Headers) => {
  if (!headers) return headers
  // get username from headers
  // X-opsi-userid: user:username
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
*/
