/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * customFetch - Custom $fetch plugin with authentication headers and error handling.
 */
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useUserStore } from '~/stores/userStore'
import { headersToObject, mergeRequestHeaders, shouldSendSessionHeader } from '../utils/requestHeaders'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseUrl = String(config.public.NUXT_PUBLIC_API_BASE || '')
  const basePath = String(config.public.API_PATH || '')

  const $customFetch = $fetch.create({
    baseURL: baseUrl + basePath,
    credentials: 'include',
    onRequest({ request, options }) {
      const userStore = useUserStore()
      const url = typeof request === 'string' ? request : request.toString()

      const isFormData = options.body instanceof FormData
      const existingHeaders = headersToObject(options.headers)

      if (shouldSendSessionHeader(url)) {
        userStore.setSession()
      }

      options.headers = mergeRequestHeaders(existingHeaders, url, userStore.sessionExpiry, isFormData) as unknown as Headers
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        const userStore = useUserStore()
        if (userStore.username && !userStore.errorLoggedOutShown) {
          userStore.setErrorLoggedOutShown(true)
          userStore.logout()
          if (typeof window !== 'undefined') {
            window.location.href = '/addons/webgui/app/login'
          }
        }
      }
    },
  })

  nuxtApp.provide('customFetch', $customFetch)
})
