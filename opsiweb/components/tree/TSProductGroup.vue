<template>
  <div>
    <LazyTreeTSTreeselect v-if="productGroup" :options="productGroup" :type="'productgroup'" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSProductGroup extends Vue {
  productGroup: Array<object> = []

  async fetch () {
    this.productGroup = Object.values((await this.$axios.$post('/api/opsidata/products/groups')).result.groups.children)
  }
}
</script>

<style>

</style>
