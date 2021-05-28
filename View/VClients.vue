<template>
  <div>
    <div class="mt-3">
      <!-- <b-form-input v-model="tableData.filterQuery" /> -->
      <div class="inline">
        <InputIFilter v-model="tableData.filterQuery" />
        <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" />
      </div>
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
      <BarBPagination
        :tabledata="tableData"
        :total-rows="fetchedData.total"
        aria-controls="tableclients"
      />
    </div>
    <div>
      {{ selectionDepots }}
    </div>
    <div>
      {{ selectionClients }}
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
  fetchedDataDepotIds: Array<string> = []
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 3,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true }, //, class: 'extrasmall-column-width' },
    clientId: { label: 'Id', key: 'clientId', visible: true, _fixed: true },
    description: { label: 'Desc', key: 'description', visible: false },
    ipAddress: { label: 'IP', key: 'ipAddress', visible: false },
    macAddress: { label: 'MAC', key: 'macAddress', visible: false },
    _majorStats: { label: 'stats', key: '_majorStats', _isMajor: true, visible: false },
    version_outdated: { label: 'vO', key: 'version_outdated', _majorKey: '_majorStats', visible: false },
    actionResult_failed: { label: 'aR failed', key: 'actionResult_failed', _majorKey: '_majorStats', visible: false },
    // _empty_: { label: '', key: '_empty_', visible: true, _fixed: true },
    actions: { key: 'actions', label: 'a', visible: true, _fixed: true }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  selectRow (s: Array<IClient>) {
    this.setSelectionClients(s.map(o => o.clientId))
  }

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () {
    this.$fetch()
  }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  async fetch () {
    this.tableData.selectedDepot = this.selectionDepots
    this.fetchedData = (await this.$axios.$post('/api/opsidata/clients', JSON.stringify(this.tableData))).result
    this.fetchedDataDepotIds = (await this.$axios.$post('/api/opsidata/depotIds')).result
  }
}
</script>

<style>

</style>
