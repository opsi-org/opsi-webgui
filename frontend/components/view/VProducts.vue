<template>
  <TableTDefault
      row-id="productId"
      :id="id"
      v-model:columns="columns"
      v-model:data="fetchedDataWrapper"
      v-model:tabledata="tableDataWrapper"
      :total-items="totalItems"
      :sort-by="tableDataWrapper.sortBy"
      :is-mobile="isMobile"

      :is-loading="tableHelper.isLoading.value"
      @fetch="tableHelper.fetch"
      @selection-changed="(id: string) => {storeSelection.toggleSelectionProducts(id)}"
      @selection-clear="storeSelection.clearSelectionProducts"
      @tabledata-changed="tableHelper.updateTableData"
      @sort-changed="tableHelper.sortChanged"
      @update-input-filter="tableHelper.filterChanged"
      >
      <!-- @tabledata-changed="(v: any) => {updateTableData('localboot', v)}" -->
      <!-- @sort-changed="(key: string, isDesc: boolean) => {
        tableData[currentType].sortBy = key
        tableData[currentType].sortDesc = isDesc
        tableSettings.setSortColumn(id, key, isDesc)
      }" -->
      <!-- @update-input-filter="(v: any)=> {
        tableData[currentType].filterColumns = v.cols
        tableData[currentType].filterQuery = v.vals
      }" -->
      <template #header-title>
        <div>
          <el-checkbox-button
            v-model="productsTypeChecked.LocalbootProduct"
            @change="changeProductsType('LocalbootProduct')"
          >{{$t('title.localbootProducts')}}</el-checkbox-button>
          <!-- <el-badge is-dot class="item"  :hidden="numberOtherNetboot <= 0" type="warning" > -->
            <el-checkbox-button
            v-model="productsTypeChecked.NetbootProduct"
            @change="changeProductsType('NetbootProduct')"
            >{{ $t('title.netbootProducts') }}</el-checkbox-button>
          <!-- </el-badge> -->
          <!--  el-checkbox-button
            disabled
            v-model="productsTypeChecked.Product"
            @change="changeProductsType('Product')"
          >Product< / > -->
        </div>
      </template>
    </TableTDefault>
  <!-- <div data-testid="VProducts" class="VProducts">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <LazyBarBPageHeader v-if="tableloaded" :title="$t('title.products')" :closeroute="child? '/clients/' : null" />
        <b-tabs class="products_horizontaltabs" small lazy>
          <b-tab disabled>
            <template #title>
              <small> <b class="count">
                {{ t_fixed('keep-english.count/all').replace('count', selectionProducts.length).replace('all', parseInt(localboot) + totalnetboot) }}
              </b> </small>
            </template>
          </b-tab>
          <b-tab active>
            <template #title>
              <span class="localboot"> {{ $t('title.localboot') + ' (' + localboot + ')' }} </span>
            </template>
            <TableTProductsLocalboot
              ref="ref-products-localboot"
              :parent-id="id"
              :is-loading="isLoading"
              :table-info.sync="tableInfo"
              :totallocalboot.sync="localboot"
              :sort="{sortBy:tableInfo.sortBy, sortDesc:tableInfo.sortDesc}"
              :filter-query="tableInfo.filterQuery"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
              :fetched-data-clients2-depots="fetchedDataClients2Depots"
              @fetch-products="fetchProducts"
            />
          </b-tab>
          <b-tab>
            <template #title>
              <span class="netboot"> {{ $t('title.netboot') + ' (' + totalnetboot+ ')' }} </span>
            </template>
            <TableTProductsNetboot
              ref="ref-products-netboot"
              :parent-id="id"
              :is-loading="isLoading"
              :table-info="tableInfo"
              :totalnetboot.sync="netboot"
              :sort="{sortBy:tableInfo.sortBy, sortDesc:tableInfo.sortDesc}"
              :filter-query="tableInfo.filterQuery"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
              :fetched-data-clients2-depots="fetchedDataClients2Depots"
              @fetch-products="fetchProducts"
            />
          </b-tab>
        </b-tabs>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div> -->
</template>

<script setup lang="tsx">
import TCProductVersionCell from '~/components/tablecell/TCProductVersionCell.vue';
import BTNRowLink from '~/components/button/BTNRowLink.vue';

import { useNotification } from '~/composables/mixins/useComponent';
import { TableV2FixedDir, type CheckboxValueType } from 'element-plus';
import { useIcons } from '~/composables/mixins/useIcons';
import { useClient } from '~/composables/mixins/useGet';
import { useNavigate } from '~/composables/mixins/useNavigateTo';

import type { ITableHeaderRow } from '~/types/ttableV3'
import type { ITableData, ITableRow } from '~/types/ttable';
import type { IObjectString2ObjectString2String } from '~/types/tgeneral';
import type { T_Client2Depot, IProductTypes} from '~/types/APItypes';
import { useTableHelper } from '~/composables/mixins/useTableHelper';
import { useMBus } from '~/composables/mixins/useMessagebus';
import { useSaveProductActionRequest } from '~/composables/mixins/useSave';

const { notifyInfo, notifyError } = useNotification()
const $t = useI18n().t
const icons = useIcons()
// const route = useRoute()
const router = useRouter()
const navigation = useNavigate()
const fetchClient = useClient($t)
const tableSettings = storeTablesettings()
const storeSelection = storeSelections()
const emit = defineEmits(['change'])
const props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return false}},
  // isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}},
  productType: { type: String, default: 'LocalbootProduct' },
  isChild: { type: Boolean, default: false },

  sortby: { type: String, default: 'productId' },
  selectedClient: { type: String, default: undefined },
})
// const clientSelection = computed(()=>props.selectedClient ? [props.selectedClient] : selectionClients.value)


// Refs
const { selectionDepots, selectionClients, selectionProducts } = storeToRefs(storeSelection)
const fetchedDataClients2Depots = ref<T_Client2Depot>({})

const clientSelection = ref(props.selectedClient ? [props.selectedClient] : selectionClients.value)

const productsTypeChecked = ref({ LocalbootProduct: true, NetbootProduct: false, Product: false })
const totalItems = ref<number>(0)

const tableData = ref ({
// const tableData = ref<tproductITableData>({
  ['LocalbootProduct' as IProductTypes]: {
    type: 'LocalbootProduct',
    pageNumber: 1,
    perPage: 50,
    // sortBy: 'productId', // this.getKeyCookie('sorting_' + id, 'sortBy', 'depotId'),
    sortBy: tableSettings.productsSorting.column,
    sortDesc: Boolean(tableSettings.productsSorting.isDesc),
    // sortDesc: false, // this.getKeyCookie('sorting_' + id, 'sortDesc', false),
    filterQuery: '',
    filterColumns: ['productId', 'description']
  } as ITableData,
  ['NetbootProduct' as IProductTypes]: {
    type: 'NetbootProduct',
    pageNumber: 1,
    perPage: 50,
    sortBy: tableSettings.productsSorting.column,
    sortDesc: Boolean(tableSettings.productsSorting.isDesc),
    filterQuery: '',
    filterColumns: ['productId', 'description']
  }as ITableData,
  ['Product' as IProductTypes]: {
    type: 'Product',
    pageNumber: 1,
    perPage: 50,
    sortBy: tableSettings.productsSorting.column,
    sortDesc: Boolean(tableSettings.productsSorting.isDesc),
    filterQuery: '',
    filterColumns: ['productId', 'description']
  }as ITableData
})

const fetchedData = ref({
  ['LocalbootProduct' as IProductTypes]: [] as Array<any>,
  ['NetbootProduct' as IProductTypes]: [] as Array<any>
})
const columns = reactive<ITableHeaderRow>({
  selected: {
      title: $t('table.fields.selection'),
      key: 'selected',
      dataKey: 'selected',
      class: 'col-selected',
      sortable: true,
      width: 50,
      maxWidth: 50,
      fixed: true, // always visible
      // hidden: cookies.includesCookie('column_' + id, 'selected', true)
      headerCellRenderer: () => {
        return (
          <buttonBTNClearSelection onClearselection={storeSelection.clearSelectionProducts} />
        )
      },
      cellRenderer: ({rowData}) => {
        // const selectedIds = computed(() => storeSelection._selectionProducts)
        // <div class="hidden">{{ (getSelectedrowIdsFromStore().includes(rowData[props.rowId])) ? rowData.selected = true : rowData.selected = false }}</div>
        if (selectionProducts.value.includes(rowData.productId)){
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
    installationStatus: {
      tooltip: $t('table.fields.instStatus'),
      key: 'installationStatus',
      dataKey: 'installationStatus',
      class: 'col-installationStatus',
      sortable: true,
      width: 70,
      maxWidth: 70,
      // minWidth: 70,
      // headerCounterBadge: 5,
      // headerCounterBadgeClass: '!mr-1',
      // iconClass: "!mr-4",
      icon: icons.product,
      // iconColor: "--el-color-warning",
      hidden: !tableSettings.productsColumns.includes('installationStatus'),
      disabled: clientSelection.value.length <= 0 ,
      // headerCellRenderer: () => {
      //   return ( <>
      //     <el-text>Hallo</el-text>
      //   </>)
      // },
      // {/* v-if={clientSelection.value.length > 0} */}
      cellRenderer: ({rowData}) => {
        return (
          <>
          { clientSelection.value.length > 0 ?
            <tablecellTCBadgeCompares
              type="installationStatus"
              rowid={rowData.productId}
              values={rowData.installationStatusDetails || [rowData.installationStatus] || []}
              objects={rowData.selectedClients || []}
              objectsorigin={clientSelection.value || []}
            />
            : <div /> }
            {/* <el-text v-else>---</el-text> */}
          </>
        )
      }
    },
    actionResult: {
      tooltip: $t('table.fields.actionResult'),
      key: 'actionResult',
      dataKey: 'actionResult',
      class: 'col-actionResult',
      width: 70,
      maxWidth: 70,
      // minWidth: 70,
      // headerCounterBadge: 555,
      // headerCounterBadgeColor: 'primary',
      // headerCounterBadgeClass: '!mr-4',
      // iconClass: "!mr-2",
      icon: icons.productActionResult,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'actionResult', true)
      hidden: !tableSettings.productsColumns.includes('actionResult'),
      disabled: clientSelection.value.length <= 0,

      cellRenderer: ({rowData}) => {
        return (
          <>
              {/* v-if={clientSelection.value.length > 0} */}
          { clientSelection.value.length > 0 ?
            <tablecellTCBadgeCompares
              type="actionResult"
              rowid={rowData.productId}
              values={rowData.actionResultDetails || [rowData.actionResult] || []}
              objects={rowData.selectedClients || []}
              objectsorigin={clientSelection.value || []}
            />
            : <div /> }
            {/* <el-text v-else>---</el-text> */}
          </>
        )
      }
    },
    productId: {
      title: $t('table.fields.productId'),
      fixed: true,
      key: 'productId',
      dataKey: 'productId',
      class: 'col-productId',
      // headerCounterBadge: 5,
      // headerCounterBadgeColor: 'primary',
      // headerCounterBadgeClass: '',
      width: 150,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'productId', true)
      hidden: false,
      cellRenderer: ({rowData}) => {
        return (
          <> <el-text>{rowData.productId}</el-text>
          </>
        )
      }
    },
    name: {
      title: $t('table.fields.name'),
      key: 'name',
      dataKey: 'name',
      class: 'col-name',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'name', false)
      hidden: !tableSettings.productsColumns.includes('name')
    },
    description: {
      title: $t('table.fields.description'),
      key: 'description',
      dataKey: 'description',
      class: 'col-description',
      // class: 'col-description max-w-[400px] text-wrap',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'description', false)
      hidden: !tableSettings.productsColumns.includes('description')
    },
    advice: {
      title: $t('table.fields.advice'),
      key: 'advice',
      dataKey: 'advice',
      class: 'col-advice',
      width: 200,
      maxWidth: 200,
      sortable: true,
      hidden: !tableSettings.productsColumns.includes('advice')
    },
    modificationTime: {
      title: $t('table.fields.modificationTime'),
      key: 'modificationTime',
      dataKey: 'modificationTime',
      class: 'col-modificationTime',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'modificationTime', false)
      hidden: !tableSettings.productsColumns.includes('modificationTime')
    },
    priority: {
      title: $t('table.fields.priority'),
      key: 'priority',
      dataKey: 'priority',
      class: 'col-priority',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'priority', false)
      hidden: !tableSettings.productsColumns.includes('priority')
    },
    // selectedDepots: {
    //   title: $t('table.fields.depotIds') as string, key: 'selectedDepots', dise,
    //   title: $t('table.fields.depotIds') as string, dataKey: 'selectedDepots', dise,
    //   title: $t('table.fields.depotIds') as string, class: 'col-selectedDepots', dise,
    //   visible: this.includesCookie('column_' + id, 'selectedDepots', false)
    // },
    // selectedClients: {
    //   title: $t('table.fields.clientsIds') as string, key: 'selectedClients', dise,
    //   title: $t('table.fields.clientsIds') as string, dataKey: 'selectedClients', dise,
    //   title: $t('table.fields.clientsIds') as string, class: 'col-selectedClients', dise,
    //   visible: this.includesCookie('column_' + id, 'selectedClients', false)
    // },
    version: {
      title: $t('table.fields.version'),
      key: 'version',
      dataKey: 'version',
      class: 'col-version',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie('column_' + id, 'version', false)
      hidden: !tableSettings.productsColumns.includes('version'),
      cellRenderer: ({rowData}) => {
        const tt = (
          <>
            <ul>
              <li>{$t('table.fields.version.tooltip.serverversions')} {(rowData.depotVersions) ? Object.values(rowData.depotVersions).join(', ') : ''}</li>
              <li>{$t('table.fields.version.tooltip.clientversions')} {(rowData.clientVersions) ? Object.values(rowData.clientVersions).join(', ') : ''}</li>
              <li>{$t('table.fields.version.tooltip.depot_version_diff')}  {rowData.depot_version_diff ? $t('yes') : $t('no')}</li>
              <li>{$t('table.fields.version.tooltip.client_version_diff')} {rowData.client_version_outdated ? $t('yes') : $t('no')}</li>
              <li>{$t('table.fields.version.tooltip.not_on_all_depots')} {rowData.not_on_all_depots ? $t('yes') : $t('no')}</li>
            </ul>
          </>
        )
        return (
          <>
          <el-tooltip
            class="box-item"
            effect="dark"
            placement="left-start"
            v-slots={ {content: () => tt} }
          >
          {/* TODO: check if this works for different versions of server/clients */}
            <TCProductVersionCell
              type="depotVersions"
              row={rowData}
              clients2depots={fetchedDataClients2Depots.value}
              onDetails={toggleDetailsTooltip}
            />
          </el-tooltip>
          </>
        )
      }
    },
    actionProgress: {
      title: $t('table.fields.actionProgress'),
      key: 'actionProgress',
      dataKey: 'actionProgress',
      class: 'col-actionProgress',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie('column_' + id, 'actionProgress', false)
      hidden: !tableSettings.productsColumns.includes('actionProgress'),
      disabled: clientSelection.value.length <= 0,
    },
    actionRequest: {
      title: $t('table.fields.actionRequest'),
      key: 'actionRequest',
      dataKey: 'actionRequest',
      class: 'col-actionRequest',
      width: 110,
      minWidth: 110, // in rem !
      sortable: true,
      // visible: this.includesCookie('column_' + id, 'actionRequest', false)
      hidden: !tableSettings.productsColumns.includes('actionRequest'),
      disabled: clientSelection.value.length <= 0,
      headerCellRenderer: (useMQ().isMobile.value) ? undefined : () => {
        return ( <>
          <tablecellTCProductRequest
            title={$t('form.tooltip.actionRequest')}
            save={saveActionRequests}
            selectedClients={clientSelection.value}
          />
        </>)
      },
      cellRenderer: ({rowData}) => {
        // const sel = (props.selectedClient) ? [props.selectedClient]: clientSelection.value
        return (
          <>
            <tablecellTCProductRequest
              request={rowData.actionRequest || 'none'}
              requestoptions={[...rowData.actions]}
              rowitem={rowData}
              row-is-selected={selectionProducts.value.includes(rowData.productId)}
              save={saveActionRequest}
            />
          </>
        )
        // selectedClients={sel}
      }
    },
    rowactions: {
      key: 'rowactions',
      dataKey: 'rowactions',
      class: 'col-rowactions',
      width: 200,
      maxWidth: 200,
      title: $t('table.fields.rowactions'),
      fixed: TableV2FixedDir.RIGHT,
      // visible: this.includesCookie('column_' + id, 'rowactions', false),
      hidden: false,
      cellRenderer: ({rowData}) => {
        const change = (e: Event)=>{
          emit('change', rowData.productId)
          navigation.toConfiguration(id, rowData.productId, props.isChild, currentType.value)
          // Object.keys(navigation.rowactionConfigChecked.value).forEach(k => navigation.rowactionConfigChecked.value[k] = false)
          // navigation.rowactionConfigChecked.value[rowData.productId] = true
          // if (props.isChild) {
          //   useRouter().push(`/clients/products/${currentType.value}/config/${rowData.productId}`)
          // } else {
          //   useRouter().push(`/products/${currentType.value}/config/${rowData.productId}`)
          // }
        }
        return (
        <>
          <div class="flex flex-row">
          <BTNRowLink
            is-pressed={navigation.rowactionConfigChecked.value[rowData.productId]}
            icon={icons.settings}
            onOnClick={change}
          />
          </div>
        </>
      )},
          // <el-button
          //   onClick={change}
          //   class={classes.value}
          // ><iconIIcon icon={icons.settings} /></el-button>
    }
  }
)
// consts
const id = "products"

// Computed
const currentType = computed<IProductTypes>(()=>{
  if (productsTypeChecked.value.LocalbootProduct) return 'LocalbootProduct'
  if (productsTypeChecked.value.NetbootProduct) return 'NetbootProduct'
  if (productsTypeChecked.value.Product) return 'Product'
  return 'LocalbootProduct'
})
const fetchedDataWrapper = computed(()=>fetchedData.value[currentType.value])
const tableDataWrapper = computed(()=>tableData.value[currentType.value])
// const clientSelection = computed(()=>props.selectedClient || selectionClients.value)

const lastChanges = ref({ clientIds: [] as Array<string>, productIds: [] as Array<string> }) // used to check if we caused the last event
const tableHelper = useTableHelper(id, tableData, fetchedData, totalItems, _fetch, tableSettings, currentType) // define watcher for tableData
const numberOtherNetboot = computed(()=>{
  // TODO: show number of netboot products with sortBy isnt empty/none/not_installed/..

  // if (props.sortby) {
  //   fetchedData.value.LocalbootProduct.every((v: any)=>v[props.sortby] === 'none')
  // }
  // if (fetchedData.value.NetbootProduct.length === 0) return 0
  return 0
})
// const numberLocalbootsSortbyNotEmpty = computed(()=>{
//   const emptys = [undefined, null, '', 'null', 'none', 'None', 'Null', 'not_installed']
//   return fetchedData.value.LocalbootProduct.filter((v: any)=>emptys.includes(v[props.sortby])).length
// })
// const noLocalbootWithEntry = computed(()=>{
//   const emptys = [undefined, null, '', 'null', 'none', 'None', 'Null', 'not_installed']
//     return fetchedData.value[currentType.value].filter((v: any)=>v[tableData.value[currentType.value]] !== 'none').length === 0
// })
//   sortdesc: boolean = false
//   rowId: string = ''
//   isLoading: boolean = false
//   localboot: string = ''
//   netboot: string = ''
//   totalnetboot: number = 0
//   tableloaded: boolean = false
//   activeLocalbootTab: boolean = true
  // headerData: ITableHeaders = {

onMounted(async ()=> {
  if (props.productType && props.productType !== currentType.value)
    changeProductsType(props.productType as IProductTypes)
  if (props.sortby) {
    tableData.value[currentType.value].sortBy = props.sortby
    tableData.value[currentType.value].sortDesc = true
  }
  fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(clientSelection.value)
  // fetchedData.value[currentType.value] = await _fetch(currentType.value)
  // fetchedData.value[currentType.value] = []
  await tableHelper.fetch()
  tableHelper.setTotalItemsAsPerPage(totalItems.value)
})

watch(()=>props.selectedClient, (v)=>{
  if (v) { clientSelection.value = [v] }
  else { clientSelection.value = selectionClients.value }
})
watch(()=>selectionClients.value, (v)=>{
  if (v) { clientSelection.value = [v] }
  else { clientSelection.value = selectionClients.value }
})
watch (()=>props.sortby, async (v)=>{
  if (props.selectedClient) {
    tableData.value[currentType.value].sortBy = v
    tableData.value[currentType.value].sortDesc = true
    // sortDesc: tableSettings.productsSorting.isDesc,
  }
}, { deep: true })
// watch(() => fetchedData[currentType.value])

watch(()=>props.productType, v=>{
  changeProductsType(v as IProductTypes)
})

setColumnVisibilityDependOnClients()
watch(()=>clientSelection.value, async () => {
  setColumnVisibilityDependOnClients()
  fetchedDataClients2Depots.value = await fetchClient.getClientToDepot(clientSelection.value)
}, { deep: true })

// watch(()=> tableData.value[currentType.value].filterQuery, async ()=>{
//   fetchedData.value[currentType.value] = []
//   fetchedData.value[currentType.value] = await _fetch(currentType.value)
// }, { deep: true})
watch(()=>clientSelection.value, async ()=> { await tableHelper.fetch() })
watch(()=>props.sortby, async ()=> { await tableHelper.fetch() })


const msgbus = useMBus(wsBusMsgObjectChanged, false, $t)

async function wsBusMsgObjectChanged (msg: any = undefined) {
// async function _wsBusMsgObjectChanged (msg: any = undefined) {
  if (msg &&
    ['event:productOnClient_created', 'event:productOnClient_updated', 'event:productOnClient_deleted'].includes(msg.channel) &&
    msg.data.productType === currentType.value &&
    // this.visibleProductIds.includes(msg.data.productId) &&
    clientSelection.value.includes(msg.data.clientId)
  ) {

    if (!(lastChanges.value.clientIds.includes(msg.data.clientId) && lastChanges.value.productIds.includes(msg.data.productId))) {
      // check if we may cause the event...
      notifyInfo({ title: $t('message.info.event'), message: $t('message.info.event.poc_updated', { productId: msg.data.productId }),
          button: { label: $t('label.reloadPage'), onClick() {
            async () => {
              await tableHelper.fetch()
            }
           } } })
    }
    // if (this.quicksave) {
    //   this.$fetch()
    //   // if (ref) { ref.hide() }
    // } else { /* quicksave is false ... do sth .. show message or sth */
    //   const objIndex = this.changesProducts.findIndex(
    //     item => item.user === localStorage.getItem('username') &&
    //     item.clientId === msg.data.clientId &&
    //     item.productId === msg.data.productId)
    //   if (objIndex > -1) { /* show msg product updated */ }
    // }
  }
}

function changeProductsType (type: IProductTypes) {
  if (props.isChild) {
    router.push('/clients/products/' + type + '/')
  } else {
    router.push('/products/' + type + '/')
  }
  const types: Array<IProductTypes> = Object.keys(productsTypeChecked.value) as Array<IProductTypes>
  types.forEach(k => productsTypeChecked.value[k] = false)
  if (Object.keys(productsTypeChecked.value).includes(type))
    productsTypeChecked.value[type] = true
  else
    throw new Error("Unknown product type " + type);


}

function setColumnVisibilityDependOnClients () {
  let b = true
  if (clientSelection.value.length > 0) {
    b = false
  }
  columns.installationStatus.hidden = b
  columns.actionResult.hidden = b
  columns.actionRequest.hidden = b
  columns.actionProgress.hidden = b
}

// async function updateTableData (type:string, v: typeof tableData.value.LocalbootProduct) {
//   tableData.value[type] = reactive(v)
//   fetchedData.value[currentType.value] = []
//   fetchedData.value[currentType.value] = await _fetch(currentType.value)
// }

async function _fetch() {
  const type: IProductTypes = currentType.value
  const params = fetchProductsPrepareParams(type)
  const {data, error, headers} = await useApiGETBody('/opsidata/products', params)
  if (error) {
    notifyError({ message: error?.response?.data?.message })
    return []
  }
  if (data.value === undefined ) {
    return []
  }
  if (headers === undefined) {
    return []
  }
  totalItems.value = parseInt(headers.get(opsiheaders.xtotalcount) || '0')
  // tableHelper.setTotalItemsAsPerPage(totalItems.value)
  return data.value
}

async function saveActionRequests(rowItem: any, newrequest: string) {
  const data = {
    clientIds: clientSelection.value,
    productIds: selectionProducts.value,
    actionRequest: newrequest
  }
  lastChanges.value.clientIds = data.clientIds
  lastChanges.value.productIds = data.productIds
  // if (!this.quicksave) {
  //   for (const c in this.selectionClients) {
  //     for (const p in this.selectionProducts) {
  //       const d = {
  //         user: localStorage.getItem('username'),
  //         clientId: this.selectionClients[c],
  //         productId: this.selectionProducts[p],
  //         actionRequest: this.action
  //       }
  //       const objIndex = this.changesProducts.findIndex(item => item.clientId === this.selectionClients[c] && item.productId === this.selectionProducts[p])
  //       if (objIndex > -1) {
  //         this.delWithIndexChangesProducts(objIndex)
  //       }
  //       this.pushToChangesProducts(d)
  //     }
  //   }
  // } else {
    await useSaveProductActionRequest($t).saveProdActionRequest(data, null, true)
    await tableHelper.fetch()
  // }
}

async function saveActionRequest(rowitem: any, newrequest: string) {
  // alert (JSON.stringify(rowItem) + "----" + req)
  // return
  // const {data, error} = await useApiPOST('/opsidata/products', {action: action.value})
  const data = {
    clientIds: clientSelection.value,
    productIds: [rowitem.productId],
    actionRequest: newrequest
  }
    // this.lastChanges.clientIds = data.clientIds
    // this.lastChanges.productIds = data.productIds
    // if (!this.quicksave) {
    //   for (const c in this.selectionClients) {
    //     const d: Object = {
    //       user: localStorage.getItem('username'),
    //       clientId: this.selectionClients[c],
    //       productId: rowitem.productId,
    //       actionRequest: newrequest
    //     }
    //     const objIndex = this.changesProducts.findIndex(item => item.user === localStorage.getItem('username') && item.clientId === this.selectionClients[c] && item.productId === rowitem.productId)
    //     if (objIndex > -1) {
    //       this.delWithIndexChangesProducts(objIndex)
    //     }
    //     this.pushToChangesProducts(d)
    //   }
    // } else {
      await useSaveProductActionRequest($t).saveProdActionRequest(data, null, true)
      // this.fetchOptions.fetchClients = true
    // }
}

function toggleDetailsTooltip (row: any, tooltiptext: IObjectString2ObjectString2String) {
    // (row.item as ITableRowItemProducts).tooltiptext = tooltiptext
    // row.toggleDetails()
  }
//   tableInfo: ITableInfo = {
//     sortBy: this.getKeyCookie(`sorting_${id}`, 'sortBy', this.sortby || 'productId'),
//     sortDesc: this.getKeyCookie(`sorting_${id}`, 'sortDesc', this.sortdesc || false),
//     filterQuery: '',
//     headerData: this.headerData
//   }

//   mounted () {
//     if (this.secondColumnOpened && !this.child) {
//       this.$router.push('/products/')
//     }
//     if (this.sortby) {
//       this.tableInfo.sortBy = this.sortby
//       this.tableInfo.sortDesc = true
//     }
//     this.updateColumnVisibility()
//   }

//   async fetch () {
//     await this.getNetbootProductsCount()
//     this.updateColumnVisibility()
//   }

//   @Watch('sortby', { deep: true }) async sortByChanged () {
//     if (this.sortby) {
//       this.tableInfo.sortBy = this.sortby
//       this.tableInfo.sortDesc = true
//     }
//     this.updateColumnVisibility()
//     await this.triggerFetch()
//     this.headerData[this.sortby].visible = true
//   }

//   @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
//     this.updateColumnVisibility()
//   }

//   get secondColumnOpened () {
//     return this.$route.path.includes('config') || this.$route.path.includes('log')
//   }

//   routeRedirectWith (to: string, rowIdent: string) {
//     this.rowId = rowIdent
//     this.$router.push(to)
//   }

//   async getNetbootProductsCount () {
//     const params: any = {}
//     params.selectedDepots = JSON.stringify(this.selectionDepots)
//     params.type = 'NetbootProduct'
//     await this.$axios.$get('/api/opsidata/products/count', { params })
//       .then((response) => {
//         this.totalnetboot = response
//       })
//   }

//   updateColumnVisibility () {
//     const b = (this.selectionClients.length > 0)
//     // this.headerData.selectedClients.disabled = b
//     this.headerData.installationStatus.visible = b
//     this.headerData.installationStatus.disabled = b
//     this.headerData.actionResult.visible = b
//     this.headerData.actionResult.disabled = b
//     this.headerData.actionRequest.visible = b
//     this.headerData.actionRequest.disabled = b
//     this.headerData.actionProgress.disabled = b

//     // store as new column visibility as cookie
//     const visibleItems = {}
//     Object.values(this.headerData).filter(k => !k._isMajor).forEach((h) => {
//       if (h._majorKey) {
//         visibleItems[this.headerData[h._majorKey].key] = h.visible || false
//       } else {
//         visibleItems[h.key] = h.visible || false
//       }
//     })
//     this.setCookie('column_' + id, JSON.stringify(Object.keys(visibleItems).filter(k => visibleItems[k])), { expires: 365 })
//   }

//   async triggerFetch () {
//     if (this.$refs['ref-products-localboot']) {
//       await (this.$refs['ref-products-localboot'] as any).fetchWrapper()
//     }
//     if (this.$refs['ref-products-netboot']) {
//       await (this.$refs['ref-products-netboot'] as any).fetchWrapper()
//     }
//   }

//   async waitBeforeFetch () {
//     // await new Promise(resolve => setTimeout(resolve, 5))
//   }
  // async function fetchProducts (thiss) {
  //   thiss.isLoadingTable = true // have to be "thiss" -> overwise sorting breaks - whyever
  //   await this.waitBeforeFetch() // needed for messagebus timing problem
  //   if (thiss.fetchOptions.fetchClients2Depots && thiss.selectionClients.length > 0) {
  //     await this.getClientToDepot(thiss.selectionClients)
  //     thiss.fetchOptions.fetchClients2Depots = false
  //   }

  //   if (thiss.fetchOptions.fetchClients) {
  //     const params = this.fetchProductsPrepareParams(thiss)
  //     const myitems = await thiss.$axios.get('/api/opsidata/products', { params })
  //       .then((response) => {
  //         thiss.totalItems = response.headers[opsiheaders.xtotalcount] || 0
  //         thiss.$emit('update:total' + thiss.id, thiss.totalItems)
  //         thiss.totalpages = Math.ceil(thiss.totalItems / params.perPage)
  //         thiss.items = response.data || []
  //         thiss.isLoadingTable = false // have to be "thiss" -> overwise sorting breaks - whyever
  //         const items = response.data || []
  //         this.tableloaded = true
  //         return items
  //       }).catch((error) => {
  //         // eslint-disable-next-line no-console
  //         console.error(error)
  //         thiss.error = thiss.$t('message.error.defaulttext') as string
  //         thiss.error += (error as IObjectString2Any).message
  //         this.showToastError(error)
  //         thiss.isLoadingTable = false // have to be "thiss" -> overwise sorting breaks - whyever
  //       })
  //     thiss.setItemsCache(myitems)
  //     return myitems
  //   }
  // }

function fetchProductsPrepareParams (type: IProductTypes) {
  const params: ITableData = { ...tableData.value[type] }
  params.selectedDepots = JSON.stringify(selectionDepots.value)
  params.selectedClients = JSON.stringify(clientSelection.value)
  // if (props.selectedClient) {
  //   params.sortDesc = false
  // }
  // if (props.selectedClient !== undefined) {
  // } else {
  //   params.selectedClients = JSON.stringify(selectionClients.value)
  // }
  // params.selectedClients = JSON.stringify(selectionClients.value)
  if (params.sortBy === 'installationStatus') {
    params.sortBy = '["installationStatus", "installationStatusErrorLevel"]'
  } else if (params.sortBy === 'actionResult') {
    params.sortBy = '["actionResultErrorLevel", "actionResult"]'
  } else if (params.sortBy === 'depotVersions') {
    params.sortBy = 'depot_version_diff'
  } else if (params.sortBy === 'clientVersions') {
    params.sortBy = 'client_version_outdated'
  } else if (params.sortBy === 'desc') {
    params.sortBy = 'description'
  } else if (params.sortBy === '') {
    params.sortBy = 'productId'
  } else if (params.sortBy === 'version') {
    params.sortBy = '["client_version_outdated", "depot_version_diff", "not_on_all_depots", "clientVersions", "depotVersions"]'
  } else if (params.sortBy === 'selected') {
    params.sortDesc = true
    params.selected = JSON.stringify(selectionProducts)
    // params.sortBy = '["selected", "productId"]'
  }
  return params
}
</script>


