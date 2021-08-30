<template>
  <b-card class="text-center index_content">
    <IconIOpsiLogo />
    <h1> OPSIWEB </h1>
    <!-- <b-button to="/depots/">
      Depots
    </b-button>
    <b-button to="/clients/">
      Clients
    </b-button> -->
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
  height: calc(100% - var(--margin-left-maincontent));
}
.index_content h1 {
  font-size: 5vw;
}
</style>
