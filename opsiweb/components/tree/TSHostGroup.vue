<template>
  <div>
    <LazyTreeTSTreeselect v-if="hostGroup" :options="hostGroup" :type="'hostgroup'" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSHostGroup extends Vue {
  hostGroup: Array<object> = []

  async fetch () {
    this.hostGroup = Object.values((await this.$axios.$post('/api/opsidata/hosts/groups', '')).result.groups.children)
  }
}
</script>

<style>

</style>
