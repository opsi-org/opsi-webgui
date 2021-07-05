<template>
  <LazyTableTDefault v-if="result" :is-busy="isLoading" :stacked="true" :tableitems="[result]" />
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
    this.$fetch()
  }

  async fetch () {
    if (this.id) {
      this.isLoading = true
      this.request.hosts = [this.id]
      this.result = (await this.$axios.$post(
        '/api/opsidata/hosts', JSON.stringify(this.request)
      )).result
      this.isLoading = false
    }
  }
}
</script>

<style>

</style>
