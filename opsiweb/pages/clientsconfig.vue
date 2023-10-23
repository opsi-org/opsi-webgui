<template>
  <ViewVConfig :id="id" :as-child="false" :type="type">
    <template slot="IDSelection">
      <TreeTSClientsNotStored :id.sync="id" :empty-allowed="false" />
    </template>
  </ViewVConfig>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsConfig extends Vue {
  id: string = ''
  type: string = 'clients'
}
</script>
