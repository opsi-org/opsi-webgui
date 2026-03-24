/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Auth plugin - handles route guarding based on authentication state.
*/
import { defineNuxtPlugin, useRuntimeConfig, navigateTo } from '#app'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin({
  name: 'auth',
  order: 1,
  setup() {
    const router = useRouter()

    router.beforeEach((to) => {
      if (
        typeof window !== 'undefined' &&
        (window.location.port === '6006' || window.location.port === '3000')
      ) {
      }

      const userStore = useUserStore()

      if (userStore.isAuthenticated && to.name === 'login') {
        return navigateTo(getDefaultPage())
      }

      if (!userStore.isAuthenticated && to.name !== 'login') {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }

      // Check feature flags for restricted pages
      if (userStore.isAuthenticated) {
        const { isPageAccessible } = useFeatureFlags()
        if (!isPageAccessible(to.path)) {
          return navigateTo('/clients')
        }
      }
    })

    function getDefaultPage(): string {
      if (typeof document === 'undefined') return '/clients'
      const match = document.cookie.match(/(?:^|; )opsi-webgui-default-page=([^;]*)/)
      const stored = match?.[1] ? decodeURIComponent(match[1]) : null
      const validPages = [
        '/dashboard',
        '/clients',
        '/products',
        '/servers',
        '/admin/terminal',
        '/admin/maintenance',
        '/admin/diagnostics',
      ]
      if (stored && validPages.includes(stored)) return stored
      return '/clients'
    }
  },
})
