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
  let errorsStore: any = null
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
      const notAvailable = authStore == null || storeAuth().errorLoggedOutShown
      if (notAvailable) throw new Error('storeAuth is null')
      return notAvailable
    } catch {
      console.error('useNotification: storeAuth not available')
      return true
    }
  }
  const _checkErrorStore = () => {
    errorsStore = null
    try {
      errorsStore = storeErrors()
      const notAvailable = errorsStore == null
      if (notAvailable) throw new Error('storeErrors is null')
      return notAvailable
    } catch {
      console.error('useNotification: storeErrors not available')
      return true
    }
  }
  const createNotification = (type: NotificationType) => {
    return ({
      title,
      message = '' as any, // can be string or object
      showClose = true,
      duration,
      onClose,
      button,
      messageRef = undefined,
    }: NotificationOptions) => {
      const notificationInstance = ref<any>()

      if (_checkAuth()) return notificationInstance
      if (_checkErrorStore()) return notificationInstance

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

      // get keys of _combine_notifications where value is true
      const combinedTypes = errorsStore?._combine_notifications
        ? Object.keys(errorsStore._combine_notifications).filter(
            (key) => errorsStore._combine_notifications[key]
          )
        : []
      // check if type can be combined
      if (combinedTypes.includes(type)) {
        if (type === 'error') {
          console.error('NotificationError:', title, message)
        } else if (type === 'warning') {
          console.warn('NotificationWarning:', title, message)
        }
        // init message
        if (errorsStore._error_log[type] == undefined) {
          errorsStore._error_log[type] = []
        }
        errorsStore._error_log[type].push({
          type: type,
          title: title,
          message,
          timestamp: Date.now(),
          showed: false,
        })
        // show single or combined notification
        const res = _handleCombinedNotification(
          type,
          title,
          message,
          buttonObject,
          messageRef,
          autoHideDuration,
          showClose,
          onClose
        )
        return res
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
  const _handleCombinedNotification = (
    type: ElNotificationType,
    title: string | undefined,
    message: any,
    buttonObject: any,
    messageRef: string | undefined,
    autoHideDuration: number,
    showClose: boolean,
    onClose: (() => void) | undefined
  ) => {
    const now = Date.now()
    //const lastError = errorsStore._error_log?.[errorsStore._error_log.length - 1]
    const lastError = errorsStore._error_log?.[type]?.[errorsStore._error_log?.[type]?.length - 2]

    if (lastError && now - lastError.timestamp < errorsStore._time_combine_notifications_ms) {
      // Kombiniere Fehler
      if (Array.isArray(lastError.messages)) {
        lastError.messages.push({ title, message, timestamp: now })
      } else {
        lastError.messages = []
        for (const msg of errorsStore._error_log[type]) {
          lastError.messages.push({
            title: msg.title,
            message: msg.message,
            timestamp: msg.timestamp,
          })
        }
      }
      lastError.timestamp = now // Update timestamp

      // Notification-Content als Liste erzeugen
      const listContent = h(
        'ul',
        {},
        lastError.messages.map((msg: any) => {
          const prefix = msg.title
            ? `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.title}: `
            : `[${new Date(msg.timestamp).toLocaleTimeString()}] `
          if (!(msg.message instanceof Object && Object.keys(msg.message).length > 1)) {
            // message ist ein String oder primitive
            return h('li', {}, prefix + (msg.message?.message ?? msg.message))
          } else {
            // message ist ein Objekt: Erstelle eine verschachtelte ul
            return h('li', {}, [
              prefix,
              h(
                'ul',
                {},
                Object.keys(msg.message).map((key) => h('li', {}, `${key}: ${msg.message[key]}`))
              ),
            ])
          }
        })
      )
      // Notification updaten (z.B. mit ElementPlus: ElNotification hat keine update-Methode, daher ggf. neu anzeigen)
      // sleep a few seconds, so that the ui does not flicker
      //useUtils().delay(2 * 1000)

      errorsStore._last_error[type]?.close()
      lastError.notificationInstance?.close()
      const globalTitle = type + ' (combined)'
      lastError.notificationInstance = ElNotification[type]({
        title: globalTitle,
        message: listContent,
        showClose: showClose,
        dangerouslyUseHTMLString: true, // allow HTML in message
        duration: autoHideDuration || 0,
      })
      errorsStore._last_error[type] = lastError.notificationInstance
      return lastError.notificationInstance
    } else {
      // Neuer Fehler
      errorsStore._error_log[type] = [] // init
      const errorEntry = {
        title,
        message,
        timestamp: now,
        notificationInstance: undefined as any,
      }
      errorsStore._error_log[type].push(errorEntry)
      // Notification erzeugen
      errorEntry.notificationInstance = _createNotificationElInstance(
        type,
        false,
        /* notificationViewItems: */ _createNotificationContent(
          type,
          buttonObject,
          message,
          messageRef
        ),
        autoHideDuration,
        title ?? type,
        showClose,
        onClose
      )

      errorsStore._last_error[type] = errorEntry.notificationInstance
      notifications.value.push(errorEntry.notificationInstance)
      return errorEntry.notificationInstance
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
