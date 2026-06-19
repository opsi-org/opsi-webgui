/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * auth - Authentication guard plugin for route protection.
 */
import { defineNuxtPlugin, navigateTo } from '#app'
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
        const redirect = to.query.redirect?.toString()
        if (redirect) {
          return navigateTo(redirect, { replace: true })
        }
        return navigateTo(getDefaultPage())
      }

      if (!userStore.isAuthenticated && to.name !== 'login') {
        return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
      }

      if (userStore.isAuthenticated) {
        const { isPageAccessible } = useUserPermissions()
        if (!isPageAccessible(to.path)) {
          return navigateTo('/clients')
        }
      }
    })

    function getDefaultPage(): string {
      return getDefaultPageFromCookie()
    }
  },
})
