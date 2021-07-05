<template>
  <LazyTableTDefault v-if="result" :stacked="true" :tableitems="[result]" />
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
interface Request {
    hosts: Array<string>
}

@Component
export default class THostAttributes extends Vue {
  @Prop({ }) id!: string
  result:Object = {}
  request: Request = { hosts: [] }
  isLoading: boolean = false

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    if (this.id) { this.$fetch() }
  }

  async fetch () {
    this.request.hosts = [this.id]
    this.result = (await this.$axios.$post(
      '/api/opsidata/hosts', JSON.stringify(this.request)
    )).result
  }
}
</script>

<style>

</style>
