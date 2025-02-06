/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import _, { debounce } from 'lodash'

export const useDynamicHeight = (
  actualDataSize: Ref,
  currentPage: Ref,
  totalItems: Ref,
  tableId: string,
  refetchData: () => void, // if pageSize changes (debounced)
  // fixedPageSize: number | undefined = undefined,
) => {
  const _windowHeight = ref(window.innerHeight)
  const _windowZoom = ref(window.devicePixelRatio)

  const notTableHeight = ref(220) // height of all elements above and below the table, such as toolbar, pagination, calculated in onMounted
  const scrollDivHeight = ref(400) // Height of scroll divs before/after tableRows
  const rowHeight = computed(() => 52.48) // default rowHeight
  const _elHeightMargins = 70 // margins, paddings.. above, below table

  const availableTableHeight = computed(
    () => {
      return Math.min(_windowHeight.value - notTableHeight.value, 3000)
    },
    // 300px includes height of menu, toolbar, pagination... (el-breadcrumb.height, tableHeader.height, el-pagination.height + x)
  )

  const isFirstPage = computed(() => currentPage.value == 1)
  const isLastPage = computed(
    () => currentPage.value * pageSize.value >= totalItems.value,
  )

  const visibleTableHeight = computed(() =>
    // fixed height of infiniteScrollDiv (table will have heigher height, so infiniteScrollDiv will have scroll)
    {
      // if (fixedPageSize) return availableTableHeight.value
      return actualDataSize.value < pageSize.value / 2 &&
        availableTableHeight.value > 1000
        ? Math.min(availableTableHeight.value / 2, 1000)
        : availableTableHeight.value
    },
  )
  const tableHeightMin = computed(() => {
    return scrollDivHeight.value + (rowHeight.value * pageSize.value) / 2
  })
  const tableHeight = computed(() => {
    // calc table height dynamicly, includes scrollDivs (depending on isFirst/last, or if only few rows)
    const scrollDivCount =
      isFirstPage.value && isLastPage.value ? 0 : isFirstPage.value ? 1 : 2
    // if (fixedPageSize) return actualDataSize.value * rowHeight.value + 200
    if (actualDataSize.value < pageSize.value / 2) {
      return visibleTableHeight.value + scrollDivHeight.value * scrollDivCount
    }
    return actualDataSize.value * rowHeight.value + 200
  })

  const debouncedRefetchData = debounce(refetchData, 200)
  function updateWindowValues() {
    setElHeights()
    // Event-Listener for resize & zoom, but only if height changed
    if (window.innerHeight === _windowHeight.value) {
      return
    }
    _windowHeight.value = window.innerHeight
    _windowZoom.value = window.devicePixelRatio
    debouncedRefetchData()
  }

  function setElHeights() {
    // we need to calculate the height of all elements above and below the table to reduce the available space for the table, this needs to be done onMount cause otherwise the elements are not rendered yet
    const _elHeightBTop =
      document.getElementById('btop-header')?.clientHeight ?? 0
    const _elHeightBreadcrumb =
      document.getElementById('globalBreadcrumb')?.clientHeight ?? 0
    const _elHeightTableHeader =
      document.getElementById(`tableHeader-${tableId}`)?.clientHeight ?? 0
    const _elHeightTableFooter =
      document.getElementById(`tableFooter-${tableId}`)?.clientHeight ?? 0
    notTableHeight.value =
      _elHeightBTop +
      _elHeightBreadcrumb +
      _elHeightTableHeader +
      _elHeightTableFooter +
      _elHeightMargins // margins, paddings..
  }

  const pageSize = computed(() => {
    // if (fixedPageSize) return fixedPageSize
    // calc page size dynamicly

    // return Math.floor(
    //   (availableTableHeight.value + notTableHeight.value) / rowHeight.value,
    // )
    return Math.min(
      50, // max page size // othewise it can be too much data for the table
      Math.floor(
        (availableTableHeight.value + notTableHeight.value) / rowHeight.value,
      ),
    )
  })

  return {
    pageSize,
    rowHeight,
    notTableHeight,
    tableHeightMin,
    visibleTableHeight,
    availableTableHeight,
    scrollDivHeight,
    tableHeight,
    isFirstPage,
    isLastPage,
    updateWindowValues,
    setElHeights,
  }
}
