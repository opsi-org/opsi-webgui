<template>
<<<<<<< HEAD
  <div>
    <el-dropdown trigger="click">
      <el-button>
        <IconIIcon :icon="icons.columns" />
      </el-button>
      <template #dropdown>
          <div style="display: flex; font-weight: bold; padding: 10px;">
            <div class="pr-10"><IconIIcon :icon="icons.filter" /></div>
            <div class="pr-10"><el-button type="text"><IconIIcon :icon="icons.sortDesc" />Sort</el-button></div>
            <div><IconIIcon :icon="icons.columns" /></div>
          </div>
          <template v-for="column in tableColumn" :key="column.key">
            <el-dropdown-item>
              <el-checkbox :disabled="!column.filter" v-model="filterBy" @change="applyFilter(column.key)"></el-checkbox>
              <el-radio :disabled="!column.sortable" v-model="sortBy" @change="applySort(column.key)"></el-radio>
              <el-checkbox v-model="column.visible" @click.stop :disabled="column.alwaysVisible">{{ column.title }}</el-checkbox>
            </el-dropdown-item>
          </template>
=======
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
      @selection-changed="(id: string) => {storeSelection.toggleSelectionClients(id)}"
      @selection-clear="storeSelection.clearSelectionClients"
      @tabledata-changed="tableHelper.updateTableData"
      @sort-changed="tableHelper.sortChanged"
      @update-input-filter="tableHelper.filterChanged"
    >
      <template #header-post-filter>
        <ButtonBTNRowLink
          :is-pressed="router.currentRoute.value.path.includes('/clients/products/')"
          :icon="icons.product"
          @click="openLink('/clients/products/LocalbootProduct')"
        > {{$t('table.fields.products')}} </ButtonBTNRowLink>
        PerPage: {{tableData.perPage}}
>>>>>>> nuxt3
      </template>
    </el-dropdown>
    <el-input v-model="filterQuery" placeholder="Type to filter..." class="w-50"></el-input>

    <div ref="infiniteScrollDiv" style="height: 80vh; overflow-y: auto;" @scroll="debouncedHandleScroll">
      <div v-if="!isFirstPage" class="extra-column">
        <div v-if="!isLoading">Scroll up to load previous page...</div>
      </div>
      <el-table :data="fetchedData" v-loading="isLoading">
        <template v-for="column in tableColumn">
          <el-table-column
            v-if="column.visible || column.alwaysVisible"
            :key="column.key"
            :prop="column.key"
            :label="column.title"
            :type="column.type"
            :sortable="column.sortable"
          >
            <template #default="scope" v-if="column.key === 'actions'">
              <el-button type="text" @click="handleActionClick(scope.row)">Action</el-button>
              <el-button type="text" @click="useRouter().push('/clients/client/logs/' + scope.row.ident)">Log</el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>
      <div class="extra-column">
        <span v-if="!isLastPage && !isLoading" >Scroll down to load next page...</span>
      </div>
    </div>

    <div class="flex justify-end">
      <el-pagination
        @current-change="handlePagination"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="totalItems">
      </el-pagination>
    </div>
  </div>
</template>
<script setup lang="ts">
import { debounce } from 'lodash'
import type { T_ClientsList } from '~/types/APItypes';
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
const icons = useIcons()
const { notifyError } = useNotification()
const storeSelection = storeSelections()
const $t = useI18n().t
let fetchedData = ref()
const totalItems = ref<number>(0)
const currentPage = ref(1)
const pageSize = ref(20)
const isLoading = ref(false)
let isFirstPage = ref(false)
let isLastPage = ref(false)
let infiniteScrollDiv = ref<HTMLElement | null>(null)
const filterQuery = ref('')
const sortBy = ref('ident')
const filterBy = ref('ident')
const tableColumn = ref([
  {title: 'selected', key: 'selected', sortable: false, type: 'selection', visible: true, alwaysVisible: true},
  {title: 'clientId', key: 'clientId', sortable: true, visible: true, alwaysVisible: true, filter: true},
  {title: 'macAddress', key: 'macAddress', sortable: false, visible: false},
  {title: 'ipAddress', key: 'ipAddress', sortable: true, visible: false},
  {title: 'description', key: 'description', sortable: false, visible: false},
  {title: 'notes', key: 'notes', sortable: true, visible: false},
  {title: 'lastSeen', key: 'lastSeen', sortable: false, visible: false},
  {title: 'uefi', key: 'uefi', sortable: true, visible: false},
  {title: 'version_outdated', key: 'version_outdated', sortable: false, visible: false},
  {title: 'version_outdated_netboot', key: 'version_outdated_netboot', sortable: false, visible: false},
  {title: 'installationStatus_unknown', key: 'installationStatus_unknown', sortable: false, visible: true},
  {title: 'installationStatus_installed', key: 'installationStatus_installed', sortable: false, visible: true},
  {title: 'actionResult_failed', key: 'actionResult_failed', sortable: false, visible: true},
  {title: 'actionResult_successful', key: 'actionResult_successful', sortable: false, visible: true},
  {title: 'reachable', key: 'reachable', sortable: false, visible: false},
  {title: 'actions', key: 'actions', sortable: false, visible: true, alwaysVisible: true},
])

onMounted(() => {
  fetchClients()
})

<<<<<<< HEAD
function handleScroll(event: Event) {
  let target = event.target as HTMLElement;
  let dynamicScrollThreshold = target.clientHeight / fetchedData.value.length;
  if (target.scrollTop <= dynamicScrollThreshold) {
    scrollUp();
  } else if (target.scrollHeight - target.scrollTop <= target.clientHeight + dynamicScrollThreshold) {
    scrollDown();
=======
const id = "clients"
const columns = ref<ITableHeaderRow>({
    selected: {
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
      headerCellRenderer: () => {
        return (
        <buttonBTNClearSelection onClearselection={storeSelection.clearSelectionClients} />
        )
      },
      cellRenderer: ({rowData}) => {
        // const selectedIds = computed(() => storeSelection._selectionClients)
        // <div class="hidden">{{ (getSelectedrowIdsFromStore().includes(rowData[props.rowId])) ? rowData.selected = true : rowData.selected = false }}</div>
        if (storeSelection.selectionClients.includes(rowData.clientId)){
          rowData.selected = true
        }
        return (<>
          {rowData.dummy ? <div /> :
            storeSelection.multiSelection ?
              <el-checkbox v-model={rowData.selected} class="selectionItem" />
            :
              <el-radio-group v-model={rowData.selected}>
                <el-radio value={true} class="selectionItem hide_label" />
              </el-radio-group>
          }
        </>)
      }
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
          <el-text>{rowData.clientId}</el-text>
        )
      }
    },
    description: {
      title: $t('table.fields.description'),
      key: 'description',
      dataKey: 'description',
      class: 'col-description',
      sortable: true,
      width: 300,
      hidden: !storeTable.clientsColumns.includes('description')
    },
    ipAddress: {
      title: $t('table.fields.ip'),
      key: 'ipAddress',
      dataKey: 'ipAddress',
      class: 'col-ipAddress',
      sortable: true,
      width: 100,
      hidden: !storeTable.clientsColumns.includes('ipAddress')
    },
    macAddress: {
      title: $t('table.fields.mac'),
      key: 'macAddress',
      dataKey: 'macAddress',
      class: 'col-macAddress',
      sortable: true,
      width: 100,
      hidden: !storeTable.clientsColumns.includes('macAddress')
    },
    lastSeen: {
      title: $t('table.fields.lastSeen'),
      key: 'lastSeen',
      dataKey: 'lastSeen',
      class: 'col-lastSeen',
      sortable: true,
      width: 100,
      hidden: !storeTable.clientsColumns.includes('lastSeen')
    },
    uefi: {
      title: $t('table.fields.uefi'),
      key: 'uefi',
      dataKey: 'uefi',
      class: 'col-uefi',
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('uefi'),
      cellRenderer: ({rowData}:any) =>
        <el-checkbox
          modelValue={rowData.uefi}
          indeterminate={false}
          class="pr-3"
        />
    },
    _majorStats: {
      title: $t('table.fields.stats'),
      key: '_majorStats',
      dataKey: '_majorStats',
      class: 'col-_majorStats',
      width: 50,
      _isMajor: true,
      // hidden: true // this is a dummy column for grouping
      hidden: !storeTable.clientsColumns.includes('_majorStats')
    },
    installationStatus_unknown: {
      tooltip: $t('table.fields.installationStatusUnknown'),
      key: 'installationStatus_unknown',
      dataKey: 'installationStatus_unknown',
      _majorKey: '_majorStats',
      class: 'col-_majorStats',
      icons: [icons.productInstallationStatusUnknown, icons.product],
      // icon: icons.productInstallationStatusUnknown,
      iconColor: "--el-color-info",
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('_majorStats'),
      cellRenderer: ({rowData}:any) => {
        const click = () => {openLink('/clients/products/LocalbootProduct?sortby=installationStatus&selectedClient=' + rowData.clientId)}
        return <el-tag
                  class="cursor-pointer"
                  onClick={click}>
                  {rowData.installationStatus_unknown}
              </el-tag>
      }
      // hidden: !cookies.includesCookie('column_' + id, 'installationStatus_unknown', true)
    },
    actionResult_failed: {
      tooltip: $t('table.fields.actionResultFailed'),
      key: 'actionResult_failed',
      dataKey: 'actionResult_failed',
      _majorKey: '_majorStats',
      class: 'col-_majorStats',
      icons: [icons.productsFailedActionResult, icons.productActionResult],
      // icon: icons.productsFailedActionResult,
      iconColor: "--el-color-error",
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('_majorStats'),
      cellRenderer: ({rowData}:any) => {
        const click = () => {openLink('/clients/products/LocalbootProduct?sortby=actionResult&selectedClient=' + rowData.clientId)}
        return <el-tag
                  class="cursor-pointer" onClick={click}>{rowData.actionResult_failed}</el-tag>
      }
      // hidden: !cookies.includesCookie('column_' + id, 'actionResult_failed', true)
    },
    version_outdated: {
      tooltip: $t('table.fields.versionOutdatedGeneral'),
      key: 'version_outdated',
      dataKey: 'version_outdated',
      _majorKey: '_majorStats',
      class: 'col-_majorStats',
      sortable: true,
      width: 50,
      align: 'right',
      icons: [icons.productsOutdated, icons.product],
      iconColor: "--el-color-warning",
      hidden: !storeTable.clientsColumns.includes('_majorStats'),
      cellRenderer: ({rowData}:any) => {
        const click = () => {openLink('/clients/products/LocalbootProduct?sortby=version&selectedClient=' + rowData.clientId)}
        return <el-tag
                  class="cursor-pointer" onClick={click}>{rowData.version_outdated}</el-tag>
      }
      // hidden: !cookies.includesCookie('column_' + id, 'version_outdated', true)
    },
    version_outdated_netboot: {
      tooltip: $t('table.fields.versionOutdatedNetboot'),
      key: 'version_outdated_netboot',
      dataKey: 'version_outdated_netboot',
      _majorKey: '_majorStats',
      icons: [icons.productsOutdated, icons.product],
      iconColor: "--el-color-warning",
      class: 'col-_majorStats',
      sortable: true,
      width: 50,
      hidden: !storeTable.clientsColumns.includes('_majorStats'),
      cellRenderer: ({rowData}:any) => {
        const click = () => {openLink('/clients/products/NetbootProduct?sortby=version&selectedClient=' + rowData.clientId)}
        return <el-tag
                  class="cursor-pointer" onClick={click}>{rowData.version_outdated_netboot}</el-tag>
      }
      // hidden: !cookies.includesCookie('column_' + id, 'version_outdated', true)
    },


    // TODO: Sorting for reachable column
    reachable: {
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
    rowactions: {
      title: $t('table.fields.rowactions'),
      key: 'rowactions',
      dataKey: 'rowactions',
      _fixed: TableV2FixedDir.RIGHT,
      width: 100,
      hidden: false,
      class: 'col-rowactions',
      _has_cell_renderer: true,
      cellRenderer: ({rowData}) => {
        return (
          <>
          {/* { <el-tag>{fetchedData.value.findIndex((e: any) => e.clientId === rowData.clientId) + 1}</el-tag> } */}
          <div class="flex flex-row">
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
            <BTNRowLink
              isPressed={navigation.rowactionConfigChecked.value[rowData.clientId] && navigation.pageType.value === 'clone'}
              icon={icons.client}
              onOnClick={(e: Event) => changeRowLink(e, rowData.clientId, 'clone')}
            />
            <DDClientActions clientIds={[rowData.clientId]} />
        </div>
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
  await useConfigserver(true, undefined, $t) // init selectiondepots with configserver
  await tableHelper.fetch()
  tableHelper.setTotalItemsAsPerPage(totalItems.value)
})


// const handleChange = (id:string) => {
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
  } else if (to === 'clone') {
    navigation.toType(id, cid, 'clone')
>>>>>>> nuxt3
  }
}

<<<<<<< HEAD
const debouncedHandleScroll = debounce(handleScroll, 200)

async function scrollUp() {
  if (!isLoading.value && !isFirstPage.value) {
    currentPage.value--
    await fetchClients()
=======
function _objectWithoutProperties(obj: any, keys: string[]): any {
  const target: any = {};
  for (const i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

async function _fetch() {
  const params: any = _objectWithoutProperties(tableData.value, ["_lastScrollDirection"]);
  // const params:any = { ...tableData.value }
  params.selectedDepots = JSON.stringify(storeSelection.selectionDepots)
  params.selectedClients = JSON.stringify(storeSelection.selectionClients)
  if (params.sortBy === '') { params.sortBy = 'clientId' }
  if (params.sortBy === 'selected') {
    params.sortDesc = true
    params.selected = JSON.stringify(storeSelection.selectionClients)
  }
    // return await this.$axios.get('/api/opsidata/clients', { params })
    //   .then((response) => {
    //     this.totalItems = response.headers[opsiheaders.xtotalcount']
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
  const {data, error, headers} = await useApiGETBody<T_ClientsList>(`/opsidata/clients`, params)

  if (error) {
    console.error(error)
    notifyError({ title:$t('message.error.fetch')+'Clients', message: error?.response?.data?.message })
    return []
  }

  totalItems.value = parseInt(headers.get(opsiheaders.xtotalcount) || '0')
  // tableHelper.setPerPage(headers)
  // this.totalpages = Math.ceil(this.totalItems / params.perPage)
  // this.isLoading = false
  // this.tableloaded = true
  // if (response.data === null) {
  //   return []
  // } else {
  //   return response.data
  // }
  // const items = [{dummy:true, clientId: 'scroll up to load more'}, ...data.value, {dummy:true, clientId: 'scroll down to load more'}]
  // return items
  // const sort_by_SortBy = (a: any, b: any) => {
  //   if (a[params.sortBy] < b[params.sortBy]) {
  //     return params.sortDesc ? 1 : -1
  //   }
  //   if (a[params.sortBy] > b[params.sortBy]) {
  //     return params.sortDesc ? -1 : 1
  //   }
  //   return 0
  // }
  // return data.value.sort(sort_by_SortBy)
  if (!data.value) {
    return []
  }
  return data.value
}

async function wsBusMsgObjectChanged(msg: any = undefined) {
  if (msg && msg.channel === 'event:host_created') {
    notifyInfo({ title: $t('message.info.event'), message: $t('message.info.event.client_updated', { clientId: msg.data.id }),
          button: { label: $t('label.reloadPage'), onClick() {
            async () => {
              tableHelper.setTotalItemsAsPerPage(100000)
              await tableHelper.fetch()
              tableHelper.setTotalItemsAsPerPage(totalItems.value)
            }
           } } })
  }
  if (msg && ['host_connected', 'host_disconnected'].includes(msg.event)) {
    console.warn('message bus: ', msg)
>>>>>>> nuxt3
  }
}

async function scrollDown() {
  if (!isLoading.value && !isLastPage.value) {
    currentPage.value++
    await fetchClients()
  }
}

function scrollToTopOfTable() {
  if (infiniteScrollDiv.value) {
    if (currentPage.value == 1) {
      infiniteScrollDiv.value.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return
    }
    infiniteScrollDiv.value.scrollTo({
      top: 400,
      behavior: 'smooth'
    });
  }
}

async function fetchClients() {
  isLoading.value = true
  const params = {
    filterQuery: filterQuery.value,
    pageNumber: currentPage.value,
    perPage: pageSize.value,
    sortBy:'clientId',
    sortDesc:true,
    selected: JSON.stringify(storeSelection.selectionClients),
    selectedDepots: JSON.stringify(storeSelection.selectionDepots)
  }
  try {
    const {data, error, headers} = await useApiGETBody<T_ClientsList>('/opsidata/clients', params)
      if (error) {
      notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
      return
    }
    if (data.value == undefined) {
      notifyError({ message: $t('message.error.empty-response') })
      return
    }
    fetchedData.value = data.value
    totalItems.value = parseInt(headers.get('x-total-count') || '0')
    if (headers.get('x-total-count')) {
      isFirstPage.value = currentPage.value == 1
      isLastPage.value = currentPage.value * pageSize.value >= parseInt(headers.get('x-total-count') || '0')
    }
  } catch (error) {
    notifyError({ message: $t('message.error.unexpected') })
  } finally {
    isLoading.value = false
    scrollToTopOfTable()
  }
}

function handlePagination(val: number) {
  currentPage.value = val
  fetchClients()
}

function handleActionClick(rowData: any) {
  console.log('Action clicked for row:', rowData);
}

function applyFilter(columnKey: string) {
  filterBy.value = columnKey
  // fetchClients()
}

function applySort(columnKey: string) {
  sortBy.value = columnKey
  // fetchClients()
}
</script>

<style scoped>
.extra-column {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
