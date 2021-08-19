<template>
  <!-- <div v-if="$mq=='mobile'"><h4>{{ $t('title.netboot') }}</h4></div> -->
  <div>
    <IconILoading v-if="isLoading" />
    <p v-else-if="errorText">
      {{ errorText }}
    </p>
    <TableTCollapseableForMobile
      v-else
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
      <template #filter>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.netbootid')" />
      </template>
      <template #head(productId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.netbootid')" />
      </template>

      <template #cell(version)="row">
        <!-- v-if="Object.keys(fetchedDataClients2Depots).length > 0" -->
        <TableCellTCProductVersionCell
          type="depotVersions"
          :row="row"
          :clients2depots="fetchedDataClients2Depots"
          @details="toogleDetailsTooltip"
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
          v-if="selectionClients.length>0 && selectionProducts.length>0"
          :action.sync="action"
          :title="$t('formselect.tooltip.actionRequest')"
          :save="saveActionRequests"
        />
      </template>

      <template v-if="selectionClients.length>0" #cell(actionRequest)="row">
        <DropdownDDProductRequest
          :request="row.item.actionRequest || 'none'"
          :requestoptions="['none', ...row.item.actions]"
          :rowitem="row.item"
          :save="saveActionRequest"
        />
      </template>

      <template #row-details="row">
        <!-- :target="`TCProductVersionCell_hover_${row.item.productId}_${type}`" -->
        <TableTTooltip
          v-if="row.item.depot_version_diff || row.item.client_version_outdated||false"
          type="version"
          :details="row.item.tooltiptext"
          :depot-version-diff="row.item.depot_version_diff"
        />
      <!-- {{ row.item.tooltiptext }} -->
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
import { IObjectString2ObjectString2String, IObjectString2String } from '~/types/tsettings'
import { ITableData, ITableHeaders, ITableRow, ITableRowItemProducts } from '~/types/ttable'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')
interface IFetchOptions {
  fetchClients:boolean,
  fetchDepotIds:boolean,
  fetchClients2Depots:boolean,
}
interface DepotRequest {
    selectedClients: string
}
@Component
export default class TProductsNetboot extends Vue {
  // @Prop() tableData!: ITableData
  action: string = ''
  depotRequest: DepotRequest = { selectedClients: '' }
  isLoading: boolean = true
  errorText: string = ''
  fetchedData: any
  // fetchedData: object = {}
  fetchedDataClients2Depots: IObjectString2String = {}
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
  @changes.Mutation public setChangesProducts!: (s: Array<object>) => void
  @changes.Mutation public pushToChangesProducts!: (s: object) => void
  @settings.Getter public expert!: boolean

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
      this.headerData.actionRequest.visible = true
      // this.headerData._majorVersion.visible = true
      // this.headerData._majorVersion.disabled = true
      this.headerData.selectedClients.disabled = true
      this.headerData.installationStatus.disabled = true
      this.headerData.actionRequest.disabled = true
    } else {
      this.headerData.actionRequest.visible = false
      // this.headerData._majorVersion.visible = false
      // this.headerData._majorVersion.disabled = false
      this.headerData.selectedClients.disabled = false
      this.headerData.installationStatus.disabled = false
      this.headerData.actionRequest.disabled = false
    }
  }

  toogleDetailsTooltip (row: ITableRow, tooltiptext: IObjectString2ObjectString2String) {
    (row.item as ITableRowItemProducts).tooltiptext = tooltiptext
    // console.debug('toogle Details', (row.item as ITableRowItemProducts).tooltiptext)
    row.toggleDetails()
  }

  async fetch () {
    this.isLoading = true
    this.updateColumnVisibility()
    if (this.fetchOptions.fetchClients2Depots) {
      this.depotRequest.selectedClients = JSON.stringify(this.selectionClients)
      const params = this.depotRequest
      await this.$axios.$get('/api/opsidata/clients/depots', { params })
        .then((response) => {
          this.fetchedDataClients2Depots = response.result
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = (this as any).$t('message.errortext')
        })
      this.fetchOptions.fetchClients2Depots = false
    }

    if (this.fetchOptions.fetchClients) {
      this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
      this.tableData.selectedClients = JSON.stringify(this.selectionClients)
      if (this.tableData.sortBy === 'depotVersions') { this.tableData.sortBy = 'depot_version_diff' }
      if (this.tableData.sortBy === 'clientVersions') { this.tableData.sortBy = 'client_versoin_outdated' }
      const params = this.tableData
      // this.fetchedData = (await this.$axios.$get('/api/opsidata/products', { params })).result
      await this.$axios.$get('/api/opsidata/products', { params })
        .then((response) => {
          this.fetchedData = response.result
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = (this as any).$t('message.errortext')
        })
    }
    this.isLoading = false
  }

  async save (change : Array<object>) {
    const responseError: IObjectString2String = (await this.$axios.$patch(
      '/api/opsidata/clients/products',
      JSON.stringify({ data: change })
    )).error
    if (Object.keys(responseError).length > 0) {
      let txt = 'Errors for: <br />'
      for (const k in responseError) {
        txt += `${k}: ${responseError[k]} <br />`
      }
      this.$bvToast.toast(txt, {
        title: 'Warnings:',
        autoHideDelay: 5000,
        appendToast: false
      })
    }
  }

  saveActionRequest (rowitem: ITableRowItemProducts, newrequest: string) {
    // TODO: saving in database for dropdown in table cell(actionRequest)
    rowitem.request = [newrequest]
    // eslint-disable-next-line no-console
    console.debug('Clients2Depots', this.fetchedDataClients2Depots)
    const alldata = []
    for (const c in this.selectionClients) {
      const depot = this.fetchedDataClients2Depots[this.selectionClients[c]]
      const data = {
        clientId: this.selectionClients[c],
        productId: rowitem.productId,
        productType: 'NetbootProduct',
        version: rowitem.depotVersions[rowitem.selectedDepots.indexOf(depot)],
        actionRequest: newrequest
      }
      alldata.push(data)
      if (this.expert) {
        this.pushToChangesProducts(data)
      }
    }
    if (!this.expert) {
    // eslint-disable-next-line no-console
      console.debug('save:', alldata)
      this.save(alldata)
      this.fetchOptions.fetchClients = true
      this.setChangesProducts([])
      this.$fetch()
    }
  }

  // saveActionRequests (rowitem: ITableRowItemProducts, newrequest: string) {
  saveActionRequests () {
    // // TODO: saving in database for dropdown in table head(actionRequest)
    // // eslint-disable-next-line no-console
    // console.log('save action Request for all selected clients and products')
    // // eslint-disable-next-line no-console
    // console.log(rowitem, newrequest)
    // // for (const i in this.selectionProducts) {
    // //   this.fetchedData[this.selectionProducts[i]].request = newrequest
    // // }
    const alldata = []
    for (const c in this.selectionClients) {
      const depot = this.fetchedDataClients2Depots[this.selectionClients[c]]
      for (const p in this.selectionProducts) {
        let row = this.fetchedData.products.filter((x: { productId: string }) => x.productId === this.selectionProducts[p])
        row = row[0]
        if (row) {
        // const item = row[0]
          const data = {
            clientId: this.selectionClients[c],
            productId: this.selectionProducts[p],
            productType: 'NetbootProduct',
            version: row.depotVersions[row.selectedDepots.indexOf(depot)],
            actionRequest: this.action
          }
          alldata.push(data)
          if (this.expert) {
            this.pushToChangesProducts(data)
          }
        }
      }
    }
    if (!this.expert) {
    // eslint-disable-next-line no-console
      console.debug('save:', alldata)
      for (const d in alldata) {
        const change = alldata[d]
        this.save([change])
      }
      this.fetchOptions.fetchClients = true
      this.$fetch()
    }
  }
}
</script>

<style>
</style>
