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

    // Before login: always fetch config server info
    const { getConfigServer, getServers } = useApiHelpers()
    const { fetchPostLoginData } = useCachedData()
    try {
      const configServerResult = await getConfigServer()
      if (configServerResult.data) {
        const serverData = configServerResult.data as unknown
        const serverId =
          typeof serverData === 'string'
            ? serverData
            : ((serverData as Record<string, unknown>)?.result as string)
        if (serverId) selectionStore.setConfigServer(serverId)
      }
    } catch (e) {
      console.warn('Failed to fetch config server:', e)
    }

    // After login: fetch user configuration & disabled features (cached)
    if (userStore.isAuthenticated) {
      try {
        const promises: Promise<unknown>[] = [fetchPostLoginData()]

        // Only fetch servers if none selected
        if (selectionStore.selectedServers.length === 0) {
          promises.push(getServers({}))
        }

        const [, serverResult] = (await Promise.all(promises)) as [
          void,
          Awaited<ReturnType<typeof getServers>> | undefined,
        ]

        if (serverResult?.data && serverResult.data.length > 0) {
          const configServer = serverResult.data.find((d) => d.type === 'OpsiConfigserver')
          if (configServer) selectionStore.setConfigServer(configServer.depotId)
          else if (serverResult.data[0]) selectionStore.setServers([serverResult.data[0].depotId])
        }
      } catch (e) {
        console.warn('Failed to initialize:', e)
      }
    }
  },
})
