<template>
  <div
    :class="{
      mobile: $mq === 'mobile',
      desktop: $mq === 'desktop',
      sidebar_collapsed:!sidebarAttr.expanded && $mq=='desktop',
      sidebar_expanded:sidebarAttr.expanded && $mq=='desktop'}"
  >
    <BarBTop class="topbar_content" :attributes="sidebarAttr" />
    <BarBSide :attributes="sidebarAttr" />
    <div class="main_content">
      <h3 class="text-capitalize">
        <BarBBreadcrumb />
      </h3>
      <Nuxt />
    </div>
    <BarBDefaultFooter />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
const settings = namespace('settings')
interface SideBarAttr {
    visible: boolean,
    expanded: boolean
}

@Component
export default class LayoutDefault extends Vue {
  sidebarAttr: SideBarAttr = { visible: true, expanded: false }
  @settings.Getter public colortheme!: any

  @Watch('$mq', { deep: true }) mqChanged () {
    this.updateSidebarAttr()
  }

  head () {
    return {
      link: [{
        rel: 'stylesheet',
        href: (this.colortheme) ? this.colortheme.rel : ''
      }]
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
  z-index: 9999;
}
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
