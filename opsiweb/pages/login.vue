<template>
  <div class="container">
    <b-card class="text-center">
      <h1> <img src="../assets/images/LogoOpsi.png" class="login_logo" alt="opsi logo">  opsiweb</h1>
      <FormFLogin />
    </b-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
@Component({
  layout: 'auth'
})
export default class PLogin extends Vue {}
</script>

<style>
.login_logo{
  height: 35px !important;
}
</style>
