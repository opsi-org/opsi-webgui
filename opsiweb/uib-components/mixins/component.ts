import Cookie from 'js-cookie'
import { Component, Vue } from 'nuxt-property-decorator'
import { Cookies } from './cookies'

@Component export class AlertToast extends Vue {
  count:number = 0
  showToast (obj = { title: '', content: '', variant: 'primary', noAutoHide: false, autoHideDelay: 5000, reload: undefined }) {
    // Use a shorter name for `this.$createElement`
    // Create a ID with a incremented count
    const id = `my-toast-${this.count++}`

    const h = this.$createElement
    const $elements:any = []
    // Create the custom reload button
    $elements.push(h('p', obj.content))
    if (obj.reload !== undefined) {
      const $btn = h('b-button',
        {
          class: `btn btn-${obj.variant} text-center`,
          on: {
            click: () => {
              this.$bvToast.hide(id)
              if (obj.reload !== undefined) { (obj.reload as Function)() }
            }
          }
        },
        this.$t('button.reload') as string
      )
      $elements.push(h('div', { class: 'd-flex justify-content-end' }, [$btn])) // all buttons right alignment
    }
    // const $content = h('div', [$btn])
    // Create the toast
    // this.$bvToast.toast(obj.content, {
    this.$bvToast.toast($elements, {
    // this.$bvToast.toast('Content....', {
      title: `${obj.title}`,
      id,
      variant: obj.variant,
      // noCloseButton: true
      autoHideDelay: obj.autoHideDelay,
      noAutoHide: obj.noAutoHide
    })
  }
}

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
