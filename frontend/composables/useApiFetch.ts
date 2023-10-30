import { useFetch } from "@vueuse/core"
import type { UseFetchOptions } from "nuxt/app"

const urlsWithoutAuthentication = [
  '/auth/logout',
  '/user/configuration'
]

export function useAPI<T> (url: string, opts: UseFetchOptions<T> = {}, prePath: string|undefined = undefined) {
  const config = useRuntimeConfig()
  const baseUrl = config.public.NUXT_PUBLIC_API_BASE
  const basePath = prePath ?? config.public.API_PATH
  // // prePath could be '', e.g. for localhost:4447/filetransfer
  // //    -> path = '/filetransfer'
  // //       prepath = ''

  let headers: any = { ...opts?.headers, }

  if (!urlsWithoutAuthentication.includes(url)) {
    const expiry = 3600 // TODO: get from store
    // const expiry = store.getters['auth/sessionExpiry']
    headers['X-opsi-session-lifetime'] = expiry
    // store.commit('auth/setSession', expiry)
  }

  return useFetch(baseUrl + basePath + url, {
      baseURL: baseUrl,
      headers,
      credentials: 'include', // omit // same-site
      ...opts
  } as any)
}
