/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

function headersToObject(
  headers: Headers | Record<string, string> | undefined
): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {}
    headers.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }
  return headers
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseUrl = String(config.public.NUXT_PUBLIC_API_BASE || '')
  const basePath = String(config.public.API_PATH || '')

  const $customFetch = $fetch.create({
    baseURL: baseUrl + basePath,
    onRequest({ options }) {
      options.headers = {
        ...headersToObject(options.headers),
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      } as any
    },
  })

  nuxtApp.provide('customFetch', $customFetch)
})
