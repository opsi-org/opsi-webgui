<template>
  <div class="fixed-bottom">
    <b-navbar
      toggleable="md"
      fixed="bottom"
      variant="primary"
      :class="{auth_footer: $mq === 'desktop', auth_footer_wrap: $mq === 'mobile'}"
    >
      <b-container fluid>
        <b-navbar-nav small>
          <b-nav-text> uib GmbH 2021</b-nav-text>
        </b-navbar-nav>
        <b-navbar-nav align="center" small class="ml-auto">
          <DropdownDDLang :dropup="true" />
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto" small>
          <b-nav-text> version: {{ $config.packageVersion }}</b-nav-text>
        </b-navbar-nav>
      </b-container>
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
