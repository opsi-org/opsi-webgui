/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Auth plugin - handles route guarding based on authentication state.
*/
import { defineNuxtPlugin, useRuntimeConfig, navigateTo }  from '#app'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin({
  name: 'auth',
  order: 1,
  setup() {
    const router = useRouter()
    const config = useRuntimeConfig()

    router.beforeEach((to) => {
      if (typeof window !== 'undefined' &&
          (window.location.port === '6006' || window.location.port === '3000')) {
      }

      const userStore = useUserStore()
      const basePage = config.public.BASE_PAGE || '/clients'

      if (userStore.isAuthenticated && to.name === 'login') {
        return navigateTo(basePage)
      }

      if (!userStore.isAuthenticated && to.name !== 'login') {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    })
  }
})
