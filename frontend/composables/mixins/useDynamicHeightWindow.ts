/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import _, { debounce } from 'lodash'

/**
 * Composable to calculate dynamic height of a window based on the available space in the window.
 * It calculates the height of all elements above and below the table to reduce the available space for the table.
 * @param reduceIds
 * @param correctionFactor
 * @param refetchData
 * @returns
 */
export const useDynamicHeight = (
  reduceIds: string[],
  correctionFactor: number = 0,
  refetchData: () => void = () => {}
) => {
  const debouncedRefetchData = debounce(refetchData, 200)
  const _windowHeight = ref(window.innerHeight)
  const _windowZoom = ref(window.devicePixelRatio)

  const reduceHeightBy = ref(220) // height of all elements above and below the table, such as toolbar, pagination, calculated in onMounted
  const _elHeightMargins = 70 // margins, paddings.. above, below table

  const maxVisibleHeight = computed<number>(() => {
    // return _windowHeight.value - reduceHeightBy.value
    return Math.min(_windowHeight.value - reduceHeightBy.value, 3000)
  })

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
    let _reduceBy = 0
    for (const id of reduceIds) {
      const el = document.getElementById(id)
      if (el) {
        _reduceBy += el.clientHeight
      }
    }
    reduceHeightBy.value = _reduceBy + _elHeightMargins + correctionFactor // margins, paddings..
  }
  onMounted(() => {
    setElHeights()
  })

  return {
    maxVisibleHeight,
    reduceHeightBy,
    updateWindowValues,
    setElHeights,
  }
}
