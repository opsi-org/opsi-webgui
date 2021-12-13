<template>
  <b-card class="text-center index_content">
    <ComponentsIconIOpsiLogo />
    <h1>  OPSIWEB  </h1>
  </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PIndex extends Vue {

}
</script>

<style>
.index_content {
  height: calc(100% - var(--height-navbar));
}
.index_content h1 {
  font-size: 5vw;
}
</style>
