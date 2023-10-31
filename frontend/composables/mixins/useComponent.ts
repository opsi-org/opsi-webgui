import { Component, Vue } from 'nuxt-property-decorator'
import { Cookies } from './cookies'

@Component export class AlertToast extends Vue {
  count:number = 0
  default_options = {
    title: '',
    content: '',
    variant: 'primary',
    noAutoHide: false,
    autoHideDelay: 5000,
    buttons: undefined,
    components: undefined,
    error_data: undefined,
    hideLastErrorToast: true
  }

  showToastSuccess (content: string = '') {
    // const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    // ref.alert(this.$t('message.success.title'), 'success', response)
    return this.showToast({
      title: this.$t('message.success.title') as string,
      content: content || '', // may wanna have a default
      variant: 'success',
      autoHideDelay: 3000
    })
  }

  showToastWarning (content: string = '') {
    return this.showToast({
      title: this.$t('message.warning.title') as string,
      content: content || '', // may wanna have a default
      variant: 'warning'
    })
  }

  showToastInfo (content: string = '') {
    // const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    // ref.alert(this.$t('message.success.title'), 'success', response)
    return this.showToast({
      title: this.$t('message.info.event') as string,
      content: content || '', // may wanna have a default
      variant: 'info',
      noAutoHide: true
    })
  }

  showToastMbus (title: string, content: string, reloadAction:any = false) {
    const obj:any = {}
    if (reloadAction !== false) {
      obj.buttons = [{
        text: this.$t('button.reload') as string,
        tooltip: this.$t('button.reload.tooltip.clients.removeselection') as string,
        action: reloadAction // shows reload button
      }]
    }
    return this.showToast({
      title,
      content,
      variant: 'info',
      ...obj
    })
  }

  showToastError (_error: any, _title: any = undefined) {
    // const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
    // const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
    // ref.alert(this.$t('message.error.title'), 'danger', detailedError)
    let title
    if (_error?.response?.data && !_title) {
      title = this.$t('message.error.serverresponse.title', { error: _error.response.data.class })
    }
    return this.showToast({
      title: title || _title || this.$t('message.error.title'),
      variant: 'danger',
      noAutoHide: true, // will be hidden by next error message
      error_data: _error?.response?.data || { message: this.$t('message.error.unknown') }
    })
  }

  showToastInfoList (response: any) {
    /* response structure:
    {
        "test-101.uib.local": {
            "result": null,
            "error": "Backend unaccomplishable error: Failed to get ip address for host 'test-101.uib.local'"
        },
        "test-13.uib.local": {
            "result": null,
            "error": "Backend unaccomplishable error: Failed to get ip address for host 'test-13.uib.local'"
        }
    }
    */
    const $elements:any = []
    const $rows:any = []
    const h = this.$createElement
    const keys = Object.keys(response)
    for (const k in keys) {
      const $key = h('b', keys[k])
      const v = response[keys[k]].error ? 'danger' : 'success'
      const msg = response[keys[k]].error ? response[keys[k]].error : response[keys[k]].result
      const $msg = h('p', msg)
      $rows.push(h('b-list-group-item', {
        props: { variant: v },
        style: { 'background-color': 'transparent !important' }
      }, [$key, $msg]))
    }
    $elements.push(h('b-list-group', $rows))

    return this.showToast({
      title: this.$t('message.info.event'),
      variant: 'info',
      noAutoHide: true, // will be hidden by next error message
      components: $elements,
      hideLastErrorToast: true
    })
  }

  showToast (_obj: any) {
    const obj = { ...this.default_options, ..._obj } // overwright defaults
    // if (obj.hideLastErrorToast) { this.hideToast() }

    const h = this.$createElement
    const $elements:any = []
    const vid = `my-toast-${this.count++}`
    $elements.push(h('div', obj.content))
    if (obj.error_data !== undefined) {
      // Construct toast to be displayed on errors (will hide all toasts before)
      const e = obj.error_data as any
      if (!obj.title.includes(e.class)) { $elements.push(h('b', e.class)) }
      $elements.push(h('p', e.message))
      if (e.details) {
        const btnDetails = h('ButtonBTNCollapseDetails', {
          props: {
            details: e.details,
            variant: obj.variant,
            buttonText: this.$t('message.error.buttton.details')
          }
        })
        $elements.push(h('div', { class: '' }, [btnDetails]))
      }
    }

    const elements:Array<any> = []
    if (obj.buttons !== undefined) {
      // Create right aligned buttons if defined
      for (let i = 0; i < (obj.buttons as Array<any>).length; i++) {
        elements.push(this._create_button(h, vid, obj.variant, obj.buttons[i]))
      }
    }
    if (obj.components !== undefined) {
      // Create right aligned custom components if defined
      elements.push(h('div', {
        class: 'd-flex justify-content-end',
        on: {
          click: () => { this.hideToast() }
        }
      }, obj.components))
    }
    $elements.push(h('div', { class: 'd-flex justify-content-end' }, elements)) // all elements are right aligned

    this.$bvToast.toast($elements, {
      title: `${obj.title}`,
      vid,
      variant: obj.variant,
      solid: true,
      autoHideDelay: obj.autoHideDelay,
      noAutoHide: obj.noAutoHide,
      noCloseButton: !obj.noAutoHide
    })
    return vid
  }

  hideToast (vid: string|undefined = undefined) {
    this.$bvToast.hide(vid)
  }

  _create_button (h, id:string, variant: string, btnData: any): any {
    const $btn = h('b-button',
      {
        props: { variant: `outline-${variant}`, title: btnData.tooltip },
        // class: `btn btn-outline-${variant}`,
        on: {
          click: () => {
            if (btnData.hide === undefined || btnData.hide === true) { this.hideToast() }
            if (btnData.action !== undefined) { (btnData.action as Function)() }
          }
        }
      },
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
