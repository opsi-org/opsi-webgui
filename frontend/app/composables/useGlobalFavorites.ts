/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useGlobalFavorites - Aggregates favorite saved searches from the clients/products/servers
 * tables (each scoped independently via useSavedSearches)
 */
import { clearStoredDataTableFilter } from '~/composables/data-table/useDataTableFilter'

export interface GlobalFavorite {
  id: string
  scope: 'clients' | 'products' | 'servers'
  name: string
  filterQuery: string
  advancedFilters: Record<string, unknown>
}

export const GLOBAL_SEARCH_SCOPES = ['clients', 'products', 'servers'] as const
export type GlobalSearchScope = (typeof GLOBAL_SEARCH_SCOPES)[number]

const SCOPE_ROUTES: Record<GlobalSearchScope, string> = {
  clients: '/clients',
  products: '/products',
  servers: '/servers',
}

export function scopeRoute(scope: GlobalSearchScope): string {
  return SCOPE_ROUTES[scope]
}

export const CLEAR_ALL_FILTERS_EVENT = 'opsi-webgui:clear-all-filters'

function advancedFiltersStorageKey(scope: GlobalSearchScope): string {
  return `opsi-webgui-${scope}-advanced-filters`
}

export function clearAllFilters() {
  if (import.meta.server) return
  for (const scope of GLOBAL_SEARCH_SCOPES) {
    clearStoredDataTableFilter(scope)
    localStorage.removeItem(advancedFiltersStorageKey(scope))
  }
  window.dispatchEvent(new Event(CLEAR_ALL_FILTERS_EVENT))
}

export function useGlobalFavorites() {
  const perScope = GLOBAL_SEARCH_SCOPES.map((scope) => ({ scope, ...useSavedSearches<Record<string, unknown>>(scope) }))

  const favorites = computed<GlobalFavorite[]>(() =>
    perScope.flatMap(({ scope, savedSearches }) =>
      savedSearches.value
        .filter((s) => s.favorite)
        .map((s) => ({ id: s.id, scope, name: s.name, filterQuery: s.filterQuery, advancedFilters: s.advancedFilters })),
    ),
  )

  function removeFavorite(favorite: Pick<GlobalFavorite, 'scope' | 'id'>) {
    perScope.find((p) => p.scope === favorite.scope)?.toggleFavorite(favorite.id)
  }

  function clearAllFavorites() {
    for (const { savedSearches, toggleFavorite } of perScope) {
      for (const s of savedSearches.value) {
        if (s.favorite) toggleFavorite(s.id)
      }
    }
  }

  return { favorites, removeFavorite, clearAllFavorites }
}
