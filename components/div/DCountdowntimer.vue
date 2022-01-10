<template>
  <div>
    <small> {{ countdowntimer }} </small>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import Cookie from 'js-cookie'
import { makeToast } from '@/.utils/utils/scomponents'
const auth = namespace('auth')
@Component
export default class BCountdowntimer extends Vue {
  countdowntimer : string = ''
  notify: boolean = false
  @auth.Mutation public logout!: () => void
  @auth.Mutation public getSession!: () => void
  @auth.Mutation public clearSession!: () => void

  mounted () {
    this.initCountdownTimer()
  }

  initCountdownTimer () {
    const timeinterval = setInterval(() => {
      const t = this.getRemainingTime()
      this.countdowntimer = 'Expires in ' + t.days + 'd ' + t.hours + 'h ' + t.minutes + 'm ' + t.seconds + 's'
      const notifyInMinutes = 5
      const notifyInMilliSec = notifyInMinutes * 60000
      if (t.diff <= notifyInMilliSec && !this.notify) {
        this.notify = true
        makeToast(this, 'Session expires in ' + notifyInMinutes + ' minutes', 'Session Timeout', 'warning', notifyInMilliSec)
      }
      if (isNaN(t.diff)) {
        this.countdowntimer = 'EXPIRED'
        clearInterval(timeinterval)
        this.logout()
        this.clearSession()
      }
    }, 1000)
  }

  getRemainingTime () {
    const endtime = Cookie.get('opsiweb-session')
    const diff = Date.parse(endtime as unknown as string) - Date.parse(new Date() as unknown as string)
    const seconds = Math.floor((diff / 1000) % 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return { diff, days, hours, minutes, seconds }
  }
}
</script>
<style>
</style>
