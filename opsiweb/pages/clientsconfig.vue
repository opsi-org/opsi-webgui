<template>
  <div class="container-fluid">
    <ViewVConfig :id="id" :as-child="false">
      <template slot="IDSelection">
        <TreeTSClients :id.sync="id" />
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
