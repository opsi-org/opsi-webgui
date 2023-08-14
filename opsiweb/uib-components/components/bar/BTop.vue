<template>
  <b-navbar
    data-testid="BarBTop"
    class="topbar"
    fixed="top"
    type="dark"
  >
    <b-navbar-nav v-if="$mq === 'mobile'" small>
      <slot name="mobilemenu" />
    </b-navbar-nav>
    <b-navbar-brand class="d-inline-flex" href="/addons/webgui/app/clients/">
      <IconIOpsiLogo v-once :light="true" class="mt-2" height="20" />
      <span class="ml-1 topbar_title webgui_title">
        {{ $t('title.project') }}
      </span>
      <span v-once class="ml-1 text-smaller topbar_version"> {{ $config.packageVersion }} </span>
      <IconIReadOnly />
    </b-navbar-brand>
    <BarBBreadcrumbRow v-if="$mq == 'desktop'" class="ml-2" />
    <b-navbar-nav small class="ml-auto">
      <ModalMTrackChanges />
      <slot name="quickpanel" />
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTop extends Vue {
  $nuxt: any
  $mq:any
  $t:any
  $config:any
  icon:any

  get username () {
    return localStorage.getItem('username')
  }
}
</script>

<style>
.topbar{
  background: var(--primary) !important;
  height: var(--height-navbar) !important;
  margin-bottom: 0px !important;
  padding: 0em !important;
  padding-left: 20px !important;
  padding-right: 0px !important;
}
.mobile .topbar {
  padding-left: 0px !important;
}
.mobile .topbar .navbar-brand{
  margin: auto;
}
.topbar_brand{
  max-height: var(--height-navbar) !important;
  display: inline-flex !important;
  padding-bottom: 0px !important;
}
.topbar_title{
  font-size: 15px;
  margin-top: 7px;
}
.mobile #nav-collapse {
  max-height:calc(var(--max-height-window) - var(--margin-top-maincontent));
  overflow: auto;
  background-color: var(--primary) !important;
  border-bottom: 3px solid var(--primary) !important;
}
.desktop #nav-collapse .vertical-line {
  min-height: 100%;
  min-width: 2px;
  content: "";
  border: 1px solid var(--primary-dark);
}
.mobile #nav-collapse,
.mobile #nav-collapse .navbar-nav {
  top:0px !important;
  width: 100% !important;
  padding: 0px;
  margin: 0px !important;
  border-left: 0px !important;
  border-right: 0px !important;
  border-top: 0px !important;
}
</style>
