/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineStore } from 'pinia'
import { useColorMode } from '@vueuse/core'
import { useCookie } from 'nuxt/app'

type Lang = 'en' | 'de'
type Theme = 'light' | 'dark'
type TableType = 'servers' | 'clients' | 'products'

const defaultVisible = {
  servers: ['selected', 'depotId', 'description', 'type', 'actions'],
  clients: [
    'selected',
    'clientId',
    'version_outdated_localboot',
    'version_outdated_netboot',
    'installationStatus_unknown',
    'installationStatus_installed',
    'actionResult_failed',
    'actionResult_successful',
    'actions',
  ],
  products: [
    'selected',
    'installationStatus',
    'actionResult',
    'productId',
    'version',
    'actionRequest',
    'actions',
  ],
}
const defaultSort = {
  servers: { column: 'depotId', isDesc: false },
  clients: { column: 'clientId', isDesc: false },
  products: { column: 'productId', isDesc: false },
}

export const useUiStore = defineStore('ui', {
  persist: { key: 'opsi-webgui-ui', storage: localStorage },
  state: () => ({
    // General UI
    isMobile: false,
    language: 'en' as Lang,
    theme: (useColorMode().value === 'auto' ? 'light' : useColorMode().value) as Theme,
    quickpanelOpened: true,
    menuCollapsed: false,
    splitviewClient: true,
    splitviewServer: true,

    // Table UI
    visibleColumns: { ...defaultVisible },
    sortColumns: { ...defaultSort },
    filterQuery: { clients: '', products: '' } as Record<string, string>,
    lastSelected: { clients: '', servers: '', products: '' },
    secondColumnSelectedRowId: '',

    // Internal UI
    productActionRequest: {} as Record<string, string>,
    productsLastRequestUrl: '',
    productsLastRequestParams: {} as unknown,
    productsLastRequestTime: 0,

    // Log UI
    logmarker: '-1;;instlog',
    loglevel: 5,
    logtype: 'instlog',
    autofetch: false,
    autoscroll: true,
    syncSelection: true,
  }),
  getters: {
    isLight: (state) => state.theme === 'light',
    getColumns: (state) => (type: TableType) => state.visibleColumns[type],
    getSorting: (state) => (type: TableType) => state.sortColumns[type],
    getFilter: (state) => (type: TableType) => state.filterQuery[type] || '',
    logmarkerNr: (state) => parseInt(String(state.logmarker?.split(';')[0] ?? '-1')) || -1,
    logmarkerId: (state) => state.logmarker?.split(';')[1] || '',
    logmarkerType: (state) => state.logmarker?.split(';')[2] || '',
  },
  actions: {
    // General UI
    setLanguage(lang: Lang) {
      this.language = lang
      useCookie('Language').value = lang
    },
    setTheme(theme: Theme) {
      this.theme = theme
      useColorMode().value = theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
    },
    setQuickpanelOpened(opened: boolean) {
      this.quickpanelOpened = opened
      useCookie('QuickpanelOpened').value = opened ? 'true' : 'false'
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

    // Table UI
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

    // Internal UI
    setProductActionRequest(key: string, value: string) {
      this.productActionRequest[key] = value
    },
    setProductsLastRequest(url: string, params: unknown, time: number) {
      this.productsLastRequestUrl = url
      this.productsLastRequestParams = params
      this.productsLastRequestTime = time
    },
    // Log UI
    setLogmarker(nr: number, id: string) {
      this.logmarker = `${nr};${id};${this.logtype}`
    },
  },
})
