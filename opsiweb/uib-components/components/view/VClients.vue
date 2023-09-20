<template>
  <div data-testid="VClients">
    <AlertAAlert ref="sortProductsAlert">
      <template #button>
        <b-button variant="warning" size="sm" class="float-right border-0 p-0" @click="sortProductTable(sortProductsByClient, sortProductsByCol, true)">
          {{ $t('button.continue') }}
        </b-button>
      </template>
    </AlertAAlert>
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tableclients">
      <template #parent>
        <LazyBarBPageHeader v-if="tableloaded" :title="$t('title.clients')">
          <template #right>
            <ButtonBTNRowLinkTo
              v-if="$mq == 'desktop'"
              :title="(secondColumnOpened || $mq=='mobile'? $t('button.show.products') : '')"
              :label="((secondColumnOpened) ? '' : $t('title.products'))"
              :icon="icon.product"
              to="/clients/products"
              ident="dummy"
              classes="tableheader_products border-0 pt-2 btn"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
          </template>
        </LazyBarBPageHeader>
        <BarBTableHeader :tableid="id" :table-data="tableData" :table-info.sync="tableInfo" :is-loading-parent="isLoading" :fetch="$fetch" />
        <TableTInfiniteScrollSmooth
          :id="id"
          :ref="id"
          :primary-key="id"
          rowident="clientId"
          :error="error"
          :is-loading="isLoading"
          :table-data="tableData"
          :header-data="headerData"
          :items="items"
          :cache_pages="cache_pages"
          :total-items="totalItems"
          :totalpages="totalpages"
          :selection="selectionClients"
          :setselection="setSelectionClients"
          :fetchitems="_fetch"
        >
          <!-- row actions: -->
          <template #contextcontent-1="{itemkey}">
            <DropdownDDClientActions :client-id="itemkey" :fetch="$fetch" :incontextmenu="true" />
            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              :label="$t('title.config')"
              :icon="icon.settings"
              to="/clients/config"
              :ident="itemkey"
              :pressed="isRouteActive"
              :incontextmenu="true"
              :click="routeRedirectWith"
            />
            <ButtonBTNRowLinkTo
              :title="$t('title.log')"
              :label="$t('title.log')"
              :icon="icon.log"
              to="/clients/log"
              :ident="itemkey"
              :pressed="isRouteActive"
              :incontextmenu="true"
              :click="routeRedirectWith"
            />
          </template>
          <!-- table actions: -->
          <template #contextcontent-general-1>
            <DropdownDDTableSorting :table-id="id" :incontextmenu="true" v-bind.sync="tableInfo" />
            <DropdownDDTableColumnVisibility :table-id="id" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" :incontextmenu="true" />
            <ButtonBTNRefetch
              :is-loading="isLoading"
              :tooltip="$t('button.refresh', {id: id})"
              :label="$t('button.refresh', {id: ''})"
              incontextmenu
              :refetch="_fetch"
            />
          </template>
          <template #head(version_outdated)>
            <div :title="$t('table.fields.versionOutdated')">
              <b-icon :icon="icon.product" />
              <b-icon font-scale="1.2" :icon="icon.productsOutdated" style="color: var(--warning);" />
            </div>
          </template>
          <template #head(actionResult_failed)>
            <div :title="$t('table.fields.actionResultFailed')">
              <b-icon :icon="icon.product" />
              <b-icon :icon="icon.productsFailedActionResult" class="rounded-circle" variant="danger" />
            </div>
          </template>
          <template #head(installationStatus_unknown)>
            <div :title="$t('table.fields.installationStatusUnknown')">
              <b-icon :icon="icon.product" />
              <b-icon :icon="icon. productInstallationStatusUnknown" class="rounded-circle" variant="primary" />
            </div>
          </template>
          <template #head(reachable)>
            <ModalMClientReachable classes="hover" />
          </template>
          <template #cell(reachable)="row">
            <ViewVClientReachable :id="row.item.clientId" :classes="{'row-selected': selectionClients.includes(row.item.clientId)}" />
          </template>

          <template #cell(uefi)="row">
            <b-icon v-if="row.item.uefi" :icon="icon.check" />
          </template>
          <template #cell(version_outdated)="row">
            <b-button
              v-if="row.item.version_outdated > 0"
              variant="outline-primary"
              size="sm"
              class="btn-client-statistic"
              :class="{'row-selected': selectionClients.includes(row.item.clientId)}"
              :title="$t('button.show.products')"
              @click="sortProductTable(row.item.clientId, 'version', false)"
            >
              {{ row.item.version_outdated }}
            </b-button>
          </template>
          <template #cell(actionResult_failed)="row">
            <b-button
              v-if="row.item.actionResult_failed > 0"
              variant="outline-primary"
              size="sm"
              class="btn-client-statistic"
              :title="$t('button.show.products')"
              :class="selectionClients.includes(row.item.clientId)? 'selected row-selected' : ''"
              :disabled="row.item.actionResult_failed == 0"
              @click="sortProductTable(row.item.clientId, 'actionResult', false)"
            >
              {{ row.item.actionResult_failed }}
            </b-button>
          </template>
          <template #cell(installationStatus_unknown)="row">
            <b-button
              v-if="row.item.installationStatus_unknown > 0"
              variant="outline-primary"
              size="sm"
              class="btn-client-statistic"
              :class="{'row-selected': selectionClients.includes(row.item.clientId)}"
              :title="$t('button.show.products')"
              @click="sortProductTable(row.item.clientId, 'installationStatus', false)"
            >
              {{ row.item.installationStatus_unknown }}
            </b-button>
          </template>
          <template #rowactions="row">
            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              :label="((headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.config') : '')"
              :icon="icon.settings"
              to="/clients/config"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <ButtonBTNRowLinkTo
              :title="$t('title.log')"
              :label="((headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.log') : '')"
              :icon="icon.log"
              to="/clients/log"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <DropdownDDClientActions :client-id="row.item.clientId" :fetch="$fetch" />
          </template>
          <template
            v-for="slotName in Object.keys($scopedSlots)"
            #[slotName]="slotScope"
          >
            <slot :name="slotName" v-bind="slotScope" />
          </template>
        </TableTInfiniteScrollSmooth>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" :sortby="sortProductsByCol" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import { Component, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders, ITableInfo } from '../../.utils/types/ttable'
import { MBus } from '../../mixins/messagebus'
import { Synchronization } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
import QueueNested from '../../.utils/utils/QueueNested'
import { Cookies } from '../../mixins/cookies'
const selections = namespace('selections')
interface DeleteClient {
  clientid: string
}

@Component({ mixins: [MBus, Icons, Synchronization, Cookies] })
export default class VClients extends Vue {
  syncSort: any // mixin Synchronization
  icon: any
  wsBusMsg: any // mixin MBus
  wsNotificationInfo: any // mixin MBus
  includesCookie!: any // mixin cookies
  getKeyCookie!: any
  $axios: any
  $t!: any
  $mq: any
  $fetch:any
  $nuxt:any
  $router:any
  $route: any

  id: string = 'Clients'
  sortProductsByCol: string = ''
  sortProductsByClient: string = ''
  rowId: string = ''
  isLoading: boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''
  tableloaded: boolean = false
  headerData: ITableHeaders = {
    selected: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.selection') as string, key: 'selected', _fixed: true, sortable: true,
      visible: this.includesCookie('column_' + this.id, 'selected', true)
    },
    // class: 'mobileVisibleOnlySelection'
    clientId: { // eslint-disaconfigble-next-line object-property-newline
      label: this.$t('table.fields.id') as string,
      key: 'clientId',
      _fixed: true,
      sortable: true,
      visible: this.includesCookie('column_' + this.id, 'clientId', true)
    },
    description: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.description') as string, key: 'description', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'description', false)
    },
    ipAddress: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.ip') as string, key: 'ipAddress', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'ipAddress', false)
    },
    macAddress: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.mac') as string, key: 'macAddress', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'macAddress', false)
    },
    lastSeen: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.lastSeen') as string, key: 'lastSeen', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'lastSeen', false)
    },
    uefi: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.uefi') as string, key: 'uefi', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'uefi', false)
    },
    _majorStats: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.stats') as string, key: '_majorStats', _isMajor: true, visible: false
    },
    version_outdated: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.versionOutdated') as string, key: 'version_outdated', _majorKey: '_majorStats', sortable: true, _fixed: true,
      visible: this.includesCookie('column_' + this.id, 'version_outdated', true)
    },
    actionResult_failed: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.actionResultFailed') as string, key: 'actionResult_failed', _majorKey: '_majorStats', sortable: true, _fixed: true,
      visible: this.includesCookie('column_' + this.id, 'actionResult_failed', true)
    },
    installationStatus_unknown: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.installationStatusUnknown') as string, key: 'installationStatus_unknown', _majorKey: '_majorStats', sortable: true, _fixed: true,
      visible: this.includesCookie('column_' + this.id, 'installationStatus_unknown', true)
    },
    // TODO: Sorting for reachable column
    reachable: { // eslint-disable-next-line object-property-newline
      key: 'reachable', label: this.$t('table.fields.reachable') as string, _fixed: true, sortable: false,
      visible: this.includesCookie('column_' + this.id, 'reachable', true)
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions', label: this.$t('table.fields.rowactions') as string, _fixed: true,
      visible: this.includesCookie('column_' + this.id, 'rowactions, false'),
      class: 'col-rowactions'
    }
  }

  deleteClient: DeleteClient = { clientid: '' }
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 20,
    sortBy: this.getKeyCookie('sorting_' + this.id, 'sortBy', 'clientId'),
    sortDesc: this.getKeyCookie('sorting_' + this.id, 'sortDesc', false),
    filterQuery: '',
    selected: ''
  }

  tableInfo: ITableInfo = {
    sortBy: this.tableData.sortBy || 'clientId',
    sortDesc: this.tableData.sortDesc || false,
    headerData: this.headerData,
    filterQuery: this.tableData.filterQuery
  }

  cache_pages_no: number = 2 // number of pages which can be stored in parallel (cache)
  cache_pages: QueueNested = new QueueNested(this.cache_pages_no)

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('wsBusMsg', { deep: true }) async wsBusMsgObjectChanged () {
    const msg = this.wsBusMsg
    if (msg && msg.channel === 'event:host_created') {
      this.wsNotificationInfo('MessageBus received event host_created', `${msg.data.id}`)
      await this.$fetch()
    }
    if (msg && ['host_connected', 'host_disconnected'].includes(msg.event)) {
      // const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
      // ref.alert(`MessageBus received event ${msg.event}`, 'info', `host: ${msg.data.id}`)
      // eslint-disable-next-line no-console
      console.log('message bus host_connected', msg)
      // this.cache_pages.
      // await this.$fetch()
    }
  }

  @Watch('selectionDepots', { deep: true }) async selectionDepotsChanged () {
    this.setSelectionClients([])
    await this.fetchPageOne()
  }

  @Watch('tableData.filterQuery', { deep: true }) tdFilterQueryChanged () {
    this.tableData.pageNumber = 1
  }

  @Watch('tableData', { deep: true }) async tableDataChanged () {
    await this.$fetch()
  }

  @Watch('tableData.sortDesc', { deep: true }) tableDataSortDescChanged () { this.syncSort(this.tableData, this.tableInfo, false, this.id) }
  @Watch('tableData.sortBy', { deep: true }) tableDataSortByChanged () { this.syncSort(this.tableData, this.tableInfo, false, this.id) }
  @Watch('tableInfo', { deep: true }) sortPropChanged () { this.syncSort(this.tableInfo, this.tableData, false, this.id) }

  mounted () {
    if (this.secondColumnOpened) {
      this.$router.push('/clients/')
    }
  }

  async fetchPageOne () {
    this.tableData.pageNumber = 1
    await this.$fetch()
  }

  async fetch () {
    const items = await this._fetch()

    Vue.nextTick(() => {
      if (!this.cache_pages.scrollDirection || this.cache_pages.scrollDirection === 'none') {
        this.cache_pages.set(this.tableData.pageNumber, items) // clear cache and set new page
      } else {
        this.cache_pages.setAuto(this.tableData.pageNumber, items) // try to append (start or beginning depend on pageNumber)
      }
      this.cache_pages.setTotalPages(this.totalpages)
    })
  }

  async _fetch () {
    this.isLoading = true
    const params = { ...this.tableData }
    params.selectedDepots = JSON.stringify(this.selectionDepots)
    params.selectedClients = JSON.stringify(this.selectionClients)
    if (params.sortBy === '') { params.sortBy = 'clientId' }
    if (params.sortBy === 'selected') {
      params.sortDesc = true
      params.selected = JSON.stringify(this.selectionClients)
    }
    return await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / params.perPage)
        this.isLoading = false
        this.tableloaded = true
        if (response.data === null) {
          return []
        } else {
          return response.data
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        ref?.alert(detailedError, 'danger')
        this.error = this.$t('message.error.defaulttext') as string
        this.error += JSON.stringify(error.message)
        this.isLoading = false
        return []
      })
  }

  routeRedirectWith (to: string, rowIdent: string) {
    if (this.isRouteActive(to, rowIdent)) {
      const parent = to.substring(0, to.lastIndexOf('/'))
      this.$router.push(parent)
    } else {
      this.rowId = rowIdent
      this.$router.push(to)
    }
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowId === rowIdent
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log') || this.$route.path.includes('products') || this.$route.path.includes('clone')
  }

  routeToChild (id: string) {
    this.routeRedirectWith('/clients/config', id)
  }

  sortProductTable (clientid: string, type: string, toContinue: boolean) {
    const ref = (this.$refs.sortProductsAlert as any)
    this.sortProductsByCol = type
    this.sortProductsByClient = clientid
    if (this.selectionClients.length <= 0 || toContinue || this.selectionClients[0] === clientid) {
      ref.hide()
      this.setSelectionClients([this.sortProductsByClient])
      this.rowId = 'dummy'
      this.$router.push('/clients/products')
    } else {
      ref.alert(this.$t('message.warning.sortProductsByClient', { client: this.sortProductsByClient }) as string, 'warning')
    }
  }
}
</script>

<style>
.tableheader_products:hover {
  background-color: var(--bg-btn-hover) !important;
}
.tableheader_products:focus {
  background-color: var(--bg-btn-hover) !important;
  border: var(--bg-btn-hover) !important;
}
/* .b-table-row-selected .btn, */
.row-selected.btn,
.row-selected>.btn {
color: var(--primary-foreground) !important;
}
</style>
