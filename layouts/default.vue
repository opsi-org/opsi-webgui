<template>
  <div
    :class="{
      mobile: $mq === 'mobile',
      desktop: $mq === 'desktop',
      sidebar_collapsed: !sidebarAttr.expanded && $mq!=='mobile',
      sidebar_expanded: sidebarAttr.expanded && $mq!=='mobile'}"
  >
    <BarBTop class="topbar_content" :attributes="sidebarAttr" />
    <BarBSide class="sidebar_content" :attributes="sidebarAttr" />
    <div class="main_content">
      <h5 class="text-capitalize">
        <BarBBreadcrumbRow v-if="$mq !== 'mobile'" />
      </h5>
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
// import Cookie from 'js-cookie'
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { ChangeObj } from '../.utils/types/tchanges'
const settings = namespace('settings')
const changes = namespace('changes')
const cache = namespace('data-cache')
interface SideBarAttr {
    visible: boolean,
    expanded: boolean
}

@Component
export default class LayoutDefault extends Vue {
  $mq: any
  $axios: any

  @settings.Getter public colortheme!: any
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @cache.Getter public opsiconfigserver!: string
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void

  sidebarAttr: SideBarAttr = { visible: this.$mq !== 'mobile', expanded: this.$mq !== 'mobile' }

  @Watch('opsiconfigserver', { deep: true }) async serverChanged () {
    await this.checkServer()
  }

  get username () {
    return localStorage.getItem('username')
  }

  async mounted () {
    window.onbeforeunload = this.confirmToSaveChanges
    await this.checkServer()
    // if (Cookie.get('menu_attributes_desktop')) {
    //   this.sidebarAttr = JSON.parse(Cookie.get('menu_attributes_desktop') as unknown as any)
    // } else {
    //   // this.sidebarAttr = { visible: true, expanded: true }
    // }
    // this.updateSidebarAttr()
  }

  confirmToSaveChanges () {
    if (this.changesProducts.filter(o => o.user === this.username).length !== 0) {
      return true
    } else {
      return null
    }
  }

  head () {
    return {
      link: [{
        rel: 'stylesheet',
        href: (this.colortheme) ? this.colortheme.rel : ''
      }]
    }
  }

  async checkServer () {
    if (this.opsiconfigserver === '') {
      this.setOpsiconfigserver((await this.$axios.$get('/api/user/opsiserver')).result)
    }
  }
}
</script>

<style>
.topbar_content {
  z-index: 2000;
}

.topbar_content,
.sidebar_content ,
.footer_content {
  color: var(--light) !important;
}

.topbar_content {
  position: absolute !important;
  width: 100% !important;
  max-height: 100px;
}
.main_content{
  position:absolute;
  margin-top: var(--margin-top-maincontent);
  margin-left: var(--margin-left-maincontent);
  overflow: hidden;
  width: calc(100% - 2 * var(--margin-left-maincontent));
  height: calc(100% - var(--margin-top-maincontent));
}

:not(.mobile).sidebar_collapsed .main_content{
  margin-left: var(--margin-left-maincontent-if-sidebar-collpased);
  width: calc(100% - var(--margin-left-maincontent-if-sidebar-collpased) - var(--margin-left-maincontent));
}
:not(.mobile).sidebar_expanded .main_content{
  margin-left: var(--margin-left-maincontent-if-sidebar-expanded);
  width: calc(100% - var(--margin-left-maincontent-if-sidebar-expanded) - var(--margin-left-maincontent));
}
</style>
