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

    <div>
      <div class="mt-3">
        <b-form-input v-model="tableData.filterQuery" />
        <TableTTable
          id="tableclients"
          datakey="clientId"
          :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
          :headers="headerData"
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
      <div>
        {{ selectionDepots }}
      </div>
      <div>
        {{ selectionClients }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { IClient, ITableData, ITableHeaders } from '~/types/tsettings'
const selections = namespace('selections')
@Component
export default class VClients extends Vue {
  fetchedData: object = {}
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 10,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: ''
  }

  headerData: ITableHeaders = {
    selected: { label: 's', key: 'sel', visible: true, _fixed: true }, //, class: 'extrasmall-column-width' },
    clientId: { label: 'Id', key: 'clientId', visible: true, _fixed: true },
    description: { label: 'Desc', key: 'description', visible: false },
    ipAddress: { label: 'IP', key: 'ipAddress', visible: false },
    _empty_: { label: '', key: '_empty_', visible: true, _fixed: true },
    actions: { key: 'actions', label: 'a', visible: true, _fixed: true }
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
