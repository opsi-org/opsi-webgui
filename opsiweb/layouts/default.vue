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

/* WARN  in ./layouts/default.vue?vue&type=script&lang=ts&

"export 'default' (imported as 'mod') was not found in '-!../node_modules/babel-loader/lib/index.js??ref--12-0!../node_modules/ts-loader/index.js??ref--12-1!../node_modules/vue-loader/lib/index.js??vue-loader-options!./default.vue?vue&type=script&lang=ts&'
*/
// import { Component, Vue, namespace } from 'nuxt-property-decorator'

// const settings = namespace('settings')
// interface ITheme {
//     title: string,
//     rel: string
// }
// @Component export class LDefault extends Vue {
//   @settings.Getter public colortheme!: ITheme
//   public head (): any {
//     return {
//       link: [{
//         rel: 'stylesheet',
//         href: this.colortheme.rel
//       }]
//     }
//   }
// }
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
