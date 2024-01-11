import { defineStore } from 'pinia'
import { computed } from 'vue'

interface Columns {
  clients: Array<string>,
  servers: Array<string>,
  products: Array<string>, // or split local /netboot?
}


export const storeTablesettings = defineStore('tablesettings', {
  persist: {
    debug: true,
  },
  state: () => ({
    _configLastSelected: {
      clients: '',
      servers: '',
      products: '',
    },
    _visibleColumns: { // visible columns (beside fixed)
      // servers: ['sel', 'depotId', 'description', 'type', 'ip', 'rowactions'], // all columns
      servers: ['sel', 'depotId', 'description', 'type', 'rowactions'],
      // clients: ['sel', 'clientId', 'description', 'ipAddress', 'macAddress', 'lastSeen', 'uefi', '_majorStats', 'reachable', 'rowactions'], // all columns
      clients: ['sel', 'clientId', 'description', '_majorStats', 'rowactions'],
      // products: ['sel', 'productId', 'name', 'description', 'installationStatus', 'actionResult', 'modificationTime', 'priority', 'version', 'actionProgress', 'actionRequest', 'rowactions'], // all columns
      products: ['sel', 'productId', 'installationStatus', 'actionResult', 'version', 'actionRequest', 'rowactions'],
    } as Columns,
  }),
  getters: {
    // columns: ({ _visibleColumns }) => _visibleColumns,
    // serversColumns: ({ _visibleColumns }) => useCookie('servers_columns', { default: undefined }).value || _visibleColumns.servers,
    serversColumns: ({ _visibleColumns }) => _visibleColumns.servers,
    clientsColumns: ({ _visibleColumns }) => _visibleColumns.clients,
    productsColumns: ({ _visibleColumns }) => _visibleColumns.products,
    configLastSelected: ({ _configLastSelected }) => _configLastSelected,
  },
  actions: {
    setColumns (tabletype:string, value:Array<string>) {
      this._visibleColumns[tabletype] = value
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
