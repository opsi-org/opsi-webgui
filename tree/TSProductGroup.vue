<template>
  <div data-testid="TSProductGroup">
    <LazyTreeTSTreeselect v-if="productGroup" :options="productGroup" :placeholder="'treeselect.prodGroups'" icon="grid" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSProductGroup extends Vue {
  productGroup: Array<object> = []

  async fetch () {
    this.productGroup = Object.values((await this.$axios.$get('/api/opsidata/products/groups')).groups)
  }
}
</script>
