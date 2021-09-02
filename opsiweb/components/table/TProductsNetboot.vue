<template>
  <!-- <div v-if="$mq=='mobile'"><h4>{{ $t('title.netboot') }}</h4></div> -->
  <div>
    <TableTCollapseableForMobile
      id="tableproducts"
      datakey="productId"
      :title="$t('title.netboot')"
      :tabledata="tableData"
      :headers="headerData"
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :selection="selectionProducts"
      :items="fetchedData.products"
      :totalrows="fetchedData.total"
      :busy="isLoading"
      :error-text="errorText"
      :onchangeselection="setSelectionProducts"
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
        <b-icon icon="box-seam" alt="installation status" />
      </template>

      <template #head(actionResult)>
        <b-icon icon="hourglass-bottom" alt="action result" />
      </template>

      <template #cell(installationStatus)="row">
        <TableCellTCBadgeCompares
          type="installationStatus"
          :rowid="row.item.productId"
          :values="row.item.installationStatusDetails || []"
          :objects="row.item.selectedClients || []"
          :objectsorigin="selectionClients || []"
        />
      </template>

      <template #cell(actionResult)="row">
        <TableCellTCBadgeCompares
          type="actionResult"
          :rowid="row.item.productId"
          :values="row.item.actionResultDetails || []"
          :objects="row.item.selectedClients || []"
          :objectsorigin="selectionClients || []"
        />
      </template>
      <template v-if="selectionClients.length>0" #head(actionRequest)>
        <DropdownDDProductRequest
          v-if="selectionClients.length>0 && selectionProducts.length>0"
          :action.sync="action"
          :title="$t('formselect.tooltip.actionRequest')"
          :save="saveActionRequests"
        />
        <div v-else />
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
        <TableTTooltipContent
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
// interface DepotRequest {
//     selectedClients: string
// }
@Component
export default class TProductsNetboot extends Vue {
  // @Prop() tableData!: ITableData
  action: string = ''
  type: string = ''
  // depotRequest: DepotRequest = { selectedClients: '' }
  isLoading: boolean = true
  errorText: string = ''
  fetchedData: any = { products: [], total: 0 }
  // fetchedData: object = {}
  fetchedDataClients2Depots: IObjectString2String = {}
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true, fetchDepotIds: true }

  tableData: ITableData = {
    type: 'NetbootProduct',
    pageNumber: 1,
    perPage: 5,
    sortBy: 'productId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    installationStatus: { label: 'table.fields.instStatus', key: 'installationStatus', visible: false, sortable: false },
    actionResult: { label: 'table.fields.actionResult', key: 'actionResult', visible: false, sortable: false },
    productId: { label: 'table.fields.netbootid', key: 'productId', visible: true, _fixed: true, sortable: false },
    desc: { label: 'table.fields.description', key: 'desc', visible: false, sortable: false },
    name: { label: 'table.fields.name', key: 'name', visible: false, sortable: false },
    selectedDepots: { label: 'table.fields.depotIds', key: 'selectedDepots', visible: false },
    selectedClients: { label: 'table.fields.clientsIds', key: 'selectedClients', visible: false, disabled: true },
    version: { label: 'table.fields.version', key: 'version', visible: true },
    actionRequest: { label: 'table.fields.actionRequest', key: 'actionRequest', visible: false, sortable: false, _fixed: false },
    rowactions: { key: 'rowactions', label: 'table.fields.rowactions', visible: true, _fixed: true, class: '' }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @changes.Getter public changesProducts!: any
  @changes.Mutation public setChangesProducts!: (s: Array<object>) => void
  @changes.Mutation public pushToChangesProducts!: (s: object) => void
  @changes.Mutation public delWithIndexChangesProducts!: (i:number) => void
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
      // this.headerData._majorVersion.visible = true
      // this.headerData._majorVersion.disabled = true
      this.headerData.selectedClients.disabled = true
      this.headerData.installationStatus.visible = true
      this.headerData.installationStatus.disabled = true
      this.headerData.actionResult.visible = true
      this.headerData.actionResult.disabled = true
      this.headerData.actionRequest.visible = true
      this.headerData.actionRequest.disabled = true
    } else {
      // this.headerData._majorVersion.visible = false
      // this.headerData._majorVersion.disabled = false
      this.headerData.selectedClients.disabled = false
      this.headerData.installationStatus.visible = false
      this.headerData.installationStatus.disabled = false
      this.headerData.actionResult.visible = false
      this.headerData.actionResult.disabled = false
      this.headerData.actionRequest.visible = false
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
    if (this.fetchOptions.fetchClients2Depots && this.selectionClients.length > 0) {
      // this.depotRequest.selectedClients = JSON.stringify(this.selectionClients)
      // const params = this.depotRequest
      // await this.$axios.$get('/api/opsidata/clients/depots', { params })
      await this.$axios.$get(`/api/opsidata/clients/depots?selectedClients=${this.selectionClients}`)
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

  async save (change : object) {
    const responseError: IObjectString2String = (await this.$axios.$patch(
      '/api/opsidata/clients/products',
      { data: change }
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

  async saveActionRequest (rowitem: any, newrequest: string) {
    // TODO: saving in database for dropdown in table cell(actionRequest)
    rowitem.request = [newrequest]
    const data = {
      clientIds: this.selectionClients,
      productIds: [rowitem.productId],
      actionRequest: newrequest
    }
    if (this.expert) {
      for (const c in this.selectionClients) {
        const d = {
          clientId: this.selectionClients[c],
          type: 'NetbootProduct',
          productId: rowitem.productId,
          actionRequest: newrequest
        }
        const objIndex = this.changesProducts.findIndex((item: { clientId: string, productId: string }) => item.clientId === this.selectionClients[c] && item.productId === rowitem.productId)
        if (objIndex > -1) {
          this.delWithIndexChangesProducts(objIndex)
        }
        this.pushToChangesProducts(d)
      }
    } else {
      // eslint-disable-next-line no-console
      console.debug('save:', data)
      await this.save(data)
      this.fetchOptions.fetchClients = true
      this.setChangesProducts([])
      this.$fetch()
    }
  }

  async saveActionRequests () {
    const data = {
      clientIds: this.selectionClients,
      productIds: this.selectionProducts,
      actionRequest: this.action
    }
    if (this.expert) {
      for (const c in this.selectionClients) {
        for (const p in this.selectionProducts) {
          const pObj = this.fetchedData.products.find((obj: { productId: string }) => obj.productId === this.selectionProducts[p])
          if (pObj) {
            this.type = 'NetbootProduct'
          } else {
            this.type = 'LocalbootProduct'
          }
          const d = {
            clientId: this.selectionClients[c],
            productId: this.selectionProducts[p],
            type: this.type,
            actionRequest: this.action
          }
          const objIndex = this.changesProducts.findIndex((item: { clientId: string, productId: string }) => item.clientId === this.selectionClients[c] && item.productId === this.selectionProducts[p])
          if (objIndex > -1) {
            this.delWithIndexChangesProducts(objIndex)
          }
          this.pushToChangesProducts(d)
        }
      }
    } else {
      // eslint-disable-next-line no-console
      console.debug('save:', data)
      await this.save(data)
      this.fetchOptions.fetchClients = true
      this.setChangesProducts([])
      this.$fetch()
    }
  }
}
</script>

<style>
</style>
