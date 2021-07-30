<template>
  <div>
    <b-navbar class="bottombar" fixed="bottom" type="dark" variant="secondary">
      <b-navbar-nav small>
        <b-nav-text> uib GmbH 2021</b-nav-text>
      </b-navbar-nav>
      <b-navbar-nav align="center" small class="ml-auto">
        <DropdownDDLang :dropup="true" />
        <DropdownDDTheme :dropup="true" />
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" small>
        <b-nav-text> version: 1.0.0</b-nav-text>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<style>
.bottombar{
  /* position: fixed; */
  height: 38px;
}
</style>
