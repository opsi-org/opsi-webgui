<template>
  <div class="container-fluid">
    <b-card class="text-center bg-primary mt-3 mx-auto login_card">
      <IconIOpsiLogo class="mb-3" height="35" />
      <h1 class="d-inline-block text-light">
        {{ getTitleUppercase() }}
      </h1>
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
