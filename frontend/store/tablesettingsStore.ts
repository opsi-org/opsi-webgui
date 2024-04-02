import { defineStore } from 'pinia'
const _data_configLastSelected = { clients: '', servers: '', products: '' }
const _data_visibleColumns = {
  // servers: ['sel', 'depotId', 'description', 'type', 'ip', 'rowactions'], // all columns
  servers: ['sel', 'depotId', 'description', 'type', 'rowactions'],
  // clients: ['sel', 'clientId', 'description', 'ipAddress', 'macAddress', 'lastSeen', 'uefi', '_majorStats', 'reachable', 'rowactions'], // all columns
  // clients: ['sel', 'clientId', 'description', '_majorStats', 'rowactions'],
  clients: ['sel', 'clientId', 'description', '_majorStats', 'rowactions'],
  // products: ['sel', 'productId', 'name', 'description', 'installationStatus', 'actionResult', 'modificationTime', 'priority', 'version', 'actionProgress', 'actionRequest', 'rowactions'], // all columns
  products: ['sel', 'productId', 'installationStatus', 'actionResult', 'version', 'actionRequest', 'rowactions'],
}
const _data_sortColumns = {
  servers: { column: 'depotId', isDesc: false },
  clients: { column: 'clientId', isDesc: false },
  products: { column: 'productId', isDesc: false },
}
// const deepCp = (obj:any) => JSON.parse(JSON.stringify(obj))
const deepCp = (obj:any) => obj

export const storeTablesettings = defineStore('tablesettings', {
  persist: true,
  state: () => ({ // the state objects are stored in localStorage
    _configLastSelected: deepCp(_data_configLastSelected),
    _visibleColumns: deepCp(_data_visibleColumns),
    _sortColumns: deepCp(_data_sortColumns),
    secondColumnSelectedRowId: ''
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
    $reset () {
      console.warn('resetting tablesettings')
      this._configLastSelected = deepCp(_data_configLastSelected)
      this._visibleColumns = deepCp(_data_visibleColumns)
      this._sortColumns = deepCp(_data_sortColumns)
    },
    setSecondColumnSelectedRowId (id:string) {
      this.secondColumnSelectedRowId = id
    },
    setColumns (tabletype:string, value:Array<string>) {
      this._visibleColumns[tabletype] = value
    },
    setSortColumn (tabletype:string, column:string, isDesc:boolean) {
      this._sortColumns[tabletype] = { column, isDesc }
    },
    setConfigLastSelected (tabletype:string, value:string) {
      this._configLastSelected[tabletype] = value
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(storeTablesettings, import.meta.hot));
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
