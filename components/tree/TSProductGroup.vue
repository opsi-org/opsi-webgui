<template>
  <div data-testid="TSProductGroup">
    <LazyTreeTSTreeselect v-if="productGroup" :options="productGroup" :placeholder="'treeselect.prodGroups'" icon="grid" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const auth = namespace('auth')

@Component
export default class TSProductGroup extends Vue {
  productGroup: Array<object> = []
  // @auth.Mutation public setSession!: () => void

  async fetch () {
    this.productGroup = Object.values((await this.$axios.$get('/api/opsidata/products/groups')).groups)
    // this.setSession()
  }
}
</script>
