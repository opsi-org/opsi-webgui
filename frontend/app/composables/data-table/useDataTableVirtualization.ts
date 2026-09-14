import type { ComputedRef, Ref } from 'vue'

export interface UseDataTableVirtualizationOptions<T> {
  containerRef: Ref<HTMLElement | null>
  rowOffset: Ref<number> | ComputedRef<number>
  rows: Ref<T[]> | ComputedRef<T[]>
}

const VIRTUALIZATION_MIN_ROWS = 60
const VIRTUALIZATION_OVERSCAN = 10
const DEFAULT_ROW_HEIGHT = 30

/**
 * Row virtualization for CoreAppDataTable: renders only the rows near the viewport, padded
 * above/below by spacer rows sized from a single measured row height (see measureRowHeight).
 */
export function useDataTableVirtualization<T>({ containerRef, rowOffset, rows }: UseDataTableVirtualizationOptions<T>) {
  const measuredRowHeight = ref(DEFAULT_ROW_HEIGHT)
  const virtualStart = ref(0)
  const virtualCount = ref(60)
  let rowHeightMeasured = false
  let containerHeight = 0

  const virtualizationActive = computed(() => rowOffset.value > 0 || rows.value.length > VIRTUALIZATION_MIN_ROWS)
  const displayStartIndex = computed(() => (virtualizationActive.value ? virtualStart.value : rowOffset.value))
  const displayRows = computed(() => {
    if (!virtualizationActive.value) return rows.value
    const start = Math.max(0, virtualStart.value - rowOffset.value)
    return rows.value.slice(start, start + virtualCount.value)
  })
  const topSpacerHeight = computed(() => (virtualizationActive.value ? virtualStart.value * measuredRowHeight.value : 0))
  const bottomSpacerHeight = computed(() => {
    if (!virtualizationActive.value) return 0
    const rendered = virtualStart.value + displayRows.value.length
    return Math.max(0, rowOffset.value + rows.value.length - rendered) * measuredRowHeight.value
  })

  function measureRowHeight() {
    if (rowHeightMeasured) return
    const rowEl = containerRef.value?.querySelector('tbody .data-table-row') as HTMLElement | null
    if (!rowEl) return
    const height = rowEl.getBoundingClientRect().height
    if (height > 0) {
      measuredRowHeight.value = height
      rowHeightMeasured = true
    }
  }

  function resetRowHeightMeasurement() {
    rowHeightMeasured = false
  }

  function refreshContainerHeight() {
    containerHeight = containerRef.value?.clientHeight ?? containerHeight
  }

  function updateVirtualWindow() {
    const el = containerRef.value
    if (!el || !virtualizationActive.value) {
      virtualStart.value = rowOffset.value
      return
    }
    measureRowHeight()
    if (!containerHeight) containerHeight = el.clientHeight
    const rowHeight = measuredRowHeight.value || DEFAULT_ROW_HEIGHT
    const visibleCount = Math.ceil(containerHeight / rowHeight) + VIRTUALIZATION_OVERSCAN * 2
    const firstVisible = Math.floor(el.scrollTop / rowHeight) - VIRTUALIZATION_OVERSCAN
    virtualCount.value = visibleCount
    const maxStart = Math.max(rowOffset.value, rowOffset.value + rows.value.length - visibleCount)
    virtualStart.value = Math.max(rowOffset.value, Math.min(firstVisible, maxStart))
  }

  function scrollToTop() {
    virtualStart.value = rowOffset.value
    containerRef.value?.scrollTo({ top: 0 })
  }

  return {
    virtualizationActive,
    displayStartIndex,
    displayRows,
    topSpacerHeight,
    bottomSpacerHeight,
    measureRowHeight,
    resetRowHeightMeasurement,
    refreshContainerHeight,
    updateVirtualWindow,
    scrollToTop,
  }
}
