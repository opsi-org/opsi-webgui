import { useUserStore } from '~/stores/userStore'

/**
 * User permissions composable for checking disabled features and access rights.
 *
 * Disabled features come from the server config (e.g., "terminal", "messagebus_terminal").
 * User permissions come from the user configuration API (e.g., client_creation, read_only).
 *
 * read_only: User can view all data but cannot modify anything.
 *   - Tabs and navigation remain accessible (user can still read values).
 *   - Edit controls (inputs, save buttons, action dropdowns) are disabled.
 *
 * server_write_access: When false, server/configserver settings are read-only.
 * depot_access (depotAccessRestricted): When true, user is RESTRICTED to configured depots only.
 * host_group_access (hostGroupAccessRestricted): When true, user is RESTRICTED to configured host groups only.
 * product_group_access (productGroupAccessRestricted): When true, user is RESTRICTED to configured product groups only.
 * client_creation: When false, cannot create new clients.
 *
 */
export function useUserPermissions() {
  const userStore = useUserStore()

  function isFeatureDisabled(feature: string): boolean {
    return userStore.disabledFeatures.includes(feature)
  }

  function isFeatureEnabled(feature: string): boolean {
    return !isFeatureDisabled(feature)
  }

  function isPageAccessible(route: string): boolean {
    const routeFeatureMap: Record<string, () => boolean> = {
      '/admin/terminal': () =>
        !userStore.readOnly &&
        isFeatureEnabled('terminal') &&
        isFeatureEnabled('messagebus_terminal'),
      '/clients/add': () => !userStore.readOnly && userStore.clientCreation,
      '/clients/clone': () => !userStore.readOnly && userStore.clientCreation,
      '/admin/maintenance': () => !userStore.readOnly,
      '/servers/configuration': () => !userStore.readOnly || userStore.serverWriteAccess,
    }

    for (const [pattern, check] of Object.entries(routeFeatureMap)) {
      if (route.startsWith(pattern)) {
        return check()
      }
    }
    return true
  }

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
  const isDepotAccessRestricted = computed(() => userStore.depotAccessRestricted)
  const isHostGroupAccessRestricted = computed(() => userStore.hostGroupAccessRestricted)
  const isProductGroupAccessRestricted = computed(() => userStore.productGroupAccessRestricted)
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
    isDepotAccessRestricted,
    isHostGroupAccessRestricted,
    isProductGroupAccessRestricted,
    isTerminalEnabled,
  }
}
