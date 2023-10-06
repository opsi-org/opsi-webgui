import Cookie from 'js-cookie'
import { Component, Vue } from 'nuxt-property-decorator'
import { Cookies } from './cookies'

@Component export class AlertToast extends Vue {
  count:number = 0
  showToast (obj = { title: '', content: '', variant: 'primary', noAutoHide: false, autoHideDelay: 5000, buttons: undefined, components: undefined, error_data: undefined }) {
    // Use a shorter name for `this.$createElement`
    // Create a ID with a incremented count
    const id = `my-toast-${this.count++}`

    const h = this.$createElement
    const $elements:any = []
    // Create the custom reload button
    $elements.push(h('div', obj.content))
    if (obj.error_data !== undefined) {
      const classtitle = (obj.error_data as any).class
      $elements.push(h('b', classtitle))
      $elements.push(h('p', (obj.error_data as any).message))
      // error: JSON.stringify(obj.error_data, null, 2)
      // $elements.push(h('div', { class: 'd-flex justify-content-end' }, [$btn])) // all buttons right alignment
    }
    const elements:Array<any> = []
    if (obj.buttons !== undefined) {
      for (let i = 0; i < (obj.buttons as Array<any>).length; i++) {
        elements.push(this._create_button(h, id, obj.variant, obj.buttons[i]))
      }
    }
    if (obj.components !== undefined) {
      elements.push(h('div', {
        class: 'd-flex justify-content-end',
        on: {
          click: () => { this.$bvToast.hide(id) }
        }
      }, obj.components)) // all buttons right alignment
    }
    $elements.push(h('div', { class: 'd-flex justify-content-end' }, elements)) // all buttons right alignment
    // const $content = h('div', [$btn])
    // Create the toast
    // this.$bvToast.toast(obj.content, {
    this.$bvToast.toast($elements, {
    // this.$bvToast.toast('Content....', {
      title: `${obj.title}`,
      id,
      variant: obj.variant,
      solid: true,
      autoHideDelay: obj.autoHideDelay,
      noAutoHide: obj.noAutoHide,
      noCloseButton: !obj.noAutoHide
    })
  }

  _create_button (h, id:string, variant: string, btnData: any): any {
    const $btn = h('b-button',
      {
        props: { variant: `outline-${variant}`, title: btnData.tooltip },
        // class: `btn btn-outline-${variant}`,
        on: {
          click: () => {
            if (btnData.hide === undefined || btnData.hide === true) { this.$bvToast.hide(id) }
            if (btnData.action !== undefined) { (btnData.action as Function)() }
          }
        }
      } as any,
      btnData.text
    )
    // $btn.data?.class = `btn btn-outline-${variant}`
    return $btn
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
