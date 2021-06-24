<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened">
    <template #parent>
      <BarBPageHeader>
        <template #filter>
          <InputIFilter :data="tableData" />
        </template>
        <template #selection>
          <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" />
        </template>
      </BarBPageHeader>
      <TableTTable
        id="tableclients"
        datakey="clientId"
        :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
        :headers="headerData"
        :items="fetchedData.clients"
        :selection="selectionClients"
        :onchangeselection="setSelectionClients"
        :loading="isLoading"
        :totalrows="fetchedData.total"
        :no-local-sorting="true"
        :sort-by.sync="tableData.sortBy"
        :sort-desc.sync="tableData.sortDesc"
        select-mode="multi"
        selectable
      >
        <template #cell(rowactions)="row">
          <!-- <ButtonBTNRowLinkTo
            title="config"
            icon="gear"
            to="/clients/config"
            :ident="row.item.ident"
            :pressed="isRouteActive"
            :click="routeRedirectWith"
          /> -->

          <ButtonBTNRowLinkTo
            title="log"
            icon="file-earmark-text"
            to="/clients/log"
            :ident="row.item.ident"
            :pressed="isRouteActive"
            :click="routeRedirectWith"
          />
        </template>
      </TableTTable>
      <BarBPagination
        :tabledata="tableData"
        :total-rows="fetchedData.total"
        aria-controls="tableclients"
      />
      <b>Selection: </b> <br>
      Depots : {{ selectionDepots }} <br>
      Clients : {{ selectionClients }} <br>
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
interface IFetchOptions {
  fetchClients:boolean,
  fetchDepotIds:boolean,
}
@Component
export default class VClients extends Vue {
  rowId: string = ''
  isLoading: boolean = true
  fetchedData: object = {}
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchDepotIds: true }
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 5,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true },
    clientId: { label: 'Id', key: 'clientId', visible: true, _fixed: true },
    description: { label: 'Desc', key: 'description', visible: false },
    ipAddress: { label: 'IP', key: 'ipAddress', visible: false },
    macAddress: { label: 'MAC', key: 'macAddress', visible: false },
    _majorStats: { label: 'stats', key: '_majorStats', _isMajor: true, visible: false },
    version_outdated: { label: 'v outated', key: 'version_outdated', _majorKey: '_majorStats', visible: false },
    actionResult_failed: { label: 'aR failed', key: 'actionResult_failed', _majorKey: '_majorStats', visible: false },
    rowactions: { key: 'rowactions', label: 'a', visible: true, _fixed: true }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () { this.$fetch() }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  async fetch () {
    this.isLoading = true
    if (this.fetchOptions.fetchClients) {
      this.tableData.selectedDepots = this.selectionDepots
      this.fetchedData = (await this.$axios.$post('/api/opsidata/clients', JSON.stringify(this.tableData))).result
    }
    if (this.fetchOptions.fetchDepotIds) {
      this.fetchedDataDepotIds = (await this.$axios.$post('/api/opsidata/depotIds')).result
      this.fetchOptions.fetchDepotIds = false
    }
    this.isLoading = false
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
}
</script>

<style>

</style>
