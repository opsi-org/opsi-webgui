/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useDataTableFilter - Shared persisted filter-query helpers for data tables.
 */
import { readStorageJSON, writeStorageJSON } from '~/utils/storage'

const FILTER_STORAGE_KEY = 'opsi-webgui-datatable-filter-queries'
type FilterStorage = { queries: Record<string, string>; advancedFilters: Record<string, object> }

function readFilters(): FilterStorage {
  if (import.meta.server) return { queries: {}, advancedFilters: {} }
  const value = readStorageJSON<unknown>(FILTER_STORAGE_KEY, {})
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { queries: {}, advancedFilters: {} }
  const record = value as Record<string, unknown>
  const queries =
    record.queries && typeof record.queries === 'object' && !Array.isArray(record.queries)
      ? (record.queries as Record<string, string>)
      : (record as Record<string, string>)
  const advancedFilters =
    record.advancedFilters && typeof record.advancedFilters === 'object' && !Array.isArray(record.advancedFilters)
      ? (record.advancedFilters as Record<string, object>)
      : {}
  return { queries, advancedFilters }
}

export function getStoredDataTableFilter(filterId: string): string {
  return readFilters().queries[filterId] || ''
}

export function saveStoredDataTableFilter(filterId: string, filterQuery: string) {
  if (import.meta.server) return
  const all = readFilters()
  all.queries[filterId] = filterQuery
  writeStorageJSON(FILTER_STORAGE_KEY, all)
}

export function clearStoredDataTableFilter(filterId: string) {
  if (import.meta.server) return
  const all = readFilters()
  delete all.queries[filterId]
  writeStorageJSON(FILTER_STORAGE_KEY, all)
}
