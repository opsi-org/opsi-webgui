import { useUserStore } from '~/stores/userStore'

/**
 * Feature flags composable for checking disabled features and user permissions.
 *
 * Disabled features come from the server config (e.g., "terminal", "messagebus_terminal").
 * User permissions come from the user configuration API (e.g., client_creation, read_only).
 *
 * Usage:
 *   const { isFeatureDisabled, isPageAccessible, canCreateClients } = useFeatureFlags()
 */
export function useFeatureFlags() {
  const userStore = useUserStore()

  /**
   * Check if a specific feature is disabled by the server admin.
   * Feature names: "terminal", "messagebus_terminal", etc.
   */
  function isFeatureDisabled(feature: string): boolean {
    return userStore.disabledFeatures.includes(feature)
  }

  /**
   * Check if a specific feature is enabled (not disabled).
   */
  function isFeatureEnabled(feature: string): boolean {
    return !isFeatureDisabled(feature)
  }

  /**
   * Check if a page/route is accessible based on disabled features and user permissions.
   * Maps routes to their feature requirements.
   */
  function isPageAccessible(route: string): boolean {
    const routeFeatureMap: Record<string, () => boolean> = {
      '/admin/terminal': () =>
        isFeatureEnabled('terminal') && isFeatureEnabled('messagebus_terminal'),
      '/clients/add': () => userStore.clientCreation,
      '/clients/clone': () => userStore.clientCreation,
      '/admin/maintenance': () => !userStore.readOnly,
    }

    for (const [pattern, check] of Object.entries(routeFeatureMap)) {
      if (route.startsWith(pattern)) {
        return check()
      }
    }
    return true
  }

  /**
   * Filter navigation items based on feature flags.
   */
  function filterNavItems<T extends { route: string; submenu?: Array<{ route: string }> }>(
    items: T[]
  ): T[] {
    return items
      .filter((item) => isPageAccessible(item.route))
      .map((item) => {
        if (item.submenu) {
          return {
            ...item,
            submenu: item.submenu.filter((sub) => isPageAccessible(sub.route)),
          }
        }
        return item
      })
      .filter((item) => !item.submenu || item.submenu.length > 0)
  }

  const canCreateClients = computed(() => userStore.clientCreation)
  const isReadOnly = computed(() => userStore.readOnly)
  const hasServerWriteAccess = computed(() => userStore.serverWriteAccess)
  const hasHostGroupAccess = computed(() => userStore.hostGroupAccess)
  const hasProductGroupAccess = computed(() => userStore.productGroupAccess)
  const isTerminalEnabled = computed(
    () => isFeatureEnabled('terminal') && isFeatureEnabled('messagebus_terminal')
  )

  return {
    isFeatureDisabled,
    isFeatureEnabled,
    isPageAccessible,
    filterNavItems,
    canCreateClients,
    isReadOnly,
    hasServerWriteAccess,
    hasHostGroupAccess,
    hasProductGroupAccess,
    isTerminalEnabled,
  }
}
