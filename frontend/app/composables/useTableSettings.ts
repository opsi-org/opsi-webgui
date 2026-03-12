/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Composable for managing table settings (columns, sorting) with cookie persistence.
*/

import { useCookie } from 'nuxt/app'

export type TableType = 'servers' | 'clients' | 'products'

export interface TableSettings {
  visibleColumns: string[]
  sortColumn: string
  sortDirection: 'asc' | 'desc'
}

const COOKIE_NAME = 'opsi-table-settings'

const defaultSettings: Record<TableType, TableSettings> = {
  servers: {
    visibleColumns: ['selected', 'depotId', 'description', 'type', 'actions'],
    sortColumn: 'depotId',
    sortDirection: 'asc',
  },
  clients: {
    visibleColumns: ['selected', 'clientId', 'description', 'lastSeen', 'actions'],
    sortColumn: 'clientId',
    sortDirection: 'asc',
  },
  products: {
    visibleColumns: ['selected', 'productId', 'description', 'depotVersions', 'actions'],
    sortColumn: 'productId',
    sortDirection: 'asc',
  },
}

export function useTableSettings(tableType: TableType) {
  const cookie = useCookie<Record<TableType, TableSettings>>(COOKIE_NAME, {
    default: () => ({ ...defaultSettings }),
    maxAge: 60 * 60 * 24 * 365, // 1 year
    watch: true,
  })

  // Ensure the cookie has the structure we expect
  if (!cookie.value) {
    cookie.value = { ...defaultSettings }
  }
  if (!cookie.value[tableType]) {
    cookie.value[tableType] = { ...defaultSettings[tableType] }
  }

  const settings = computed({
    get: () => cookie.value[tableType] || defaultSettings[tableType],
    set: (val: TableSettings) => {
      cookie.value = { ...cookie.value, [tableType]: val }
    },
  })

  const visibleColumns = computed({
    get: () => settings.value.visibleColumns,
    set: (cols: string[]) => {
      settings.value = { ...settings.value, visibleColumns: cols }
    },
  })

  const sortColumn = computed({
    get: () => settings.value.sortColumn,
    set: (col: string) => {
      settings.value = { ...settings.value, sortColumn: col }
    },
  })

  const sortDirection = computed({
    get: () => settings.value.sortDirection,
    set: (dir: 'asc' | 'desc') => {
      settings.value = { ...settings.value, sortDirection: dir }
    },
  })

  function isColumnVisible(key: string): boolean {
    return visibleColumns.value.includes(key)
  }

  function toggleColumn(key: string) {
    const cols = [...visibleColumns.value]
    const idx = cols.indexOf(key)
    if (idx >= 0) {
      cols.splice(idx, 1)
    } else {
      cols.push(key)
    }
    visibleColumns.value = cols
  }

  function setSort(column: string, direction?: 'asc' | 'desc') {
    if (direction) {
      sortColumn.value = column
      sortDirection.value = direction
    } else {
      // Toggle direction if same column
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
      }
    }
  }

  function reset() {
    settings.value = { ...defaultSettings[tableType] }
  }

  return {
    settings,
    visibleColumns,
    sortColumn,
    sortDirection,
    isColumnVisible,
    toggleColumn,
    setSort,
    reset,
  }
}
