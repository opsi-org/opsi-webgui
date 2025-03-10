/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export default defineNuxtPlugin(() => {
  const router = useRouter()
  router.beforeEach((to: any) => {
    // console.log('plugin middleware before from', from.name, 'to', to.name)
    if (window.location.port === '6006' || window.location.port === '3000') {
      // access from storybook
      return
    }

    const auth = storeAuth()
    if (auth.isAuthenticated && to.name === 'login') {
      const config: any = useRuntimeConfig()
      return navigateTo(config.public.BASE_PAGE)
    } else if (!auth.isAuthenticated && to.name !== 'login') {
      return navigateTo(`/login?redirect=${to.fullPath}`)
    }
  })
})
