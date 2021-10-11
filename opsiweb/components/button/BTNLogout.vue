<template>
  <b-button
    v-bind="$props"
    data-testid="btn-logout"
    variant="primary"
    class="btn_logout text-left"
    @click="doLogout"
  >
    <b-icon-power />
    {{ $t('button.logout') }}
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
const auth = namespace('auth')
const selections = namespace('selections')
const changes = namespace('changes')

@Component
export default class BTNLogout extends Vue {
  @Prop({ default: false }) navbar!: boolean
  @auth.Mutation public logout!: () => void
  @selections.Mutation public clearAllSelection!: () => void
  @changes.Mutation public deleteAllChanges!: () => void

  async doLogout () {
    const response = await this.$axios.$post('/api/auth/logout')
    if (response.result === 'logout success') {
      this.logout()
      this.clearAllSelection()
      this.deleteAllChanges()
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
