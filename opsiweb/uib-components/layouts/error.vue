<template>
  <div class="main_content">
    <h1 v-if="error.statusCode === 404">
      {{ $t('message.error.404') }}
    </h1>
    <h1 v-else>
      {{ $t('message.error.else') }}
    </h1>
    {{ error.message }}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, namespace } from 'nuxt-property-decorator'
import { ITheme, ISidebarAttributes } from '../.utils/types/tsettings'
const settings = namespace('settings')
@Component({ layout: 'default' })
export default class LError extends Vue {
  @Prop({ }) error!: object

  sidebarAttr: ISidebarAttributes = { visible: true, expanded: true }

  head () {
    return {
      link: [{
        rel: 'stylesheet',
        href: (this.colortheme) ? this.colortheme.rel : ''
      }]
    }
  }

  @settings.Getter public colortheme!: ITheme

  @Watch('$mq'/* , { deep: true } */) mqChanged () { this.updateSidebarAttr() }

  updateSidebarAttr () {
    if ((this as any).$mq === 'mobile') {
      this.sidebarAttr.visible = false
      this.sidebarAttr.expanded = true
    } else {
      this.sidebarAttr.visible = true
    }
  }
}

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
