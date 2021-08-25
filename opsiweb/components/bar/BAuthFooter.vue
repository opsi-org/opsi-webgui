<template>
  <div class="fixed-bottom">
      <!-- type="dark" -->
    <b-navbar
      toggleable="md"
      fixed="bottom"
      variant="primary"
      :class="{auth_footer: $mq === 'desktop', auth_footer_wrap: $mq === 'mobile'}"
    >
      <b-navbar-nav small>
        <b-nav-text> uib GmbH 2021</b-nav-text>
      </b-navbar-nav>
      <b-navbar-nav align="center" small class="ml-auto">
        <DropdownDDLang :dropup="true" />
        <DropdownDDTheme :dropup="true" :navbar="true" />
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" small>
        <b-nav-text> version: 1.0.0</b-nav-text>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<style>
.fixed-bottom .navbar {
  margin-bottom: 0;
}
.auth_footer{
  height: var(--height-navbar) !important;
}
.auth_footer_wrap {
  display: flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
}
</style>
