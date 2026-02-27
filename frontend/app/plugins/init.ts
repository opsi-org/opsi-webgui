/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Initialization plugin - fetches initial data like depots after authentication.
*/
import { defineNuxtPlugin } from '#app'
import { useStateStore } from '~/stores/stateStore'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin({
  name: 'init',
  order: 10, // Run after auth plugin
  async setup() {
    const userStore = useUserStore()
    const stateStore = useStateStore()

    // Only initialize if user is authenticated and depots aren't already loaded
    if (userStore.isAuthenticated && stateStore.depots.length === 0) {
      try {
        const { getDepots } = useApiHelpers()
        const result = await getDepots({})

        if (result.data && result.data.length > 0) {
          // Find the configserver
          const configServer = result.data.find(d => d.type === 'OpsiConfigserver')
          if (configServer) {
            stateStore.setConfigServer(configServer.depotId)
          } else if (result.data[0]) {
            // Fallback to first depot
            stateStore.setDepots([result.data[0].depotId])
          }
        }
      } catch (e) {
        console.warn('Failed to initialize depots:', e)
      }
    }
  }
})
