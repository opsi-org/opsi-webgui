import { ElNotification } from 'element-plus'
import { _getI18nInComposable } from './helper-i18n'
import { h } from 'vue';

interface NotificationOptions {
  title?: string;
  message?: any;
  showClose?: boolean;
  duration?: number;
  onClose?: () => void;
  button?: { label: string; onClick: () => void; };
}

export function useNotification() {
  const notification = ref();

  const createNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    return ({ title, message = '', showClose = true, duration, onClose, button }: NotificationOptions) => {
        let customMessage = message && typeof message === 'object' && message !== null ?
          h('pre', {
            innerHTML:
              Object.entries(message)
                .map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) {
                    value = Object.entries(value)
                      .map(([k, v]) => v !== null ? `${k}: ${v}` : '')
                      .filter(Boolean)
                      .join('\n');
                  }
                  return `<b>${key}</b>:\n${value}\n`;
                })
                .join('\n'),
            style: { 'white-space': 'pre-wrap' } })
          : message


      if (button) {
        customMessage = h('div', {}, [
          customMessage,
          h('button', {
            onClick: button.onClick,
            style: {
              display: 'block',
              width: '100%',
              border: '1px solid #000',
              cursor: 'pointer'
            }
          }, button.label)
        ])
      }

      const autoHideDuration = type === 'success' ? (duration ?? 8000) : 0 // 0 means no Auto Hide

      notification.value = ElNotification[type]({
        title,
        message: customMessage,
        showClose,
        duration: autoHideDuration,
        onClose,
      })
    }
  }

  return {
    notifySuccess: createNotification('success'),
    notifyError: createNotification('error'),
    notifyWarning: createNotification('warning'),
    notifyInfo: createNotification('info'),
  }
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


import debounce from 'lodash/debounce'
export const useScrollListener = (refComponent: Ref<HTMLElement|undefined>, handleScroll = (...args: any[]) => {}) => {
  // const handleDebouncedScroll = debounce(handleScroll, 100)
  let resizeObserver: any = null
  onMounted(() => {
    if (refComponent.value == undefined) {
      console.error('mount. component for scroll listener undefined')
      return
    }

    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(refComponent.value)
    // // handleDebouncedScroll = debounce(handleScroll, 100);
    // refComponent.value.addEventListener('scroll', handleDebouncedScroll);
  })

  function onResize() {
    const h = refComponent.value?.clientHeight + 'px'
  }
  onUnmounted(() => {
    if (resizeObserver !== null)
    resizeObserver.unobserve(refComponent)
    // if (refComponent.value == undefined) {
    //   console.error('unmount. component for scroll listener undefined')
    //   return
    // }
    // // I switched the example from `destroyed` to `beforeDestroy`
    // // to exercise your mind a bit. This lifecycle method works too.
    // refComponent.value.removeEventListener('scroll', handleDebouncedScroll);
  })
  // return {handleDebouncedScroll}
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

