<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened">
    <template #parent>
      <BarBPageHeader>
        <template #left>
          <InputIFilter :data="tableData" />
        </template>
      </BarBPageHeader>
      <TableTTable
        id="tabledepots"
        datakey="depotId"
        :tabledata="tableData"
        :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
        :headers="headerData"
        :items="fetchedData.depots"
        :selection="selectionDepots"
        :onchangeselection="setSelectionDepots"
        :loading="isLoading"
        :totalrows="fetchedData.total"
      >
        <template #cell(rowactions)="row">
          <ButtonBTNRowLinkTo
            :title="$t('title.config')"
            icon="gear"
            to="/depots/config"
            :ident="row.item.ident"
            :pressed="isRouteActive"
            :click="routeRedirectWith"
          />
        </template>
      </TableTTable>
      <BarBPagination
        :tabledata="tableData"
        :total-rows="fetchedData.total"
        aria-controls="tabledepots"
      />
      <b>Selection: </b> <br>
      Depots : {{ selectionDepots }} <br>
      <!-- rowID {{ rowId }} <br>
      Filter Query: {{ tableData.filterQuery }} -->
    </template>
    <template #child>
      <NuxtChild :id="rowId" :as-child="true" />
    </template>
  </GridGTwoColumnLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders } from '~/types/ttable'
const selections = namespace('selections')
@Component
export default class VDepots extends Vue {
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  rowId: string = ''
  fetchedData: object = {}
  isLoading: boolean = true
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 5,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true },
    depotId: { label: 'table.fields.id', key: 'depotId', visible: true, _fixed: true, sortable: true },
    description: { label: 'table.fields.description', key: 'description', visible: false, sortable: true },
    type: { label: 'table.fields.type', key: 'type', visible: false, sortable: true },
    ip: { label: 'table.fields.ip', key: 'ip', visible: false, sortable: true },
    _empty_: { label: '', key: '_empty_', visible: true, _fixed: true },
    rowactions: { key: 'rowactions', label: 'a', visible: true, _fixed: true }
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowId === rowIdent
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  @Watch('tableData', { deep: true }) tableDataChanged () {
    // eslint-disable-next-line no-console
    console.log('tableData changed')
    this.$fetch()
  }

  async fetch () {
    this.isLoading = true
    this.fetchedData = (await this.$axios.$post('/api/opsidata/depots', JSON.stringify(this.tableData))).result
    this.isLoading = false
  }
}
</script>

<style>

</style>
