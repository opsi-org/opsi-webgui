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

export type AdvancedFilterScope = 'clients' | 'products' | 'servers'

type AdvancedFilters = Record<AdvancedFilterScope, object>
type FilterStorage = { queries: Record<string, string>; advancedFilters: AdvancedFilters }

const STORAGE_KEY = 'opsi-webgui-datatable-filter-queries'
const UI_STORAGE_KEY = 'opsi-webgui-ui'
const scopes: AdvancedFilterScope[] = ['clients', 'products', 'servers']
const legacyAdvancedFilterKeys = scopes.map((scope) => `opsi-webgui-${scope}-advanced-filters`)

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readQueries(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {}
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}

function readAdvancedFilters(value: unknown): Partial<AdvancedFilters> {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    scopes.flatMap((scope) => {
      const filters = value[scope]
      return isRecord(filters) ? [[scope, filters]] : []
    }),
  ) as Partial<AdvancedFilters>
}

export const useDataTableFilterStore = defineStore('dataTableFilters', {
  state: () => ({
    queries: {} as Record<string, string>,
    advancedFilters: { clients: {}, products: {}, servers: {} } as AdvancedFilters,
    initialized: false,
  }),
  actions: {
    initialize() {
      if (this.initialized || import.meta.server) return
      this.initialized = true

      const stored = readStorageJSON<unknown>(STORAGE_KEY, {})
      const isCurrentFormat = isRecord(stored) && 'queries' in stored
      this.queries = readQueries(isCurrentFormat ? stored.queries : stored)

      const storedAdvancedFilters = isCurrentFormat && isRecord(stored) ? readAdvancedFilters(stored.advancedFilters) : {}
      const oldUi = readStorageJSON<unknown>(UI_STORAGE_KEY, {})
      const uiAdvancedFilters = isRecord(oldUi) ? readAdvancedFilters(oldUi.advancedFilters) : {}
      for (const scope of scopes) {
        const legacyKey = `opsi-webgui-${scope}-advanced-filters`
        const legacy = readStorageJSON<unknown>(legacyKey, {})
        const migrated = storedAdvancedFilters[scope] ?? uiAdvancedFilters[scope] ?? (isRecord(legacy) ? legacy : {})
        this.advancedFilters[scope] = migrated
      }

      const normalized: FilterStorage = { queries: this.queries, advancedFilters: this.advancedFilters }
      writeStorageJSON(STORAGE_KEY, normalized)
      legacyAdvancedFilterKeys.forEach(removeStorageValue)

      if (isRecord(oldUi) && 'advancedFilters' in oldUi) {
        const { advancedFilters: _oldAdvancedFilters, ...uiPreferences } = oldUi
        writeStorageJSON(UI_STORAGE_KEY, uiPreferences)
      }
    },
    getFilterQuery(filterId: string): string {
      this.initialize()
      return this.queries[filterId] || ''
    },
    saveFilterQuery(filterId: string, filterQuery: string) {
      this.initialize()
      this.queries[filterId] = filterQuery
      this.persist()
    },
    clearFilterQuery(filterId: string) {
      this.initialize()
      delete this.queries[filterId]
      this.persist()
    },
    setAdvancedFilters(scope: AdvancedFilterScope, filters: object) {
      this.initialize()
      const stored = readStorageJSON<unknown>(STORAGE_KEY, {})
      const isCurrentFormat = isRecord(stored) && 'queries' in stored
      this.queries = readQueries(isCurrentFormat ? stored.queries : stored)
      const latestAdvancedFilters = isCurrentFormat && isRecord(stored) ? readAdvancedFilters(stored.advancedFilters) : {}
      for (const storedScope of scopes) {
        if (latestAdvancedFilters[storedScope]) this.advancedFilters[storedScope] = latestAdvancedFilters[storedScope]
      }
      this.advancedFilters[scope] = filters
      this.persist()
    },
    persist() {
      const value: FilterStorage = { queries: this.queries, advancedFilters: this.advancedFilters }
      writeStorageJSON(STORAGE_KEY, value)
    },
  },
})
