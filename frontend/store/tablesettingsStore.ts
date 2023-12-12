import { defineStore } from 'pinia'
import { computed } from 'vue'

interface Columns {
  clients: Array<string>,
  depots: Array<string>,
  // products: Array<string>, // or split local /netboot?
}

export const storeTablesettings = defineStore('tablesettings', () => {
  // let _multiSelection: boolean = useCookie('MultiSelection').value === 'true' || (useCookie('MultiSelection').value === undefined) || true
  const _columns: Columns = reactive({
    clients: [],
    depots: [],
    products: [],
  })

  // getter
  const columns = computed(() => _columns)
  // actions

  // function setMultiSelection (isMultiSelection: boolean) {
  //   _multiSelection = isMultiSelection
  //   // Cookies.options.methods.setCookie('MultiSelection', (isMultiSelection) ? 'true' : 'false')
  //   useCookie('MultiSelection').value = (isMultiSelection) ? 'true' : 'false'
  // }

  function setColumns (tabletype:string, value:Array<string>) {
    _columns[tabletype] = value
  }
  return {
    /* states */
    /* getters */ columns
    /* actions */ , setColumns,
  }
}, { persist: true } as any)
