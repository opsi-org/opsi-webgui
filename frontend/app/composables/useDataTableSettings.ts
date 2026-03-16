/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Composable for managing DataTable settings with localStorage persistence.
*/

export interface DataTableSettings {
  visibleColumns: string[]
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  pageSize: number
  displayMode: 'infinite' | 'pagination'
  selectionMode: 'multi' | 'single'
}

export interface DataTableColumnDef {
  key: string
  label: string
  sortable?: boolean
  visible?: boolean
  alwaysVisible?: boolean
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  class?: string
  headerClass?: string
}

const STORAGE_KEY = 'opsi-datatable-settings'

// Default settings for each table type
const defaultSettings: Record<string, DataTableSettings> = {
  servers: {
    visibleColumns: ['depotId', 'description', 'type'],
    sortColumn: 'depotId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
  clients: {
    visibleColumns: ['clientId', 'description', 'lastSeen', 'macAddress'],
    sortColumn: 'clientId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
  products: {
    visibleColumns: ['productId', 'description', 'depotVersions', 'priority'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
  'products-localboot': {
    visibleColumns: ['productId', 'description', 'depotVersions', 'installationStatus', 'actionRequest'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
  'products-netboot': {
    visibleColumns: ['productId', 'description', 'depotVersions'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
}

function getStoredSettings(): Record<string, DataTableSettings> {
  if (import.meta.server) return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveSettings(tableId: string, settings: DataTableSettings) {
  if (import.meta.server) return
  try {
    const all = getStoredSettings()
    all[tableId] = settings
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // localStorage quota exceeded - ignore
  }
}

export function useDataTableSettings(tableId: string) {
  const stored = getStoredSettings()
  const defaults = defaultSettings[tableId] || {
    visibleColumns: [],
    sortColumn: '',
    sortDirection: 'asc' as const,
    pageSize: 20,
    displayMode: 'infinite' as const,
    selectionMode: 'multi' as const,
  }

  // Merge stored with defaults (stored takes precedence)
  const initial: DataTableSettings = {
    ...defaults,
    ...stored[tableId],
  }

  const settings = reactive<DataTableSettings>({ ...initial })

  // Watch for changes and persist
  watch(
    () => ({ ...settings }),
    (newSettings) => {
      saveSettings(tableId, newSettings)
    },
    { deep: true }
  )

  function setVisibleColumns(columns: string[]) {
    settings.visibleColumns = columns
  }

  function toggleColumn(key: string) {
    const idx = settings.visibleColumns.indexOf(key)
    if (idx >= 0) {
      settings.visibleColumns.splice(idx, 1)
    } else {
      settings.visibleColumns.push(key)
    }
  }

  function isColumnVisible(key: string, columns: DataTableColumnDef[]): boolean {
    const col = columns.find((c) => c.key === key)
    if (col?.alwaysVisible) return true
    if (settings.visibleColumns.length === 0) {
      return col?.visible !== false
    }
    return settings.visibleColumns.includes(key)
  }

  function setSort(column: string, direction?: 'asc' | 'desc') {
    if (direction) {
      settings.sortColumn = column
      settings.sortDirection = direction
    } else {
      // Toggle direction if same column
      if (settings.sortColumn === column) {
        settings.sortDirection = settings.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        settings.sortColumn = column
        settings.sortDirection = 'asc'
      }
    }
  }

  function setPageSize(size: number) {
    settings.pageSize = size
  }

  function setDisplayMode(mode: 'infinite' | 'pagination') {
    settings.displayMode = mode
  }

  function setSelectionMode(mode: 'multi' | 'single') {
    settings.selectionMode = mode
  }

  function reset() {
    const defaults = defaultSettings[tableId] || {
      visibleColumns: [],
      sortColumn: '',
      sortDirection: 'asc' as const,
      pageSize: 20,
      displayMode: 'infinite' as const,
      selectionMode: 'multi' as const,
    }
    Object.assign(settings, defaults)
  }

  return {
    settings,
    setVisibleColumns,
    toggleColumn,
    isColumnVisible,
    setSort,
    setPageSize,
    setDisplayMode,
    setSelectionMode,
    reset,
  }
}
