<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened">
    <template #parent>
      <div>
        <div class="mt-3">
          Filter: {{tableData.filterQuery}}
          <div class="inline">
            <InputIFilter :data="tableData" />
            <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" />
            <DropdownDDClientIds v-if="fetchedDataDepotIds.length > 1" />
            Selection: {{ selectionDepots }} <br />
            Selection: {{ selectionClients }} <br />
            rowID {{ rowId }}
          </div>
          <TableTCollapseable
            id="tableproducts"
            datakey="productId"
            :title="'Localboot products'"
            :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
            :headers="headerData"
            :items="Object.values(fetchedData)"
            :selection="selectionClients"
            :onchangeselection="setSelectionProducts"
            :loading="isLoading"
            :totalrows="fetchedData.total"
            :no-local-sorting="true"
            :sort-by.sync="tableData.sortBy"
            :sort-desc.sync="tableData.sortDesc"
            select-mode="multi"
            selectable
          >
            <template #cell(version)="row">
              <TableCellTCSpan :list2text="row.item.versionDepot" />
            </template>
            <template #cell(name)="row">
              <TableCellTCSpan :list2text="row.item.name" />
            </template>
            <template #cell(productId)="row">
              <TableCellTCSpan :list2text="row.item.productId" />
            </template>
            <template #head(request)>
              <DropdownDDProductRequest
                v-if="selectionClients.length>0"
                :title="'Set actionrequest for all selected products'"
                :save="saveActionRequests"
              />
            </template>
            <template #cell(request)="row">
              <DropdownDDProductRequest
                :title="'Set actionrequest for all selected products'"
                :request="row.item.request"
                :requestoptions="row.item.requestOptions"
                :rowitem="row.item"
                :save="saveActionRequest"
              />
              <!-- {{row.item.versionDepot}} -->
            </template>

            <template #pagination>
              <BarBPagination
                :tabledata="tableData"
                :total-rows="fetchedData.total"
                aria-controls="tableclients"
              />
            </template>
          </TableTCollapseable>
        </div>
      </div>
    </template>
    <template #child>
      <NuxtChild :id="rowId" :as-child="true" />
    </template>
  </GridGTwoColumnLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders, ITableRowItemProducts } from '~/types/tsettings'
const selections = namespace('selections')
interface IFetchOptions {
  fetchClients:boolean,
  fetchDepotIds:boolean,
}
@Component
export default class VProducts extends Vue {
  rowId: string = ''
  isLoading: boolean = true
  fetchedData: object = {}
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchDepotIds: true }
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 2,
    sortBy: 'productId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true },
    productId: { label: 'Id', key: 'productId', visible: true, _fixed: true },
    name: { label: 'Desc', key: 'name', visible: true },
    request: { label: 'request', key: 'request', visible: true },
    version: { label: 'version', key: 'version', visible: true }
    // macAddress: { label: 'MAC', key: 'macAddress', visible: false },
    // _majorStats: { label: 'stats', key: '_majorStats', _isMajor: true, visible: false },
    // version_outdated: { label: 'vO', key: 'version_outdated', _majorKey: '_majorStats', visible: false },
    // actionResult_failed: { label: 'aR failed', key: 'actionResult_failed', _majorKey: '_majorStats', visible: false },
    // actions: { key: 'actions', label: 'a', visible: true, _fixed: true }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () { this.$fetch() }

  @Watch('selectionClients', { deep: true })
  selectionClientsChanged () { this.$fetch() }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  async fetch () {
    this.isLoading = true
    if (this.fetchOptions.fetchClients) {
      this.tableData.selectedDepots = this.selectionDepots
      this.fetchedData = (await this.$axios.$post('/api/opsidata/localbootproducts', JSON.stringify(this.tableData))).result
    }
    if (this.fetchOptions.fetchDepotIds) {
      this.fetchedDataDepotIds = (await this.$axios.$post('/api/opsidata/depotIds')).result
      this.fetchOptions.fetchDepotIds = false
    }
    this.isLoading = false
  }

  saveActionRequest (rowitem: ITableRowItemProducts, newrequest: string) {
    rowitem.request = [newrequest]
  }

  saveActionRequests (rowitem: ITableRowItemProducts, newrequest: string) {
    console.log('save action Request for all selected clients and products')
    console.log(rowitem)
    console.log(newrequest)
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
