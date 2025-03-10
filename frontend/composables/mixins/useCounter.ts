/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { useNotification } from '~/composables/mixins/useComponent'
import { useConfigserver } from '~/composables/mixins/useGet'
import { useCallLogout } from '~/composables/mixins/usePost'
import type { TTimeDiff } from '~/types/Datatypes'

export const useTimer = (init: boolean = false) => {
  const authStore = storeAuth()
  const settingsStore = storeSettings()

  const { notifyInfo } = useNotification()
  const router = useRouter()
  const $t = useI18n().t

  const notifyInMilliSec = ref<number>(1)
  const countdowntimer = ref<string>('')
  const first_notification_showed = ref<boolean>(false)
  const notification = ref<any>()
  const intervalId = ref<NodeJS.Timer>()

  notifyInMilliSec.value = (authStore.isAuthenticated ? 5 : -1) * 60000 //  // 5 min
  if (init) initCountdownTimer()
  // onMounted(() => {
  // })

  onBeforeUnmount(() => {
    if (init) clearInterval(intervalId.value)
  })

  function initCountdownTimer() {
    try {
      intervalId.value = setInterval(() => calcTimeout(), 1000)
    } catch (e) {
      console.error('Error in setInterval', e)
    }
  }

  function calcTimeout() {
    const t: TTimeDiff = getRemainingTime()
    countdowntimer.value = getText(t)
    // const time = { min: t.minutes, s: t.seconds }
    if (t.diff <= notifyInMilliSec.value && !first_notification_showed.value) {
      first_notification_showed.value = true
      _createNotification(t)
    } else if (
      t.diff <= notifyInMilliSec.value &&
      first_notification_showed.value
    ) {
      const timerTextElement = document.getElementById('timerText')
      if (timerTextElement) {
        timerTextElement.innerHTML = _getNotificationText(t)
      } else {
        _createNotification(t)
      }
      // notification.value?.
      // TODO: update text every second
      // if (this.refAlert?.showAlert === true) {
      //   this.initRef(time)
      // }
    } else {
      first_notification_showed.value = false
      notification.value?.close()
    }
    if (isNaN(t.diff) || t.diff <= 0 || notifyInMilliSec.value <= 0) {
      if (notification.value) notification.value?.close()
      countdowntimer.value = $t('message.session.expired') as string
      console.error('Session expired')
      try {
        useCallLogout($t).callLogout()
      } catch (e) {
        authStore.logout()
        authStore.clearSession()
        settingsStore.setExpiresInterval(undefined)
        router.push('/login')
        console.warn('Logout failed, cause already logged out', e)
      }
      settingsStore.setExpiresInterval(undefined)
      // clearInterval(intervalId.value)
    }
  }
  function _createNotification(t: TTimeDiff) {
    if (notification.value) notification.value?.close()
    const _notification: any = notifyInfo!({
      title: $t('message.session.info'),
      messageRef: 'timerText',
      message: _getNotificationText(t),
      duration: 0,
      button: {
        label: $t('label.extend'),
        onClick: async () =>
          await (
            await useConfigserver(false, undefined, $t)
          ).getOpsiConfigServerWithHeaders(),
      },
    })
    if (_notification) notification.value = _notification
    else console.error('Notification not created: ', $t('message.session.info'))
  }
  function _getNotificationText(t: TTimeDiff) {
    return $t('message.session.expiresInHours', {
      h: t.hours,
      min: t.minutes,
      s: t.seconds,
    })
  }
  function getText(t: TTimeDiff, small: boolean = true) {
    if (t.days > 0) {
      if (small) {
        return ` ${t.days}d ${t.hours}h ${t.minutes}m ${t.seconds}s`
      } else {
        return $t('message.session.expiresInDays', {
          d: t.days,
          h: t.hours,
          min: t.minutes,
          s: t.seconds,
        }) as string
      }
    } else if (t.hours > 0) {
      if (small === true) {
        return ` ${t.hours}h ${t.minutes}m ${t.seconds}s`
      } else {
        return $t('message.session.expiresInHours', {
          h: t.hours,
          min: t.minutes,
          s: t.seconds,
        }) as string
      }
    } else if (small === true) {
      return `${t.minutes}m ${t.seconds}s`
    }
    return $t('message.session.expiresInMinutes', {
      min: t.minutes,
      s: t.seconds,
    }) as string
  }

  function getRemainingTime(): TTimeDiff {
    const endtime = authStore.sessionEndTime
    if (!endtime) {
      authStore.setSession()
    }
    const diff =
      Date.parse(endtime as unknown as string) -
      Date.parse(new Date() as unknown as string)
    const seconds = Math.floor((diff / 1000) % 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    authStore.setExpiresIn({ diff, days, hours, minutes, seconds })
    return authStore.sessionExpiresIn
  }

  return {
    getText,
  }
}
