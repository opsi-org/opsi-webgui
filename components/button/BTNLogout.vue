<template>
  <b-button
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
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
// import Settings from '~/store/settings'
import { Constants } from '../../mixins/uib-mixins'
const auth = namespace('auth')
const selections = namespace('selections')
const settings = namespace('settings')

@Component({ mixins: [Constants] })
export default class BTNLogout extends Vue {
  iconnames: any
  $axios:any
  @Prop({ default: false }) abortClick!: boolean
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void
  @selections.Mutation public clearAllSelection!: () => void
  @settings.Mutation public setExpiresInterval!: (any) => void

  async doLogout () {
    if (this.abortClick) { return }
    const response = await this.$axios.$post('/api/auth/logout')
    if (response.result === 'logout success') {
      this.logout()
      this.clearSession()
      this.setExpiresInterval(undefined)
      this.clearAllSelection()
      if (this.$route.name !== 'login') {
        this.$router.push({ path: '/login' })
      }
    }
  }
}
</script>
