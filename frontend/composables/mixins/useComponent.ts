import { ElNotification } from 'element-plus'
import { _getI18nInComposable } from './helper-i18n'
import { h, type VNode } from 'vue'

type PropTypeFunctionOptionalAsync = (() => Promise<void>) | (() => void)

interface NotificationOptions {
  title?: string
  message?: any
  showClose?: boolean
  duration?: number
  onClose?: () => void
  button?: { label: string; onClick: PropTypeFunctionOptionalAsync }
}

type ElNotificationType = 'success' | 'error' | 'warning' | 'info'
type NotificationType = 'success' | 'error' | 'warning' | 'info' // | 'loading'

export function useNotification() {
  const notifications = ref<any[]>([])
  const clearAllNotification = ref<any>(null)

  const formatMessage = (message: any) => {
    if (typeof message === 'object' && message !== null) {
      return h('pre', {
        innerHTML: Object.entries(message)
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              value = Object.entries(value)
                .map(([k, v]) => (v !== null ? `${k}: ${v}` : ''))
                .filter(Boolean)
                .join('\n')
            }
            return `<b>${key}</b>:\n${value}\n`
          })
          .join('\n'),
        style: { 'white-space': 'pre-wrap' },
      })
    }
    return message
  }

  const _createNotificationContent = (
    type: NotificationType,
    button: any,
    message: any,
  ) => {
    const itemsInNotification = [formatMessage(message)]
    if (button) {
      itemsInNotification.push(
        h(
          'button',
          {
            onClick: button.onClick,
            style: {
              display: 'block',
              width: '100%',
              border: '1px solid #000',
              cursor: 'pointer',
            },
          },
          button.label,
        ),
      )
    }
    const notificationViewItems = h('div', {}, itemsInNotification)
    return notificationViewItems
  }
  const _createNotificationElInstance = (
    instanceType: ElNotificationType,
    useMsgAsHtml: boolean,
    notificationViewItems: VNode,
    autoHideDuration: number,
    title: string,
    showClose = true,
    onClose: (() => void) | undefined,
  ) => {
    const notificationInstance = ElNotification[instanceType]({
      title,
      dangerouslyUseHTMLString: useMsgAsHtml,
      message: notificationViewItems,
      showClose,
      duration: autoHideDuration,
      onClose: () => {
        notifications.value = notifications.value.filter(
          (n: any) => n !== notificationInstance,
        )
        if (onClose) onClose()
        if (notifications.value.length <= 3 && clearAllNotification.value) {
          clearAllNotification.value.close()
          clearAllNotification.value = null
        }
      },
    })
    return notificationInstance
  }
  const createNotification = (type: NotificationType) => {
    return ({
      title,
      message = '',
      showClose = true,
      duration,
      onClose,
      button,
    }: NotificationOptions) => {
      const notificationInstance = ref<any>()
      const buttonObject = { ...button }
      if (buttonObject?.onClick) {
        buttonObject.onClick = () => {
          button?.onClick()
          notificationInstance.value?.close()
        }
      }

      const notificationViewItems = _createNotificationContent(
        type,
        buttonObject,
        message,
      )

      const autoHideDuration = ['success', 'info'].includes(type)
        ? (duration ?? 8000)
        : 0
      if (type === 'error') {
        console.error('NotificationError:', title, message)
      }

      notificationInstance.value = _createNotificationElInstance(
        type,
        false,
        notificationViewItems,
        autoHideDuration,
        title ?? type,
        showClose,
        onClose,
      )

      notifications.value.push(notificationInstance.value)

      if (notifications.value.length > 3 && !clearAllNotification.value) {
        clearAllNotification.value = ElNotification({
          message: h(
            'button',
            {
              onClick: () => {
                notifications.value.forEach((n) => n.close())
                notifications.value = []
                if (clearAllNotification.value) {
                  clearAllNotification.value.close()
                  clearAllNotification.value = null
                }
              },
            },
            'Clear All Notifications',
          ),
          duration: 0,
          showClose: true,
          position: 'bottom-right',
        })
      }
      return notificationInstance.value
    }
  }

  interface NotificationOptionsDetailedRow {
    title?: string
    msg: string
    class?: string
    retryButton?: { label: string; onClick: PropTypeFunctionOptionalAsync }
    tag?: string // default is div
    tagTitle?: string
  }
  interface NotificationOptionsDetailed {
    title: string
    messages: Array<NotificationOptionsDetailedRow>
    wrapperClass?: string
    showClose?: boolean
    duration?: number
    onClose?: () => void
  }
  const createDetailedNotification = () => {
    return ({
      title,
      messages = [], // msg, class, retryButton
      wrapperClass = '', // class for the div holding the messages
      showClose = true,
      duration = 0, // 0 means no auto hide
      onClose,
    }: NotificationOptionsDetailed) => {
      const notificationInstance = ref<any>()

      const notificationMessageItems = ref<Array<any>>([])
      for (const messageRow of messages) {
        notificationMessageItems.value.push(
          h('div', [
            h(messageRow.tagTitle || 'div', {}, messageRow.title),
            h(
              messageRow.tag || 'div',
              { class: messageRow.class },
              messageRow.msg,
            ),
          ]),
        )
      }

      notificationInstance.value = ElNotification({
        title,
        message: h(
          'div',
          { class: wrapperClass },
          notificationMessageItems.value,
        ),
        showClose: showClose,
        duration: duration || 0,
        onClose: onClose,
      })

      return notificationInstance.value
    }
  }

  return {
    notifySuccess: createNotification('success'),
    notifyError: createNotification('error'),
    notifyWarning: createNotification('warning'),
    notifyInfo: createNotification('info'),
    // notifyLoading: createNotification('loading'),
    notifyDetailed: createDetailedNotification(),
  }
}

export const useHoverDropdown = () => {
  function onOver(ref: any) {
    if (ref) {
      ref.visible = true
    }
  }
  function onLeave(ref: any) {
    if (ref) {
      ref.visible = false
    }
  }
  return { onOver, onLeave }
}

export const useScrollListener = (
  refComponent: Ref<HTMLElement | undefined>,
  handleScroll = (...args: any[]) => {
    console.warn('scroll listener not implemented', args)
  },
) => {
  let resizeObserver: any = null
  onMounted(() => {
    if (refComponent.value == undefined) {
      console.error(
        'mount. component for scroll listener undefined',
        handleScroll,
      )
      return
    }

    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(refComponent.value)
    // // handleDebouncedScroll = debounce(handleScroll, 100);
    // refComponent.value.addEventListener('scroll', handleDebouncedScroll);
  })

  function onResize() {
    const h = refComponent.value?.clientHeight + 'px'
    console.warn('resize', h)
  }
  onUnmounted(() => {
    if (resizeObserver !== null) resizeObserver.unobserve(refComponent)
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
  function syncSort(fromSort: any, toSort: any, emitToSort: any, id: any) {
    const sortingCookie = useCookie('sorting_' + id)

    if (fromSort.filterQuery && toSort.filterQuery !== fromSort.filterQuery) {
      toSort.filterQuery = fromSort.filterQuery
    }
    if (fromSort.sortBy && toSort.sortBy !== fromSort.sortBy) {
      toSort.sortBy = fromSort.sortBy
      sortingCookie.value = JSON.stringify({
        sortBy: toSort.sortBy,
        sortDesc: toSort.sortDesc,
      })
      // this.setCookie('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (
      fromSort.sortDesc !== undefined &&
      toSort.sortDesc !== fromSort.sortDesc
    ) {
      toSort.sortDesc = fromSort.sortDesc
      sortingCookie.value = JSON.stringify({
        sortBy: toSort.sortBy,
        sortDesc: toSort.sortDesc,
      })
      // this.setCookie('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (emitToSort) {
      emitToSort('update:sort', toSort)
    }
    // if (emitToSort) { this.$emit('update:sort', toSort) }
  }
  return { syncSort }
}
