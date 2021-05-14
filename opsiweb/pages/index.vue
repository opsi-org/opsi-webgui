<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">
        opsiweb
      </h1>
      <div>
        <ButtonBTNLogout />
        <DropdownDDTheme />
      </div>
      <h4>Modules content: </h4>
      <div v-for="v,k in modules" :key="k">
        <p>{{ k }}:{{ v }}</p>
      </div>
      <div class="links">
        <b-button
          v-if="!isAuthenticated"
          to="/login"
          class="button--grey"
        >
          Login
        </b-button>
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="button--green"
        >
          Documentation
        </a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
export default Vue.extend({
  async asyncData ({ $axios }) {
    return {
      modules: (await $axios.$post('/api/opsidata/modulesContent')).result
    }
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated'
    })
  }
})
</script>

<style>
</style>
