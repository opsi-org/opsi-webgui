/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
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
  messageRef?: string
  button?: { label: string; onClick: PropTypeFunctionOptionalAsync }
}

type ElNotificationType = 'success' | 'error' | 'warning' | 'info'
type NotificationType = 'success' | 'error' | 'warning' | 'info' // | 'loading'

export function useNotification() {
  const notifications = ref<any[]>([])
  const clearAllNotification = ref<any>(null)
  let authStore: any = null
  const formatMessage = (message: any, messageRef: string | undefined = undefined) => {
    if (typeof message === 'object' && message !== null) {
      return h('pre', {
        ref: messageRef,
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
    return h('p', { ref: messageRef, id: messageRef }, message) // simple
  }

  const _createNotificationContent = (
    type: NotificationType,
    button: any,
    message: any,
    messageRef: string | undefined
  ) => {
    const itemsInNotification = [formatMessage(message, messageRef)]
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
          button.label
        )
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
    onClose: (() => void) | undefined
  ) => {
    const notificationInstance = ElNotification[instanceType]({
      title,
      dangerouslyUseHTMLString: useMsgAsHtml,
      message: notificationViewItems,
      showClose,
      duration: autoHideDuration,
      onClose: () => {
        notifications.value = notifications.value.filter((n: any) => n !== notificationInstance)
        if (onClose) onClose()
        if (notifications.value.length <= 3 && clearAllNotification.value) {
          clearAllNotification.value.close()
          clearAllNotification.value = null
        }
      },
    })
    return notificationInstance
  }
  const _checkAuth = () => {
    authStore = null
    try {
      authStore = storeAuth()
    } catch {
      console.error('useNotification: storeAuth not available')
      return true
    }

    return authStore == null || storeAuth().errorLoggedOutShown
  }
  const createNotification = (type: NotificationType) => {
    return ({
      title,
      message = '',
      showClose = true,
      duration,
      onClose,
      button,
      messageRef = undefined,
    }: NotificationOptions) => {
      const notificationInstance = ref<any>()

      console.warn('createNotification', type, ' checkAuth', _checkAuth())
      if (_checkAuth()) {
        console.warn('Notify: ', title, message)
        return notificationInstance
        // return (args: NotificationOptions) => {
        // }
      }

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
        messageRef
      )

      const autoHideDuration = ['success', 'info', 'warning'].includes(type)
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
        onClose
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
            'Clear All Notifications'
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
            h(messageRow.tag || 'div', { class: messageRow.class }, messageRow.msg),
          ])
        )
      }

      notificationInstance.value = ElNotification({
        title,
        message: h('div', { class: wrapperClass }, notificationMessageItems.value),
        showClose: showClose,
        duration: duration || 0,
        onClose: onClose,
      })

      return notificationInstance.value
    }
  }
  const closeAll = () => {
    // do not work.....
    notifications.value.forEach((n) => n.close())
    notifications.value = []
    if (clearAllNotification.value) {
      clearAllNotification.value.close()
      clearAllNotification.value = null
    }
  }
  return {
    notifySuccess: createNotification('success'),
    notifyError: createNotification('error'),
    notifyWarning: createNotification('warning'),
    notifyInfo: createNotification('info'),
    // notifyLoading: createNotification('loading'),
    notifyDetailed: createDetailedNotification(),
    closeAll,
  }
}
