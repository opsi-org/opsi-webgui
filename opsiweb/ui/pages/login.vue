<template>
  <div class="container-fluid">
    <b-card class="login_content text-center bg-primary">
      <div class="login_title_row">
        <b-badge class="bg-light login_logo_container">
          <img src="../assets/images/LogoOpsi.png" class="login_logo" alt="opsi logo">
        </b-badge>
        <h1 class="login_title">
          OPSIWEB
        </h1>
      </div>
      <FormFLogin />
    </b-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({ layout: 'auth' })
export default class PLogin extends Vue {}
</script>

<style>

.login_content {
  margin-top: max(15px, 5%);
  max-width: 450px;
  margin: 0 auto;
}
.login_title_row {
  margin-bottom: 5px;
}

.login_logo_container {
  display: inline-block;
  margin-left:5px;
  margin-right:5p;
  margin-bottom: 1rem !important;
}
.login_logo{
  display: inline-block;
  height: 35px !important;
}

.login_title{
  display: inline-block;
  color: var(--light);
}
</style>
