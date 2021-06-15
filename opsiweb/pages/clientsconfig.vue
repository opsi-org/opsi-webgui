<template>
  <!-- Same as clients/config but shows the only the config column (without parent 'clients') -->
  <!-- breadcrumb is changed from clientsconfig to config -->
  <div class="container-fluid">
    <ViewVConfig :id="id" :as-child="false">
      <template slot="IDSelection">
        <SelectSClientIds :id.sync="id" />
      </template>
    </ViewVConfig>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsconfig extends Vue {
  id: string = ''
}
</script>

<style>

</style>
