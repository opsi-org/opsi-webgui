/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */
import { defineStore } from 'pinia'
import { readStorageJSON, removeStorageValue, writeStorageJSON } from '~/utils/storage'
import {
  readDataTableFilterStorage,
  isStorageRecord,
  writeDataTableFilterStorage,
  type AdvancedFilterScope,
  type DataTableFilterStorage,
} from '~/utils/dataTableFilterStorage'

const UI_STORAGE_KEY = 'opsi-webgui-ui'
const scopes: AdvancedFilterScope[] = ['clients', 'products', 'servers']
const legacyAdvancedFilterKeys = scopes.map((scope) => `opsi-webgui-${scope}-advanced-filters`)

function readAdvancedFilters(value: unknown): Partial<DataTableFilterStorage['advancedFilters']> {
  if (!isStorageRecord(value)) return {}
  return Object.fromEntries(
    scopes.flatMap((scope) => {
      const filters = value[scope]
      return isStorageRecord(filters) ? [[scope, filters]] : []
    }),
  ) as Partial<DataTableFilterStorage['advancedFilters']>
}

export const useDataTableFilterStore = defineStore('dataTableFilters', {
  state: () => ({
    advancedFilters: { clients: {}, products: {}, servers: {} } as Record<AdvancedFilterScope, object>,
    initialized: false,
  }),
  actions: {
    initialize() {
      if (this.initialized || import.meta.server) return
      this.initialized = true

      const stored = readDataTableFilterStorage()
      const storedAdvancedFilters = stored.advancedFilters
      const oldUi = readStorageJSON<unknown>(UI_STORAGE_KEY, {})
      const uiAdvancedFilters = isStorageRecord(oldUi) ? readAdvancedFilters(oldUi.advancedFilters) : {}
      for (const scope of scopes) {
        const legacyKey = `opsi-webgui-${scope}-advanced-filters`
        const legacy = readStorageJSON<unknown>(legacyKey, {})
        const migrated = storedAdvancedFilters[scope] ?? uiAdvancedFilters[scope] ?? (isStorageRecord(legacy) ? legacy : {})
        this.advancedFilters[scope] = migrated
      }

      writeDataTableFilterStorage({ queries: stored.queries, advancedFilters: this.advancedFilters })
      legacyAdvancedFilterKeys.forEach(removeStorageValue)

      if (isStorageRecord(oldUi) && 'advancedFilters' in oldUi) {
        const { advancedFilters: _oldAdvancedFilters, ...uiPreferences } = oldUi
        writeStorageJSON(UI_STORAGE_KEY, uiPreferences)
      }
    },
    setAdvancedFilters(scope: AdvancedFilterScope, filters: object) {
      this.initialize()
      const stored = readDataTableFilterStorage()
      const advancedFilters = { ...stored.advancedFilters }
      advancedFilters[scope] = filters
      this.advancedFilters[scope] = filters
      writeDataTableFilterStorage({ queries: stored.queries, advancedFilters })
    },
  },
})
