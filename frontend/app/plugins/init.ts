import { defineNuxtPlugin } from '#app'
import { useSelectionStore } from '~/stores/selectionStore'
import { useUserStore } from '~/stores/userStore'
import { useUiStore } from '~/stores/uiStore'

export default defineNuxtPlugin({
  name: 'init',
  order: 10,
  async setup() {
    const userStore = useUserStore()
    const selectionStore = useSelectionStore()
    const uiStore = useUiStore()

    if (typeof document !== 'undefined') {
      uiStore.initTheme()
      const colorMode = useColorMode()
      colorMode.preference = uiStore.theme
    }

    if (userStore.isAuthenticated && selectionStore.selectedServers.length === 0) {
      try {
        const { getServers, getUserConfiguration } = useApiHelpers()
        const [serverResult, userConfigResult] = await Promise.all([
          getServers({}),
          getUserConfiguration(),
        ])
        if (serverResult.data && serverResult.data.length > 0) {
          const configServer = serverResult.data.find((d) => d.type === 'OpsiConfigserver')
          if (configServer) selectionStore.setConfigServer(configServer.depotId)
          else if (serverResult.data[0]) selectionStore.setServers([serverResult.data[0].depotId])
        }
        if (userConfigResult.data?.configuration) {
          userStore.setUserConfiguration(userConfigResult.data.configuration)
        }
      } catch (e) {
        console.warn('Failed to initialize:', e)
      }
    }
  },
})
