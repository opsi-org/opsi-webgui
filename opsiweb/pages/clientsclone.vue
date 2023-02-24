<template>
  <ViewVClientClone :id="id" :as-child="false">
    <template slot="IDSelection">
      <TreeTSClientsNotStored :id.sync="id" />
    </template>
  </ViewVClientClone>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsClone extends Vue {
  id: string = ''
}
</script>
