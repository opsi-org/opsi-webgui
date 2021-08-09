<template>
  <div>
    <!-- <div v-if="$mq=='mobile'"><h4>{{ $t('title.localboot') }}</h4></div> -->
    <TableTCollapseableForMobile
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
      <template #filter>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.localbootid')" />
      </template>
      <template #head(productId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.localbootid')" />
      </template>
      <template #cell(version)="row">
        <!-- v-if="Object.keys(fetchedDataClients2Depots).length > 0" -->
        <TableCellTCProductVersionCell
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
        {{ row.item.installationStatus }}
        <!-- <TableCellTCBadgeCompares
          v-if="(selectionClients && row.item.selectedClients)"
          type="installationStatus"
          :rowid="row.item.productId"
          :values="row.item.installationStatus || []"
          :objects="row.item.selectedClients || []"
          :objectsorigin="selectionClients || []"
        /> -->
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
    </TableTCollapseableForMobile>
  </div>
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
export default class TProductsLocalboot extends Vue {
  // @Prop() tableData!: ITableData
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
    productId: { label: this.$t('table.fields.netbootid') as string, key: 'productId', visible: true, _fixed: true, sortable: true },
    desc: { label: this.$t('table.fields.description') as string, key: 'desc', visible: false, sortable: true },
    name: { label: this.$t('table.fields.name') as string, key: 'name', visible: false, sortable: true },
    selectedDepots: { label: this.$t('table.fields.depotIds') as string, key: 'selectedDepots', visible: false },
    selectedClients: { label: this.$t('table.fields.clientsIds') as string, key: 'selectedClients', visible: false, disabled: true },
    installationStatus: { label: this.$t('table.fields.instStatus') as string, key: 'installationStatus', visible: false, sortable: true },
    actionRequest: { label: this.$t('table.fields.actionRequest') as string, key: 'actionRequest', visible: false, sortable: true, _fixed: false },
    version: { label: this.$t('table.fields.version') as string, key: 'version', visible: true },
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
      this.fetchOptions.fetchClients2Depots = true
      this.headerData.actionRequest.visible = true
      // this.headerData._majorVersion.visible = true
      // this.headerData._majorVersion.disabled = true
      this.headerData.selectedClients.disabled = true
      this.headerData.installationStatus.disabled = true
      this.headerData.actionRequest.disabled = true
    } else {
      this.headerData.actionRequest.visible = false
      this.fetchOptions.fetchClients2Depots = false
      // this.headerData._majorVersion.visible = false
      // this.headerData._majorVersion.disabled = false
      this.headerData.selectedClients.disabled = false
      this.headerData.installationStatus.disabled = false
      this.headerData.actionRequest.disabled = false
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
    this.updateColumnVisibility()
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
}
</script>

<style>
</style>
