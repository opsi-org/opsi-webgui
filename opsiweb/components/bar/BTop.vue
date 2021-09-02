<template>
  <div>
    <b-navbar class="topbar" toggleable="md" fixed="top" type="dark" variant="primary">
      <div class="container-fluid">
        <b-navbar-nav v-if="$mq === 'mobile'">
          <b-button :pressed.sync="attributes.visible">
            <b-icon icon="list" />
          </b-button>
        </b-navbar-nav>
        <b-navbar-brand href="/" class="topbar_brand">
          <b-badge class="bg-light" style="margin-left:5px;margin-right:5px">
            <img src="../../assets/images/LogoOpsi.png" class="topbar_logo" alt="opsi logo">
          </b-badge>
          OPSIWEB
        </b-navbar-brand>
        <b-navbar-nav v-if="$mq === 'mobile'">
          <b-button v-b-toggle.nav-collapse variant="primary">
            <!-- <IconIExpert v-if="expert" /> -->
            <b-icon-three-dots-vertical font-scale="1.1" />
          </b-button>
        </b-navbar-nav>
        <b-collapse id="nav-collapse" is-nav variant="primary">
          <b-navbar-nav v-if="$mq!='mobile'">
            <IconIExpert />
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto float-right">
            <DropdownDDLang class="navbar-collapse-child" :navbar="true" />
            <!-- TODO: remove for production start -->
            <!-- <ButtonBTNExpertMode v-if="$mq=='mobile'" class="navbar-collapse-child" :navbar="true" /> -->
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
import { Component, Vue, namespace, Prop } from 'nuxt-property-decorator'
const settings = namespace('settings')
@Component
export default class CTop extends Vue {
  @Prop({ default: { visible: true, expanded: false } }) readonly attributes!: Object
  @settings.Getter public expert!: boolean
}
</script>

<style>
.navbar-light .navbar-nav .nav-link{
  color: unset !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}

/* .desktop #nav-collapse,
.desktop #nav-collapse .navbar-nav {
  margin-top: 0px !important;
  padding-top: 0px !important;
  background-color: var(--transparent) !important;
} */
.topbar{
  background-color: var(--primary) !important;
  position: fixed;
  height: var(--height-navbar) !important;
  margin-bottom: 0px !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
  padding: 0em !important;
}
/* .navbar-toggler{
  margin-right: 0.5em !important;
}
.navbar-nav {
  margin-left: 1em !important;
  padding-right: 1em !important;
} */

/* .mobile .navbar-collapse .navbar-nav > .navbar-collapse-child{
/* .mobile .navbar-collapse .navbar-nav >
  margin-left: 1em !important;
  margin-right: 1em !important;
} */
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
.topbar_logo {
  height: 25px !important;
}
.desktop .navbar-brand{
  margin-right: 0px !important;
  /* padding-right: 0px !important; */
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

/* .navbar {
  background-image: none !important;
} */
/* .btn {
  color: inherit !important;
} */
/* .navbar-collapse .navbar-nav{
  padding-top:10px !important;
  margin-top:10px !important;
  background-color: var(--secondary) !important;
} */
</style>
