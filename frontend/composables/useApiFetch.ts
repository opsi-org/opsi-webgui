import { useFetch } from "@vueuse/core"
import { defu } from 'defu'
import type { UseFetchOptions } from "nuxt/app"

export function useAPI<T> (url: string, options: UseFetchOptions<T> = {}, prePath: string|undefined = undefined) {
  // const userAuth = useCookie('token')
  const config = useRuntimeConfig()
  const baseUrl = config.public.NUXT_PUBLIC_API_BASE
  // options.baseURL = config.public.NUXT_PUBLIC_API_BASE
  // const p = config.public.API_PATH // '/addons/webgui/api
  const basePath = prePath !== undefined ? prePath : config.public.API_PATH
  // // prePath could be '', e.g. for localhost:4447/filetransfer
  // //    -> path = '/filetransfer'
  // //       prepath = ''
  // const fullPath = (options.baseURL + basePath + url) // remove duplicate '/'

  const defaults: UseFetchOptions<T> = {
    baseURL: baseUrl, // + basePath + url,
    // // this overrides the default key generation, which includes a hash of
    // // url, method, headers, etc. - this should be used with care as the key
    // // is how Nuxt decides how responses should be deduplicated between
    // // client and server
    // key: url,

    // set user token if connected
    // headers: userAuth.value
    //   ? { Authorization: `Bearer ${userAuth.value}` }
    //   : {},
    // withCredentials: (url !== '/user/opsiserver'),

    onResponse (_ctx: any) {
      // _ctx.response._data = new myBusinessResponse(_ctx.response._data)
      console.log("onrespone")
    },

    onResponseError (_ctx: any) {
      console.log("onresponeerror")
      // throw new myBusinessError()
    }
  }

  // for nice deep defaults, please use unjs/defu
  const params: any = defu(options, defaults)

  return useFetch(baseUrl + basePath + url, params)
}

// // wrap useFetch with configuration needed to talk to our API
// export const useAPI2  = (path, options:any = {}, prePath = undefined) => {
//   const config = useRuntimeConfig()
//   options.baseURL = config.public.NUXT_PUBLIC_API_BASE
//   const p = config.public.API_PATH // '/addons/webgui/api
//   const basePath = prePath !== undefined ? prePath : p
//   // prePath could be '', e.g. for localhost:4447/filetransfer
//   //    -> path = '/filetransfer'
//   //       prepath = ''
//   const fullPath = (options.baseURL + basePath + path) // remove duplicate '/'

//   // modify options as needed
//   // if (path !== p + '/user/opsiserver') {
//   //   options.withCredentials = true
//   // }
//   // if (path !== p + '/api/auth/logout' || path !== p + '/api/user/configuration') {
//   //   const expiry = store.getters['auth/sessionExpiry']
//   //   $axios.setHeader('X-opsi-session-lifetime', expiry)
//   //   store.commit('auth/setSession', expiry)
//   // }
//   return useFetch(fullPath, {
//     ...options,
//     withCredentials: (path !== p + '/user/opsiserver'),
//     server: false
//   })
// }