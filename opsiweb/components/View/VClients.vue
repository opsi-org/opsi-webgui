<template>
  <div>
    <div class="mt-3">
      <b-form-input v-model="tableData.filterQuery" />
      <b-table
        id="tableclients"
        striped
        hover
        :items="fetchedData.clients"
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
        aria-controls="tableclients"
        size="sm"
        align="fill"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator'
@Component
export default class VClients extends Vue {
  fetchedData: object = {}
  tableData: object = {
    pageNumber: 1,
    perPage: 10,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    selectedDepot: []
  }

  async fetch () {
    this.fetchedData = (await this.$axios.$post('/api/opsidata/clients', JSON.stringify(this.tableData))).result
  }

  @Watch('tableData', { deep: true })
  tableDataChanged () {
    this.$fetch()
  }
}
</script>

<style>
</style>
