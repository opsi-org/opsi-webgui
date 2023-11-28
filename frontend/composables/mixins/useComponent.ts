// import { Component, Vue } from 'nuxt-property-decorator'
// import { Cookies } from './cookies'
import { ElNotification } from 'element-plus'
const _getI18nInComposable = () => {
  // only 'const {t} = useI18n()" not works for story
  let t = (k: string) => { return k}
  let _t = undefined
  try {
    const t = useI18n({ useScope: 'global'}).t
    if (t != undefined) _t = t
  } catch (error) {
    console.warn(error)
  }
  if (_t !== undefined) t = _t
  console.log('use81n.  t  ', t)
  return t
}
export const useI18nFromComposable = () => {
  // setup
  const t = _getI18nInComposable()
  return {
    f: () => {return t('message.info.event')}
  }
}

const _useNotification = (t: any) => {
  // const t = useNuxtApp().$i18n.t
  // const appContext = getCurrentInstance()?.appContext

  const count = ref(0)
  const _default_options = {
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

  function success (content: string = '') {
    return showToast({
      title: t('message.success.title'),
      content: content || '', // may wanna have a default
      variant: 'success',
      autoHideDelay: 3000
    })
  }

  function warning (content: string = '') {
    return showToast({
      title: t('message.warning.title'),
      content: content || '', // may wanna have a default
      variant: 'warning'
    })
  }

  function info (content: string = '') {
    return showToast({
      title: t('message.info.event'),
      content: content || '', // may wanna have a default
      variant: 'info',
      noAutoHide: true
    })
  }

  function infoMbus (title: string, content: string, reloadAction:any = false) {
    const obj:any = {}
    if (reloadAction !== false) {
      obj.buttons = [{
        text: t('button.reload'),
        tooltip: t('button.reload.tooltip.clients.removeselection'),
        action: reloadAction // shows reload button
      }]
    }
    return showToast({
      title,
      content,
      variant: 'info',
      ...obj
    })
  }

  function error (_error: any, _title: any = undefined) {
    let title
    if (_error?.response?.data && !_title) {
      title = t('message.error.serverresponse.title', { error: _error.response.data.class })
    }
    let error = _error?.response?.data || _error
    console.log(error)
    return showToast({
      title: title || _title || t('message.error.title'),
      variant: 'error',
      autoHideDelay: 30000,
      noAutoHide: false, // will be hidden by next error message
      // noAutoHide: true, // will be hidden by next error message
      // autoHideDelay: true, // will be hidden by next error message
      error_data: error || { message: t('message.error.unknown') }
    })
  }

  function infoList (response: any) {
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

    return showToast({
      title: t('message.info.event'),
      type: 'info',
      noAutoHide: true, // will be hidden by next error message
      components: $elements,
      hideLastErrorToast: true
    })
  }

  function showToast (_obj: any) {
    const obj = { ..._default_options, ..._obj } // overwright defaults
    // if (obj.hideLastErrorToast) { this.hideToast() }

    const $elements:any = []
    const vid = `my-toast-${count.value++}`
    $elements.push(h('div', obj.content))
    if (obj.error_data !== undefined) {
      // Construct toast to be displayed on errors (will hide all toasts before)
      const e = obj.error_data
      if (!obj.title.includes(e.class)) { $elements.push(h('b', e.class)) }
      $elements.push(h('p', e.message))
      if (e.details) {
        const btnDetails = h('ButtonBTNCollapseDetails', {
          props: {
            details: e.details,
            variant: obj.variant,
            buttonText: t('message.error.buttton.details')
          }
        })
        $elements.push(h('div', { class: '' }, [btnDetails]))
      }
    }

    const elements:Array<any> = []
    if (obj.buttons !== undefined) {
      // Create right aligned buttons if defined
      for (let i = 0; i < (obj.buttons as Array<any>).length; i++) {
        elements.push(_create_button(h, vid, obj.variant, obj.buttons[i]))
      }
    }
    if (obj.components !== undefined) {
      // Create right aligned custom components if defined
      elements.push(h('div', {
        class: 'd-flex justify-content-end',
        on: {
          click: () => { hideToast() }
        }
      }, obj.components))
    }
    $elements.push(h('div', { class: 'd-flex justify-content-end' }, elements)) // all elements are right aligned
    // const _showToast = (BToast?.methods as any).showToast
    // const _showToast: any = $bvToast.showToast

    const message = h('div', $elements)
    const data = {
  // setTimeout(() =>
  // {
  //   // The timeout seems to be need, otherwise _bv__toast is undefined.
  //   // const bvToast = instance.ctx._bv__toast as BvToast;
  //   const _showToast: any = instance.ctx._bv__toast.showToast
  //   _showToast($elements, {
      title: `${obj.title}`,
      message,
  //     vid,
      type: obj.variant,
  //     solid: true,
      duration: obj.noAutoHide ? 0 : obj.autoHideDelay,
      showClose: obj.noAutoHide,

      // current workaround, cause colors are not inherits
      // customClass: settings.isLight ? 'bg-light text-black' : 'bg-dark text-dark'
      // customClass: 'bg-inherit text-inherit'
      // --el-notification-title-color
      // --el-notification-content-color

      //     autoHideDelay: obj.autoHideDelay,'
      //     noAutoHide: obj.noAutoHide,
      //     noCloseButton: !obj.noAutoHide
    }
    ElNotification(data)
    // ElNotification(data, appContext)
    return vid
  }

  function hideToast (vid: string|undefined = undefined) {
    // const _hide = (BToast?.methods as any).hide
    // const _hide = $bvToast.hide
    // const _hide: any = instance.ctx._bv__toast.hide
    // _hide(vid)
    ElNotification.closeAll()
  }

  function _create_button (h: any, id:string, variant: string, btnData: any): any {
    const $btn = h('b-button',
      {
        props: { variant: `outline-${variant}`, title: btnData.tooltip },
        // class: `btn btn-outline-${variant}`,
        on: {
          click: () => {
            if (btnData.hide === undefined || btnData.hide === true) { hideToast() }
            if (btnData.action !== undefined) { (btnData.action as Function)() }
          }
        }
      },
      btnData.text
    )
    // $btn.data?.class = `btn btn-outline-${variant}`
    return $btn
  }

  return {
    error,
    success,
    info,
    infoMbus,
    infoList,
    warning
  }
}
export function useNotification() {
  // const { t } = useI18n()
  const t = _getI18nInComposable()
  return _useNotification(t)
}
export const useAlertToast = () => {
  // const { t } = useI18n()
  const t = _getI18nInComposable()
  return _useNotification(t)
}

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
  // TODO check if useCookies is needed instead of useCookie
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
