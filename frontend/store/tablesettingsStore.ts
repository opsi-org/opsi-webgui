/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { defineStore } from 'pinia'
type tTableType = 'servers' | 'clients' | 'products'
interface tVisible {
  servers: Array<string>
  clients: Array<string>
  products: Array<string>
}
interface tSortItem {
  column: string
  isDesc: boolean
}
interface tSort {
  servers: tSortItem
  clients: tSortItem
  products: tSortItem
}
const _data_configLastSelected = { clients: '', servers: '', products: '' }
const _data_visibleColumns: tVisible = {
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
const _data_sortColumns: tSort = {
  servers: { column: 'depotId', isDesc: false },
  clients: { column: 'clientId', isDesc: false },
  products: { column: 'productId', isDesc: false },
}
const _data_settings = {
  // e.g. for border changing
  servers: {} as Record<string, any>,
  clients: { statisticIcons: true, reachableAllClients: false } as Record<string, any>,
  products: {} as Record<string, any>,
}
const _filterQuery = {
  //servers: '',
  clients: '',
  products: '',
}
const deepCp = (obj: any) => obj

export const storeTablesettings = defineStore('tablesettings', {
  persist: {
    key: 'opsi-tables',
    storage: localStorage,
  },
  state: () => ({
    // the state objects are stored in localStorage
    _configLastSelected: deepCp(_data_configLastSelected),
    _visibleColumns: deepCp(_data_visibleColumns) as tVisible,
    _sortColumns: deepCp(_data_sortColumns) as tSort,
    _settings: deepCp(_data_settings),
    _filterQuery: deepCp(_filterQuery) as Record<string, string>,
    secondColumnSelectedRowId: '',
  }),
  getters: {
    serversColumns: ({ _visibleColumns }) => _visibleColumns.servers,
    clientsColumns: ({ _visibleColumns }) => _visibleColumns.clients,
    productsColumns: ({ _visibleColumns }) => _visibleColumns.products,

    serversSorting: ({ _sortColumns }) => _sortColumns.servers,
    clientsSorting: ({ _sortColumns }) => _sortColumns.clients,
    productsSorting: ({ _sortColumns }) => _sortColumns.products,

    otherSettings: ({ _settings }) => _settings,

    configLastSelected: ({ _configLastSelected }) => _configLastSelected,

    filterQuery: ({ _filterQuery }) => _filterQuery,
  },
  actions: {
    $reset() {
      console.warn('resetting tablesettings')
      this._configLastSelected = deepCp(_data_configLastSelected)
      this._visibleColumns = deepCp(_data_visibleColumns)
      this._sortColumns = deepCp(_data_sortColumns)
    },
    setSecondColumnSelectedRowId(id: string) {
      this.secondColumnSelectedRowId = id
    },
    setColumns(tabletype: tTableType, value: Array<string>) {
      this._visibleColumns[tabletype] = value
    },
    setSortColumn(tabletype: tTableType, column: string, isDesc: boolean) {
      this._sortColumns[tabletype] = { column, isDesc } as tSortItem
    },
    setConfigLastSelected(tabletype: string, value: string) {
      this._configLastSelected[tabletype] = value
    },
    getFilter(groupTable: 'ProductGroup' | 'HostGroup') {
      const ttype = groupTable === 'ProductGroup' ? 'products' : 'clients'
      return this._filterQuery[ttype]
    },
    setFilter(groupTable: 'ProductGroup' | 'HostGroup', filter: string) {
      const ttype = groupTable === 'ProductGroup' ? 'products' : 'clients'
      this._filterQuery[ttype] = filter
    },
    toggleFilter(groupTable: 'ProductGroup' | 'HostGroup', filter: string) {
      const ttype = groupTable === 'ProductGroup' ? 'products' : 'clients'
      if (this._filterQuery[ttype] === filter) {
        this._filterQuery[ttype] = ''
      } else {
        this._filterQuery[ttype] = filter
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeTablesettings, import.meta.hot))
}
