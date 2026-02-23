/**
 * opsi-webgui session timer composable.
 * Copyright (c) uib GmbH <info@uib.de> 2025
 * License: AGPL-3.0
 */
import { ref, onBeforeUnmount } from 'vue'
import { useUiHelpers } from '~/composables/useUiHelpers'

export function useSessionTimer() {
  const { t } = useUiHelpers()
  const countdownText = ref('')
  const intervalId = ref<number>()

  function updateCountdown(time: any) {
    if (time.days > 0) {
      countdownText.value = `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`
    } else if (time.hours > 0) {
      countdownText.value = `${time.hours}h ${time.minutes}m ${time.seconds}s`
    } else {
      countdownText.value = `${time.minutes}m ${time.seconds}s`
    }
  }

  function startCountdown(getTime: () => any) {
    intervalId.value = setInterval(() => updateCountdown(getTime()), 1000) as unknown as number
  }

  onBeforeUnmount(() => clearInterval(intervalId.value))

  return { startCountdown, countdownText }
}
