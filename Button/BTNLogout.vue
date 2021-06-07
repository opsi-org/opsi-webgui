<template>
  <b-button v-bind="$props" class="btn-logout text-left" @click="doLogout">
    Logout
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue, namespace } from 'nuxt-property-decorator'
const auth = namespace('auth')

@Component
export default class BTNLogout extends Vue {
  @Prop({ default: false }) navbar!: boolean
  @auth.Mutation public logout!: () => void

  async doLogout () {
    const response = await this.$axios.$post('/api/auth/logout')
    if (response.result === 'logout success') {
      this.logout()
      if (this.$route.name !== 'login') {
        this.$router.push({ path: '/login' })
      }
    }
  }
}
</script>

<style>
.btn-logout{
  padding-left: 1em !important;
  padding-right: 1em !important;
  /* width: 100%; */
}
</style>
