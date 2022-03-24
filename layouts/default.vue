<template>
  <div
    :class="{
      mobile: $mq === 'mobile',
      desktop: $mq === 'desktop',
      sidebar_collapsed:!sidebarAttr.expanded && $mq=='desktop',
      sidebar_expanded:sidebarAttr.expanded && $mq=='desktop'}"
  >
    <BarBTop class="topbar_content" :attributes="sidebarAttr" />
    <BarBSide class="sidebar_content" :attributes="sidebarAttr" />
    <div class="main_content">
      <h3 class="text-capitalize">
        <BarBBreadcrumb v-if="$mq != 'mobile'" />
      </h3>
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')
const cache = namespace('data-cache')
interface SideBarAttr {
    visible: boolean,
    expanded: boolean
}

@Component
export default class LayoutDefault extends Vue {
  $mq: any
  $axios: any
  sidebarAttr: SideBarAttr = { visible: true, expanded: true }
  @settings.Getter public colortheme!: any
  @cache.Getter public opsiconfigserver!: string;
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void;

  @Watch('opsiconfigserver', { deep: true }) async serverChanged () {
    await this.checkServer()
  }

  @Watch('$mq', { deep: true }) mqChanged () {
    this.updateSidebarAttr()
  }

  @Watch('sidebarAttr', { deep: true }) attributesChanged () {
    Cookie.set('menu_attributes', JSON.stringify(this.sidebarAttr), { expires: 365 })
  }

  async mounted () {
    await this.checkServer()
    if (Cookie.get('menu_attributes')) {
      this.sidebarAttr = JSON.parse(Cookie.get('menu_attributes') as unknown as any)
    } else {
      // this.sidebarAttr = { visible: true, expanded: true }
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

  updateSidebarAttr () {
    if ((this as any).$mq === 'mobile') {
      this.sidebarAttr.visible = false
      this.sidebarAttr.expanded = true
    } else {
      this.sidebarAttr.visible = true
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
.sidebar_collapsed .main_content{
  margin-left: var(--margin-left-maincontent-if-sidebar-collpased);
  width: calc(100% - var(--margin-left-maincontent-if-sidebar-collpased) - var(--margin-left-maincontent));
}
.sidebar_expanded .main_content{
  margin-left: var(--margin-left-maincontent-if-sidebar-expanded);
  width: calc(100% - var(--margin-left-maincontent-if-sidebar-expanded) - var(--margin-left-maincontent));
}
</style>
