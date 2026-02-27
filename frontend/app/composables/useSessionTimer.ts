/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { useUserStore } from '~/stores/userStore'

const WARNING_THRESHOLD_SEC = 60 * 5 // Show warning 5 minutes before expiry

// Session timer state (singleton across components)
const sessionState = reactive({
  remainingSeconds: 0,
  isWarning: false,
  isExpired: false,
  timerInterval: null as ReturnType<typeof setInterval> | null,
  initialized: false,
})

/**
 * Composable for managing session expiry countdown and auto-logout.
 * Automatically decrements timer and triggers logout when session expires.
 *
 * @param autoStart - Whether to automatically start the timer (default: false)
 * @returns Session timer state and helpers
 */
export function useSessionTimer(autoStart = false) {
  const userStore = useUserStore()
  const { t } = useI18n()

  // Calculate remaining seconds from stored session end time
  function calculateRemaining(): number {
    if (!userStore.sessionEndTime) return 0
    const endTime = new Date(userStore.sessionEndTime).getTime()
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
    return remaining
  }

  // Update session state
  function updateState() {
    sessionState.remainingSeconds = calculateRemaining()
    sessionState.isWarning = sessionState.remainingSeconds > 0 && sessionState.remainingSeconds <= WARNING_THRESHOLD_SEC
    sessionState.isExpired = sessionState.remainingSeconds === 0 && !!userStore.sessionEndTime
  }

  // Format remaining time for display
  function formatTime(seconds: number): string {
    if (seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format with localized text
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

  // Start the countdown timer
  function startTimer() {
    if (sessionState.timerInterval) return // Already running

    updateState()
    sessionState.timerInterval = setInterval(() => {
      updateState()

      // Auto-logout when expired
      if (sessionState.isExpired && userStore.isAuthenticated) {
        stopTimer()
        handleSessionExpired()
      }
    }, 1000)
  }

  // Stop the countdown timer
  function stopTimer() {
    if (sessionState.timerInterval) {
      clearInterval(sessionState.timerInterval)
      sessionState.timerInterval = null
    }
  }

  // Handle session expiry
  async function handleSessionExpired() {
    console.warn('Session expired - auto logout')
    userStore.logout()
    await navigateTo('/login?expired=1')
  }

  // Refresh session (extend expiry)
  function refreshSession(expiryInSec?: number) {
    userStore.setSession(expiryInSec)
    updateState()
  }

  // Initialize on first use (if autoStart)
  if (autoStart && !sessionState.initialized) {
    sessionState.initialized = true
    onMounted(() => {
      if (userStore.isAuthenticated) {
        startTimer()
      }
    })
    onUnmounted(() => {
      // Don't stop timer on unmount as it's shared
    })
  }

  // Watch authentication state
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
    // State (readonly)
    remainingSeconds: computed(() => sessionState.remainingSeconds),
    isWarning: computed(() => sessionState.isWarning),
    isExpired: computed(() => sessionState.isExpired),
    isRunning: computed(() => !!sessionState.timerInterval),

    // Formatted values
    formattedTime: computed(() => formatTime(sessionState.remainingSeconds)),
    formattedTimeText: computed(() => formatTimeText(sessionState.remainingSeconds)),

    // Actions
    startTimer,
    stopTimer,
    refreshSession,
    formatTime,
    formatTimeText,
  }
}
