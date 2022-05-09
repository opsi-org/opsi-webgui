<template>
  <div data-testid="DivDCounttimer" class="DCountdowntimer text-center bg-primary">
    <small class="timer"> {{ countdowntimer }} </small>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch, Vue } from 'nuxt-property-decorator'
// import Cookie from 'js-cookie'
// import { makeToast } from '../../.utils/utils/scomponents'
const auth = namespace('auth')
const settings = namespace('settings')
@Component
export default class BCountdowntimer extends Vue {
  @Prop({ default: false }) small!: boolean
  $router:any
  $mq:any
  $t:any

  refAlert: any
  notifyInMilliSec: number = 0
  countdowntimer: string = ''
  first_notification_showed: boolean = false
  @auth.Getter public sessionEndTime!: string
  @auth.Getter public isAuthenticated!: Boolean
  @auth.Mutation public setSession!: () => void
  @auth.Mutation public clearSession!: () => void
  @auth.Mutation public logout!: () => void

  @settings.Getter public expiresInterval!: any
  @settings.Mutation public setExpiresInterval!: (any) => void

  @Watch('expiresInterval', { deep: false }) intervalChanged () {
    clearInterval(this.expiresInterval)
  }

  mounted () {
    this.first_notification_showed = false
    // ref is different in development and production: children[1] is correct for production children[2] for development
    this.refAlert = (this.$root.$children[1].$refs.expiringAlert as any) || (this.$root.$children[2]?.$refs.expiringAlert as any)
    console.warn('Ref Alert ', this.refAlert)

    this.notifyInMilliSec = ((this.isAuthenticated) ? 5 : -1) * 60000
    if (!this.sessionEndTime) {
      this.setSession()
    }
    this.initCountdownTimer()
  }

  initCountdownTimer () {
    this.calcTimeout()
    this.setExpiresInterval(setInterval(this.calcTimeout, 1000))
  }

  calcTimeout () {
    const t = this.getRemainingTime()
    this.countdowntimer = this.getText(t)
    // console.warn('time remaining: ', t.diff, ' notify if <', this.notifyInMilliSec, '-> ', (t.diff <= this.notifyInMilliSec))
    const time = { min: t.minutes, s: t.seconds }
    if (t.diff <= this.notifyInMilliSec && !this.first_notification_showed) {
      this.first_notification_showed = true
      this.initRef(time)
    } else if (t.diff <= this.notifyInMilliSec && this.first_notification_showed) {
      this.initRef(time)
    } else {
      this.first_notification_showed = false
      this.refAlert?.hide()
    }
    if (isNaN(t.diff) || t.diff === 0 || this.notifyInMilliSec <= 0) {
      this.countdowntimer = this.$t('message.session.expired') as string
      clearInterval(this.expiresInterval)
      this.logout()
      this.$router.push('/login')
      this.clearSession()
    }
  }

  initRef (time: any) {
    if (this.refAlert === undefined) {
      this.refAlert = (this.$root.$children[1].$refs.expiringAlert as any) || (this.$root.$children[2].$refs.expiringAlert as any)
    }
    if (this.refAlert !== undefined) {
      this.refAlert.alert(this.$t('message.session.expiresInMinutesDetails', time) as string, 'warning')
    } else {
      console.warn(this.$t('message.session.expiresInMinutesDetails', time))
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
