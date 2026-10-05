/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useDataTableSettings - Persistent data table column visibility and sorting settings.
 */
import { readStorageJSON, writeStorageJSON } from '~/utils/storage'

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
  filterMode?: 'primary' | 'all'
  defaultPanelView?: 'config' | 'logs' | 'inventory' | 'clone'
  showAllRowActions?: boolean
}

const STORAGE_KEY = 'opsi-webgui-datatable-settings'

const defaults: Record<string, DataTableSettings> = {
  servers: {
    visibleColumns: ['depotId', 'description', 'type', 'ip'],
    sortColumn: 'depotId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'pagination',
    selectionMode: 'single',
    filterMode: 'all',
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
    displayMode: 'pagination',
    selectionMode: 'multi',
    filterMode: 'all',
    defaultPanelView: 'config',
    showAllRowActions: false,
  },
  products: {
    visibleColumns: ['productId', 'description', 'version', 'installationStatus', 'actionResult', 'actionProgress', 'actionRequest'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'pagination',
    selectionMode: 'multi',
    filterMode: 'all',
  },
  'products-localboot': {
    visibleColumns: ['productId', 'description', 'version', 'installationStatus', 'actionResult', 'actionProgress', 'actionRequest'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'pagination',
    selectionMode: 'multi',
    filterMode: 'all',
  },
  'products-netboot': {
    visibleColumns: ['productId', 'description', 'version', 'actionProgress'],
    sortColumn: 'productId',
    sortDirection: 'asc',
    pageSize: 20,
    displayMode: 'pagination',
    selectionMode: 'multi',
    filterMode: 'all',
  },
  'inventory-hardware': {
    visibleColumns: ['className', 'displayName', 'lastseen'],
    sortColumn: 'className',
    sortDirection: 'asc',
    pageSize: 50,
    displayMode: 'pagination',
    selectionMode: 'single',
    filterMode: 'all',
  },
  'inventory-software': {
    visibleColumns: ['displayName', 'version', 'architecture', 'language', 'lastseen'],
    sortColumn: 'displayName',
    sortDirection: 'asc',
    pageSize: 50,
    displayMode: 'pagination',
    selectionMode: 'single',
    filterMode: 'all',
  },
}

function getStored(tableId: string): Record<string, DataTableSettings> {
  if (import.meta.server) return {}
  const all = readStorageJSON<Record<string, DataTableSettings>>(STORAGE_KEY, {})
  if (tableId !== 'clients') return all

  const clientSettings = { ...all.clients }
  let migrated = false
  const ui = readStorageJSON<Record<string, unknown>>('opsi-webgui-ui', {})
  const legacyClients = ui.clients
  if (typeof clientSettings.showAllRowActions !== 'boolean' && legacyClients && typeof legacyClients === 'object') {
    const oldValue = (legacyClients as Record<string, unknown>).showAllRowActions
    if (typeof oldValue === 'boolean') {
      clientSettings.showAllRowActions = oldValue
      migrated = true
    }
  }

  if (typeof document !== 'undefined') {
    const cookie = document.cookie.match(/(?:^|; )opsi-webgui-default-client-panel-view=([^;]*)/)?.[1]
    if (!('defaultPanelView' in clientSettings) && cookie) {
      let oldValue: string | undefined
      try {
        oldValue = decodeURIComponent(cookie)
      } catch {
        oldValue = undefined
      }
      if (oldValue === 'config' || oldValue === 'logs' || oldValue === 'inventory' || oldValue === 'clone') {
        clientSettings.defaultPanelView = oldValue
        migrated = true
      }
    }
    if (cookie !== undefined) document.cookie = 'opsi-webgui-default-client-panel-view=; path=/; max-age=0; SameSite=Lax'
  }

  if (migrated) {
    all.clients = { ...defaults.clients!, ...clientSettings }
    writeStorageJSON(STORAGE_KEY, all)
  }

  if (legacyClients && typeof legacyClients === 'object') {
    const { clients: _legacyClients, theme: _legacyTheme, ...remainingUi } = ui
    writeStorageJSON('opsi-webgui-ui', remainingUi)
  } else if ('theme' in ui) {
    const { theme: _legacyTheme, ...remainingUi } = ui
    writeStorageJSON('opsi-webgui-ui', remainingUi)
  }
  return all
}

function save(id: string, s: DataTableSettings) {
  if (import.meta.server) return
  const all = getStored(id)
  all[id] = s
  writeStorageJSON(STORAGE_KEY, all)
}

export function useDataTableSettings(tableId: string) {
  const stored = getStored(tableId)
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
