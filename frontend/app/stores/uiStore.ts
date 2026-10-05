/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * uiStore - Pinia store for shared UI state and user preferences.
 */
import { defineStore } from 'pinia'
import type { ProductVisibility } from '~/types'
import {
  readStorageJSON,
  readStorageValue,
  removeStorageValue,
  safeLocalStorage,
  writeStorageJSON,
  writeStorageValue,
} from '~/utils/storage'

const legacyPreferenceKeys = [
  'opsi-webgui-save-and-process',
  'opsi-webgui-process-actions-visibility',
  'opsi-webgui-show-all-client-row-actions',
  'opsi-webgui-terminal-quick-commands',
]
const UI_STORAGE_KEY = 'opsi-webgui-ui'
const LEGACY_LAYOUT_KEY = 'opsi-webgui-workspace-layout'

interface WorkspaceLayoutState {
  quickpanelWidth: number
  detailPanelWidthPercent: number
  groupsSidebarWidthPercent: number
}

const DEFAULT_WORKSPACE_LAYOUT: WorkspaceLayoutState = {
  quickpanelWidth: 264,
  detailPanelWidthPercent: 50,
  groupsSidebarWidthPercent: 50,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function migrateShowAllRowActions(value: boolean) {
  const tableSettings = readStorageJSON<Record<string, unknown>>('opsi-webgui-datatable-settings', {})
  const clientSettings = tableSettings.clients
  if (!clientSettings || typeof clientSettings !== 'object' || !('showAllRowActions' in clientSettings)) {
    tableSettings.clients = {
      ...(clientSettings && typeof clientSettings === 'object' ? clientSettings : {}),
      showAllRowActions: value,
    }
    writeStorageJSON('opsi-webgui-datatable-settings', tableSettings)
  }
}

export const useUiStore = defineStore('ui', {
  persist: {
    key: 'opsi-webgui-ui',
    storage: safeLocalStorage,
    pick: ['quickpanelOpened', 'menuCollapsed', 'productActions', 'terminal', 'logs', 'layout'],
  },
  state: () => ({
    isMobile: false,
    quickpanelOpened: true,
    menuCollapsed: false,
    productActions: { processAfterSave: false, visibility: '' as ProductVisibility },
    terminal: { quickCommands: [] as string[] },
    logs: {
      lastSelectedLogLevel: 6,
      lastSelectedLogType: 'instlog',
      filter: '',
      autoRefresh: false,
      autoScroll: true,
    },
    layout: { ...DEFAULT_WORKSPACE_LAYOUT },
  }),
  actions: {
    initializePreferences() {
      if (import.meta.server) return

      const storedUi = readStorageJSON<unknown>(UI_STORAGE_KEY, {})
      if (storedUi && typeof storedUi === 'object' && !Array.isArray(storedUi)) {
        const legacyTheme = 'theme' in storedUi ? storedUi.theme : undefined
        if ((legacyTheme === 'light' || legacyTheme === 'dark') && readStorageValue('opsi-webgui-color-mode') === null) {
          writeStorageValue('opsi-webgui-color-mode', legacyTheme)
        }

        const legacyClients = 'clients' in storedUi ? storedUi.clients : undefined
        if (
          legacyClients &&
          typeof legacyClients === 'object' &&
          'showAllRowActions' in legacyClients &&
          typeof legacyClients.showAllRowActions === 'boolean'
        ) {
          migrateShowAllRowActions(legacyClients.showAllRowActions)
        }

        if ('theme' in storedUi || 'clients' in storedUi) {
          const preferences = { ...storedUi } as Record<string, unknown>
          delete preferences.theme
          delete preferences.clients
          writeStorageJSON(UI_STORAGE_KEY, preferences)
        }
      }

      const legacyLayoutRaw = readStorageValue(LEGACY_LAYOUT_KEY)
      if (legacyLayoutRaw !== null) {
        const legacyLayout = readStorageJSON<unknown>(LEGACY_LAYOUT_KEY, {})
        const storedLayout = isRecord(storedUi) && isRecord(storedUi.layout) ? storedUi.layout : {}
        const migratedLayout = { ...DEFAULT_WORKSPACE_LAYOUT }
        for (const key of Object.keys(DEFAULT_WORKSPACE_LAYOUT) as (keyof WorkspaceLayoutState)[]) {
          const oldValue = legacyLayout && isRecord(legacyLayout) ? legacyLayout[key] : undefined
          const currentValue = storedLayout[key]
          const value = typeof currentValue === 'number' ? currentValue : oldValue
          if (typeof value === 'number' && Number.isFinite(value)) migratedLayout[key] = value
        }
        this.layout = migratedLayout
        const uiPreferences = readStorageJSON<unknown>(UI_STORAGE_KEY, {})
        writeStorageJSON(UI_STORAGE_KEY, { ...(isRecord(uiPreferences) ? uiPreferences : {}), layout: migratedLayout })
        removeStorageValue(LEGACY_LAYOUT_KEY)
      }

      const processAfterSave = readStorageValue('opsi-webgui-save-and-process')
      if (processAfterSave !== null) this.productActions.processAfterSave = processAfterSave === '1'
      const visibility = readStorageValue('opsi-webgui-process-actions-visibility')
      if (visibility === '' || visibility === 'hidden' || visibility === 'visible') {
        this.productActions.visibility = visibility
      }
      const showAllClientRowActions = readStorageValue('opsi-webgui-show-all-client-row-actions')
      if (showAllClientRowActions !== null) migrateShowAllRowActions(showAllClientRowActions === 'true')
      const commandsKey = 'opsi-webgui-terminal-quick-commands'
      if (readStorageValue(commandsKey) !== null) {
        const commands = readStorageJSON<unknown>(commandsKey, [])
        this.terminal.quickCommands = Array.isArray(commands)
          ? commands.filter((command): command is string => typeof command === 'string')
          : []
      }

      legacyPreferenceKeys.forEach(removeStorageValue)
    },
    setIsMobile(isMobile: boolean) {
      this.isMobile = isMobile
    },
  },
})
