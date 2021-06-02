<template>
  <div
    :class="{
      sidebar_collapsed:!sidebarAttr.expanded && $mq=='desktop',
      sidebar_expanded:sidebarAttr.expanded && $mq=='desktop'}"
  >
    <BarBTop :attributes="sidebarAttr" />
    <BarBSide :attributes="sidebarAttr" />
    <div class="main_content">
      <Nuxt />
    </div>
    <!-- <Nuxt class="main_content" /> -->
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
.main_content{
  margin-top: var(--margin-top-maincontent);
  margin-left: var(--margin-left-maincontent);
}
.sidebar_collapsed .main_content{
  margin-left: var(--margin-left-maincontent-if-sidebar-collpased);
}
.sidebar_expanded .main_content{
  margin-left: var(--margin-left-maincontent-if-sidebar-expanded);
}
</style>
