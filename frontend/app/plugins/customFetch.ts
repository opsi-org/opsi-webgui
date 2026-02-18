/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const opsiSessionLifeTime = parseInt(config.public.OPSI_SESSION_LIFETIME || '3600', 10)
  const baseUrl = config.public.NUXT_PUBLIC_API_BASE
  const basePath = config.public.API_PATH

  const $customFetch = $fetch.create({
    baseURL: baseUrl + basePath,
    onRequest({ request, options }) {
      storeAuth().globalError = undefined
      if (!request.toString().includes('/user/opsiserver')) {
        options.credentials = process.env.NODE_ENV === 'production' ? 'same-origin' : 'include'
        options.headers.set('Cookie', document.cookie)
      }
      options.headers.set('Content-Type', options.headers.get('Content-Type') || 'application/json')
      options.headers.set(
        'Accept',
        options.headers.get('Accept') || 'application/json, text/plain, */*'
      )
      options.headers.set('X-opsi-session-lifetime', opsiSessionLifeTime.toString())
    },
    onRequestError(data) {
      if (
        !data.response &&
        data.error?.message === 'Failed to fetch' &&
        data.error?.name === 'TypeError'
      ) {
        useRouter().push('/login')
        storeAuth().isAuth = false
        storeAuth().globalError =
          'Network or certificate issue detected. Please check your network connection and browser security settings.'
      }
    },
    onResponse({ request, response }) {
      storeAuth().globalError = undefined
      const authMethods = response.headers.get('x-opsi-auth-methods')
      if (authMethods) storeAuth().authMethods = authMethods
      if (
        !request.toString().includes('/api/user/login') &&
        !request.toString().includes('/api/user/logout') &&
        !request.toString().includes('/api/user/opsiserver')
      ) {
        storeAuth().isAuth = true
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        storeAuth().isAuth = false
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    },
  })

  // Expose customFetch globally;
  nuxtApp.provide('customFetch', $customFetch)
})
