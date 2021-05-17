<template>
  <div>
    <b-button
      to="/"
      class="button--grey"
    >
      Home
    </b-button>
    <b-button
      to="/depots/"
      class="button--grey"
    >
      Depots
    </b-button>
    <!-- <TableTTable /> -->

    <div>
      <div class="mt-3">
        <b-form-input v-model="tableData.filterQuery" />
        <TableTTable
          id="tableclients"
          datakey="clientId"
          :fields="Object.values(headerData)"
          :items="fetchedData.clients"
          :selection="selectionClients"
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
          aria-controls="tableclients"
          size="sm"
          align="fill"
        />
      </div>
      {{ selectionDepots }}
      <br />
      {{ selectionClients }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { IClient, ITableData } from '~/types/tsettings'
const selections = namespace('selections')
@Component
export default class VClients extends Vue {
  fetchedData: object = {}
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 10,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    selectedDepot: []
  }

  headerData: object = {
    selected: { label: 's', key: 'sel', visible: true }, //, class: 'extrasmall-column-width' },
    clientId: { label: 'Id', key: 'clientId', visible: true },
    description: { label: 'Desc', key: 'description', visible: true },
    actions: { key: 'actions', label: 'a', visible: true, selectableColumn: false }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  selectRow (s: Array<IClient>) {
    this.setSelectionClients(s.map(o => o.clientId))
  }

  @Watch('selectedDepots', { deep: true })
  selectionDepotsChanged () {
    this.tableData.selectedDepot = this.selectionDepots
    this.$fetch()
  }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  async fetch () {
    this.fetchedData = (await this.$axios.$post('/api/opsidata/clients', JSON.stringify(this.tableData))).result
  }
}
</script>

<style>

</style>
