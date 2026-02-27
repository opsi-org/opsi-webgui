/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { useUserStore } from '~/stores/userStore'

const WARNING_THRESHOLD_SEC = 60 * 5 // 5 minutes

const sessionState = reactive({
  remainingSeconds: 0,
  isWarning: false,
  isExpired: false,
  timerInterval: null as ReturnType<typeof setInterval> | null,
  initialized: false,
})

export function useSessionTimer(autoStart = false) {
  const userStore = useUserStore()
  const { t } = useI18n()

  function calculateRemaining(): number {
    if (!userStore.sessionEndTime) return 0
    const endTime = new Date(userStore.sessionEndTime).getTime()
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
    return remaining
  }

  function updateState() {
    sessionState.remainingSeconds = calculateRemaining()
    sessionState.isWarning = sessionState.remainingSeconds > 0 && sessionState.remainingSeconds <= WARNING_THRESHOLD_SEC
    sessionState.isExpired = sessionState.remainingSeconds === 0 && !!userStore.sessionEndTime
  }

  function formatTime(seconds: number): string {
    if (seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function formatTimeText(seconds: number): string {
    if (seconds <= 0) return t('sessionExpired') || 'Session expired'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
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
    console.warn('Session expired - auto logout')
    userStore.logout()
    await navigateTo('/login?expired=1')
  }

  function refreshSession(expiryInSec?: number) {
    userStore.setSession(expiryInSec)
    updateState()
  }

  if (autoStart && !sessionState.initialized) {
    sessionState.initialized = true
    onMounted(() => {
      if (userStore.isAuthenticated) {
        startTimer()
      }
    })
  }

  watch(
    () => userStore.isAuthenticated,
    (isAuth) => {
      if (isAuth && autoStart) {
        startTimer()
      } else if (!isAuth) {
        stopTimer()
        sessionState.remainingSeconds = 0
        sessionState.isWarning = false
        sessionState.isExpired = false
      }
    }
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
