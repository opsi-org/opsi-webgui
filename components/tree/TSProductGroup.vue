<template>
  <div data-testid="TSProductGroup">
    <LazyTreeTSTreeselect
      v-if="productGroup"
      type="products"
      :options="productGroup"
      :placeholder="'treeselect.prodGroups'"
      icon="grid"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSProductGroup extends Vue {
  $axios: any
  // $nuxt: any
  // $fetch: any
  // $mq: any
  // $t: any

  productGroup: Array<object> = []
  // @auth.Mutation public setSession!: () => void

  async fetch () {
    this.productGroup = Object.values((await this.$axios.$get('/api/opsidata/products/groups')).groups)
    // this.setSession()
  }
}
</script>
