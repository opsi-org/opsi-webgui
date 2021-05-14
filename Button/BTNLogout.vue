<template>
  <b-button @click="doLogout">
    Logout
  </b-button>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
const auth = namespace('auth')
@Component
export default class BTNLogout extends Vue {
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

</style>
