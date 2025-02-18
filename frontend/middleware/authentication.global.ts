/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineNuxtRouteMiddleware, navigateTo, useCookie } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {
  if (window.location.port === '6006' || window.location.port === '3000') {
    // access from storybook
    return
  }

  const config: any = useRuntimeConfig()

  const isAuthenticated = Boolean(
    useCookie('opsiconfd-session') && storeAuth().username,
  )

  if (isAuthenticated && to.name === 'login') {
    return navigateTo(config.public.BASE_PAGE)
  } else if (!isAuthenticated && to.name !== 'login') {
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }
})
