<template>
  <div>
    <b-navbar toggleable="sm" sticky fixed="top" type="dark" variant="secondary">
      <b-navbar-brand href="/">
        <img src="../../assets/images/LogoOpsi.png" class="logo"/>
        Opsiweb
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"> </b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <ButtonBTNLogout />
            <!-- <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button> -->
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
</style>