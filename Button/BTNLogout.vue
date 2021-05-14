<template>
  <b-button @click="logout">
    Logout
  </b-button>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapMutations } from 'vuex'
export default Vue.extend({
  methods: {
    ...mapMutations({
      Xlogout: 'auth/logout'
    }),
    async logout () {
      const response = await this.$axios.$post('/api/auth/logout')
      if (response.result === 'logout success') {
        this.Xlogout()
        if (this.$route.name !== 'login') {
          this.$router.push({ path: '/login' })
        }
      }
    }
  }
})
</script>
<style>

</style>
