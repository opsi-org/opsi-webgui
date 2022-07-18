<template>
  <div data-testid="TProductsLocalboot">
    <AlertAAlert ref="productsAlert" />
    <TableTInfiniteScroll
      id="Localboot"
      ref="Localboot"
      primary-key="Localboot"
      rowident="productId"
      :error="error"
      :is-loading="isLoadingTable || isLoading"
      :table-data="tableData"
      :header-data="headerData"
      :items="items"
      :total-items="totalItems"
      :totalpages="totalpages"
      :ismultiselect="multiselect"
      :selection="selectionProducts"
      :setselection="setSelectionProducts"
      :routechild="routeToChild"
      :fetchitems="$fetch"
    >
      <template #head(productId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.localbootid')" />
      </template>
      <template #cell(desc)="row">
        {{ row.item.description }}
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
      <template #head(installationStatus)>
        <b-icon
          :title="$t('table.fields.instStatus')"
          :icon="iconnames.productInstallationStatus"
          alt="installation status"
        />
      </template>
      <template #head(actionResult)>
        <b-icon
          :title="$t('table.fields.actionResult')"
          :icon="iconnames.productActionResult"
          alt="action result"
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
      <template v-if="selectionClients.length>0" #head(actionRequest)>
        <!-- v-if="selectionClients.length>0 && selectionProducts.length>0" -->
        <DropdownDDProductRequest
          :action.sync="action"
          :title="$t('form.tooltip.actionRequest')"
          :save="saveActionRequests"
        />
        <!-- <div v-else /> -->
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
        <TableTTooltipContent
          v-if="row.item.depot_version_diff || row.item.client_version_outdated||false"
          type="version"
          :details="row.item.tooltiptext"
          :depot-version-diff="row.item.depot_version_diff"
        />
      </template>
      <template #rowactions="row">
        <ButtonBTNRowLinkTo
          :title="$t('title.config')"
          :label="(headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.config'):''"
          :icon="iconnames.settingsobject"
          :to="child ? '/clients/products/config' : '/products/config'"
          :ident="row.item.productId"
          :pressed="isRouteActive"
          :click-parent="routeRedirectToParent"
        />
      </template>
    </TableTInfiniteScroll>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, namespace } from 'nuxt-property-decorator'
// import { makeToast } from '../../.utils/utils/scomponents'
import { IObjectString2ObjectString2String, IObjectString2String } from '../../.utils/types/tgeneral'
import { ITableData, ITableHeaders, ITableRow, ITableRowItemProducts } from '../../.utils/types/ttable'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants, Synchronization } from '../../mixins/uib-mixins'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')
interface IFetchOptions {
  fetchClients:boolean,
  fetchClients2Depots:boolean,
}

@Component({ mixins: [Constants, Synchronization] })
export default class TProductsLocalboot extends Vue {
  iconnames: any
  syncSort: any
  $axios: any
  $nuxt: any
  $mq: any
  $fetch: any

  @Prop() parentId!: string
  @Prop() rowident!: string
  @Prop() filterQuery!: string
  @Prop() routeRedirectWith!: Function
  @Prop({ default: true }) multiselect!: boolean
  @Prop() child!: boolean
  @Prop({ }) sort!: {sortBy:string, sortDesc: boolean}
  @Prop({ }) headerData!: ITableHeaders
  @Prop({ default: false }) isLoading!: boolean

  id = 'localboot'
  items: Array<any> = []
  totalItems: number = 0
  isLoadingTable: boolean = false
  totalpages: number = 0
  error: string = ''
  action: string = ''
  fetchedDataClients2Depots: IObjectString2String = {}
  fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true }
  tableData: ITableData = {
    type: 'LocalbootProduct',
    pageNumber: 1,
    perPage: 15,
    sortBy: this.sort.sortBy ? this.sort.sortBy : 'productId',
    sortDesc: false,
    filterQuery: this.filterQuery || ''
  }

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public pushToChangesProducts!: (o: object) => void
  @changes.Mutation public delWithIndexChangesProducts!: (i:number) => void
  @settings.Getter public quicksave!: boolean

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () {
    this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    this.fetchPageOne()
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    this.fetchPageOne()
  }

  @Watch('tableData', { deep: true }) tableDataChanged () {
    if (this.tableData.filterQuery) {
      this.tableData.pageNumber = 1
    }
    this.$fetch()
  }

  @Watch('tableData.sortDesc', { deep: true }) tableDataSortDescChanged () { this.syncSort(this.tableData, this.sort, true, this.parentId) }
  @Watch('tableData.sortBy', { deep: true }) tableDataSortByChanged () { this.syncSort(this.tableData, this.sort, true, this.parentId) }
  @Watch('sort', { deep: true }) sortPropChanged () { this.syncSort(this.sort, this.tableData, false, this.parentId) }
  @Watch('filterQuery', { deep: true }) filterPropChanged () {
    this.syncSort({ filterQuery: this.filterQuery }, this.tableData, false, this.parentId)
  }

  toogleDetailsTooltip (row: ITableRow, tooltiptext: IObjectString2ObjectString2String) {
    (row.item as ITableRowItemProducts).tooltiptext = tooltiptext
    row.toggleDetails()
  }

  async fetchPageOne () {
    this.tableData.pageNumber = 1
    await this.$fetch()
  }

  async fetch () { await this.$emit('fetch-products', this) }
  async fetchWrapper () { await this.$emit('fetch-products', this) }

  async save (change: object) {
    // const t:any = this
    this.isLoading = true
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        const ref = (this.$refs.productsAlert as any)
        ref.alert(this.$t('message.success.trackChanges.save'), 'success')
        // makeToast(t, 'Action request ' + JSON.stringify(change) + ' saved successfully', this.$t('message.success.title') as string, 'success')
      }).catch((error) => {
        const ref = (this.$refs.productsAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.title'), 'danger', detailedError)
        // makeToast(t, (error as IObjectString2Any).message, this.$t('message.error.title') as string, 'danger')
      })
    this.isLoading = false
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
    if (!this.quicksave) {
      for (const c in this.selectionClients) {
        const d: Object = {
          user: localStorage.getItem('username'),
          clientId: this.selectionClients[c],
          productId: rowitem.productId,
          actionRequest: newrequest
        }
        const objIndex = this.changesProducts.findIndex(item => item.user === localStorage.getItem('username') && item.clientId === this.selectionClients[c] && item.productId === rowitem.productId)
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
    // TODO: saving in database for dropdown in table cell(actionRequest)
    const data = {
      clientIds: this.selectionClients,
      productIds: this.selectionProducts,
      actionRequest: this.action
    }
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
      await this.save(data)
      this.$fetch()
    }
  }

  routeRedirectToParent (to: string, rowIdent: string) {
    this.routeRedirectWith(to, rowIdent)
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

<style>
.minimalwidth {
  max-width: fit-content;
}
</style>
