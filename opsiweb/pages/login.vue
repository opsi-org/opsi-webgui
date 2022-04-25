<template>
  <div class="container-fluid">
    <b-card class="text-center bg-secondary mt-3 mx-auto w-25">
      <IconIOpsiLogo :light="true" class="mb-3" height="35" />
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
