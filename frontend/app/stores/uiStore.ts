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

export const useUiStore = defineStore('ui', {
  persist: {
    key: 'opsi-webgui-ui',
    storage: safeLocalStorage,
    pick: ['quickpanelOpened', 'menuCollapsed', 'productActions', 'terminal', 'logs'],
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
  }),
  actions: {
    initializePreferences() {
      if (import.meta.server) return

      const storedUi = readStorageJSON<unknown>('opsi-webgui-ui', {})
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
          const tableSettings = readStorageJSON<Record<string, unknown>>('opsi-webgui-datatable-settings', {})
          const clientSettings = tableSettings.clients
          if (!clientSettings || typeof clientSettings !== 'object' || !('showAllRowActions' in clientSettings)) {
            tableSettings.clients = {
              ...(clientSettings && typeof clientSettings === 'object' ? clientSettings : {}),
              showAllRowActions: legacyClients.showAllRowActions,
            }
            writeStorageJSON('opsi-webgui-datatable-settings', tableSettings)
          }
        }

        if ('theme' in storedUi || 'clients' in storedUi) {
          const preferences = { ...storedUi } as Record<string, unknown>
          delete preferences.theme
          delete preferences.clients
          writeStorageJSON('opsi-webgui-ui', preferences)
        }
      }

      const processAfterSave = readStorageValue('opsi-webgui-save-and-process')
      if (processAfterSave !== null) this.productActions.processAfterSave = processAfterSave === '1'
      const visibility = readStorageValue('opsi-webgui-process-actions-visibility')
      if (visibility === '' || visibility === 'hidden' || visibility === 'visible') {
        this.productActions.visibility = visibility
      }
      const showAllClientRowActions = readStorageValue('opsi-webgui-show-all-client-row-actions')
      if (showAllClientRowActions !== null) {
        const tableSettings = readStorageJSON<Record<string, unknown>>('opsi-webgui-datatable-settings', {})
        const clientSettings = tableSettings.clients
        if (!clientSettings || typeof clientSettings !== 'object' || !('showAllRowActions' in clientSettings)) {
          tableSettings.clients = {
            ...(clientSettings && typeof clientSettings === 'object' ? clientSettings : {}),
            showAllRowActions: showAllClientRowActions === 'true',
          }
          writeStorageJSON('opsi-webgui-datatable-settings', tableSettings)
        }
      }
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
