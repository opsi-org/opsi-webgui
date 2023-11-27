import { useFetch } from "@vueuse/core"
import { useRuntimeConfig, type UseFetchOptions } from "nuxt/app"

const urlsWithoutAuthentication = [
  '/auth/logout',
  '/user/configuration'
]

const useAPI2 = async (
    method: string,
    url: string,
    body: any = undefined,
    opts: UseFetchOptions<any> = {},
    prePath: string | undefined = undefined
) => {
  const config = useRuntimeConfig()
  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = prePath ?? config.public.API_PATH
  // prePath could be '', e.g. for localhost:4447/filetransfer
  //    -> path = '/filetransfer'
  //       prepath = ''

  let headers: any = { ...opts?.headers, }

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
    // callheader.value = JSON.parse(res.json().data.value)
  }

  await useFetch(baseUrl + basePath + url, {
    baseURL: baseUrl,
    credentials: 'include',
    method,
    headers,
    body,
    ...opts
  } as any).then(onResponse,onResponseError)
          //  .catch((err:any) => console.log('intern error', err))

  return { data: callresponse, error: callerror, headers: callheaders }
}

const useApiGET = async (url: string, prePath: string|undefined = undefined, opts: UseFetchOptions<any> = {}) => useAPI2('GET', url, undefined, opts, prePath)
const useApiGETBody = async (url: string, body:any=undefined, prePath: string|undefined = undefined, opts: UseFetchOptions<any> = {}) => useAPI2('GET', url, body, opts, prePath)
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
