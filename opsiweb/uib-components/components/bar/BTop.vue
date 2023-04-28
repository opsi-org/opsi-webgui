<template>
  <div>
    <b-navbar
      data-testid="BarBTop"
      class="topbar"
      toggleable="md"
      fixed="top"
      type="dark"
    >
      <b-navbar-nav v-if="$mq === 'mobile'" class="h-100">
        <slot name="mobilemenu" />
      </b-navbar-nav>
      <b-navbar-brand class="d-inline-flex" href="/addons/webgui/app/clients/">
        <IconIOpsiLogo v-once :light="true" class="mt-2" height="20" />
        <span class="ml-1 topbar_title webgui_title">
          {{ $t('title.project') }}
        </span>
        <span v-once class="ml-1 topbar_version"> {{ $config.packageVersion }} </span>
        <IconIReadOnly />
      </b-navbar-brand>
      <BarBBreadcrumbRow v-if="$mq == 'desktop'" />
      <ModalMTrackChanges v-if="$mq === 'mobile'" />
      <b-navbar-nav v-if="$mq === 'mobile'" class="h-100">
        <b-button variant="primary" class="h-100 border-0" :pressed.sync="rightmenuVisible">
          <span class="sr-only">{{ $t('menu.open-topmenu.sr-only') }}</span>
          <b-icon :icon="icon.menu" font-scale="1.4" />
        </b-button>
      </b-navbar-nav>
      <b-collapse
        id="nav-collapse"
        v-model="rightmenuVisible"
        is-nav
        :class="{ 'pt-2 pb-2': $mq=='mobile' }"
      >
        <div
          v-if="rightmenuVisible"
          role="button"
          tabindex="0"
          class="b-sidebar-backdrop bg-dark border-0"
          @keydown="rightmenuVisible = false"
          @click="rightmenuVisible = false"
        />
        <b-navbar-nav class="pt-0 ml-auto mr-3 float-right">
          <b-nav-item><span class="sr-only">{{ $t('button.track.changes') }}</span> <ModalMTrackChanges v-if="$mq != 'mobile'" /> </b-nav-item>
          <ModalMSelectionsAll :navbar="true" :with-text="$mq=='mobile'" />
          <ButtonBTNEvent :navbar="true" event="ondemand" size="md" :with-text="$mq=='mobile'" classes="global_topbar_button btn-primary" />
          <DropdownDDLang v-once :navbar="true" />
          <DropdownDDTheme v-once :navbar="true" />
          <ButtonBTNLogout v-once :navbar="true" />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Icons } from '../../mixins/icons'
const config = namespace('config-app')

@Component({ mixins: [Icons] })
export default class BTop extends Vue {
  $nuxt: any
  $mq:any
  $t:any
  $config:any
  icon:any

  rightmenuVisible:boolean = false

  @config.Getter public config!: IObjectString2Boolean
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
.topbar::before {
  content: unset !important;
}
.topbar::after {
  content: unset !important;
}
.topbar_brand{
  max-height: var(--height-navbar) !important;
  display: inline-flex !important;
  padding-bottom: 0px !important;
}
.topbar_title{
  font-size: 18px;
  margin-left: -3px;
  margin-top: 7px;
}
.topbar_version{
  font-size: var(--text-small-size)!important;
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
