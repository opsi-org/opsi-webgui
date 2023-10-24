import { useFetch } from "@vueuse/core"

// wrap useFetch with configuration needed to talk to our API
export const $fetch  = (path, options:any = {}, prePath = undefined) => {
  const config = useRuntimeConfig()
  options.baseURL = config.public.NUXT_PUBLIC_API_BASE
  const p = config.public.API_PATH // '/addons/webgui/api
  const basePath = prePath !== undefined ? prePath : p
  // prePath could be '', e.g. for localhost:4447/filetransfer
  //    -> path = '/filetransfer'
  //       prepath = ''
  const fullPath = (options.baseURL + basePath + path) // remove duplicate '/'

  console.log('HELLO')

  // modify options as needed
  // if (path !== p + '/user/opsiserver') {
  //   options.withCredentials = true
  // }
  // if (path !== p + '/api/auth/logout' || path !== p + '/api/user/configuration') {
  //   const expiry = store.getters['auth/sessionExpiry']
  //   $axios.setHeader('X-opsi-session-lifetime', expiry)
  //   store.commit('auth/setSession', expiry)
  // }
  return useFetch(fullPath, {
    ...options,
    withCredentials: (path !== p + '/user/opsiserver'),
    server: false,
    // transform (data) {
    //   console.log('Transform', typeof data, data)
    //   return JSON.parse(data as unknown as string)
    // }
  })
}