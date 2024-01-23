import { useFetch } from "@vueuse/core"
import { useRuntimeConfig, type UseFetchOptions } from "nuxt/app"

const urlsWithoutAuthentication = [
  '/auth/logout',
  '/user/configuration'
]

const useAPI2 = async (
    method: string,
    url: string,
    body: FormData | Object | undefined = undefined,
    opts: UseFetchOptions<any> = {},
    prePath: string | undefined = undefined
) => {
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = prePath ?? config.public.API_PATH
  // prePath could be '', e.g. for localhost:4447/filetransfer
  //    -> path = '/filetransfer'
  //       prepath = ''

  let headers: any = {
    ...opts?.headers,
    // "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    // Accept: 'application/json'
    // Accept: 'application/json, text/plain, */*',

  }

  if (!urlsWithoutAuthentication.includes(url)) {
    const expiry = 3600 // TOD O: get from store
    // const expiry = store.getters['auth/sessionExpiry']
    headers['X-opsi-session-lifetime'] = expiry
    // store.commit('auth/setSession', expiry)
  }

  let callresponse = ref<any>(undefined);
  let callheaders: any = {};
  let callerror: any = null;


  const onResponseError = async (res: any) => {
    const _callerror = res.error.value
    const errordata = { response: { data: {
      class: 'Error',
      message: _callerror
      // details: ''
    }}}
    callerror = errordata
    console.log('onResponseError', errordata)
    if (res.statusCode.value === 401) {
      storeAuth().logout()
      storeAuth().clearSession()
      await useRouter().push({ path: '/login' })
    }
  }
  const onResponse = async (res: any) => {
    if (res.statusCode.value !== 200) {
      await onResponseError(res)
      return
    }
    callresponse.value = JSON.parse(res.json().data.value)
    // console.log("RESU", )
    callheaders = Object.fromEntries(res.json().response.value.headers)
    // callheader.value = JSON.parse(res.json().data.value)
  }

  let fullURL = baseUrl + basePath + url
  let fullBody = body
  if (method !== 'GET' && body != undefined && url !== '/auth/login') {
    if (headers['Content-Type'] === undefined)
      headers['Content-Type'] = 'application/json'
    if (headers['Accept'] === undefined)
      headers['Accept'] = 'application/json, text/plain, */*'

    fullBody = JSON.stringify(body)
  }
  if (method === 'GET' && body != undefined) {
    fullURL = _getURLwithParams(fullURL, body)
    fullBody = undefined
  }
  console.log(method, fullURL, fullBody)
  await useFetch(fullURL, {
    baseURL: baseUrl,
    credentials: 'include',
    method,
    headers,
    body: fullBody,
    ...opts
  } as any).then(onResponse,onResponseError)
          //  .catch((err:any) => console.log('intern error', err))

  return { data: callresponse, error: callerror, headers: callheaders }
}
const _getURLwithParams = (url: string, params: any) => {
  const _url = new URL(url);
  _url.search = new URLSearchParams(params).toString();
  console.log('GET URL WITH SEARCH PARAMS IS', _url)
  return _url.toString()
}

const useApiGET = async (url: string, prePath: string|undefined = undefined, opts: UseFetchOptions<any> = {}) => useAPI2('GET', url, undefined, opts, prePath)
const useApiGETBody = async (url: string, params:any=undefined, prePath: string|undefined = undefined, opts: UseFetchOptions<any> = {}) => useAPI2('GET', url, params, opts, prePath)
const useApiPOST = async (url: string, body:any=undefined, prePath: string|undefined = undefined, opts: UseFetchOptions<any> = {}) => useAPI2('POST', url, body, opts, prePath)
// const useApiPUT = async (url: string, body:any=undefined, opts: UseFetchOptions<any> = {}, prePath: string|undefined = undefined) => useAPI2('PUT', url, body, opts, prePath)
// const useApiDELETE = async (url: string, body:any=undefined, opts: UseFetchOptions<any> = {}, prePath: string|undefined = undefined) => useAPI2('DELETE', url, body, opts, prePath)

export { useApiGET, useApiGETBody, useApiPOST }


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
