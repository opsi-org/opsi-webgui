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
import { readDataTableFilterStorage, writeDataTableFilterStorage } from '~/utils/dataTableFilterStorage'

export function getStoredDataTableFilter(filterId: string): string {
  return readDataTableFilterStorage().queries[filterId] || ''
}

export function saveStoredDataTableFilter(filterId: string, filterQuery: string) {
  const all = readDataTableFilterStorage()
  all.queries[filterId] = filterQuery
  writeDataTableFilterStorage(all)
}

export function clearStoredDataTableFilter(filterId: string) {
  const all = readDataTableFilterStorage()
  delete all.queries[filterId]
  writeDataTableFilterStorage(all)
}
