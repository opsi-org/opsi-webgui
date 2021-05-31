<template>
  <div>
    <b-navbar class="topbar" toggleable="sm" fixed="top" variant="secondary">
      <b-navbar-nav v-if="$mq === 'mobile'">
        <b-button :pressed.sync="attributes.visible">
          <b-icon icon="list" />
        </b-button>
      </b-navbar-nav>
      <b-navbar-brand href="/">
        <img src="../../assets/images/LogoOpsi.png" class="topbar_logo">
        Opsiweb
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse">
        <template #default="">
          <b-icon icon="three-dots-vertical" />
        </template>
      </b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto float-right">
          <DropdownDDTheme />
          <ButtonBTNLogout />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    attributes: {
      type: Object,
      default () {
        return { visible: true, expanded: false }
      }
    }
  }
})
</script>

<style>
.topbar{
  position: fixed;
  height: var(--height-navbar) !important;
  /* flex-flow: row nowrap;
  display: inline-flex; */
}
.topbar_logo {
  height: 25px !important;
}
</style>
