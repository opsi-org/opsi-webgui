/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * uiStore - Pinia store for UI state (sidebar, theme, language, datatable and layout preferences).
 */
import { defineStore } from 'pinia'
import { useColorMode } from '@vueuse/core'
import { useCookie } from 'nuxt/app'

type Lang = 'en' | 'de'
type Theme = 'light' | 'dark'
type TableType = 'servers' | 'clients' | 'products'

const defaultVisible: Record<TableType, string[]> = {
  servers: ['selected', 'depotId', 'description', 'type', 'actions'],
  clients: [
    'selected',
    'clientId',
    'description',
    'lastSeen',
    'version_outdated',
    'installationStatus_installed',
    'actionRequest_set',
    'actionResult_failed',
    'actionResult_successful',
    'reachable',
    'actions',
  ],
  products: ['selected', 'installationStatus', 'actionResult', 'productId', 'version', 'actionRequest', 'actions'],
}

const defaultSort: Record<TableType, { column: string; isDesc: boolean }> = {
  servers: { column: 'depotId', isDesc: false },
  clients: { column: 'clientId', isDesc: false },
  products: { column: 'productId', isDesc: false },
}

export const useUiStore = defineStore('ui', {
  persist: { key: 'opsi-webgui-ui', storage: localStorage },
  state: () => ({
    isMobile: false,
    language: 'en' as Lang,
    theme: (useColorMode().value === 'auto' ? 'light' : useColorMode().value) as Theme,
    quickpanelOpened: true,
    menuCollapsed: false,
    splitviewClient: true,
    splitviewServer: true,
    visibleColumns: { ...defaultVisible } as Record<TableType, string[]>,
    sortColumns: { ...defaultSort } as Record<TableType, { column: string; isDesc: boolean }>,
    filterQuery: { clients: '', products: '' } as Record<string, string>,
    lastSelected: { clients: '', servers: '', products: '' },
    secondColumnSelectedRowId: '',
    productActionRequest: {} as Record<string, string>,
    productsLastRequestUrl: '',
    productsLastRequestParams: {} as unknown,
    productsLastRequestTime: 0,
    logmarker: '-1;;instlog',
    loglevel: 5,
    logtype: 'instlog',
    autofetch: false,
    autoscroll: true,
    syncSelection: true,
  }),
  getters: {
    isLight: (s) => s.theme === 'light',
    getColumns: (s) => (type: TableType) => s.visibleColumns[type],
    getSorting: (s) => (type: TableType) => s.sortColumns[type],
    getFilter: (s) => (type: TableType) => s.filterQuery[type] || '',
    logmarkerNr: (s) => parseInt(String(s.logmarker?.split(';')[0] ?? '-1')) || -1,
    logmarkerId: (s) => s.logmarker?.split(';')[1] || '',
    logmarkerType: (s) => s.logmarker?.split(';')[2] || '',
  },
  actions: {
    setLanguage(lang: Lang) {
      this.language = lang
      useCookie('opsi-webgui-language').value = lang
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
    setQuickpanelOpened(opened: boolean) {
      this.quickpanelOpened = opened
      useCookie('opsi-webgui-quickpanel-opened').value = opened ? 'true' : 'false'
    },
    setMenuCollapsed(collapsed: boolean) {
      this.menuCollapsed = collapsed
    },
    setIsMobile(isMobile: boolean) {
      this.isMobile = isMobile
    },
    setSplitviewClient(val: boolean) {
      this.splitviewClient = val
    },
    setSplitviewServer(val: boolean) {
      this.splitviewServer = val
    },
    setSecondColumnSelectedRowId(id: string) {
      this.secondColumnSelectedRowId = id
    },
    setColumns(type: TableType, columns: string[]) {
      this.visibleColumns[type] = columns
    },
    setSort(type: TableType, column: string, isDesc: boolean) {
      this.sortColumns[type] = { column, isDesc }
    },
    setFilter(type: TableType, filter: string) {
      this.filterQuery[type] = filter
    },
    toggleFilter(type: TableType, filter: string) {
      this.filterQuery[type] = this.filterQuery[type] === filter ? '' : filter
    },
    resetTable() {
      this.visibleColumns = { ...defaultVisible }
      this.sortColumns = { ...defaultSort }
    },
    setProductActionRequest(key: string, value: string) {
      this.productActionRequest[key] = value
    },
    setProductsLastRequest(url: string, params: unknown, time: number) {
      this.productsLastRequestUrl = url
      this.productsLastRequestParams = params
      this.productsLastRequestTime = time
    },
    setLogmarker(nr: number, id: string) {
      this.logmarker = `${nr};${id};${this.logtype}`
    },
  },
})
