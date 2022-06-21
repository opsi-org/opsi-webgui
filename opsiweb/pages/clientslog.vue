<template>
  <ViewVClientsLog :id="id" :as-child="false">
    <template slot="IDSelection">
      <TreeTSClientsNotStored :id.sync="id" />
    </template>
  </ViewVClientsLog>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsLog extends Vue {
  id: string = ''
}
</script>
