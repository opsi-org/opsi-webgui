import { id } from "element-plus/es/locales.mjs"
import type { ITableData } from "~/types/ttable"

export const useTableHelper = (
  tableId: string,
  tableData: Ref<ITableData>,
  fetchedData:Ref<Array<any>>,
  totalItems: Ref<number>,
  _fetch: Function,
  storeTable: any
) => {
  const isLoading = ref(false)
  const nPages = 2

  const _firstDummyRow = {dummy:true, clientId: 'click to load more', direction: 'prev'}
  const _lastDummyRow = {dummy:true, clientId: 'click to load more', direction: 'next'}

  const maxPage = computed(()=> Math.ceil(totalItems.value/tableData.value.perPage) || -1)
  watch(()=> tableData.value.filterQuery, async ()=>{ await fetch ()}, { deep: true})
  watch(()=> tableData.value.sortBy, async ()=>{ await fetch ()}, { deep: true})
  watch(()=> tableData.value.sortDesc, async ()=>{await fetch ()}, { deep: true})

  async function fetch (location: string|undefined = undefined) {
    isLoading.value = true

    const visiblePages = Math.ceil(fetchedData.value.filter(x=>x.dummy !== true).length / tableData.value.perPage)
    // console.warn('useTableHelper:  fetch clients. page', tableData.value.pageNumber )
    let direction = location
    if (fetchedData.value.length === 0) direction = undefined

    log().log_colored('darkgreen', 'useTableHelper: fetch clients. page', tableData.value.pageNumber)

    if (direction === undefined || direction === '') {
      log().log_colored('gray', 'only this page / reset')
      fetchedData.value = []
      const data =  await _fetch()
      fetchedData.value =  []
      if (tableData.value.pageNumber !== 1) fetchedData.value.push(_firstDummyRow)
      fetchedData.value.push(...data)
      log().log_colored('gray', 'pageNumber', tableData.value.pageNumber, 'maxPage', maxPage.value)
      if (tableData.value.pageNumber < maxPage.value) fetchedData.value.push(_lastDummyRow)

    } else if (direction === 'next') {
      console.log('next / append data to end of array', visiblePages)
      if (fetchedData.value.length > 0 ) {
        log().log_colored('orange', 'next / remove last dummy row')
        if (fetchedData.value[0].dummy) fetchedData.value.splice(0, 1) // remove first dummy row
        if (fetchedData.value[fetchedData.value.length-1].dummy) fetchedData.value.splice(fetchedData.value.length-1, 1) // remove last dummy row
      }
      if (visiblePages >= nPages) {
        log().log_colored('orange', 'next / remove first n rows')
        fetchedData.value.splice(0, tableData.value.perPage) // remove first n rows
      }

      // fetchedData.value.push(_firstDummyRow)
      if (tableData.value.pageNumber > 2) fetchedData.value.splice(0, 0, _firstDummyRow)
      fetchedData.value.push(...(await _fetch()))
      if (tableData.value.pageNumber < maxPage.value) fetchedData.value.push(_lastDummyRow)

    } else if (direction === 'prev') {

      if (fetchedData.value.length > 0 ) {
        log().log_colored('orange', 'next / remove last dummy row')
        if (fetchedData.value[0].dummy) fetchedData.value.splice(0, 1) // remove first dummy row
        if (fetchedData.value[fetchedData.value.length-1].dummy) fetchedData.value.splice(fetchedData.value.length-1, 1) // remove last dummy row
      }
      if (visiblePages >= nPages) {
        // fetchedData.value.splice(0, tableData.value.perPage) // remove first n rows
        fetchedData.value.splice(fetchedData.value.length - tableData.value.perPage, tableData.value.perPage)
      }
      fetchedData.value.unshift(...(await _fetch()))
      if (tableData.value.pageNumber !== 1) fetchedData.value.unshift(_firstDummyRow)
      if (maxPage.value-1 > 1 && tableData.value.pageNumber < maxPage.value-1) fetchedData.value.push(_lastDummyRow)
    }
    tableData.value._lastScrollDirection = direction
    isLoading.value = false
  }

  function updateTableData (v: typeof tableData.value) {
    for (const key in v) {
      if (JSON.stringify(tableData.value[key]) !== JSON.stringify(v[key])) {
        log().log_colored('orange', 'tabledata changed key', key, 'value', v[key], 'oldvalue', tableData.value[key])
        tableData.value[key] = v[key]
      }
    }
    console.log('tabledata changed', v)
    // tableData.value = v
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
    isLoading,
    fetch,
    updateTableData,
    sortChanged,
    filterChanged
  }
}