<template>
  <div data-testid="DivDCounttimer" class="DCountdowntimer text-center inline">
    <span class="timer text-small"> {{ countdowntimer }} </span>
  </div>
</template>

<script setup lang="ts">
  import { useCallLogout } from '~/composables/mixins/usePost'

  const authStore = storeAuth()
  const settingsStore = storeSettings()

  const props = defineProps({
    small: {
      type: Boolean,
      default: false,
    },
  })

  const router = useRouter()
  const $t = useI18n().t

  //   const refAlert = ref<any>()
  const notifyInMilliSec = ref<number>(0)
  const countdowntimer = ref<string>('')
  const first_notification_showed = ref<boolean>(false)

  watch(
    () => settingsStore.expiresInterval,
    (newVal) => {
      clearInterval(newVal)
    },
  )
  onMounted(() => {
    first_notification_showed.value = false
    //   refAlert = (this.$root.$children[1]?.$refs?.expiringAlert as any) || (this.$root.$children[2]?.$refs?.expiringAlert as any)

    notifyInMilliSec.value = (authStore.isAuthenticated ? 5 : -1) * 60000
    if (!authStore.sessionEndTime) {
      authStore.setSession()
    }
    initCountdownTimer()
  })

  function initCountdownTimer() {
    calcTimeout()
    settingsStore.setExpiresInterval(setInterval(calcTimeout, 1000))
  }

  function calcTimeout() {
    const t = getRemainingTime()
    countdowntimer.value = getText(t)
    // const time = { min: t.minutes, s: t.seconds }
    if (t.diff <= notifyInMilliSec.value && !first_notification_showed.value) {
      first_notification_showed.value = true
      // initRef(time)
    } else if (
      t.diff <= notifyInMilliSec.value &&
      first_notification_showed.value
    ) {
      // if (this.refAlert?.showAlert === true) {
      //   this.initRef(time)
      // }
    } else {
      first_notification_showed.value = false
      // this.refAlert?.hide()
    }
    if (isNaN(t.diff) || t.diff === 0 || notifyInMilliSec.value <= 0) {
      countdowntimer.value = $t('message.session.expired') as string
      try {
        useCallLogout().callLogout()
      } catch (e) {
        authStore.logout()
        authStore.clearSession()
        settingsStore.setExpiresInterval(undefined)
        router.push('/login')
        throw new Error('Cannot find logout btn, error: ' + e)
      }
      clearInterval(settingsStore.expiresInterval)
    }
  }

  //   function initRef(time: any) {
  //   this.refAlert?.alert($t('message.session.expiresInMinutesDetails', time), 'warning')
  //   }

  function getText(t: any) {
    if (t.days > 0) {
      if (props.small === true) {
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
      if (props.small === true) {
        return ` ${t.hours}h ${t.minutes}m ${t.seconds}s`
      } else {
        return $t('message.session.expiresInHours', {
          h: t.hours,
          min: t.minutes,
          s: t.seconds,
        }) as string
      }
    } else if (props.small === true) {
      return ` ${t.minutes}m ${t.seconds}s`
    }
    return $t('message.session.expiresInMinutes', {
      min: t.minutes,
      s: t.seconds,
    }) as string
  }

  function getRemainingTime() {
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
    return { diff, days, hours, minutes, seconds }
  }
  //   }
</script>
