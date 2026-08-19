/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useSessionTimer - Session timeout management with auto-logout and renewal.
 */
import { useUserStore } from '~/stores/userStore'

const WARNING_THRESHOLD_SEC = 60 * 5

const sessionState = reactive({
  remainingSeconds: 0,
  isWarning: false,
  isExpired: false,
  timerInterval: null as ReturnType<typeof setInterval> | null,
})

export function useSessionTimer(autoStart = false) {
  const userStore = useUserStore()
  const { t: $t } = useI18n()

  function calculateRemaining(): number {
    if (!userStore.sessionEndTime) return 0
    return Math.max(0, Math.floor((new Date(userStore.sessionEndTime).getTime() - Date.now()) / 1000))
  }

  function updateState() {
    sessionState.remainingSeconds = calculateRemaining()
    sessionState.isWarning = sessionState.remainingSeconds > 0 && sessionState.remainingSeconds <= WARNING_THRESHOLD_SEC
    sessionState.isExpired = sessionState.remainingSeconds === 0 && !!userStore.sessionEndTime
  }

  function formatTime(seconds: number): string {
    if (seconds <= 0) return '0:00'
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  function formatTimeText(seconds: number): string {
    if (seconds <= 0) return $t('auth.expired')
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  function startTimer() {
    if (sessionState.timerInterval) return
    updateState()
    sessionState.timerInterval = setInterval(() => {
      updateState()
      if (sessionState.isExpired && userStore.isAuthenticated) {
        stopTimer()
        handleSessionExpired()
      }
    }, 1000)
  }

  function stopTimer() {
    if (sessionState.timerInterval) {
      clearInterval(sessionState.timerInterval)
      sessionState.timerInterval = null
    }
  }

  async function handleSessionExpired() {
    userStore.logout()
    await navigateTo('/login?expired=1')
  }

  function refreshSession(expiryInSec?: number) {
    userStore.setSession(expiryInSec)
    updateState()
  }

  if (autoStart) {
    onMounted(() => {
      if (userStore.isAuthenticated) {
        if (!sessionState.timerInterval) {
          startTimer()
        } else {
          updateState()
        }
      }
    })

    onUnmounted(() => {
      updateState()
    })
  }

  watch(
    () => userStore.isAuthenticated,
    (isAuth) => {
      if (isAuth && autoStart) startTimer()
      else if (!isAuth) {
        stopTimer()
        sessionState.remainingSeconds = 0
        sessionState.isWarning = false
        sessionState.isExpired = false
      }
    },
  )

  return {
    remainingSeconds: computed(() => sessionState.remainingSeconds),
    isWarning: computed(() => sessionState.isWarning),
    isExpired: computed(() => sessionState.isExpired),
    isRunning: computed(() => !!sessionState.timerInterval),
    formattedTime: computed(() => formatTime(sessionState.remainingSeconds)),
    formattedTimeText: computed(() => formatTimeText(sessionState.remainingSeconds)),
    startTimer,
    stopTimer,
    refreshSession,
    formatTime,
    formatTimeText,
  }
}
