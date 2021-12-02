<template>
  <!-- <div v-if="$mq=='mobile'"><h4>{{ $t('title.netboot') }}</h4></div> -->
  <div data-testid="TProductsNetboot">
    <TableTCollapseableForMobile
      id="tableproducts"
      datakey="productId"
      :title="$t('title.netboot')"
      :visible="false"
      :tabledata="tableData"
      :headers="headerData"
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :selection="selectionProducts"
      :items="fetchedData"
      :totalrows="totalData"
      :busy="isLoading"
      :error-text="errorText"
      :onchangeselection="setSelectionProducts"
      :routechild="routeToChild"
      :ismultiselect="multiselect"
      :stacked="$mq=='mobile'"
    >
      <template #filter>
        <InputIFilter v-if="$mq=='mobile'" :data="tableData" :additional-title="$t('table.fields.netbootid')" />
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
          :requestoptions="[...row.item.actions]"
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
        <BarBTablePagination
          :tabledata="tableData"
          :total-rows="totalData"
          aria-controls="tableproducts"
        />
      </template>
    </TableTCollapseableForMobile>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, namespace } from 'nuxt-property-decorator'
import Cookie from 'js-cookie'
import { makeToast } from 'uib-components/.utils/utils/scomponents'
import { IObjectString2Any, IObjectString2ObjectString2String, IObjectString2String } from 'uib-components/.utils/types/tgeneral'
import { ITableData, ITableHeaders, ITableRow, ITableRowItemProducts } from 'uib-components/.utils/types/ttable'
import { ChangeObj } from 'uib-components/.utils/types/tchanges'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')
interface IFetchOptions {
  fetchClients:boolean,
  fetchDepotIds:boolean,
  fetchClients2Depots:boolean,
}
// interface FetchProd {
//   products:Array<ITableRowItemProducts>,
//   total:Number,
// }

@Component
export default class TProductsNetboot extends Vue {
  // @Prop() tableData!: ITableData
  @Prop() rowId!: string
  @Prop() routeRedirectWith!: Function
  @Prop() multiselect!: boolean

  action: string = ''
  // type: string = ''
  isLoading: boolean = true
  errorText: string = ''
  fetchedData: Array<ITableRowItemProducts> = []
  totalData: number = 0
  fetchedDataClients2Depots: IObjectString2String = {}
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true, fetchDepotIds: true }

  tableData: ITableData = {
    type: 'NetbootProduct',
    pageNumber: 1,
    perPage: Cookie.get('perpage_netboot') ? Cookie.get('perpage_netboot') as unknown as number : 5,
    setPerPage: (pp:number) => {
      this.tableData.perPage = pp
      Cookie.set('perpage_netboot', this.tableData.perPage as unknown as string, { expires: 365 })
    },
    sortBy: 'productId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    ident: { label: '', key: 'ident', visible: true, _fixed: true },
    installationStatus: { label: this.$t('table.fields.instStatus') as string, key: 'installationStatus', visible: false, sortable: true },
    actionResult: { label: this.$t('table.fields.actionResult') as string, key: 'actionResult', visible: false, sortable: true },
    productId: { label: this.$t('table.fields.netbootid') as string, key: 'productId', visible: true, _fixed: true, sortable: true },
    desc: { label: this.$t('table.fields.description') as string, key: 'desc', visible: false, sortable: true },
    name: { label: this.$t('table.fields.name') as string, key: 'name', visible: false, sortable: true },
    selectedDepots: { label: this.$t('table.fields.depotIds') as string, key: 'selectedDepots', visible: false },
    selectedClients: { label: this.$t('table.fields.clientsIds') as string, key: 'selectedClients', visible: false, disabled: true },
    version: { label: this.$t('table.fields.version') as string, key: 'version', visible: true },
    actionRequest: { label: this.$t('table.fields.actionRequest') as string, key: 'actionRequest', visible: false, sortable: true, _fixed: false },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true, class: '' }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @changes.Getter public changesProducts!: Array<ChangeObj>
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
      await this.$axios.$get(`/api/opsidata/clients/depots?selectedClients=[${this.selectionClients}]`)
        .then((response) => {
          this.fetchedDataClients2Depots = response
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = this.$t('message.errortext') as string
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
      await this.$axios.get('/api/opsidata/products', { params })
        .then((response) => {
          this.fetchedData = response.data
          this.totalData = response.headers['x-total-count']
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = this.$t('message.errortext') as string
        })
    }
    this.isLoading = false
  }

  async save (change : object) {
    const t:any = this
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        makeToast(t, 'Action request ' + JSON.stringify(change) + ' saved successfully', this.$t('message.success') as string, 'success')
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger')
      })
  }

  async saveActionRequest (rowitem: ITableRowItemProducts, newrequest: string) {
    // TODO: saving in database for dropdown in table cell(actionRequest)
    let orgActionReq = rowitem.actionRequest
    if (orgActionReq === null) {
      orgActionReq = 'none'
    }
    const data = {
      clientIds: this.selectionClients,
      productIds: [rowitem.productId],
      actionRequest: newrequest
    }
    if (this.expert) {
      for (const c in this.selectionClients) {
        const d = {
          user: localStorage.getItem('username'),
          clientId: this.selectionClients[c],
          productId: rowitem.productId,
          actionRequest: newrequest
        }
        const objIndex = this.changesProducts.findIndex(item => item.clientId === this.selectionClients[c] && item.productId === rowitem.productId)
        if (objIndex > -1) {
          this.delWithIndexChangesProducts(objIndex)
        }
        if (orgActionReq !== newrequest) {
          this.pushToChangesProducts(d)
        }
      }
    } else if (orgActionReq !== newrequest) {
      await this.save(data)
      this.fetchOptions.fetchClients = true
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
          const d = {
            user: localStorage.getItem('username'),
            clientId: this.selectionClients[c],
            productId: this.selectionProducts[p],
            actionRequest: this.action
          }
          const objIndex = this.changesProducts.findIndex(item => item.clientId === this.selectionClients[c] && item.productId === this.selectionProducts[p])
          if (objIndex > -1) {
            this.delWithIndexChangesProducts(objIndex)
          }
          this.pushToChangesProducts(d)
        }
      }
    } else {
      await this.save(data)
      this.$nuxt.refresh()
      // this.fetchOptions.fetchClients = true
      // this.$fetch()
    }
  }

  routeRedirectToParent (to: string, rowIdent: string) {
    this.routeRedirectWith(to, rowIdent)
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowId === rowIdent
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  routeToChild (id: string) {
    this.routeRedirectWith('/products/config', id)
  }
}
</script>
