/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Auth plugin - handles route guarding based on authentication state.
Named 01.auth.ts to ensure it loads early in the plugin lifecycle.
*/
import { defineNuxtPlugin, useRuntimeConfig, navigateTo }  from '#app'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const config = useRuntimeConfig()

  router.beforeEach((to) => {
    // Skip auth check for storybook or specific dev ports
    if (typeof window !== 'undefined' &&
        (window.location.port === '6006' || window.location.port === '3000')) {
      // Allow access from storybook or dev server without cookie check
      // Note: In dev with HTTPS (port 3000), cookies work; this is a fallback
    }

    const userStore = useUserStore()
    const basePage = config.public.BASE_PAGE || '/clients'

    // If authenticated and trying to access login page, redirect to base page
    if (userStore.isAuthenticated && to.name === 'login') {
      return navigateTo(basePage)
    }

    // If not authenticated and trying to access protected page, redirect to login
    if (!userStore.isAuthenticated && to.name !== 'login') {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  })
})
