<template>
  <div class="container-fluid">
    <b-card class="text-center bg-primary mt-3 mx-auto login_card">
      <div class="mb-2">
        <b-badge class="d-inline-block bg-light">
          <img src="~/uib-components/assets/images/LogoOpsi.png" height="35" alt="opsi logo">
        </b-badge>
        <h1 class="d-inline-block text-light">
          {{ getTitleUppercase() }}
        </h1>
      </div>
      <FormFLogin />
    </b-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({ layout: 'auth' })
export default class PLogin extends Vue {
  $t:any

  getTitleUppercase () {
    return (this.$t('title.project') as string).toUpperCase()
  }
}
</script>

<style>
.login_card {
  max-width: 35%;
}
</style>
