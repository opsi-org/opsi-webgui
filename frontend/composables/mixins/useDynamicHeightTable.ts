/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
// import _, { debounce } from 'lodash'

import { useDynamicHeight } from './useDynamicHeightWindow'

export const useDynamicHeightTable = (
  actualDataSize: Ref,
  currentPage: Ref,
  totalItems: Ref,
  tableId: string,
  refetchData: () => void, // if pageSize changes (debounced)
) => {
  const notTableHeight = ref(220) // height of all elements above and below the table, such as toolbar, pagination, calculated in onMounted
  const scrollDivHeight = ref(400) // Height of scroll divs before/after tableRows
  const rowHeight = computed(() => 52.48) // default rowHeight
  const _elHeightMargins = 0 // margins, paddings.. above, below table

  const { maxVisibleHeight, updateWindowValues, setElHeights } =
    useDynamicHeight(
      [
        'btop-header',
        'globalBreadcrumb',
        'tableHeader-' + tableId,
        'tableFooter-' + tableId,
      ],
      _elHeightMargins,
      refetchData,
    )

  const isFirstPage = computed(() => currentPage.value == 1)
  const isLastPage = computed(
    () => currentPage.value * pageSize.value >= totalItems.value,
  )

  const visibleTableHeight = computed(() =>
    // fixed height of infiniteScrollDiv (table will have heigher height, so infiniteScrollDiv will have scroll)
    {
      // if (fixedPageSize) return maxVisibleHeight.value
      return actualDataSize.value < pageSize.value / 2 &&
        maxVisibleHeight.value > 1000
        ? Math.min(maxVisibleHeight.value / 2, 1000)
        : maxVisibleHeight.value
    },
  )
  const tableHeightMin = computed(() => {
    return scrollDivHeight.value + (rowHeight.value * pageSize.value) / 2
  })
  const tableHeight = computed(() => {
    // calc table height dynamicly, includes scrollDivs (depending on isFirst/last, or if only few rows)
    const scrollDivCount =
      isFirstPage.value && isLastPage.value ? 0 : isFirstPage.value ? 1 : 2
    if (actualDataSize.value < pageSize.value / 2) {
      return visibleTableHeight.value + scrollDivHeight.value * scrollDivCount
    }
    return actualDataSize.value * rowHeight.value + 200
  })

  const pageSize = computed(() => {
    // calc page size dynamicly
    return Math.min(
      50, // max page size // othewise it can be too much data for the table
      Math.floor(
        (maxVisibleHeight.value + notTableHeight.value) / rowHeight.value,
      ),
    )
  })

  return {
    pageSize,
    rowHeight,
    notTableHeight,
    tableHeightMin,
    visibleTableHeight,
    availableTableHeight: maxVisibleHeight,
    scrollDivHeight,
    tableHeight,
    isFirstPage,
    isLastPage,
    updateWindowValues,
    setElHeights,
  }
}
