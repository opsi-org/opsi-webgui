<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened">
    <template #parent>
      <BarBPageHeader>
        <template #left>
          <InputIFilter :data="tableData" />
          <DropdownDDDepotIds />
          <DropdownDDClientIds />
          <!-- <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" />
          <DropdownDDClientIds v-if="fetchedDataDepotIds.length > 1" /> -->
          <TreeTSProductGroup />
        </template>
      </BarBPageHeader>
      <TableTCollapseable
        id="tableproducts"
        datakey="productId"
        :tabledata="tableData"
        :title="$t('title.localboot')"
        :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
        :headers="headerData"
        :items="fetchedData.products"
        :selection="selectionProducts"
        :onchangeselection="setSelectionProducts"
        :loading="isLoading"
        :totalrows="fetchedData.total"
        :stacked="$mq=='mobile'"
      >
        <!-- :no-local-sorting="true"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc" -->
        <template #cell(_majorVersion)="row">
          <TableCellTCProductVersionCell
            v-if="Object.keys(fetchedDataClients2Depots).length > 0"
            type="depotVersions"
            :rowitem="row.item"
            :clients2depots="fetchedDataClients2Depots"
          />
        </template>
        <!-- <template #cell(clientVersions)="row">
          <TableCellTCProductVersionCell
            v-if="fetchedDataClients2Depots"
            type="clientVersion"
            :rowitem="row.item"
            :clients2depots="fetchedDataClients2Depots"
          />
        </template> -->

        <template #head(installationStatus)>
          is
        </template>

        <template #cell(installationStatus)="row">
          <TableCellTCBadgeCompares
            v-if="(selectionClients && row.item.selectedClients)"
            type="installationStatus"
            :rowid="row.item.productId"
            :values="row.item.installationStatus || []"
            :objects="row.item.selectedClients || []"
            :objectsorigin="selectionClients || []"
          />
        </template>
        <!-- <template #cell(name)="row">
            <TableCellTCProductCellComparable :list2text="row.item.name" />
          </template> -->
        <!-- <template #cell(productId)="row">
            <TableCellTCProductCellComparable :list2text="row.item.productId" />
          </template> -->
        <template v-if="selectionClients.length>0" #head(actionRequest)>
          <DropdownDDProductRequest
            v-if="selectionClients.length>0"
            :title="$t('formselect.tooltip.actionRequest')"
            :save="saveActionRequests"
          />
        </template>

        <template v-if="selectionClients.length>0" #cell(actionRequest)="row">
          <!-- {{row.item.actionRequest}} -->
          <!-- :title="'Set actionrequest for all selected products'" -->
          <!-- {{row.item.installationStatus}} -->
          <DropdownDDProductRequest
            :request="row.item.actionRequest || 'none'"
            :requestoptions="row.item.actions"
            :rowitem="row.item"
            :save="saveActionRequest"
          />
          <!-- {{row.item.versionDepot}} -->
        </template>

        <template #pagination>
          <BarBPagination
            :tabledata="tableData"
            :total-rows="fetchedData.total"
            aria-controls="tableproducts"
          />
        </template>
      </TableTCollapseable>
      <b>Selection: </b> <br>
      Depots : {{ selectionDepots }} <br>
      Clients: {{ selectionClients }} <br>
      Products: {{ selectionProducts }} <br>
      <!-- Sorting By: <b>{{ tableData.sortBy }}</b>, Sort Direction:
      <b>{{ tableData.sortDesc ? 'Descending' : 'Ascending' }}</b> -->
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
import { ITableData, ITableHeaders, ITableRowItemProducts } from '~/types/ttable'
const selections = namespace('selections')
interface IFetchOptions {
  fetchClients:boolean,
  fetchDepotIds:boolean,
  fetchClients2Depots:boolean,
}
@Component
export default class VProducts extends Vue {
  rowId: string = ''
  isLoading: boolean = true
  fetchedData: object = {}
  fetchedDataClients2Depots: object = {}
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true, fetchDepotIds: true }
  tableData: ITableData = {
    type: 'LocalbootProduct',
    pageNumber: 1,
    perPage: 5,
    sortBy: 'productId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true },
    productId: { label: 'table.fields.id', key: 'productId', visible: true, _fixed: true, sortable: true },
    desc: { label: 'table.fields.description', key: 'desc', visible: false, sortable: true },
    name: { label: 'table.fields.name', key: 'name', visible: false, sortable: true },
    selectedClients: { label: 'table.fields.clientsIds', key: 'selectedClients', visible: false },
    selectedDepots: { label: 'table.fields.depotIds', key: 'selectedDepots', visible: false },
    installationStatus: { label: 'table.fields.instStatus', key: 'installationStatus', visible: false, sortable: true },
    actionRequest: { label: 'actionRequest', key: 'actionRequest', visible: false, sortable: true, _fixed: false },
    _majorVersion: { label: 'table.fields.version', key: '_majorVersion', _isMajor: true, visible: true },
    // depotVersions: { label: 'version', key: 'depotVersions', _majorKey: '_majorVersion', visible: true, sortable: true, class: 'bg-color-grey text-right' },
    // clientVersions: { label: 'c', key: 'clientVersions', _majorKey: '_majorVersion', visible: false, sortable: true, class: 'bg-color-grey width-max-content ' },
    rowactions: { key: 'rowactions', label: '', visible: true, _fixed: true, class: '' }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () {
    this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    this.$fetch()
  }

  @Watch('selectionClients', { deep: true })
  selectionClientsChanged () {
    this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    this.$fetch()
    this.updateColumnVisibility()
  }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  mounted () {
    this.updateColumnVisibility()
  }

  updateColumnVisibility () {
    if (this.selectionClients.length > 0) {
      this.headerData.actionRequest.visible = true
    } else {
      this.headerData.actionRequest.visible = false
    }
  }
  // async beforeMount () {
  //   this.tableData.selectedDepots = this.selectionDepots
  //   this.tableData.selectedClients = this.selectionClients
  //   if (this.tableData.sortBy === 'depotVersions') { this.tableData.sortBy = 'depot_version_diff' }
  //   if (this.tableData.sortBy === 'clientVersions') { this.tableData.sortBy = 'client_versoin_outdated' }
  //   this.fetchedData = (await this.$axios.$post(
  //     '/api/opsidata/products',
  //     JSON.stringify(this.tableData)
  //   )).result
  // }

  async fetch () {
    this.isLoading = true
    // if (this.fetchOptions.fetchDepotIds) {
    //   this.fetchedDataDepotIds = (await this.$axios.$get('/api/opsidata/depotIds')).result
    //   this.fetchOptions.fetchDepotIds = false
    // }
    if (this.fetchOptions.fetchClients2Depots) {
      this.fetchedDataClients2Depots = (await this.$axios.$post(
        '/api/opsidata/clients/depots',
        JSON.stringify({ selectedClients: this.selectionClients })
      )).result
      this.fetchOptions.fetchClients2Depots = false
    }

    if (this.fetchOptions.fetchClients) {
      this.tableData.selectedDepots = this.selectionDepots
      this.tableData.selectedClients = this.selectionClients
      if (this.tableData.sortBy === 'depotVersions') { this.tableData.sortBy = 'depot_version_diff' }
      if (this.tableData.sortBy === 'clientVersions') { this.tableData.sortBy = 'client_versoin_outdated' }
      this.fetchedData = (await this.$axios.$post(
        '/api/opsidata/products',
        JSON.stringify(this.tableData)
      )).result
      // console.log('products', this.fetchedData)
    }

    // this.tableData.selectedDepots = this.selectionDepots
    // this.tableData.selectedClients = this.selectionClients
    // if (this.tableData.sortBy === 'depotVersions') { this.tableData.sortBy = 'depot_version_diff' }
    // if (this.tableData.sortBy === 'clientVersions') { this.tableData.sortBy = 'client_versoin_outdated' }
    // this.fetchedData = (await this.$axios.$post(
    //   '/api/opsidata/products',
    //   JSON.stringify(this.tableData)
    // )).result
    this.isLoading = false
  }

  saveActionRequest (rowitem: ITableRowItemProducts, newrequest: string) {
    // TODO: saving in database for dropdown in table cell(actionRequest)
    rowitem.request = [newrequest]
  }

  saveActionRequests (rowitem: ITableRowItemProducts, newrequest: string) {
    // TODO: saving in database for dropdown in table head(actionRequest)
    // eslint-disable-next-line no-console
    console.log('save action Request for all selected clients and products')
    // eslint-disable-next-line no-console
    console.log(rowitem, newrequest)
    // for (const i in this.selectionProducts) {
    //   this.fetchedData[this.selectionProducts[i]].request = newrequest
    // }
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
