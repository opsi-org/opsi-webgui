<template>
  <div data-testid="TProductsLocalboot">
    <TableTInfiniteScroll
      id="Localboot"
      ref="Localboot"
      primary-key="Localboot"
      rowident="productId"
      :error="error"
      :is-loading="isLoading"
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
        <TableTTooltipContent
          v-if="row.item.depot_version_diff || row.item.client_version_outdated||false"
          type="version"
          :details="row.item.tooltiptext"
          :depot-version-diff="row.item.depot_version_diff"
        />
      </template>
      <template #cell(rowactions)="row">
        <ButtonBTNRowLinkTo
          :title="$t('title.config')"
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
import { makeToast } from '../../.utils/utils/scomponents'
import { IObjectString2Any, IObjectString2ObjectString2String, IObjectString2String } from '../../.utils/types/tgeneral'
import { ITableData, ITableHeaders, ITableRow, ITableRowItemProducts } from '../../.utils/types/ttable'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')
interface IFetchOptions {
  fetchClients:boolean,
  fetchClients2Depots:boolean,
}

@Component({ mixins: [Constants] })
export default class TProductsLocalboot extends Vue {
  iconnames: any
  $axios: any
  $nuxt: any
  $mq: any
  $fetch: any

  @Prop() rowident!: string
  @Prop() routeRedirectWith!: Function
  @Prop() multiselect!: boolean
  @Prop() child!: boolean
  @Prop({ }) sortby!: string

  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''
  action: string = ''
  // fetchedData: Array<ITableRowItemProducts> = []
  fetchedDataClients2Depots: IObjectString2String = {}
  fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true }

  tableData: ITableData = {
    type: 'LocalbootProduct',
    pageNumber: 1,
    perPage: 15,
    sortBy: this.sortby ? this.sortby : 'productId',
    sortDesc: false,
    filterQuery: ''
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'selected', visible: true, _fixed: true, sortable: true, class: 'minimalwidth' },
    installationStatus: { label: this.$t('table.fields.instStatus') as string, key: 'installationStatus', visible: true, sortable: true },
    actionResult: { label: this.$t('table.fields.actionResult') as string, key: 'actionResult', visible: true, sortable: true },
    productId: { label: this.$t('table.fields.netbootid') as string, key: 'productId', visible: true, _fixed: true, sortable: true },
    desc: { label: this.$t('table.fields.description') as string, key: 'desc', visible: false, sortable: true },
    name: { label: this.$t('table.fields.name') as string, key: 'name', visible: false, sortable: true },
    selectedDepots: { label: this.$t('table.fields.depotIds') as string, key: 'selectedDepots', visible: false },
    selectedClients: { label: this.$t('table.fields.clientsIds') as string, key: 'selectedClients', visible: false, disabled: true },
    version: { label: this.$t('table.fields.version') as string, key: 'version', visible: false, sortable: true },
    actionRequest: { label: this.$t('table.fields.actionRequest') as string, key: 'actionRequest', visible: false, sortable: true, _fixed: false },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true, class: '' }
  }

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public pushToChangesProducts!: (o: object) => void
  @changes.Mutation public delWithIndexChangesProducts!: (i:number) => void
  @settings.Getter public expert!: boolean

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () {
    this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    this.fetchPageOne()
  }

  @Watch('selectionClients', { deep: true })
  selectionClientsChanged () {
    this.fetchedDataClients2Depots = {}
    this.fetchOptions.fetchClients2Depots = true
    this.fetchPageOne()
    this.updateColumnVisibility()
  }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  mounted () {
    this.updateColumnVisibility()
  }

  toogleDetailsTooltip (row: ITableRow, tooltiptext: IObjectString2ObjectString2String) {
    (row.item as ITableRowItemProducts).tooltiptext = tooltiptext
    row.toggleDetails()
  }

  updateColumnVisibility () {
    if (this.selectionClients.length > 0) {
      this.headerData.selectedClients.disabled = true
      this.headerData.installationStatus.visible = true
      this.headerData.installationStatus.disabled = true
      this.headerData.actionResult.visible = true
      this.headerData.actionResult.disabled = true
      this.headerData.actionRequest.visible = true
      this.headerData.actionRequest.disabled = true
    } else {
      this.headerData.selectedClients.disabled = false
      this.headerData.installationStatus.visible = false
      this.headerData.installationStatus.disabled = false
      this.headerData.actionResult.visible = false
      this.headerData.actionResult.disabled = false
      this.headerData.actionRequest.visible = false
      this.headerData.actionRequest.disabled = false
    }
  }

  async fetchPageOne () {
    this.tableData.pageNumber = 1
    await this.$fetch()
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
          this.error = this.$t('message.errortext') as string
        })
      this.fetchOptions.fetchClients2Depots = false
    }

    if (this.fetchOptions.fetchClients) {
      this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
      this.tableData.selectedClients = JSON.stringify(this.selectionClients)
      if (this.tableData.sortBy === 'depotVersions') { this.tableData.sortBy = 'depot_version_diff' }
      if (this.tableData.sortBy === 'clientVersions') { this.tableData.sortBy = 'client_version_outdated' }
      if (this.tableData.sortBy === 'version') { this.tableData.sortBy = 'client_version_outdated' }
      if (this.tableData.sortBy === 'desc') { this.tableData.sortBy = 'description' }
      if (this.tableData.sortBy === '') { this.tableData.sortBy = 'productId' }
      if (this.tableData.sortBy === 'selected') {
        this.tableData.sortDesc = true
        // this.tableData.sortBy = 'selected'
        this.tableData.selected = JSON.stringify(this.selectionProducts)
      }
      try {
        const params = this.tableData
        const response = (await this.$axios.get('/api/opsidata/products', { params }))
        this.totalItems = response.headers['x-total-count']
        this.$emit('update:totallocalboot', this.totalItems)
        this.totalpages = Math.ceil(this.totalItems / this.tableData.perPage)
        if (response.data === null) {
          this.items = []
        } else {
          this.items = response.data
        }
      } catch (error) {
        this.error = this.$t('message.errortext') as string
        // TODO: Error for: {"type":"LocalbootProduct","pageNumber":5,"perPage":5,"sortBy":"productId","sortDesc":false,"filterQuery":"","selectedDepots":["bonifax.uib.local","bonidepot.uib.local"],"selectedClients":["anna-tp-t14.uib.local","akunde1.uib.local"]} (important: pagenumber, perpage, clients bzw product zB 7zip)
      }
    }
    this.isLoading = false
  }

  async save (change: object) {
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
