<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened">
    <template #parent>
      <div class="mt-3">
        <!-- Filter: {{tableData.filterQuery}} -->
        <div class="inline">
          <InputIFilter :data="tableData" />
          <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" />
          <DropdownDDClientIds v-if="fetchedDataDepotIds.length > 1" />
          <!-- Selection: {{ selectionDepots }} <br />
          Selection: {{ selectionClients }} <br />
          rowID {{ rowId }}
          Sorting By: <b>{{ tableData.sortBy }}</b>, Sort Direction:
          <b>{{ tableData.sortDesc ? 'Descending' : 'Ascending' }}</b> -->
        </div>
        <TableTCollapseable
          id="tableproducts"
          datakey="productId"
          :title="'Localboot products'"
          :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
          :headers="headerData"
          :items="fetchedData.products"
          :selection="selectionClients"
          :onchangeselection="setSelectionProducts"
          :loading="isLoading"
          :totalrows="fetchedData.total"
          select-mode="multi"
          selectable
        >
          <!-- :no-local-sorting="true"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc" -->
          <template #cell(version)="row">
            <TableCellTCProductVersionCell
              :rowid="row.item.productId"
              :clients2depots="fetchedDataClients2Depots"
              :values-depots="row.item.depotVersions || []"
              :values-clients="row.item.clientVersions || []"
              :objects-depots="row.item.selectedDepots || []"
              :objects-clients="row.item.selectedClients || []"
            />
          </template>

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
          <template #head(actionRequest)>
            <DropdownDDProductRequest
              v-if="selectionClients.length>0"
              :title="'Set actionrequest for all selected products'"
              :save="saveActionRequests"
            />
          </template>

          <template #cell(actionRequest)="row">
            <!-- {{row.item.actionRequest}} -->
            <!-- :title="'Set actionrequest for all selected products'" -->
            <DropdownDDProductRequest
              v-if="selectionClients.length>0"
              :request="row.item.actionRequest || ['none']"
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
      </div>
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
    perPage: 2,
    sortBy: 'productId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true },
    productId: { label: 'Id', key: 'productId', visible: true, _fixed: true, sortable: true },
    desc: { label: 'desc', key: 'desc', visible: false, sortable: true },
    name: { label: 'name', key: 'name', visible: false, sortable: true },
    selectedClients: { label: 'clientIds', key: 'selectedClients', visible: false },
    selectedDepots: { label: 'depotIds', key: 'selectedDepots', visible: false },
    installationStatus: { label: 'installationStatus', key: 'installationStatus', visible: false, sortable: true },
    actionRequest: { label: '', key: 'actionRequest', visible: true, sortable: true, _fixed: true },
    version: { label: 'version', key: 'version', visible: false, sortable: true },
    // macAddress: { label: 'MAC', key: 'macAddress', visible: false },
    // _majorStats: { label: 'stats', key: '_majorStats', _isMajor: true, visible: false },
    // version_outdated: { label: 'vO', key: 'version_outdated', _majorKey: '_majorStats', visible: false },
    // actionResult_failed: { label: 'aR failed', key: 'actionResult_failed', _majorKey: '_majorStats', visible: false },
    rowactions: { key: 'rowactions', label: '-', visible: true, _fixed: true }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  // get sortBy (): string {
  //   console.log("sortby asked", this.tableData.sortBy)
  //   return this.tableData.sortBy
  // }

  // set sortBy (s: string) {
  //   this.tableData.sortBy = s
  //   console.log("sortby set", this.tableData.sortBy)
  // }

  // get sortDesc (): boolean {
  //   console.log("sortDesc asked", this.tableData.sortDesc)
  //   return this.tableData.sortDesc
  // }

  // set sortDesc (s: boolean) {
  //   this.tableData.sortDesc = s
  //   console.log("sortDesc set", this.tableData.sortDesc)
  // }

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () { this.$fetch() }

  @Watch('selectionClients', { deep: true })
  selectionClientsChanged () { this.$fetch() }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  async fetch () {
    this.isLoading = true
    if (this.fetchOptions.fetchDepotIds) {
      this.fetchedDataDepotIds = (await this.$axios.$post('/api/opsidata/depotIds')).result
      this.fetchOptions.fetchDepotIds = false
    }
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
      this.fetchedData = (await this.$axios.$post(
        '/api/opsidata/products',
        JSON.stringify(this.tableData)
      )).result
      // console.log('products', this.fetchedData)
    }
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
