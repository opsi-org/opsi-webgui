<template>
  <div>
    <b-button
      to="/"
      class="button--grey"
    >
      Home
    </b-button>
    <b-button
      to="/clients/"
      class="button--grey"
    >
      Clients
    </b-button>
    <!-- <TableTTable /> -->

    <div>
      <div class="mt-3">
        <b-form-input v-model="tableData.filterQuery" />
        <TableTTable
          id="tabledepots"
          datakey="depotId"
          :fields="Object.values(headerData)"
          :items="fetchedData.depots"
          :selection="selectionDepots"
          :no-local-sorting="true"
          :sort-by.sync="tableData.sortBy"
          :sort-desc.sync="tableData.sortDesc"
          sort-icon-left
          select-mode="multi"
          selectable
          striped
          hover
          :rowchanged="selectRow"
        />
          <!-- :fetch="fetch" -->
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
      {{ selectionDepots }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { IDepot, ITableData } from '~/types/tsettings'
const selections = namespace('selections')
@Component
export default class VClients extends Vue {
  fetchedData: object = {}
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 10,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: ''
  }

  headerData: object = {
    selected: { label: 's', key: 'sel', visible: true }, //, class: 'extrasmall-column-width' },
    depotId: { label: 'Id', key: 'depotId', visible: true },
    description: { label: 'Desc', key: 'description', visible: true },
    actions: { key: 'actions', label: 'a', visible: true, selectableColumn: false }
  }

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  selectRow (s: Array<IDepot>) {
    this.setSelectionDepots(s.map(o => o.depotId))
  }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  async fetch () {
    this.fetchedData = (await this.$axios.$post('/api/opsidata/depots', JSON.stringify(this.tableData))).result
  }
}
</script>

<style>

</style>
