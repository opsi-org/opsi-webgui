/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Initialization plugin - restores theme and fetches initial data after authentication.
*/
import { defineNuxtPlugin } from '#app'
import { useStateStore } from '~/stores/stateStore'
import { useUserStore } from '~/stores/userStore'
import { useUiStore } from '~/stores/uiStore'

export default defineNuxtPlugin({
  name: 'init',
  order: 10, // Run after auth plugin
  async setup() {
    const userStore = useUserStore()
    const stateStore = useStateStore()
    const uiStore = useUiStore()

    // Restore theme from persisted state immediately
    if (typeof document !== 'undefined') {
      uiStore.initTheme()
      // Also sync Nuxt's color mode
      const colorMode = useColorMode()
      colorMode.preference = uiStore.theme
    }

    // Only initialize if user is authenticated and depots aren't already loaded
    if (userStore.isAuthenticated && stateStore.depots.length === 0) {
      try {
        const { getDepots, getUserConfiguration } = useApiHelpers()

        // Fetch depots and user configuration in parallel
        const [depotResult, userConfigResult] = await Promise.all([
          getDepots({}),
          getUserConfiguration(),
        ])

        if (depotResult.data && depotResult.data.length > 0) {
          // Find the configserver
          const configServer = depotResult.data.find(d => d.type === 'OpsiConfigserver')
          if (configServer) {
            stateStore.setConfigServer(configServer.depotId)
          } else if (depotResult.data[0]) {
            // Fallback to first depot
            stateStore.setDepots([depotResult.data[0].depotId])
          }
        }

        // Store user configuration (read_only, access levels, etc.)
        if (userConfigResult.data?.configuration) {
          userStore.setUserConfiguration(userConfigResult.data.configuration)
        }
      } catch (e) {
        console.warn('Failed to initialize:', e)
      }
    }
  }
})
