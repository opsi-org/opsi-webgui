<template>
  <ViewVHealthCheck :id="id" :as-child="false">
    <template slot="IDSelection">
      <TreeTSDepotsNotStored :id.sync="id" cssclass="treeselect_short" />
    </template>
  </ViewVHealthCheck>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PDepotsHealthCheck extends Vue {
  id: string = ''
}
</script>
