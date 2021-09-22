<template>
  <div class="container-fluid">
    <ViewVClientsLog :id="id" :as-child="false">
      <template slot="IDSelection">
        <TreeTSClientsSelect :id.sync="id" />
      </template>
    </ViewVClientsLog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsLog extends Vue {
  id: string = ''
}
</script>
