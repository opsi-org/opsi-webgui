/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useDataTableSettings - Persistent data table column visibility and sorting settings.
 */
export interface DataTableColumnDef {
  key: string
  label: string
  labelKey?: string
  sortable?: boolean
  visible?: boolean
  alwaysVisible?: boolean
  width?: string
  minWidth?: string
  maxWidth?: string
  align?: 'left' | 'center' | 'right'
  class?: string
  headerClass?: string
  headerIcon?: string
  stickyRight?: boolean
  truncate?: boolean
  tooltip?: boolean
}

export interface DataTableSettings {
  visibleColumns: string[]
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  pageSize: number
  displayMode: 'infinite' | 'pagination'
  selectionMode: 'multi' | 'single'
  onlySelected?: boolean
}

const STORAGE_KEY = 'opsi-webgui-datatable-settings'

const defaults: Record<string, DataTableSettings> = {
  servers: {
    visibleColumns: ['depotId', 'description', 'type', 'ip'],
    sortColumn: 'depotId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'single',
  },
  clients: {
    visibleColumns: [
      'clientId',
      'description',
      'macAddress',
      'ipAddress',
      'lastSeen',
      'version_outdated',
      'installationStatus_installed',
      'actionRequest_set',
      'actionResult_failed',
      'reachable',
    ],
    sortColumn: 'clientId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
  products: {
    visibleColumns: ['productId', 'description', 'version', 'installationStatus', 'actionResult', 'actionProgress', 'actionRequest'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
  'products-localboot': {
    visibleColumns: ['productId', 'description', 'version', 'installationStatus', 'actionResult', 'actionProgress', 'actionRequest'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
  'products-netboot': {
    visibleColumns: ['productId', 'description', 'version', 'actionProgress'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'infinite',
    selectionMode: 'multi',
  },
}

function getStored(): Record<string, DataTableSettings> {
  if (import.meta.server) return {}
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : {}
  } catch {
    return {}
  }
}

function save(id: string, s: DataTableSettings) {
  if (import.meta.server) return
  try {
    const all = getStored()
    all[id] = s
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* */
  }
}

export function useDataTableSettings(tableId: string) {
  const stored = getStored()
  const def = defaults[tableId] || {
    visibleColumns: [],
    sortColumn: '',
    sortDirection: 'asc' as const,
    pageSize: 20,
    displayMode: 'infinite' as const,
    selectionMode: 'multi' as const,
  }

  const settings = reactive<DataTableSettings>({ ...def, ...stored[tableId] })

  watch(
    () => ({ ...settings }),
    (n) => save(tableId, n),
    { deep: true },
  )

  function setVisibleColumns(cols: string[]) {
    settings.visibleColumns = cols
  }

  function toggleColumn(key: string) {
    const i = settings.visibleColumns.indexOf(key)
    if (i >= 0) settings.visibleColumns.splice(i, 1)
    else settings.visibleColumns.push(key)
  }

  function isColumnVisible(key: string, columns: DataTableColumnDef[]): boolean {
    const col = columns.find((c) => c.key === key)
    if (col?.alwaysVisible) return true
    if (settings.visibleColumns.length === 0) return col?.visible !== false
    return settings.visibleColumns.includes(key)
  }

  function setSort(column: string, direction?: 'asc' | 'desc') {
    if (direction) {
      settings.sortColumn = column
      settings.sortDirection = direction
    } else if (settings.sortColumn === column) settings.sortDirection = settings.sortDirection === 'asc' ? 'desc' : 'asc'
    else {
      settings.sortColumn = column
      settings.sortDirection = 'asc'
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
    Object.assign(settings, defaults[tableId] || def)
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
