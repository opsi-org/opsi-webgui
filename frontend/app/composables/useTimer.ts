/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { ref, onBeforeUnmount } from 'vue'
import { useNotification } from '~/composables/mixins/useComponent'
import { useConfigserver } from '~/composables/mixins/useGet'
import { useCallLogout } from '~/composables/mixins/usePost'
import { useI18n } from 'vue-i18n'

// Session expiration timer with notification and auto-logout.
export function useSessionTimer(startOnInit = false) {
  const authStore = storeAuth()
  const settingsStore = storeSettings()
  const { notifyInfo } = useNotification()
  const router = useRouter()
  const t = useI18n().t

  const notifyBeforeMs = ref<number>((authStore.isAuthenticated ? 5 : -1) * 60000)
  const countdownText = ref<string>('')
  const notificationShown = ref<boolean>(false)
  const notificationRef = ref<any>()
  const intervalId = ref<number>()

  if (startOnInit) startCountdown()

  onBeforeUnmount(() => {
    if (startOnInit) clearInterval(intervalId.value)
  })

  function startCountdown() {
    try {
      intervalId.value = setInterval(updateCountdown, 1000) as unknown as number
    } catch (e) {
      console.error('Error in setInterval', e)
    }
  }

  function updateCountdown() {
    const time = getRemainingTime()
    countdownText.value = formatCountdownText(time)
    if (time.diff <= notifyBeforeMs.value && !notificationShown.value) {
      notificationShown.value = true
      showSessionExpiringNotification(time)
    } else if (time.diff <= notifyBeforeMs.value && notificationShown.value) {
      const timerTextEl = document.getElementById('timerText')
      if (timerTextEl) {
        timerTextEl.innerHTML = formatNotificationText(time)
      } else {
        showSessionExpiringNotification(time)
      }
    } else {
      notificationShown.value = false
      notificationRef.value?.close()
    }
    if (isNaN(time.diff) || time.diff <= 0 || notifyBeforeMs.value <= 0) {
      notificationRef.value?.close()
      countdownText.value = t('message.sessionExpired') as string
      try {
        useCallLogout(t).callLogout()
      } catch (e) {
        authStore.logout()
        authStore.clearSession()
        settingsStore.setExpiresInterval(undefined)
        router.push('/login')
        console.warn('Logout failed, cause already logged out', e)
      }
      settingsStore.setExpiresInterval(undefined)
    }
  }

  function showSessionExpiringNotification(time: any) {
    notificationRef.value?.close()
    const notif = notifyInfo!({
      title: t('message.sessionExpiring'),
      messageRef: 'timerText',
      message: formatNotificationText(time),
      duration: 0,
      combined: false,
      button: {
        label: t('extend'),
        onClick: async () =>
          await (await useConfigserver(false, undefined, t)).getOpsiConfigServerWithHeaders(),
      },
    })
    if (notif) notificationRef.value = notif
    else console.error('Notification not created: ', t('message.sessionExpiring'))
  }

  function formatNotificationText(time: any) {
    return t('message.autoLogoutInHMS', {
      h: time.hours,
      min: time.minutes,
      s: time.seconds,
    })
  }

  function formatCountdownText(time: any, short = true) {
    if (time.days > 0) {
      return short
        ? ` ${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`
        : (t('message.autoLogoutInDHMS', {
            d: time.days,
            h: time.hours,
            min: time.minutes,
            s: time.seconds,
          }) as string)
    } else if (time.hours > 0) {
      return short
        ? ` ${time.hours}h ${time.minutes}m ${time.seconds}s`
        : (t('message.autoLogoutInHMS', {
            h: time.hours,
            min: time.minutes,
            s: time.seconds,
          }) as string)
    } else if (short) {
      return `${time.minutes}m ${time.seconds}s`
    }
    return t('message.autoLogoutInMS', {
      min: time.minutes,
      s: time.seconds,
    }) as string
  }

  function getRemainingTime(): any {
    const endtime = authStore.sessionEndTime
    if (!endtime) authStore.setSession()
    const diff =
      Date.parse(endtime as unknown as string) - Date.parse(new Date() as unknown as string)
    const seconds = Math.floor((diff / 1000) % 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    authStore.setExpiresIn({ diff, days, hours, minutes, seconds })
    return authStore.sessionExpiresIn
  }

  return {
    startCountdown,
    countdownText,
    formatCountdownText,
  }
}
