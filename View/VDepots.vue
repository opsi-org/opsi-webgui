<template>
  <div>
    <div class="mt-3">
      <InputIFilter v-model="tableData.filterQuery" />
      <TableTTable
        id="tabledepots"
        datakey="depotId"
        :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
        :headers="headerData"
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
      <BarBPagination
        :tabledata="tableData"
        :total-rows="fetchedData.total"
        aria-controls="tabledepots"
      />
    </div>
    {{ selectionDepots }}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { IDepot, ITableData, ITableHeaders } from '~/types/tsettings'
const selections = namespace('selections')
@Component
export default class VClients extends Vue {
  fetchedData: object = {}
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 2,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true }, //, class: 'extrasmall-column-width' },
    depotId: { label: 'Id', key: 'depotId', visible: true, _fixed: true },
    description: { label: 'Desc', key: 'description', visible: false },
    type: { label: 'type', key: 'type', visible: false },
    ip: { label: 'ip', key: 'ip', visible: false },
    _empty_: { label: '', key: '_empty_', visible: true, _fixed: true },
    actions: { key: 'actions', label: 'a', visible: true, _fixed: true }
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
