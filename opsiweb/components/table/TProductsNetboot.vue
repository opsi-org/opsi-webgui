<template>
  <div>
    <TableTTable
      id="tableproducts"
      datakey="productId"
      :tabledata="tableData"
      :title="$t('title.netboot')"
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :headers="headerData"
      :items="fetchedData.products"
      :selection="selectionProducts"
      :onchangeselection="setSelectionProducts"
      :loading="isLoading"
      :totalrows="fetchedData.total"
      :stacked="$mq=='mobile'"
    >
      <template #head(productId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.netbootid')" />
      </template>

      <template #cell(_majorVersion)="row">
        <!-- v-if="Object.keys(fetchedDataClients2Depots).length > 0" -->
        <TableCellTCProductVersionCell
          type="depotVersions"
          :rowitem="row.item"
          :clients2depots="fetchedDataClients2Depots"
        />
      </template>
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
      <template v-if="selectionClients.length>0" #head(actionRequest)>
        <DropdownDDProductRequest
          v-if="selectionClients.length>0"
          :title="$t('formselect.tooltip.actionRequest')"
          :save="saveActionRequests"
        />
      </template>

      <template v-if="selectionClients.length>0" #cell(actionRequest)="row">
        <DropdownDDProductRequest
          :request="row.item.actionRequest || 'none'"
          :requestoptions="row.item.actions"
          :rowitem="row.item"
          :save="saveActionRequest"
        />
      </template>
    </TableTTable>
    <BarBPagination
      :tabledata="tableData"
      :total-rows="fetchedData.total"
      aria-controls="tableproducts"
    />
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
export default class TProductsNetboot extends Vue {
  // @Prop() tableData!: ITableData

  isLoading: boolean = true
  fetchedData: object = {}
  fetchedDataClients2Depots: object = {}
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true, fetchDepotIds: true }

  tableData: ITableData = {
    type: 'NetbootProduct',
    pageNumber: 1,
    perPage: 2,
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
    selectedDepots: { label: 'table.fields.depotIds', key: 'selectedDepots', visible: false },
    selectedClients: { label: 'table.fields.clientsIds', key: 'selectedClients', visible: false, disabled: true },
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
    this.tableData.sortBy = (this.selectionClients.length > 0) ? 'productId' : 'productId'
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
      this.fetchOptions.fetchClients2Depots = false
      this.headerData.actionRequest.visible = false
      // this.headerData._majorVersion.visible = false
      // this.headerData._majorVersion.disabled = false
      this.headerData.selectedClients.disabled = false
      this.headerData.installationStatus.disabled = false
      this.headerData.actionRequest.disabled = false
    }
  }

  async fetch () {
    this.isLoading = true
    this.updateColumnVisibility()
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
}
</script>

<style>
</style>
