<template>
  <div>
    <b-navbar class="topbar" toggleable="sm" fixed="top" type="dark" variant="secondary">
      <b-navbar-brand href="/">
        <img src="../../assets/images/LogoOpsi.png" class="logo"/>
        Opsiweb
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"> </b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
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
}
</style>