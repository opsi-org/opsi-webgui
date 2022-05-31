<template>
  <b-button
    ref="btn-logout"
    v-bind="$props"
    data-testid="ButtonBTNLogout"
    class="text-left"
    :class="{ 'pl-3': $mq=='mobile' }"
    :title="$t('button.logout.tooltip')"
    variant="primary"
    @click="doLogout"
  >
    <b-icon :icon="iconnames.logout" />
    {{ ($mq!=='desktop')? $t('button.logout'):'' }}
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import Settings from '~/store/settings'
import { Constants, CallLogout } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants, CallLogout] })
export default class BTNLogout extends Vue {
  iconnames: any
  $axios:any
  @Prop({ default: false }) abortClick!: boolean

  async doLogout () {
    if (this.abortClick) { return }
    await this.callLogout() // from uib-mixins CallLogout
    // const response = await this.$axios.$post('/api/auth/logout')
    // if (response.result === 'logout success') {
    //   this.logout()
    //   this.clearSession()
    //   this.setExpiresInterval(undefined)
    //   this.clearAllSelection()
    //   if (this.$route.name !== 'login') {
    //     this.$router.push({ path: '/login' })
    //   }
    // }
  }
}
</script>
