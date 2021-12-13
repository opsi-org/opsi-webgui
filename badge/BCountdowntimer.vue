<template>
  <b-badge>
    Expires in
    <!-- {{ countdowntime }} -->
  </b-badge>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import Cookie from 'js-cookie'
const auth = namespace('auth')
@Component
export default class BCountdowntimer extends Vue {
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void

  // get countdowntime () {
  //   return setInterval(() => { this.countdown() }, 1000)
  // }

  countdown () {
    const expiry = JSON.parse(Cookie.get('X-opsi-session-lifetime'))
    const countdownEnd = expiry.ExpiresIn
    const countdownStart = new Date().getTime()
    const diff = countdownEnd - countdownStart
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    if (diff < 0) {
      this.logout()
      this.clearSession()
      return 'EXPIRED'
    } else { return days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's' }
  }
}
</script>
<style>
</style>
