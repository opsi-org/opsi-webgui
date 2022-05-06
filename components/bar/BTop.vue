<template>
  <div>
    <b-navbar
      data-testid="BarBTop"
      class="topbar"
      toggleable="md"
      fixed="top"
      type="dark"
    >
      <b-navbar-nav v-if="$mq === 'mobile'">
        <b-button variant="primary" :pressed.sync="attributes.visible">
          <span class="sr-only">{{ $t('menu.open-sidemenu.sr-only') }}</span>
          <b-icon :icon="iconnames.menuOpen" />
        </b-button>
      </b-navbar-nav>
      <b-navbar-brand class="d-inline-flex" href="/addons/webgui/app/clients/">
        <IconIOpsiLogo :light="true" height="25" />
        <span class="ml-1 topbar_title"> {{ getTitleUppercase() }} </span>
        <span class="ml-1 topbar_version"> {{ $config.packageVersion }} </span>
      </b-navbar-brand>

      <ModalMTrackChanges v-if="$mq === 'mobile'" />

      <b-navbar-nav v-if="$mq === 'mobile'">
        <b-button v-b-toggle.nav-collapse variant="primary">
          <span class="sr-only">{{ $t('menu.open-topmenu.sr-only') }}</span>
          <b-icon :icon="iconnames.menu" font-scale="1.1" />
        </b-button>
      </b-navbar-nav>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto float-right">
          <ModalMTrackChanges v-if="$mq != 'mobile'" />
          <DropdownDDLang :navbar="true" />
          <!-- TODO: remove for production start -->
          <DropdownDDTheme v-if="$mq!='mobile'" :navbar="true" />
          <!-- TODO: remove for production end -->
          <ButtonBTNLogout :navbar="true" />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ISidebarAttributes } from '../../.utils/types/tsettings'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTop extends Vue {
  $nuxt: any
  $mq:any
  $config:any
  iconnames:any

  @Prop({ default: { visible: true, expanded: false } }) readonly attributes!: ISidebarAttributes

  get username () {
    return localStorage.getItem('username')
  }

  getTitleUppercase () {
    return (this.$t('title.project') as string).toUpperCase()
  }
}
</script>

<style>
.topbar{
  background: var(--primary) !important;
  position: fixed;
  height: var(--height-navbar) !important;
  margin-bottom: 0px !important;
  padding: 0em !important;
  padding-left: 20px !important;
  padding-right: 0px !important;
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
.mobile #nav-collapse,
.mobile #nav-collapse .navbar-nav {
  top:0px !important;
  width: 100% !important;
  padding: 0px !important;
  margin: 0px !important;
  border-left: 0px !important;
  border-right: 0px !important;
  border-top: 0px !important;
}
</style>
