import Cookie from 'js-cookie'
import { Component, Vue } from 'nuxt-property-decorator'
import { Cookies } from './cookies'

@Component export class HoverDropdown extends Vue {
  onOver (ref) {
    if (ref) {
      ref.visible = true
    }
  }

  onLeave (ref) {
    if (ref) {
      ref.visible = false
    }
  }
}

@Component({ mixins: [Cookies] }) export class Synchronization extends Vue {
  setCookie: any
  syncSort (fromSort, toSort, emitToSort, id) {
    if (fromSort.filterQuery && toSort.filterQuery !== fromSort.filterQuery) {
      toSort.filterQuery = fromSort.filterQuery
    }
    if (fromSort.sortBy && toSort.sortBy !== fromSort.sortBy) {
      toSort.sortBy = fromSort.sortBy
      this.setCookie('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (fromSort.sortDesc !== undefined && toSort.sortDesc !== fromSort.sortDesc) {
      toSort.sortDesc = fromSort.sortDesc
      this.setCookie('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (emitToSort) { this.$emit('update:sort', toSort) }
  }
}
