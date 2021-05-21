<template>
  <div>
    <b-navbar class="topbar" toggleable="sm" fixed="top" variant="secondary">
      <b-navbar-brand href="/">
        <img src="../../assets/images/LogoOpsi.png" class="logo" alt="opsi logo">
        Opsiweb
        <b-button
          to="/depots/"
          class="button--grey"
        >
          Depots
        </b-button>
        <b-button
          to="/clients/"
          class="button--grey"
        >
          Clients
        </b-button>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse">
        <template #default="">
          <b-icon icon="three-dots-vertical" />
        </template>
      </b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto float-right">
          <b-nav-form>
            <DropdownDDTheme />
            <ButtonBTNLogout />
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<style>
.logo {
  height: 25px !important;
}
.topbar{
  position: fixed;
  height: 56px !important;
}
</style>
