import { useRuntimeConfig, type UseFetchOptions } from 'nuxt/app'
import type { IObjectString2Any } from '~/types/tgeneral'

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
  readonly headers: IObjectString2Any
  readonly status: number
}

function define_vars<T>(prePath: string | undefined) {
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = prePath ?? config.public.API_PATH

  const callresponse = ref<T | undefined>()
  const callerror = ref<terror | undefined>(undefined)
  const pendingState = ref<boolean>(true)
  return { baseUrl, basePath, callresponse, callerror, pendingState }
}
async function useAPI2<T>(
  method: tmethod,
  url: string,
  body: FormData | object | undefined = undefined,
  opts: UseFetchOptions<T> = {},
  prePath: string | undefined = undefined,
  synced: boolean = true, // possibility to wait for the fetch in component and have "pending" state available, otherwise pending is always false
): Promise<ApiResult<T>> {
  const { baseUrl, basePath, callresponse, callerror, pendingState } =
    define_vars<T>(prePath)
  let fullURL = baseUrl + basePath + url
  let callheaders: Headers | undefined = undefined
  let status: any = null
  let fullBody: any = body

  if (method === 'GET' && body != undefined) {
    fullURL = fullURL + '?' + _getBodyParams(body)
    fullBody = undefined
  }

  const fetch = $fetch<T>(fullURL, {
    onRequest({ options }: any) {
      // Set the request headers
      const headers: IObjectString2Any = { ...opts?.headers }
      if (!urlsWithoutAuthentication.includes(url)) {
        headers['X-opsi-session-lifetime'] = 3600 // TODO: get from store
      }
      if (method !== 'GET' && body != undefined && url !== '/auth/login') {
        if (headers['Content-Type'] === undefined)
          headers['Content-Type'] = 'application/json'
        if (headers['Accept'] === undefined)
          headers['Accept'] = 'application/json, text/plain, */*'

        fullBody = JSON.stringify(body)
      }
      if (method === 'GET' && body != undefined) {
        fullBody = undefined
      }

      options.credentials = 'include'
      options.method = method
      options.body = fullBody
      options.baseURL = baseUrl
      // options.query = query
      options.headers = headers
      // console.log('onRequest', request, options)
    },
    onRequestError({ error }: any) {
      // Handle the request errors
      // console.error('onRequestError', error)
      callerror.value = {
        response: { data: { class: '', message: String(error) } },
      }
    },
    onResponse({ response }) {
      // console.log('onResponse', response)
      // Process the response data
      callresponse.value = response._data || response.body || {}
      callheaders = response.headers
      status = response.status
      pendingState.value = false
    },
    // onResponseError(context) {
    onResponseError({ response }) {
      // Handle the response errors
      console.error('onResponseError response ', response)
      callerror.value = {
        response: {
          data: {
            class: response?._data?.class,
            message: response?._data?.message,
            // message: response?._data?.message,
            details: response?._data?.details,
          },
        },
      }
      pendingState.value = false
      status = response.status
      callheaders = response.headers
      // if status is 401
      logout_on_specific_error(response.status)
      console.error('onResponseError callerror', callerror.value)
    },
  })
  if (synced) {
    await fetch
  } else {
    pendingState.value = false
    if (callresponse.value === undefined) {
      callerror.value = {
        response: { data: { class: 'error', message: 'no response' } },
      }
    }
  }

  if (callheaders === undefined) {
    console.warn(
      'no headers in request response. url: ',
      fullURL,
      callheaders,
      status,
    )
  } else {
    callheaders = callheaders as Headers
    const headerusername = callheaders.get(opsiheaders.xopsiuserid)
    if (!headerusername) {
      console.warn('No username in headers. Clearing session')
      storeAuth().clearSession()
    } else {
      const username = headerusername.split('user:')[1]
      if (username) {
        storeAuth().setUser(username)
      } else {
        storeAuth().clearSession()
      }
    }
  }

  return {
    pending: pendingState,
    data: callresponse,
    error: callerror.value,
    headers: callheaders as IObjectString2Any,
    status,
  }
}
const logout_on_specific_error = (status: number) => {
  if (status === 401) {
    storeAuth().logout()
    navigateTo('/login')
  } else if (status === 403) {
    console.error('403 forbidden. You may want to reload the page')
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
) {
  return useAPI2<ResultDataType>('GET', url, undefined, opts, prePath, synced)
}

async function useApiGETBody<ResultDataType>(
  url: string,
  params: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
) {
  return useAPI2<ResultDataType>('GET', url, params, opts, prePath, synced)
}
async function useApiPOST<ResultDataType>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
) {
  return useAPI2<ResultDataType>('POST', url, body, opts, prePath, synced)
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
) {
  return useAPI2<ResultDataType>('DELETE', url, body, opts, prePath, synced)
}

async function useApiPUT<ResultDataType>(
  url: string,
  body: any = undefined,
  prePath: string | undefined = undefined,
  opts: UseFetchOptions<any> = {},
  synced: boolean = true,
) {
  return useAPI2<ResultDataType>('PUT', url, body, opts, prePath, synced)
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
}

// export function useAPI<T> (url: string, opts: UseFetchOptions<T> = {}, prePath: string|undefined = undefined) {
//   const config = useRuntimeConfig()
//   const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE as string
//   const basePath: string = prePath ?? config.public.API_PATH as string
//   // // prePath could be '', e.g. for localhost:4447/filetransfer
//   // //    -> path = '/filetransfer'
//   // //       prepath = ''

//   let headers: any = { ...opts?.headers, }

//   if (!urlsWithoutAuthentication.includes(url)) {
//     const expiry = 3600 // TODO: get from store
//     // const expiry = store.getters['auth/sessionExpiry']
//     headers['X-opsi-session-lifetime'] = expiry
//     // store.commit('auth/setSession', expiry)
//   }

//   return useFetch(baseUrl + basePath + url, {
//       baseURL: baseUrl,
//       headers,
//       credentials: 'include', // omit // same-site
//       ...opts
//   } as any)
// }
