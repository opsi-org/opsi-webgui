<template>
  <ViewVConfig :id="id" :as-child="false">
    <template slot="IDSelection">
      <TreeTSDepotsNotStored :id.sync="id" />
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
