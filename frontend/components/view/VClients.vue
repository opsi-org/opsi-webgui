<template>
  <el-text>{{ $t('title.clients') }}</el-text><br />
  <el-text>Client Selection: {{ storeSelection.selectionClients }}</el-text> <br />
      <!-- :filterable-columns="[columns['clientId'], columns['description']]" -->

      <!-- <FormitemDDTableColumnVisibility :table-id="id" v-model:headers="columns" :sort-by="tableData.sortBy" :multi="true" :incontextmenu="false"/> -->
    <ButtonBTNRowLink
      :is-pressed="router.currentRoute.value.path.includes('/clients/products/')"
      :icon="icons.product"
      @click="openLink('/clients/products/LocalbootProduct')"
    > Products </ButtonBTNRowLink>
    <TableTDefault
      row-id="clientId"
      :id="id"
      v-model:columns="columns"
      v-model:data="fetchedData"
      :table-data.sync="tableData"
      :total-items="totalItems"
      :sort-by="tableData.sortBy"
      :is-mobile="isMobile"
      :is-loading="tableHelper.isLoading.value"
      @fetch="tableHelper.fetch"
      @selection-changed="(id: string) => {console.log('select clientId', id);storeSelection.toggleSelectionClients(id)}"
      @selection-clear="storeSelection.clearSelectionClients"
      @tabledata-changed="tableHelper.updateTableData"
      @sort-changed="tableHelper.sortChanged"
      @update-input-filter="tableHelper.filterChanged"
    >
    </TableTDefault>
  <!--

  <div data-testid="VClients">
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
          <template #contextcontent-1="{itemkey}">
            <!- row actions --
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
          <!- table actions: --
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
            <div :title="$t('table.fields.versionOutdated') + $t(' ') + $t('table.fields.localbootproduct')">
              <IconIIcon :icon="icon.product" /> <small>{{ $t('title.localboot') }}</small>
              <IconIIcon font-scale="1.2" :icon="icon.productsOutdated" style="color: var(--warning);" />
            </div>
          </template>
          <template #head(version_outdated_netboot)>
            <div :title="$t('table.fields.versionOutdated') + $t(' ') + $t('table.fields.netbootproduct')">
              <IconIIcon :icon="icon.product" /> <small>{{ $t('title.netboot') }}</small>
              <IconIIcon font-scale="1.2" :icon="icon.productsOutdated" style="color: var(--warning);" />
            </div>
          </template>
          <template #head(actionResult_failed)>
            <div :title="$t('table.fields.actionResultFailed')">
              <IconIIcon :icon="icon.product" />
              <IconIIcon :icon="icon.productsFailedActionResult" class="rounded-circle" variant="danger" />
            </div>
          </template>
          <template #head(installationStatus_unknown)>
            <div :title="$t('table.fields.installationStatusUnknown')">
              <IconIIcon :icon="icon.product" />
              <IconIIcon :icon="icon. productInstallationStatusUnknown" class="rounded-circle" variant="primary" />
            </div>
          </template>
          <template #head(reachable)>
            <ModalMClientReachable classes="hover" />
          </template>
          <template #cell(reachable)="row">
            <ButtonBTNClientReachable :id="row.item.clientId" :classes="{'row-selected': selectionClients.includes(row.item.clientId)}" />
          </template>

          <template #cell(uefi)="row">
            <IconIIcon v-if="row.item.uefi" :icon="icon.check" />
          </template>
          <template #cell(lastSeen)="row">
            <small>{{ date(row.item.lastSeen) }}</small>
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
          <template #cell(version_outdated_netboot)="row">
            <b-button
              v-if="row.item.version_outdated_netboot > 0"
              variant="outline-primary"
              size="sm"
              class="btn-client-statistic"
              :class="{'row-selected': selectionClients.includes(row.item.clientId)}"
              :title="$t('button.show.products')"
              @click="sortProductTable(row.item.clientId, 'version', false)"
            >
              {{ row.item.version_outdated_netboot }}
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
            <ButtonBTNRowLinkTo
              :title="$t('title.clone')"
              :label="((headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.clone') : '')"
              :icon="icon.client"
              to="/clients/clone"
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
  -->
  <!-- <br />
  <br />
  <br /> -->
  <!-- <pre>{{ totalItems }}</pre> -->
  <!-- <pre>{{ tableData }}</pre> -->
</template>

<script setup lang="tsx">
import BTNRowLink from '@/components/button/BTNRowLink.vue'
import { useNotification } from '~/composables/mixins/useComponent';
import { useTableHelper } from '~/composables/mixins/useTableHelper';
import { useIcons } from '~/composables/mixins/useIcons';
import { useConfigserver } from '~/composables/mixins/useGet';
import { useNavigate } from '~/composables/mixins/useNavigateTo';
import { TableV2FixedDir, type CheckboxValueType } from 'element-plus';
import type { T_ClientsList } from '~/types/APItypes';
import type { ITableHeaderRow } from '~/types/ttableV3'
import type { ITableData } from '~/types/ttable';

const router = useRouter()
const navigation = useNavigate()
const $t = useI18n().t
const icons = useIcons()
const notify = useNotification()

const storeSelection = storeSelections()
const storeTable = storeTablesettings()
// const datacache = storeCache()

const fetchedData = ref<Array<any>>([])
const totalItems = ref<number>(0)
const tableData = ref<ITableData>({
  pageNumber: 1,
  perPage: 1000000,
  _lastScrollDirection: '',
  // sortBy: 'clientId', // this.getKeyCookie('sorting_' + id, 'sortBy', 'depotId'),
  sortBy: storeTable.clientsSorting.column,
  sortDesc: storeTable.clientsSorting.isDesc,
  // sortDesc: false, // this.getKeyCookie('sorting_' + id, 'sortDesc', false),
  filterQuery: '',
  filterColumns: ['clientId', 'description']
})

const id = "clients"
const columns = ref<ITableHeaderRow>({
    selected: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.selection'),
      key: 'selected',
      dataKey: 'selected',
      class: 'col-selected',
      sortable: true,
      width: 40,
      maxWidth: 40,
      _fixed: true, // always visible
      fixed: true, // always visible
      // hidden: cookies.includesCookie('column_' + id, 'selected', true)
    },
    // class: 'mobileVisibleOnlySelection'
    clientId: { // eslint-disaconfigble-next-line object-property-newline
      title: $t('table.fields.id'),
      key: 'clientId',
      dataKey: 'clientId',
      class: 'col-clientId',
      _fixed: true,
      width: 100,
      sortable: true,
      // hidden: cookies.includesCookie('column_' + id, 'clientId', true)
      hidden: false,

      cellRenderer: ({rowData}) => {
        // { <el-tag>{fetchedData.value.findIndex((e: any) => e.clientId === rowData.clientId)}</el-tag> }
        return (
          <>
          <el-text>{rowData.clientId}</el-text>
          </>
        )
      }
    },
    description: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.description'),
      key: 'description',
      dataKey: 'description',
      class: 'col-description',
      sortable: true,
      width: 300,
      hidden: !storeTable.clientsColumns.includes('description')
      // hidden: cookies.includesCookie('column_' + id, 'description', false)
    },
    ipAddress: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.ip'),
      key: 'ipAddress',
      dataKey: 'ipAddress',
      class: 'col-ipAddress',
      sortable: true,
      width: 100,
      hidden: !storeTable.clientsColumns.includes('ipAddress')
      // hidden: cookies.includesCookie('column_' + id, 'ipAddress', false)
    },
    macAddress: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.mac'),
      key: 'macAddress',
      dataKey: 'macAddress',
      class: 'col-macAddress',
      sortable: true,
      width: 100,
      hidden: !storeTable.clientsColumns.includes('macAddress')
      // hidden: cookies.includesCookie('column_' + id, 'macAddress', false)
    },
    lastSeen: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.lastSeen'),
      key: 'lastSeen',
      dataKey: 'lastSeen',
      class: 'col-lastSeen',
      sortable: true,
      width: 100,
      hidden: !storeTable.clientsColumns.includes('lastSeen')
      // hidden: cookies.includesCookie('column_' + id, 'lastSeen', false)
    },
    uefi: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.uefi'),
      key: 'uefi',
      dataKey: 'uefi',
      class: 'col-uefi',
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('uefi'),
      // hidden: !cookies.includesCookie('column_' + id, 'uefi', false),
        // onChange={onChange}
      cellRenderer: ({rowData}:any) =>
        <el-checkbox
          modelValue={rowData.uefi}
          indeterminate={false}
          class="pr-3"
        />
    },
    _majorStats: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.stats'),
      key: '_majorStats',
      dataKey: '_majorStats',
      class: 'col-_majorStats',
      width: 50,
      _isMajor: true,
      hidden: true // this is a dummy column for grouping
    },
    version_outdated: { // eslint-disable-next-line object-property-newline
      tooltip: $t('table.fields.versionOutdatedGeneral'),
      key: 'version_outdated',
      dataKey: 'version_outdated',
      _majorKey: '_majorStats',
      class: 'col-_majorStats',
      sortable: true,
      width: 50,
      icon: icons.productsOutdated,
      iconColor: "--el-color-warning",
      hidden: !storeTable.clientsColumns.includes('_majorStats')
      // hidden: !cookies.includesCookie('column_' + id, 'version_outdated', true)
    },
    version_outdated_netboot: { // eslint-disable-next-line object-property-newline
      tooltip: $t('table.fields.versionOutdatedNetboot'),
      key: 'version_outdated_netboot',
      dataKey: 'version_outdated',
      _majorKey: '_majorStats',
      icon: icons.productsOutdated,
      iconColor: "--el-color-warning",
      class: 'col-_majorStats',
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('_majorStats')
      // hidden: !cookies.includesCookie('column_' + id, 'version_outdated', true)
    },
    actionResult_failed: { // eslint-disable-next-line object-property-newline
      tooltip: $t('table.fields.actionResultFailed'),
      key: 'actionResult_failed',
      dataKey: 'actionResult_failed',
      _majorKey: '_majorStats',
      class: 'col-_majorStats',
      icon: icons.productsFailedActionResult,
      iconColor: "--el-color-error",
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('_majorStats')
      // hidden: !cookies.includesCookie('column_' + id, 'actionResult_failed', true)
    },
    installationStatus_unknown: { // eslint-disable-next-line object-property-newline
      tooltip: $t('table.fields.installationStatusUnknown'),
      key: 'installationStatus_unknown',
      dataKey: 'installationStatus_unknown',
      _majorKey: '_majorStats',
      class: 'col-_majorStats',
      icon: icons.productInstallationStatusUnknown,
      iconColor: "--el-color-info",
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('_majorStats')
      // hidden: !cookies.includesCookie('column_' + id, 'installationStatus_unknown', true)
    },
    // TODO: Sorting for reachable column
    reachable: { // eslint-disable-next-line object-property-newline
      tooltip: $t('table.fields.reachable'),
      key: 'reachable',
      dataKey: 'reachable',
      class: 'col-reachable',
      icon: icons.productsOutdated,
      sortable: false,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('reachable')
      // hidden: !cookies.includesCookie('column_' + id, 'reachable', true)
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.rowactions'),
      key: 'rowactions',
      dataKey: 'rowactions',
      _fixed: TableV2FixedDir.RIGHT,
      width: 100,
      hidden: false,
      class: 'col-rowactions',
      cellRenderer: ({rowData}) => {
        return (
          <>
          {/* { <el-tag>{fetchedData.value.findIndex((e: any) => e.clientId === rowData.clientId) + 1}</el-tag> } */}
          <BTNRowLink
            isPressed={navigation.rowactionConfigChecked.value[rowData.clientId] && navigation.pageType.value === 'config'}
            icon={icons.settings}
            onOnClick={(e: Event) => changeRowLink(e, rowData.clientId, 'config')}
          />
          <BTNRowLink
            isPressed={navigation.rowactionConfigChecked.value[rowData.clientId] && navigation.pageType.value === 'logs'}
            icon={icons.log}
            onOnClick={(e: Event) => changeRowLink(e, rowData.clientId, 'logs')}
          />
          </>
      )},
    }
})


const tableHelper = useTableHelper(id, tableData, fetchedData, totalItems, _fetch, storeTable) // define watcher for tableData


const emit = defineEmits(['change'])
const props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return false}}
})

onMounted(async ()=> {
  await useConfigserver(true) // init selectiondepots with configserver
  await tableHelper.fetch()
  tableHelper.setTotalItemsAsPerPage(totalItems.value)
})


// const handleChange = (id:string) => {
//   console.log('handleSelectionChange', id)
//   storeSelection.toggleSelectionDepots(id)
// }
function openLink(link: string) {
  router.push(link)
}
function changeRowLink(e:Event, cid: string, to='config') {
  // e.stopPropagation()
  // e.stopImmediatePropagation()
  emit('change', cid)
  if (to === 'config') {
    navigation.toConfiguration(id, cid)
  } else if (to === 'logs') {
    navigation.toType(id, cid, 'logs')
  }
}
// function updateTableData (v: typeof tableData.value) {
//   console.log('tabledata changed total', v)
//   tableData.value = v
// }
async function _fetch() {
  const params:any = { ...tableData.value }
  // console.log('datacache server', datacache.opsiconfigserver)
  params.selectedDepots = JSON.stringify(storeSelection.selectionDepots)
  // console.log('params.selectedDepots', params.selectedDepots)
  params.selectedClients = JSON.stringify(storeSelection.selectionClients)
    // console.log('params.selectedClients', params.selectedClients)
  if (params.sortBy === '') { params.sortBy = 'clientId' }
  if (params.sortBy === 'selected') {
    params.sortDesc = true
    params.selected = JSON.stringify(storeSelection.selectionClients)
  }
    // return await this.$axios.get('/api/opsidata/clients', { params })
    //   .then((response) => {
    //     this.totalItems = response.headers['x-total-count']
    //     this.totalpages = Math.ceil(this.totalItems / params.perPage)
    //     this.isLoading = false
    //     this.tableloaded = true
    //     if (response.data === null) {
    //       return []
    //     } else {
    //       return response.data
    //     }
    //   }).catch((error) => {
    //     this.showToastError(error)
    //     return []
    //  })
  log().log_colored('green', 'VClients: fetch clients. page', params.pageNumber)
  // console.log('VClients: fetch clients. page', params.pageNumber)
  const {data, error, headers} = await useApiGETBody<T_ClientsList>(`/opsidata/clients`, params)

  if (error) {
    console.log(error)
    notify.error(error, 'Error fetching clients')
    return []
  }
  // console.log('data', data)
  totalItems.value = parseInt(headers['x-total-count'])
  // tableHelper.setPerPage(headers)
  // this.totalpages = Math.ceil(this.totalItems / params.perPage)
  // this.isLoading = false
  // this.tableloaded = true
  // if (response.data === null) {
  //   return []
  // } else {
  //   return response.data
  // }
  // console.log('DATA', data.value.length)
  // const items = [{dummy:true, clientId: 'scroll up to load more'}, ...data.value, {dummy:true, clientId: 'scroll down to load more'}]
  // return items
  const sort_by_SortBy = (a: any, b: any) => {
    if (a[params.sortBy] < b[params.sortBy]) {
      return params.sortDesc ? 1 : -1
    }
    if (a[params.sortBy] > b[params.sortBy]) {
      return params.sortDesc ? -1 : 1
    }
    return 0
  }
  // return data.value.sort(sort_by_SortBy)
  return data.value
}
/**
import { Component, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders, ITableInfo } from '../../.utils/types/ttable'
import { MBus } from '../../mixins/messagebus'
import { AlertToast, Synchronization } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
import QueueNested from '../../.utils/utils/QueueNested'
import { Cookies } from '../../mixins/cookies'
import { Format } from '../../mixins/format'
import { DeleteClient } from '../../.utils/types/tobjects'
import { storeTablesettings } from '../../store/tablesettingsStore';
import BTNRowLinkTo from '../../../opsiweb/uib-components/components/button/BTNRowLinkTo.vue';
const selections = namespace('selections')

@Component({ mixins: [AlertToast, MBus, Icons, Synchronization, Cookies, Format] })
export default class VClients extends Vue {
  syncSort: any // mixin Synchronization
  icon: any
  date:any
  wsBusMsg: any // mixin MBus
  showToast: any // mixin AlertToast
  showToastMbus: any // mixin AlertToast
  showToastError: any // mixin AlertToast
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

  @selections.Getter public multiSelection!: boolean
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('wsBusMsg', { deep: true }) async wsBusMsgObjectChanged () {
    const msg = this.wsBusMsg
    if (msg && msg.channel === 'event:host_created') {
      this.showToastMbus({
        title: this.$t('message.info.event'),
        content: this.$t('message.info.event.client_updated', { clientId: msg.data.id })
      })
      await this.$fetch()
    }
    if (msg && ['host_connected', 'host_disconnected'].includes(msg.event)) {
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
        this.showToastError(error)
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
    // const ref = (this.$refs.sortProductsAlert as any)
    this.sortProductsByCol = type
    this.sortProductsByClient = clientid
    if (this.selectionClients.length <= 0 || toContinue || this.selectionClients[0] === clientid || this.multiSelection === false) {
      // ref.hide()
      this.setSelectionClients([this.sortProductsByClient])
      this.rowId = 'dummy'
      this.$router.push('/clients/products')
    } else {
      // ref.alert(this.$t('message.warning.sortProductsByClient', { client: this.sortProductsByClient }) as string, 'warning')
      this.showToast({
        title: this.$t('message.warning.title'),
        content: this.$t('message.warning.sortProductsByClient', { client: this.sortProductsByClient }),
        variant: 'warning',
        noAutoHide: true,
        buttons: [
          {
            hide: true,
            text: this.$t('button.continue') as string,
            action: () => this.sortProductTable(this.sortProductsByClient, this.sortProductsByCol, true) // shows reload button
          }
        ],
        components: [
          this.$createElement('CheckboxCBMultiselection', { props: { type: 'button', action: () => this.sortProductTable(this.sortProductsByClient, this.sortProductsByCol, true) } })
          // new CBMultiselection({ type: 'button' })
        ]
      })
    }
  }
}
*/
</script>

<style scoped>
/*
.tableheader_products:hover {
  background-color: var(--bg-btn-hover) !important;
}
.tableheader_products:focus {
  background-color: var(--bg-btn-hover) !important;
  border: var(--bg-btn-hover) !important;
}
.row-selected.btn,
.row-selected>.btn {
color: var(--primary-foreground) !important;
}
*/
</style>
