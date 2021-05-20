<template>
  <div
    :class="{
      sidebar_collapsed:!sidebarAttr.expanded && $mq!='mobile',
      sidebar_expanded:sidebarAttr.expanded}"
  >
    <BarBTop>
      <template slot="sidebarToggle">
        <b-navbar-nav>
          <b-button v-if="$mq === 'mobile'" :pressed.sync="sidebarAttr.visible">
            <b-icon icon="list" />
          </b-button>
        </b-navbar-nav>
      </template>
    </BarBTop>
    <BarBSide :attributes="sidebarAttr" />
    <div class="main_content">
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      sidebarAttr: { visible: true, expanded: false }
    }
  },
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
  },
  watch: {
    $mq () {
      this.updateSidebarAttr()
    }
  },
  methods: {
    updateSidebarAttr () {
      if ((this as any).$mq === 'mobile') {
        this.sidebarAttr.visible = false
        this.sidebarAttr.expanded = true
      } else {
        this.sidebarAttr.visible = true
      }
    }
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
/* .main_content{
  margin-top: 56px !important;
  width: calc(100% + 15px);
} */
.sidebar_collapsed .main_content{
  margin-left: 55px;
  width: calc(100% - 55px - 15px);
  max-width: calc(100% - 55px - 15px);
  margin-top: 56px;
  max-height: calc(100% - 56px - 15px);
}
.sidebar_expanded .main_content{
  margin-left: 245;
  width: calc(100% - 245 - 15px);
  max-width: calc(100% - 245 - 15px);
  margin-top: 56px;
  max-height: calc(100% - 56px - 15px);
}
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
