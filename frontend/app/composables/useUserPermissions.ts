/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useUserPermissions - Composable for checking user roles, read-only state, and feature access.
 */
import { useUserStore } from '~/stores/userStore'

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
