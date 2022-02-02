<template>
  <div class="tablediv">
    <b-table
      id="table"
      ref="table"
      :items="items"
      sticky-header
      responsive
      primary-key="table"
    />
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
// import { BTable } from 'bootstrap-vue'
@Component
export default class TTable extends Vue {
  isLoading: Boolean = false
  items: Array<object> = []
  currentPage: number = 0
  perPage: number = 5
  totalItems: number = 0

  created () {
    this.fetchItems()
  }

  async fetchItems () {
    if (this.items.length === this.totalItems) { return }
    this.isLoading = true
    const startIndex = this.currentPage++ * this.perPage
    const endIndex = startIndex + this.perPage
    const newItems = await this.callBackend(startIndex, endIndex)
    this.items = this.items.concat(newItems)
    this.isLoading = false
  }

  mounted () {
    const tableScrollBody = (this.$refs.table as any).$el
    tableScrollBody.addEventListener('scroll', this.onScroll)
  }

  onScroll (event) {
    if (
      event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
      if (!this.isLoading) {
        this.fetchItems()
      }
    }
  }
}
</script>

<style>

</style>
