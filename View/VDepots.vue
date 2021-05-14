<template>
  <div>
    <div class="mt-3">
      <b-form-input v-model="tableData.filterQuery" />
      <b-table
        id="tabledepots"
        striped
        hover
        :items="fetchedData.depots"
        :no-local-sorting="true"
        :sort-by.sync="tableData.sortBy"
        :sort-desc.sync="tableData.sortDesc"
        sort-icon-left
      />
      {{ fetchedData.total }}
      <b-pagination
        v-model="tableData.pageNumber"
        :per-page="tableData.perPage"
        :total-rows="fetchedData.total"
        first-number
        last-number
        aria-controls="tabledepots"
        size="sm"
        align="fill"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator'
@Component
export default class VDepots extends Vue {
  fetchedData: object = {}
  tableData: object = {
    pageNumber: 1,
    perPage: 10,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: ''
  }

  async fetch () {
    this.fetchedData = (await this.$axios.$post('/api/opsidata/depots', JSON.stringify(this.tableData))).result
  }

  @Watch('tableData', { deep: true })
  tableDataChanged () {
    this.$fetch()
  }
}
</script>

<style>
</style>
