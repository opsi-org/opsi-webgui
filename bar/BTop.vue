<template>
  <div>
    <b-navbar class="topbar" toggleable="md" fixed="top" type="light" variant="secondary">
      <b-navbar-nav v-if="$mq === 'mobile'">
        <b-button :pressed.sync="attributes.visible">
          <b-icon icon="list" />
        </b-button>
      </b-navbar-nav>
      <b-navbar-brand href="/" class="topbar_brand">
        <img src="../../assets/images/LogoOpsi.png" class="topbar_logo" alt="opsi logo">
        OPSIWEB
      </b-navbar-brand>
      <b-navbar-nav v-if="$mq === 'mobile'">
        <b-button v-b-toggle.nav-collapse variant="secondary">
          <b-icon-three-dots-vertical font-scale="1.1" />
        </b-button>
      </b-navbar-nav>
      <b-collapse id="nav-collapse" is-nav variant="secondary">
        <b-navbar-nav class="ml-auto float-right">
          <DropdownDDLang class="navbar-collapse-child" :navbar="true" />
          <DropdownDDTheme class="navbar-collapse-child" :navbar="true" />
          <ButtonBTNLogout class="navbar-collapse-child" :navbar="true" />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component
export default class CTop extends Vue {
  @Prop({ default: { visible: true, expanded: false } }) readonly attributes!: Object
}

</script>

<style>

.navbar-light .navbar-nav .nav-link{
  color: unset !important;
  font-weight: normal !important;
  padding-top: 0px;
  padding-bottom: 0px;
}

.mobile #nav-collapse {
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

/* .desktop #nav-collapse,
.desktop #nav-collapse .navbar-nav {
  margin-top: 0px !important;
  padding-top: 0px !important;
  background-color: var(--transparent) !important;
} */
.topbar{
  background-color: var(--secondary) !important;
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

/* .navbar-collapse .navbar-nav{
  padding-top:10px !important;
  margin-top:10px !important;
  background-color: var(--secondary) !important;
} */

</style>
