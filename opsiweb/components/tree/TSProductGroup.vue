<template>
  <LazyTreeTSTreeselect v-if="productGroup" :options="productGroup" :type="'productgroup'" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSProductGroup extends Vue {
  productGroup: Array<object> = []

  async fetch () {
    this.productGroup = Object.values((await this.$axios.$get('/api/opsidata/products/groups')).result.groups)
  }
}
</script>

<style>
</style>
