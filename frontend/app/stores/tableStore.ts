/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { defineStore } from 'pinia'
type TableType = 'servers' | 'clients' | 'products'
type SortItem = { column: string; isDesc: boolean }
type VisibleColumns = Record<TableType, string[]>
type SortColumns = Record<TableType, SortItem>
type TableSettings = Record<TableType, Record<string, any>>

const defaultVisible: VisibleColumns = {
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
const defaultSort: SortColumns = {
  servers: { column: 'depotId', isDesc: false },
  clients: { column: 'clientId', isDesc: false },
  products: { column: 'productId', isDesc: false },
}
const defaultSettings: TableSettings = {
  servers: {},
  clients: { statisticIcons: true, reachableAllClients: false },
  products: {},
}

export const useTableStore = defineStore('table', {
  persist: { key: 'opsi-table', storage: localStorage },
  state: () => ({
    visibleColumns: { ...defaultVisible },
    sortColumns: { ...defaultSort },
    settings: { ...defaultSettings },
    filterQuery: { clients: '', products: '' } as Record<string, string>,
    lastSelected: { clients: '', servers: '', products: '' },
    secondColumnSelectedRowId: '',
  }),
  getters: {
    getColumns: (state) => (type: TableType) => state.visibleColumns[type],
    getSorting: (state) => (type: TableType) => state.sortColumns[type],
    getSettings: (state) => (type: TableType) => state.settings[type],
    getFilter: (state) => (type: TableType) => state.filterQuery[type] || '',
  },
  actions: {
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
    reset() {
      this.visibleColumns = { ...defaultVisible }
      this.sortColumns = { ...defaultSort }
      this.settings = { ...defaultSettings }
    },
  },
})
