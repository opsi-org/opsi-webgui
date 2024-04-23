import { id } from "element-plus/es/locales.mjs"
import type { IObjectString2Function } from "~/types/tgeneral"
import type { ITableData } from "~/types/ttable"

export const useTableHelper = (
  tableId: string,
  tableData: Ref<ITableData> | Ref< { [key: string]: ITableData } >,
  fetchedData:Ref<Array<any>>| Ref< { [key: string]: Array<any> } >,
  totalItems: Ref<number>,
  _fetch: Function,
  storeTable: any,
  tableDataType: Ref<string>|undefined = undefined,
) => {
  const isLoading = ref(false)
  const nPages = 2

  const _firstDummyRow = {dummy:true, clientId: 'click to load more', direction: 'prev'}
  const _firstDummyRow2 = {dummy:true, clientId: '', direction: undefined}
  const _lastDummyRow = {dummy:true, clientId: 'click to load more', direction: 'next'}

  const fetchedDataWrapper = computed<any[]>(()=> { return (tableDataType !== undefined) ? fetchedData.value[tableDataType.value] : fetchedData.value })
  const tableDataWrapper = computed(()=> (tableDataType !== undefined) ? tableData.value[tableDataType.value] : tableData.value)

  const maxPage = computed(()=> Math.ceil(totalItems.value/tableDataWrapper.value.perPage) || -1)

  // watch(()=> tableDataWrapper.value, async ()=>{ await fetch ()}, { deep: true})
  watch(()=> tableDataWrapper.value.filterQuery, async ()=>{ await fetch ()}, { deep: true})
  watch(()=> [tableDataWrapper.value.sortBy, tableDataWrapper.value.sortDesc], async ()=>{ await fetch () }, { deep: true})
  // watch(()=> tableDataWrapper.value.sortBy, async ()=>{ await fetch () }, { deep: true})
  // watch(()=> tableDataWrapper.value.sortDesc, async ()=>{await fetch ()}, { deep: true})

  function resetFetchData(val: any[]|undefined = []) {
    if (tableDataType === undefined) {
      fetchedData.value = val
      return
    }
    fetchedData.value[tableDataType.value] = val
  }
  function setTotalItemsAsPerPage (count: number) {
    totalItems.value = count
    if (totalItems.value === 0) {
      return []
    }
    tableDataWrapper.value.perPage = totalItems.value
    updateTableData(tableDataWrapper.value)
  }
  async function fetch (location: string|undefined = undefined) {
    isLoading.value = true

    const visiblePages = Math.ceil(fetchedDataWrapper.value.filter(x=>x.dummy !== true).length / tableDataWrapper.value.perPage)
    // console.warn('useTableHelper:  fetch clients. page', tableDataWrapper.value.pageNumber )
    let direction = location
    if (fetchedDataWrapper.value.length === 0) direction = undefined

    if (direction === undefined || direction === '') {
      resetFetchData()
      const data = await _fetch()
      resetFetchData()
      if (tableDataWrapper.value.pageNumber !== 1) {
        fetchedDataWrapper.value.push(_firstDummyRow)
        fetchedDataWrapper.value.push(_firstDummyRow2)
      }
      fetchedDataWrapper.value.push(...data)
      if (tableDataWrapper.value.pageNumber < maxPage.value) fetchedDataWrapper.value.push(_lastDummyRow)

    } else if (direction === 'next') {
      if (fetchedDataWrapper.value.length > 0 ) {
        if (fetchedDataWrapper.value[0].dummy) fetchedDataWrapper.value.splice(0, 1) // remove first dummy row
        if (fetchedDataWrapper.value[fetchedDataWrapper.value.length-1].dummy) fetchedDataWrapper.value.splice(fetchedDataWrapper.value.length-1, 1) // remove last dummy row
      }
      if (visiblePages >= nPages) {
        fetchedDataWrapper.value.splice(0, tableDataWrapper.value.perPage) // remove first n rows
      }

      // fetchedDataWrapper.value.push(_firstDummyRow)
      if (tableDataWrapper.value.pageNumber > 2){
        fetchedDataWrapper.value.splice(0, 0, _firstDummyRow, _firstDummyRow2)
      }
      fetchedDataWrapper.value.push(...(await _fetch()))
      if (tableDataWrapper.value.pageNumber < maxPage.value) fetchedDataWrapper.value.push(_lastDummyRow)

    } else if (direction === 'prev') {

      if (fetchedDataWrapper.value.length > 0 ) {
        if (fetchedDataWrapper.value[0].dummy) fetchedDataWrapper.value.splice(0, 1) // remove first dummy row
        if (fetchedDataWrapper.value[fetchedDataWrapper.value.length-1].dummy) fetchedDataWrapper.value.splice(fetchedDataWrapper.value.length-1, 1) // remove last dummy row
      }
      if (visiblePages >= nPages) {
        // fetchedDataWrapper.value.splice(0, tableDataWrapper.value.perPage) // remove first n rows
        fetchedDataWrapper.value.splice(fetchedDataWrapper.value.length - tableDataWrapper.value.perPage, tableDataWrapper.value.perPage)
      }
      fetchedDataWrapper.value.unshift(...(await _fetch()))
      if (tableDataWrapper.value.pageNumber !== 1) fetchedDataWrapper.value.unshift(_firstDummyRow, _firstDummyRow2)
      if (maxPage.value-1 > 1 && tableDataWrapper.value.pageNumber < maxPage.value-1) fetchedDataWrapper.value.push(_lastDummyRow)
    }
    tableDataWrapper.value._lastScrollDirection = direction
    isLoading.value = false
  }

  function updateTableData (v: typeof tableDataWrapper.value) {
    for (const key in v) {
      if (JSON.stringify(tableDataWrapper.value[key]) !== JSON.stringify(v[key])) {
        if (v[key])
          tableDataWrapper.value[key] = v[key]
      }
    }
    // tableDataWrapper.value = v
  }
  function sortChanged(v: any) {
    tableDataWrapper.value.sortBy = v.key
    tableDataWrapper.value.sortDesc = v.isDesc
    storeTable.setSortColumn(tableId, v.key, v.isDesc)
    // storeTable.setSortColumn(tableId, 'clientId', true)
  }
  function filterChanged(v: any) {
    tableDataWrapper.value.filterColumns = v.cols
    tableDataWrapper.value.filterQuery = v.vals
  }

  return {
    isLoading,
    fetch,
    setTotalItemsAsPerPage,
    updateTableData,
    sortChanged,
    filterChanged
  }
}