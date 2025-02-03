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
  // servers: ['selected', 'depotId', 'description', 'type', 'ip', 'actions'], // all columns
  servers: ['selected', 'depotId', 'description', 'type', 'actions'],
  // clients: [selected, clientId, description, ipAddress, macAddress, lastSeen, uefi, version_outdated_localboot, version_outdated_netboot,installationStatus_unknown, installationStatus_installed, actionResult_failed, actionResult_successful
  //  reachable, actions], // all columns
  // clients: ['selected, 'clientId, 'description, '_majorStats, 'actions'],
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
  // products: ['selected', 'productId', 'name', 'description', 'installationStatus', 'actionResult', 'modificationTime', 'priority', 'version', 'actionProgress', 'actionRequest', 'actions'], // all columns
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
// const deepCp = (obj:any) => JSON.parse(JSON.stringify(obj))
const deepCp = (obj: any) => obj

export const storeTablesettings = defineStore('tablesettings', {
  // persist: false,
  persist: {
    key: 'opsi-tables',
    storage: localStorage,
    // storage: sessionStorage,
  },
  state: () => ({
    // the state objects are stored in localStorage
    _configLastSelected: deepCp(_data_configLastSelected),
    _visibleColumns: deepCp(_data_visibleColumns) as tVisible,
    _sortColumns: deepCp(_data_sortColumns) as tSort,
    secondColumnSelectedRowId: '',
  }),
  getters: {
    serversColumns: ({ _visibleColumns }) => _visibleColumns.servers,
    clientsColumns: ({ _visibleColumns }) => _visibleColumns.clients,
    productsColumns: ({ _visibleColumns }) => _visibleColumns.products,

    serversSorting: ({ _sortColumns }) => _sortColumns.servers,
    clientsSorting: ({ _sortColumns }) => _sortColumns.clients,
    productsSorting: ({ _sortColumns }) => _sortColumns.products,

    configLastSelected: ({ _configLastSelected }) => _configLastSelected,
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
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeTablesettings, import.meta.hot))
}

// export const storeTablesettings = defineStore('tablesettings', () => {
//   // let _multiSelection: boolean = useCookie('MultiSelection').value === 'true' || (useCookie('MultiSelection').value === undefined) || true
//   const _columns: Columns = reactive({
//     clients: [],
//     depots: [],
//     products: [],
//   })

//   // getter
//   const columns = computed(() => _columns)
//   // actions

//   // function setMultiSelection (isMultiSelection: boolean) {
//   //   _multiSelection = isMultiSelection
//   //   // Cookies.options.methods.setCookie('MultiSelection', (isMultiSelection) ? 'true' : 'false')
//   //   useCookie('MultiSelection').value = (isMultiSelection) ? 'true' : 'false'
//   // }

//   function setColumns (tabletype:string, value:Array<string>) {
//     _columns[tabletype] = value
//   }
//   return {
//     /* states */
//     /* getters */ columns
//     /* actions */ , setColumns,
//   }
// }, { persist: true } as any)
