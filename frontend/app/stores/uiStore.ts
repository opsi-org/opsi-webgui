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
import { useColorMode } from '@vueuse/core'
import type { ProductVisibility } from '~/types'
import { readStorageJSON, readStorageValue, removeStorageValue, safeLocalStorage } from '~/utils/storage'

type Theme = 'light' | 'dark'
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
    pick: ['theme', 'quickpanelOpened', 'menuCollapsed', 'productActions', 'clients', 'terminal'],
  },
  state: () => ({
    isMobile: false,
    theme: (useColorMode().value === 'auto' ? 'light' : useColorMode().value) as Theme,
    quickpanelOpened: true,
    menuCollapsed: false,
    productActions: { processAfterSave: false, visibility: '' as ProductVisibility },
    clients: { showAllRowActions: false },
    terminal: { quickCommands: [] as string[] },
  }),
  actions: {
    initializePreferences() {
      if (import.meta.server) return

      const processAfterSave = readStorageValue('opsi-webgui-save-and-process')
      if (processAfterSave !== null) this.productActions.processAfterSave = processAfterSave === '1'
      const visibility = readStorageValue('opsi-webgui-process-actions-visibility')
      if (visibility === '' || visibility === 'hidden' || visibility === 'visible') {
        this.productActions.visibility = visibility
      }
      const showAllClientRowActions = readStorageValue('opsi-webgui-show-all-client-row-actions')
      if (showAllClientRowActions !== null) this.clients.showAllRowActions = showAllClientRowActions === 'true'
      const commandsKey = 'opsi-webgui-terminal-quick-commands'
      if (readStorageValue(commandsKey) !== null) {
        const commands = readStorageJSON<unknown>(commandsKey, [])
        this.terminal.quickCommands = Array.isArray(commands)
          ? commands.filter((command): command is string => typeof command === 'string')
          : []
      }

      legacyPreferenceKeys.forEach(removeStorageValue)
    },
    setTheme(theme: Theme) {
      this.theme = theme
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        document.cookie = `opsi-webgui-color-mode=${theme}; path=/; max-age=31536000; SameSite=Lax`
      }
    },
    initTheme() {
      if (this.theme && typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', this.theme === 'dark')
        document.cookie = `opsi-webgui-color-mode=${this.theme}; path=/; max-age=31536000; SameSite=Lax`
      }
    },
    setIsMobile(isMobile: boolean) {
      this.isMobile = isMobile
    },
  },
})
