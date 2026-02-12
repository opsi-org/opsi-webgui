export default defineNuxtPlugin((nuxtApp) => {
  const opsiSessionLifeTime = process.env.OPSI_SESSION_LIFETIME
    ? parseInt(process.env.OPSI_SESSION_LIFETIME)
    : 3600 // default to 3600 seconds (1 hour) if not set
  const config = useRuntimeConfig()

  const baseUrl: string = config.public.NUXT_PUBLIC_API_BASE
  const basePath: string = config.public.API_PATH

  const $customFetch = $fetch.create({
    baseURL: baseUrl + basePath,
    onRequest({ request, options }) {
      storeAuth().globalError = undefined
      // if url is not /user/opsiserver
      if (!request.toString().includes('/user/opsiserver')) {
        config.withCredentials = true
        options.credentials = process.env.NODE_ENV === 'production' ? 'same-origin' : 'include'
        options.headers.set('Cookie', document.cookie)
      }

      if (options.headers.get('Content-Type') === undefined) {
        options.headers.set('Content-Type', 'application/json')
      }
      if (options.headers.get('Accept') === undefined) {
        options.headers.set('Accept', 'application/json, text/plain, */*')
      }

      options.headers.set('X-opsi-session-lifetime', opsiSessionLifeTime.toString())
    },
    onRequestError(data) {
      if (
        data.response == undefined &&
        data.error?.message == 'Failed to fetch' &&
        data.error?.name == 'TypeError'
      ) {
        //ERR_CERT_AUTHORITY_INVALID or network error
        useRouter().push('/login')
        console.warn('Network or certificate error detected')
        storeAuth().isAuth = false
        try {
          const $t = (nuxtApp?.$i18n as { t: (key: string) => string }).t
          storeAuth().globalError = $t('error.networkOrCertificateIssue')
        } catch (e) {
          storeAuth().globalError =
            'Network or certificate issue detected. Please check your network connection and browser security settings.'
        }
      }
    },
    onResponse({ request, response }) {
      storeAuth().globalError = undefined
      const authMethods = response.headers.get('x-opsi-auth-methods')
      if (authMethods) {
        storeAuth().authMethods = authMethods
      }
      if (
        !request.toString().includes('/api/user/login') &&
        !request.toString().includes('/api/user/logout') &&
        !request.toString().includes('/api/user/opsiserver')
      ) {
        // reuqest after login
        storeAuth().isAuth = true
      }
    },
    async onResponseError({ response }) {
      console.warn('fetch ResponseError:', response)
      if (response.status === 401) {
        storeAuth().isAuth = false
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    },
  })

  // Expose to useNuxtApp().$customFetch
  return {
    provide: {
      customFetch: $customFetch,
    },
  }
})
