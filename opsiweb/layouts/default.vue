<template>
  <div>
    <Nuxt />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import Vue from 'vue'
export default Vue.extend({
  head () {
    return {
      link: [{
        rel: 'stylesheet',
        href: (this.XgetColorTheme) ? this.XgetColorTheme.rel : ''
      }]
    }
  },
  computed: {
    ...mapGetters({
      XgetColorTheme: 'settings/colortheme'
    })
  }
})
</script>

<style>
html {
  font-family:
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
