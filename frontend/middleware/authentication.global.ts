/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import {
  abortNavigation,
  defineNuxtRouteMiddleware,
  navigateTo,
  useCookie,
} from 'nuxt/app'
// import { storeAuth } from "../store/authsstore"

export default defineNuxtRouteMiddleware((to, from) => {
  if (window.location.port === '6006' || window.location.port === '3000') {
    // access from storybook
    return
  }

  const config: any = useRuntimeConfig()
  if (to.params.id === '1') {
    console.error('no idea what happend here', to.name, from.name)
    return abortNavigation()
  }
  // const isA:Boolean = storeAuth().isAuthenticated // has old values in store...
  const isA = Boolean(useCookie('opsiconfd-session') && storeAuth().username)
  // const isA = Boolean(useCookie('opsiconfd-session') && localStorage.getItem('auth.username'))

  if (isA && to.name === 'login') {
    return navigateTo('' + config.public.BASE_PAGE)
  } else if (!isA && to.name !== 'login') {
    return navigateTo('/login?redirect=' + to.path)
  }
  // if (to.params.redirect) {
  //   return navigateTo('' + to.params.redirect)
  // }
  // In a real app you would probably not redirect every route to `/`
  // however it is important to check `to.path` before redirecting or you
  // might get an infinite redirect loop
  // if (to.path !== '/') {
  //   return navigateTo('/')
  // }
})
