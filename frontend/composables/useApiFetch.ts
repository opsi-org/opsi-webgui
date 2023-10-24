// composables/useAPIFetch.ts

import { useFetch } from "@vueuse/core"

// import { useFetch } from "#app"

// type useFetchType = typeof useFetch

// // wrap useFetch with configuration needed to talk to our API
// export const useAPIFetch: useFetchType = (path, options = {}) => {
//   const config = useRuntimeConfig()

//   // modify options as needed
//   options.baseURL = config.public.baseUrl
//   return useFetch(path, options)
// }
// // /composables/useMyFetch.ts

// export const useApiFetch: typeof useFetch = (request, opts?) => {
//   const config = useRuntimeConfig()

//   return useFetch(request, { baseURL: config.public.baseURL, ...opts })
// }




// // eslint-disable-next-line no-console
// console.debug('axios request ', config.url)
// return config

// wrap useFetch with configuration needed to talk to our API
// export const useApiFetch: typeof useFetch  = (path, options:any = {}, prePath = '/addons/webgui/api') => {
export const useApiFetch  = (path, options:any = {}, prePath = undefined) => {
  const config = useRuntimeConfig()
  options.baseURL = config.public.NUXT_PUBLIC_API_BASE
  const p = config.public.API_PATH // '/addons/webgui/api
  const basePath = prePath !== undefined ? prePath : p
  // prePath could be '', e.g. for localhost:4447/filetransfer
  //    -> path = '/filetransfer'
  //       prepath = ''
  const fullPath = (options.baseURL + basePath + path) // remove duplicate '/'

  // modify options as needed
  if (path !== p + '/user/opsiserver') {
    options.withCredentials = true
  }
  // if (path !== p + '/api/auth/logout' || path !== p + '/api/user/configuration') {
  //   const expiry = store.getters['auth/sessionExpiry']
  //   $axios.setHeader('X-opsi-session-lifetime', expiry)
  //   store.commit('auth/setSession', expiry)
  // }
  return useFetch(fullPath, options)
}