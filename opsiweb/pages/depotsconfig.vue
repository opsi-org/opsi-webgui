<template>
  <ViewVConfig :id="id" :as-child="false" type="depots">
    <template slot="IDSelection">
      <TreeTSDepotsNotStored :id.sync="id" cssclass="treeselect_depotselect_short" />
    </template>
  </ViewVConfig>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PDepotsConfig extends Vue {
  id: string = ''
}
</script>
