<template>
  <div>
    <b-navbar
      data-testid="BarBTop"
      class="topbar"
      toggleable="md"
      fixed="top"
      type="dark"
      variant="primary"
    >
      <div class="container-fluid">
        <b-navbar-nav v-if="$mq === 'mobile'">
          <b-button :pressed.sync="attributes.visible">
            <span class="sr-only">Open sidemenu</span>
            <b-icon :icon="iconnames.menuOpen" />
          </b-button>
        </b-navbar-nav>
        <b-navbar-brand class="topbar_brand">
          <b-badge href="/addons/webgui/app/clients" class="topbar_badge_logo">
            <IconIOpsiLogo class="topbar_logo" />
          </b-badge>
          <span class="topbar_title"> {{ getTitleUppercase() }} </span>
          <span class="topbar_version"> {{ $config.packageVersion }} </span>
          <ButtonBTNExpertMode :navbar="true" />
          <ModalMTrackChanges />
        </b-navbar-brand>

        <b-navbar-nav v-if="$mq === 'mobile'">
          <b-button v-b-toggle.nav-collapse variant="primary">
            <span class="sr-only">Open topmenu</span>
            <b-icon :icon="iconnames.menu" font-scale="1.1" />
          </b-button>
        </b-navbar-nav>
        <b-collapse id="nav-collapse" is-nav variant="primary">
          <b-navbar-nav class="ml-auto float-right">
            <DropdownDDLang class="navbar-collapse-child" :navbar="true" />
            <!-- TODO: remove for production start -->
            <DropdownDDTheme v-if="$mq!='mobile'" class="navbar-collapse-child" :navbar="true" />
            <!-- TODO: remove for production end -->
            <ButtonBTNLogout class="navbar-collapse-child" :navbar="true" />
          </b-navbar-nav>
        </b-collapse>
      </div>
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
.navbar-light .navbar-nav .nav-link{
  color: unset !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}

.topbar{
  background: var(--primary) !important;
  /* background-color: var(--primary) !important; */
  position: fixed;
  height: var(--height-navbar) !important;
  margin-bottom: 0px !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
  padding: 0em !important;
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
  margin-left: -7px;
}
.topbar_version{
  font-size: 10px;
  margin-left: 5px;
}

.topbar_badge_logo  {
    margin-left:5px;
    margin-right: 5px;
    background-color: var(--bg-type) !important;
    padding: 0;
}

.topbar_logo {
  height: 25px !important;
}

.desktop .navbar-brand{
  margin-right: 0px !important;
}

.desktop #nav-collapse {
  margin-left: 0px !important;
  padding-left: 0px !important;
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
