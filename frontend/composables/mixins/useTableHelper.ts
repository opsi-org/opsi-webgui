import { id } from "element-plus/es/locales.mjs"
import type { ITableData } from "~/types/ttable"

export const useTableHelper = (
  tableId: string,
  tableData: Ref<ITableData>,
  fetchedData:any,
  totalItems: Ref<number>,
  _fetch: Function,
  storeTable: any
) => {


  watch(()=> tableData.value.filterQuery, async ()=>{ await fetch ()}, { deep: true})
  watch(()=> tableData.value.sortBy, async ()=>{ await fetch ()}, { deep: true})
  watch(()=> tableData.value.sortDesc, async ()=>{await fetch ()}, { deep: true})

  async function fetch () {
    fetchedData.value = []
    fetchedData.value = await _fetch()
  }
  function updateTableData (v: typeof tableData.value) {
    console.log('tabledata changed total', v)
    tableData.value = v
  }
  function sortChanged(v: any) {
    console.log('onSort table', tableId, 'by', v.key, 'desc', v.isDesc)
    tableData.value.sortBy = v.key
    tableData.value.sortDesc = v.isDesc
    storeTable.setSortColumn(tableId, v.key, v.isDesc)
    // storeTable.setSortColumn(tableId, 'clientId', true)
  }
  function filterChanged(v: any) {
    tableData.value.filterColumns = v.cols
    tableData.value.filterQuery = v.vals
  }
  return {
    updateTableData,
    sortChanged,
    filterChanged
  }
}