<template>
  <div data-testid="DivDCounttimer" class="DCountdowntimer">
    <small> {{ countdowntimer }} </small>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
// import Cookie from 'js-cookie'
import { makeToast } from '../../.utils/utils/scomponents'
const auth = namespace('auth')
@Component
export default class BCountdowntimer extends Vue {
  @Prop({ default: false }) small!: boolean
  $mq:any
  $t:any

  timeinterval: any
  countdowntimer: string = ''
  notify: boolean = false
  @auth.Getter public sessionEndTime!: string
  @auth.Getter public isAuthenticated!: Boolean
  @auth.Mutation public clearSession!: () => void
  @auth.Mutation public logout!: () => void

  mounted () {
    this.initCountdownTimer()
  }

  initCountdownTimer () {
    this.calcTimeout()
    this.timeinterval = setInterval(this.calcTimeout, 1000)
  }

  calcTimeout () {
    const t = this.getRemainingTime()
    this.countdowntimer = this.getText(t)
    const notifyInMinutes = (this.isAuthenticated) ? 5 : -1
    const notifyInMilliSec = notifyInMinutes * 60000
    if (t.diff <= notifyInMilliSec && !this.notify) {
      this.notify = true
      makeToast(this, this.$t('message.session.expiresInMinutesOnly', { min: notifyInMinutes }) as string, this.$t('message.session.title') as string, 'warning', notifyInMilliSec)
    }
    if (isNaN(t.diff) || t.diff === 0 || notifyInMinutes === -1) {
      this.countdowntimer = this.$t('message.session.expired') as string
      clearInterval(this.timeinterval)
      this.logout()
      this.clearSession()
    }
  }

  getText (t) {
    if (t.days > 0) {
      if (this.small === true) {
        return ` ${t.days}d ${t.hours}:${t.minutes}:${t.seconds}`
      } else {
        return this.$t('message.session.expiresInDays', { d: t.days, h: t.hours, min: t.minutes, s: t.seconds }) as string
      }
    } else if (t.hours > 0) {
      if (this.small === true) {
        return ` ${t.hours}:${t.minutes}:${t.seconds}`
      } else {
        return this.$t('message.session.expiresInHours', { h: t.hours, min: t.minutes, s: t.seconds }) as string
      }
    } else if (this.small === true) {
      return ` ${t.minutes}:${t.seconds}`
    }
    return this.$t('message.session.expiresInMinutes', { min: t.minutes, s: t.seconds }) as string
  }

  getRemainingTime () {
    // const endtime = Cookie.get('opsiweb-session')
    const endtime = this.sessionEndTime
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
.DCountdowntimer {
  text-align: center;
}
</style>
