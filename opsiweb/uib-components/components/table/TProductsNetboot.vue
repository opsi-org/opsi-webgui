<template>
  <div data-testid="TProductsNetboot">
    <BarBTableHeader :tableid="id" :table-data="tableData" :table-info.sync="tableInfo" :is-loading-parent="isLoading" :fetch="$fetch" />
    <LazyTableTInfiniteScrollSmooth
      v-if="cache_pages"
      id="Netboot"
      ref="Netboot"
      primary-key="Netboot"
      rowident="productId"
      :error="error"
      :is-loading="isLoadingTable || isLoading"
      :table-data="tableData"
      :header-data="tableInfo.headerData"
      :cache_pages="cache_pages"
      :total-items="totalItems"
      :totalpages="totalpages"
      :selection="selectionProducts"
      :setselection="setSelectionProducts"
      :routechild="routeToChild"
      :fetchitems="$fetch"
    >
      <template #producttableheader>
        <DropdownDDProductRequest
          v-if="(selectionClients.length > 0 && selectionProducts.length > 0)"
          :action.sync="action"
          :title="$t('form.tooltip.actionRequest')"
          :save="saveActionRequests"
        />
      </template>

      <template #contextcontent-specific-1="{itemkey}">
        <ButtonBTNRowLinkTo
          :label="$t('title.config')"
          :incontextmenu="true"
          :title="$t('title.config')"
          :icon="icon.settings"
          :to="child ? '/clients/products/config' : '/products/config'"
          :ident="itemkey"
          :pressed="isRouteActive"
          :click-parent="routeRedirectToParent"
        />
      </template>

      <template #contextcontent-general-1>
        <ButtonBTNEvent
          event="ondemand"
          classes="dropdown-itemborder-0 smaller-text-size incontextmenu"
          :incontextmenu="true"
          :with-text="true"
        />
        <!-- :update-loading = *"loading => clientsLoading = loading" -->
      </template>
      <template #contextcontent-general-2>
        <DropdownDDTableSorting :table-id="id" :incontextmenu="true" v-bind.sync="tableInfo" />
        <DropdownDDTableColumnVisibility :table-id="id" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" :incontextmenu="true" />
        <ButtonBTNRefetch
          :is-loading="isLoadingTable || isLoading"
          :tooltip="$t('button.refresh', {id: id})"
          :label="$t('button.refresh', {id: ''})"
          incontextmenu
          :refetch="$fetch"
        />
      </template>
      <template #head(installationStatus)>
        <IconIIcon :icon="icon.product" alt="installation status" />
      </template>
      <template #head(actionResult)>
        <IconIIcon :icon="icon.productActionResult" alt="action result" />
      </template>
      <template #cell(modificationTime)="row">
        <small>{{ date(row.item.modificationTime) }}</small>
      </template>
      <template #cell(advice)="row">
        <small> <vue-markdown>{{ row.item.advice }}</vue-markdown> </small>
      </template>
      <template #cell(version)="row">
        <TableCellTCProductVersionCell
          type="depotVersions"
          :row="row"
          :clients2depots="fetchedDataClients2Depots"
          @details="toogleDetailsTooltip"
        />
      </template>
      <template #cell(installationStatus)="row">
        <TableCellTCBadgeCompares
          type="installationStatus"
          :rowid="row.item.productId"
          :values="row.item.installationStatusDetails || [row.item.installationStatus] || []"
          :objects="row.item.selectedClients || []"
          :objectsorigin="selectionClients || []"
        />
      </template>
      <template #cell(actionResult)="row">
        <TableCellTCBadgeCompares
          type="actionResult"
          :rowid="row.item.productId"
          :values="row.item.actionResultDetails || [row.item.actionResult] || []"
          :objects="row.item.selectedClients || []"
          :objectsorigin="selectionClients || []"
        />
      </template>
      <template #cell(actionProgress)="row">
        <div v-if="row.item.actionProgress == 'mixed'">
          <small :id="('tooltip_actionprogress_mixed' + row.item.productId)"> {{ row.item.actionProgress }}</small>
          <b-tooltip size="sm" :target="('tooltip_actionprogress_mixed'+row.item.productId)" triggers="hover">
            <b-row v-for="(key, index) in row.item.selectedClients" :key="index">
              <b-col class="d-flex flex-nowrap text-sm-left">
                {{ key }}
              </b-col> <b-col class="d-flex flex-nowrap text-sm-left">
                {{ '  :  ' + row.item.actionProgressDetails[index] }}
              </b-col>
            </b-row>
          </b-tooltip>
        </div>
        <small v-else> {{ row.item.actionProgress }} </small>
      </template>
      <template v-if="selectionClients.length > 0 && selectionProducts.length > 0" #head(actionRequest)>
        <DropdownDDProductRequest
          :action.sync="action"
          :title="$t('form.tooltip.actionRequest')"
          :save="saveActionRequests"
        />
      </template>
      <template v-if="selectionClients.length > 0" #cell(actionRequest)="row">
        <DropdownDDProductRequest
          :request="row.item.actionRequest || 'none'"
          :requestoptions="[...row.item.actions]"
          :rowitem="row.item"
          :row-is-selected="selectionProducts.includes(row.item.productId)"
          :save="saveActionRequest"
        />
      </template>
      <template #row-details="row">
        <TableTTooltipContent
          v-if="row.item.depot_version_diff || row.item.client_version_outdated || false"
          type="version"
          :details="row.item.tooltiptext"
          :depot-version-diff="row.item.depot_version_diff"
        />
      </template>
      <template #rowactions="row">
        <ButtonBTNRowLinkTo
          :title="$t('title.config')"
          :label="(tableInfo.headerData.rowactions.mergeOnMobile==true && $mq=='mobile') ? $t('title.config') : ''"
          :icon="icon.settings"
          :to="child ? '/clients/products/config' : '/products/config'"
          :ident="row.item.productId"
          :pressed="isRouteActive"
          :click-parent="routeRedirectToParent"
        />
      </template>
    </LazyTableTInfiniteScrollSmooth>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { IObjectString2ObjectString2String, IObjectString2String } from '../../.utils/types/tgeneral'
import { ITableData, ITableInfo, ITableRow, ITableRowItemProducts } from '../../.utils/types/ttable'
import { ChangeObj } from '../../.utils/types/tchanges'
import QueueNested from '../../.utils/utils/QueueNested'
import { MBus } from '../../mixins/messagebus'
import { AlertToast, Synchronization } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
import { SaveProductActionRequest } from '../../mixins/save'
import { Format } from '../../mixins/format'
import { IFetchOptions } from '../../.utils/types/tobjects'

const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [AlertToast, MBus, Icons, Synchronization, SaveProductActionRequest, Format] })
export default class TProductsNetboot extends Vue {
  @Prop() parentId!: string
  @Prop() rowident!: string
  @Prop() filterQuery!: string
  @Prop() routeRedirectWith!: Function
  @Prop() child!: boolean
  @Prop({ }) sort!: {sortBy:string, sortDesc: boolean}
  @Prop({ }) tableInfo!: ITableInfo
  @Prop({ default: false }) isLoading!: boolean
  @Prop() fetchedDataClients2Depots!: IObjectString2String
  wsBusMsg: any // mixin // store
  showToastMbus: any // mixin // alerttoast
  hideToast: any // mixin // alerttoast
  icon: any
  date:any
  syncSort: any
  $axios: any
  $nuxt: any
  $fetch: any
  $mq: any
  $t: any
  $route: any
  $router:any
  saveProdActionRequest:any
  id = 'netboot'
  items: Array<any> = []
  isLoadingTable: boolean = false
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''
  action: string = ''
  // fetchedDataClients2Depots: IObjectString2String = {}
  fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true }
  lastChanges: any = { clientIds: [], productIds: [] } // used to check if we caused the last event

  cache_pages_no: number = 2 // number of pages which can be stored in parallel (cache)
  cache_pages: QueueNested = new QueueNested(this.cache_pages_no, 'NetbootQueue')
  tableData: ITableData = {
    type: 'NetbootProduct',
    pageNumber: 1,
    perPage: 20,
    sortBy: this.sort.sortBy ? this.sort.sortBy : 'productId',
    sortDesc: false,
    filterQuery: this.filterQuery || ''
  }

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public pushToChangesProducts!: (s: object) => void
  @changes.Mutation public delWithIndexChangesProducts!: (i:number) => void
  @settings.Getter public quicksave!: boolean

  get visibleProductIds () {
    return this.cache_pages.valuesOfKey('productId')
  }

  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
    const msg = this.wsBusMsg // todo deepCopy
    if (msg &&
      ['event:productOnClient_created', 'event:productOnClient_updated', 'event:productOnClient_deleted'].includes(msg.channel) &&
      msg.data.productType === 'NetbootProduct' &&
      this.visibleProductIds.includes(msg.data.productId) &&
      this.selectionClients.includes(msg.data.clientId)
    ) {
      if (!(this.lastChanges.clientIds.includes(msg.data.clientId) && this.lastChanges.productIds.includes(msg.data.productId))) {
        // check if we may cause the event...
        this.showToastMbus({
          title: this.$t('message.info.event'),
          content: this.$t('message.info.event.poc_updated', { productId: msg.data.productId }),
          variant: 'info'
        })
      }
      if (this.quicksave) {
        this.$fetch()
        // ref.hide()
      } else { /* quicksave is false ... do sth .. show message or sth */
        const objIndex = this.changesProducts.findIndex(
          item => item.user === localStorage.getItem('username') &&
          item.clientId === msg.data.clientId &&
          item.productId === msg.data.productId)
        if (objIndex > -1) { /* show msg product updated */ }
      }
    }
  }

  @Watch('selectionDepots', { deep: true }) async selectionDepotsChanged () {
    // this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    this.setSelectionProducts([])
    await this.fetchPageOne()
  }

  @Watch('selectionClients', { deep: true }) async selectionClientsChanged () {
    this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    await this.fetchPageOne()
  }

  @Watch('tableData.filterQuery', { deep: true }) tdFilterQueryChanged () {
    this.tableData.pageNumber = 1
  }

  @Watch('tableData', { deep: true }) async tableDataChanged () {
    await this.$fetch()
  }

  @Watch('tableData.sortDesc', { deep: true }) tableDataSortDescChanged () { this.syncSort(this.tableData, this.sort, true, this.parentId) }
  @Watch('tableData.sortBy', { deep: true }) tableDataSortByChanged () { this.syncSort(this.tableData, this.sort, true, this.parentId) }
  @Watch('sort', { deep: true }) sortPropChanged () { this.syncSort(this.sort, this.tableData, false, this.parentId) }
  @Watch('filterQuery', { deep: true }) filterPropChanged () {
    this.syncSort({ filterQuery: this.filterQuery }, this.tableData, false, this.parentId)
  }

  // mounted () {
  //   this.tableData.sortBy = (this.selectionClients.length > 0) ? 'productId' : 'productId'
  // }

  toogleDetailsTooltip (row: ITableRow, tooltiptext: IObjectString2ObjectString2String) {
    (row.item as ITableRowItemProducts).tooltiptext = tooltiptext
    row.toggleDetails()
  }

  async fetchPageOne () {
    this.tableData.pageNumber = 1
    await this.$fetch()
  }

  async fetchWrapper () { await this.$fetch() }
  fetch () {
    this.hideToast()
    this.$emit('fetch-products', this)
  } // will trigger -> this.setItemsCache(items)

  setItemsCache (items) {
    Vue.nextTick(() => {
      if (!this.cache_pages.scrollDirection || this.cache_pages.scrollDirection === 'none') {
        this.cache_pages.set(this.tableData.pageNumber, items) // clear cache and set new page
      } else {
        this.cache_pages.setAuto(this.tableData.pageNumber, items) // try to append (start or beginning depend on pageNumber)
      }
      this.cache_pages.setTotalPages(this.totalpages)
    })
  }

  async saveActionRequest (rowitem: ITableRowItemProducts, newrequest: string) {
    // TODO: saving in database for dropdown in table cell(actionRequest)
    const data = {
      clientIds: this.selectionClients,
      productIds: [rowitem.productId],
      actionRequest: newrequest
    }
    this.lastChanges.clientIds = data.clientIds
    this.lastChanges.productIds = data.productIds
    if (!this.quicksave) {
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
        this.pushToChangesProducts(d)
      }
    } else {
      const successalert = true
      await this.saveProdActionRequest(data, null, successalert)
      this.fetchOptions.fetchClients = true
    }
  }

  async saveActionRequests () {
    const data = {
      clientIds: this.selectionClients,
      productIds: this.selectionProducts,
      actionRequest: this.action
    }
    this.lastChanges.clientIds = data.clientIds
    this.lastChanges.productIds = data.productIds
    if (!this.quicksave) {
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
      const successalert = true
      await this.saveProdActionRequest(data, null, successalert)
      this.$fetch()
    }
  }

  routeRedirectToParent (to: string, rowIdent: string) {
    if (this.isRouteActive(to, rowIdent)) {
      const parent = to.substring(0, to.lastIndexOf('/'))
      this.$router.push(parent)
    } else {
      this.routeRedirectWith(to, rowIdent)
    }
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowident === rowIdent
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  routeToChild (id: string) {
    if (this.child) {
      this.routeRedirectWith('/clients/products/config', id)
    } else {
      this.routeRedirectWith('/products/config', id)
    }
  }
}
</script>
