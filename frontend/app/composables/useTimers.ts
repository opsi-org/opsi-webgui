/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { ref, onBeforeUnmount } from 'vue'

type CountdownTime = { days: number; hours: number; minutes: number; seconds: number }

export function useSessionTimer() {
  const countdownText = ref('')
  const intervalId = ref<number>()

  function updateCountdown(time: CountdownTime) {
    if (time.days > 0)
      countdownText.value = `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`
    else if (time.hours > 0)
      countdownText.value = `${time.hours}h ${time.minutes}m ${time.seconds}s`
    else countdownText.value = `${time.minutes}m ${time.seconds}s`
  }

  function startCountdown(getTime: () => CountdownTime) {
    intervalId.value = setInterval(() => updateCountdown(getTime()), 1000) as unknown as number
  }

  onBeforeUnmount(() => clearInterval(intervalId.value))

  return { startCountdown, countdownText }
}
