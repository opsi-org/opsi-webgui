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
        <BarBBreadcrumb />
      </h3>
      <Nuxt />
    </div>
    <!-- <BarBDefaultFooter /> -->
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
  color: var(--light) !important;
}
.sidebar_content {
  color: var(--dark) !important;
}

.topbar_content .btn,
.topbar_content .navbar,
.topbar_content .navbar-dark .navbar-brand,
.topbar_content .navbar-dark .navbar-nav .nav-link,
.sidebar_content .b-icon,
.sidebar_content .btn,
.sidebar_content .navbar,
.sidebar_content .nav-item,
.sidebar_content .nav-tabs .nav-link,
.sidebar_content .nav-tabs .nav-link.disabled,
.sidebar_content .navbar-dark .navbar-brand,
.sidebar_content .navbar-dark .navbar-nav .nav-link {
  color: inherit !important;
  background-image: none !important;
  /* background-repeat: no-repeat !important; */
}

.topbar_content .dropdown-toggle,
.topbar_content .btn,
.sidebar_content .btn,
.sidebar_content .nav-tabs .nav-link,
.sidebar_content .nav-tabs .nav-link.disabled {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  background-color: transparent !important;
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
