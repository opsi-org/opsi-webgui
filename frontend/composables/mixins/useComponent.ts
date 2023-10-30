
export const useHoverDropdown = () => {
  function onOver (ref: any) {
    if (ref) {
      ref.visible = true
    }
  }

  function onLeave (ref: any) {
    if (ref) {
      ref.visible = false
    }
  }
  return {onOver, onLeave}
 }

export const useSynchronization = () => {
  // setCookie: any
  function syncSort (fromSort: any, toSort: any, emitToSort: any, id: any) {
    const sortingCookie = useCookie('sorting_' + id)

    if (fromSort.filterQuery && toSort.filterQuery !== fromSort.filterQuery) {
      toSort.filterQuery = fromSort.filterQuery
    }
    if (fromSort.sortBy && toSort.sortBy !== fromSort.sortBy) {
      toSort.sortBy = fromSort.sortBy
      sortingCookie.value = JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc })
      // this.setCookie('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (fromSort.sortDesc !== undefined && toSort.sortDesc !== fromSort.sortDesc) {
      toSort.sortDesc = fromSort.sortDesc
      sortingCookie.value = JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc })
      // this.setCookie('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (emitToSort) { emitToSort('update:sort', toSort) }
    // if (emitToSort) { this.$emit('update:sort', toSort) }
  }
}