<template>
  <b-button
    v-bind="$props"
    data-testid="ButtonBTNLogout"
    variant="primary"
    class="btn_logout text-left"
    @click="doLogout"
  >
    <b-icon :icon="iconnames.logout" />
    {{ $t('button.logout') }}
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const auth = namespace('auth')
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class BTNLogout extends Vue {
  iconnames: any
  $axios:any
  @Prop({ default: false }) abortClick!: boolean
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void
  @selections.Mutation public clearAllSelection!: () => void

  async doLogout () {
    if (this.abortClick) { return }
    const response = await this.$axios.$post('/api/auth/logout')
    if (response.result === 'logout success') {
      this.logout()
      this.clearSession()
      this.clearAllSelection()
      if (this.$route.name !== 'login') {
        this.$router.push({ path: '/login' })
      }
    }
  }
}
</script>

<style>
.btn_logout{
  padding-left: 1em !important;
  padding-right: 1em !important;
}
</style>
