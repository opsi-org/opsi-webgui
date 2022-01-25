<template>
  <b-card class="text-center index_content">
    <IconIOpsiLogo class="logo" />
    <h1>  {{ $t("title.project") }} </h1>
  </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PIndex extends Vue {
  $t:any
}
</script>

<style>
.index_content {
  height: calc(100% - var(--height-navbar));
}
.index_content h1 {
  font-size: 5vw;
}
.logo {
  max-width: 50%;
  max-height: 50%;
}

</style>
