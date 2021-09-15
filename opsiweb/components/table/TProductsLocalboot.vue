<template>
  <div>
    <!-- <div v-if="$mq=='mobile'"><h4>{{ $t('title.localboot') }}</h4></div> -->
    <TableTCollapseableForMobile
      id="tableproducts"
      datakey="productId"
      :visible="true"
      :tabledata="tableData"
      :title="$t('title.localboot')"
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :headers="headerData"
      :items="fetchedData.products"
      :selection="selectionProducts"
      :onchangeselection="setSelectionProducts"
      :busy="isLoading"
      :error-text="errorText"
      :totalrows="fetchedData.total"
      :stacked="$mq=='mobile'"
    >
      <!-- :no-local-sorting="true"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc" -->
      <template #filter>
        <InputIFilter v-if="$mq=='mobile'" :data="tableData" :additional-title="$t('table.fields.localbootid')" />
      </template>
      <template #head(productId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.localbootid')" />
      </template>
      <template #cell(version)="row">
        <TableCellTCProductVersionCell
          v-if="Object.keys(fetchedDataClients2Depots).length == selectionClients.length"
          type="depotVersions"
          :row="row"
          :clients2depots="fetchedDataClients2Depots"
          @details="toogleDetailsTooltip"
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
      <!-- <template #cell(name)="row">
          <TableCellTCProductCellComparable :list2text="row.item.name" />
        </template> -->
      <!-- <template #cell(productId)="row">
          <TableCellTCProductCellComparable :list2text="row.item.productId" />
        </template> -->
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
      <template #cell(rowactions)="row">
        <ButtonBTNRowLinkTo
          :title="$t('title.config')"
          icon="gear"
          to="/products/config"
          :ident="row.item.productId"
          :pressed="isRouteActive"
          :click-parent="routeRedirectToParent"
        />
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
import { Component, Vue, Prop, Watch, namespace } from 'nuxt-property-decorator'
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
@Component
export default class TProductsLocalboot extends Vue {
  @Prop() rowId!: string
  @Prop() routeRedirectWith!: Function
  action: string = ''
  type: string = ''
  // depotRequest: DepotRequest = { selectedClients: '' }
  // rowId: string = ''
  isLoading: boolean = true
  errorText: string = ''
  // fetchedData: any
  fetchedData: any = { products: [], total: 0 }
  // fetchedData: object = {}
  fetchedDataClients2Depots: IObjectString2String = {}
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
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    installationStatus: { label: this.$t('table.fields.instStatus') as string, key: 'installationStatus', visible: true, sortable: false },
    actionResult: { label: this.$t('table.fields.actionResult') as string, key: 'actionResult', visible: true, sortable: false },
    productId: { label: this.$t('table.fields.netbootid') as string, key: 'productId', visible: true, _fixed: true, sortable: false },
    desc: { label: this.$t('table.fields.description') as string, key: 'desc', visible: false, sortable: false },
    name: { label: this.$t('table.fields.name') as string, key: 'name', visible: false, sortable: false },
    selectedDepots: { label: this.$t('table.fields.depotIds') as string, key: 'selectedDepots', visible: false },
    selectedClients: { label: this.$t('table.fields.clientsIds') as string, key: 'selectedClients', visible: false, disabled: true },
    version: { label: this.$t('table.fields.version') as string, key: 'version', visible: true },
    actionRequest: { label: this.$t('table.fields.actionRequest') as string, key: 'actionRequest', visible: false, sortable: false, _fixed: false },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true, class: '' }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @changes.Getter public changesProducts!: any
  @changes.Mutation public setChangesProducts!: (a: Array<object>) => void
  @changes.Mutation public pushToChangesProducts!: (o: object) => void
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
  }

  toogleDetailsTooltip (row: ITableRow, tooltiptext: IObjectString2ObjectString2String) {
    (row.item as ITableRowItemProducts).tooltiptext = tooltiptext
    // console.debug('toogle Details', (row.item as ITableRowItemProducts).tooltiptext)
    row.toggleDetails()
  }

  updateColumnVisibility () {
    if (this.selectionClients.length > 0) {
      // this.fetchOptions.fetchClients2Depots = true
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
      // this.fetchOptions.fetchClients2Depots = false
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

  async fetch () {
    this.isLoading = true
    this.updateColumnVisibility()
    // if (this.fetchOptions.fetchDepotIds) {
    //   this.fetchedDataDepotIds = (await this.$axios.$get('/api/opsidata/depotIds')).result
    //   this.fetchOptions.fetchDepotIds = false
    // }
    if (this.fetchOptions.fetchClients2Depots && this.selectionClients.length > 0) {
      // this.depotRequest.selectedClients = JSON.stringify(this.selectionClients)
      // const params = this.depotRequest
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
      if (this.tableData.sortBy === 'clientVersions') { this.tableData.sortBy = 'client_version_outdated' }
      try {
        const params = this.tableData
        this.fetchedData = (await this.$axios.$get('/api/opsidata/products', { params })).result
      } catch (error) {
        this.errorText = (this as any).$t('message.errortext')
        // eslint-disable-next-line no-console
        console.error('error in fetchData ', this.fetchedData)
        // TODO: Error for: {"type":"LocalbootProduct","pageNumber":5,"perPage":5,"sortBy":"productId","sortDesc":false,"filterQuery":"","selectedDepots":["bonifax.uib.local","bonidepot.uib.local"],"selectedClients":["anna-tp-t14.uib.local","akunde1.uib.local"]} (important: pagenumber, perpage, clients bzw product zB 7zip)
      }
      // console.log('products', this.fetchedData)
    }
    this.isLoading = false
  }

  async save (change: object) {
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
        const d: Object = {
          clientId: this.selectionClients[c],
          productId: rowitem.productId,
          type: 'LocalbootProduct',
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
    // TODO: saving in database for dropdown in table cell(actionRequest)
    // rowitem.request = [newrequest]
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
            this.type = 'LocalbootProduct'
          } else {
            this.type = 'NetbootProduct'
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

  routeRedirectToParent (to: string, rowIdent: string) {
    this.routeRedirectWith(to, rowIdent)
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowId === rowIdent
  }
}
</script>

<style>
</style>
