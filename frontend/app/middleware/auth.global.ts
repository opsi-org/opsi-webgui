/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * auth.global - Global route middleware guarding authenticated routes.
 */
import { useUserStore } from '~/stores/userStore'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const userStore = useUserStore()

  if (userStore.isAuthenticated && to.name === 'login') {
    const redirect = to.query.redirect?.toString()
    if (redirect) {
      return navigateTo(redirect, { replace: true })
    }
    return navigateTo(getDefaultPageFromCookie())
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
