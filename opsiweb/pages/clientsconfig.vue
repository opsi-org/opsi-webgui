<template>
  <!-- Same as clients/config but shows the only the config column (without parent 'clients') -->
  <!-- breadcrumb is changed from clientsconfig to config -->
  <div class="container-fluid">
    <ViewVClientsConfig :as-child="false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsconfig extends Vue {
}
</script>

<style>

</style>
