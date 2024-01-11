<template>
  <el-text>{{ $t('title.depots') }}</el-text><br />
  <el-text>Depot Selection: {{ storeSelection.selectionDepots }}</el-text> <br />
  <el-text>Client Selection: {{ storeSelection.selectionClients }}</el-text> <br />
  <el-text>Product Selection: {{ storeSelection.selectionProducts }}</el-text> <br />
  {{ fetchedData[currentType].length }}, total {{ totalItems }}
  <div>
    <el-checkbox-button
        v-model="productsTypeChecked.LocalbootProduct"
        @change="changeProductsType('LocalbootProduct')"
      >LocalbootProduct</el-checkbox-button>
    <el-checkbox-button
        v-model="productsTypeChecked.NetbootProduct"
        @change="changeProductsType('NetbootProduct')"
      >NetbootProduct</el-checkbox-button>
    <el-checkbox-button
        disabled
        v-model="productsTypeChecked.Product"
        @change="changeProductsType('Product')"
      >Product</el-checkbox-button>
  </div>
  <TableTDefault
      v-if="fetchedData[currentType].length > 0 && totalItems > 0"
      row-id="productId"
      :id="id"
      :columns="columns"
      :data="fetchedData[currentType]"
      :table-data="tableData[currentType]"
      :total-items="totalItems"
      :sort-by="tableData[currentType].sortBy"
      :is-mobile="isMobile"
      @selection-changed="(id: string) => storeSelection.toggleSelectionProducts(id)"
      @selection-clear="storeSelection.clearSelectionProducts"
      @tabledata-changed="(v: any) => {updateTableData('localboot', v)}"

      @sort-changed="(key: string, isDesc: boolean) => {
        console.log('sort table', currentType, 'by', key, 'desc', isDesc)
        tableData[currentType].sortBy = key
        tableData[currentType].sortDesc = isDesc
        storeTablesettings().setSortColumn(id, key, isDesc)
      }"
    >

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

import { useNotification } from '~/composables/mixins/useComponent';

import type { ITableHeaderRow } from '~/types/ttableV3'

import { useCookies } from '~/composables/mixins/useCookies'
import { TableV2FixedDir, type CheckboxValueType } from 'element-plus';
import { useIcons } from '~/composables/mixins/useIcons';
import { useClient } from '~/composables/mixins/useGet';
import type { ITableRow } from '~/types/ttable';
import type { IObjectString2ObjectString2String } from '~/types/tgeneral';
const cookies = useCookies()
const $t = useI18n().t
const icons = useIcons()
const id = "products"

const route = useRoute()
const _routeId = route.params.id || ['']
const _routeLength = _routeId.length
const rowactionConfigChecked = ref<any>({[_routeId[_routeLength - 1]]: true})
watch(()=>route.params.id, ()=>{
  console.log('route.params.id', route.params.id)
  const routeLength = route.params.id?.length || 1
  const id = route.params.id?.[routeLength - 1] || ''
  Object.keys(rowactionConfigChecked.value).forEach(k => rowactionConfigChecked.value[k] = false)
  rowactionConfigChecked.value[id] = true
}, {deep: true})

// import { Component, Vue, Watch, Prop, namespace } from 'nuxt-property-decorator'
// import { Client } from '../../mixins/get'
// import { Icons } from '../../mixins/icons'
// import { Cookies } from '../../mixins/cookies'
// import { ITableHeaders, ITableInfo } from '../../.utils/types/ttable'
// import { IObjectString2Any, IObjectString2String } from '../../.utils/types/tgeneral'
// import { Strings } from '../../mixins/strings'
// import { AlertToast } from '../../mixins/component'
// const selections = namespace('selections')

// @Component({ mixins: [AlertToast, Client, Icons, Strings, Cookies] })
// export default class VProducts extends Vue {
//   fetchedDataClients2Depots!: IObjectString2String // mixin Client
//   // Cookie: any
//   showToastError: any // mixin
//   isCookie: any
//   includesCookie!: any
//   getKeyCookie!: any
//   setCookie: any
//   icon: any
//   t_fixed: any
//   $mq: any
//   $route:any
//   $router:any
//   $t!:any
//   $axios: any
//   getClientToDepot:any

const emit = defineEmits(['change'])
const props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}},
  productType: { type: String, default: 'LocalbootProduct' },
  isChild: { type: Boolean, default: false },
})
//   @Prop() child!: boolean
//   @Prop({}) id!: string
//   @Prop({}) sortby!: string
// const datacache = storeCache()
// console.log('datacache', datacache.opsiconfigserver)

const storeSelection = storeSelections()
const { selectionDepots, selectionClients, selectionProducts } = storeToRefs(storeSelection)

const fetchedDataClients2Depots = ref(await useClient().getClientToDepot(selectionClients.value))
//   @selections.Getter public selectionDepots!: Array<string>
//   @selections.Getter public selectionClients!: Array<string>
//   @selections.Getter public selectionProducts!: Array<string>
//   @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

//   sortdesc: boolean = false
//   rowId: string = ''
//   isLoading: boolean = false
//   localboot: string = ''
//   netboot: string = ''
//   totalnetboot: number = 0
//   tableloaded: boolean = false
//   activeLocalbootTab: boolean = true
  // headerData: ITableHeaders = {
const columns = reactive<ITableHeaderRow>({
  selected: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.selection'),
      key: 'selected',
      dataKey: 'selected',
      class: 'col-selected',
      sortable: true,
      width: 50,
      maxWidth: 50,
      fixed: true, // always visible
      // hidden: cookies.includesCookie('column_' + id, 'selected', true)
    },
    installationStatus: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.instStatus'),
      key: 'installationStatus',
      dataKey: 'installationStatus',
      class: 'col-installationStatus',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'installationStatus', true)
      hidden: !storeTablesettings().productsColumns.includes('installationStatus')
    },
    actionResult: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.actionResult'),
      key: 'actionResult',
      dataKey: 'actionResult',
      class: 'col-actionResult',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'actionResult', true)
      hidden: !storeTablesettings().productsColumns.includes('actionResult')
    },
    productId: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.productId'),
      fixed: true,
      key: 'productId',
      dataKey: 'productId',
      class: 'col-productId',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'productId', true)
      hidden: false
    },
    name: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.name'),
      key: 'name',
      dataKey: 'name',
      class: 'col-name',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'name', false)
      hidden: !storeTablesettings().productsColumns.includes('name')
    },
    description: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.description'),
      key: 'description',
      dataKey: 'description',
      class: 'col-description',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'description', false)
      hidden: !storeTablesettings().productsColumns.includes('description')
    },
    modificationTime: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.modificationTime'),
      key: 'modificationTime',
      dataKey: 'modificationTime',
      class: 'col-modificationTime',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'modificationTime', false)
      hidden: !storeTablesettings().productsColumns.includes('modificationTime')
    },
    priority: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.priority'),
      key: 'priority',
      dataKey: 'priority',
      class: 'col-priority',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie(`column_${id}`, 'priority', false)
      hidden: !storeTablesettings().productsColumns.includes('priority')
    },
    // selectedDepots: { // eslint-disable-next-line object-property-newline
    //   title: $t('table.fields.depotIds') as string, key: 'selectedDepots', dise,
    //   title: $t('table.fields.depotIds') as string, dataKey: 'selectedDepots', dise,
    //   title: $t('table.fields.depotIds') as string, class: 'col-selectedDepots', dise,
    //   visible: this.includesCookie('column_' + id, 'selectedDepots', false)
    // },
    // selectedClients: { // eslint-disable-next-line object-property-newline
    //   title: $t('table.fields.clientsIds') as string, key: 'selectedClients', dise,
    //   title: $t('table.fields.clientsIds') as string, dataKey: 'selectedClients', dise,
    //   title: $t('table.fields.clientsIds') as string, class: 'col-selectedClients', dise,
    //   visible: this.includesCookie('column_' + id, 'selectedClients', false)
    // },
    version: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.version'),
      key: 'version',
      dataKey: 'version',
      class: 'col-version',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie('column_' + id, 'version', false)
      hidden: !storeTablesettings().productsColumns.includes('version'),
      cellRenderer: ({rowData}) => {
        return (
          <>
            {/* <el-text v-if={!rowData.depot_version_diff}>{Object.values(rowData.depotVersions)[0]}</el-text> */}
            <tablecellTCProductVersionCell
              v-if={Object.keys(fetchedDataClients2Depots).length == selectionClients.value.length}
              type="depotVersions"
              row={rowData}
              clients2depots={fetchedDataClients2Depots}
              onDetails={toggleDetailsTooltip}
            />
          </>
        )
      }
    },
    actionProgress: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.actionProgress'),
      key: 'actionProgress',
      dataKey: 'actionProgress',
      class: 'col-actionProgress',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie('column_' + id, 'actionProgress', false)
      hidden: !storeTablesettings().productsColumns.includes('actionProgress')
    },
    actionRequest: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.actionRequest'),
      key: 'actionRequest',
      dataKey: 'actionRequest',
      class: 'col-actionRequest',
      width: 200,
      maxWidth: 200,
      sortable: true,
      // visible: this.includesCookie('column_' + id, 'actionRequest', false)
      hidden: !storeTablesettings().productsColumns.includes('actionRequest'),
    },
    rowactions: { // eslint-disable-next-line object-property-newline
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
          e.stopPropagation()
          emit('change', rowData.productId)
          Object.keys(rowactionConfigChecked.value).forEach(k => rowactionConfigChecked.value[k] = false)
          rowactionConfigChecked.value[rowData.productId] = true
          if (props.isChild) {
            useRouter().push(`/clients/products/${currentType.value}/config/${rowData.productId}`)
          } else {
            useRouter().push(`/products/${currentType.value}/config/${rowData.productId}`)
          }
        }
        return (
        <>
          <buttonBTNRowLink
            is-pressed={rowactionConfigChecked.value[rowData.productId]}
            icon={icons.settings}
            onClick={change}
          />
        </>
      )},
          // <el-button
          //   onClick={change}
          //   class={classes.value}
          // ><iconIIcon icon={icons.settings} /></el-button>
    }
  }
)

const productsTypeChecked = ref({ LocalbootProduct: true, NetbootProduct: false, Product: false })
const changeProductsType = (type: string)=>{

  console.log('route.params.id changeProductsType', type)
  if (props.isChild) {
    useRouter().push('/clients/products/' + type + '/')
  } else {
    useRouter().push('/products/' + type + '/')
  }
  Object.keys(productsTypeChecked.value).forEach(k => productsTypeChecked.value[k] = false)
  productsTypeChecked.value[type] = true

}
const currentType = computed(()=>{
  if (productsTypeChecked.value.LocalbootProduct) return 'LocalbootProduct'
  if (productsTypeChecked.value.NetbootProduct) return 'NetbootProduct'
  if (productsTypeChecked.value.Product) return 'Product'
  return 'LocalbootProduct'
})
if (props.productType && props.productType !== currentType.value) changeProductsType(props.productType)
watch(()=>props.productType, (v)=>{
  changeProductsType(v)
})

setColumnVisibilityDependOnClients()
watch(()=>selectionClients.value, async () => {
  setColumnVisibilityDependOnClients()
  console.log('selectionClients changed', selectionClients.value)
  fetchedDataClients2Depots.value = await useClient().getClientToDepot(selectionClients.value)
}, { deep: true })

function setColumnVisibilityDependOnClients () {
  let b = true
  console.log('selectionClients', selectionClients.value)
  if (selectionClients.value.length > 0) {
    b = false
  }
  columns.installationStatus.hidden = b
  columns.actionResult.hidden = b
  columns.actionRequest.hidden = b
  columns.actionProgress.hidden = b
}
const fetchedData = ref({
  LocalbootProduct: [] as Array<any>,
  NetbootProduct: [] as Array<any>
})
const totalItems = ref<number>(0)
// const handleChange = (id:string) => {
//   console.log('handleSelectionChange', id)
//   storeSelection.toggleSelectionDepots(id)
// }

const tableData = ref({
  'LocalbootProduct': {
    type: 'LocalbootProduct',
    pageNumber: 1,
    perPage: 25,
    // sortBy: 'productId', // this.getKeyCookie('sorting_' + id, 'sortBy', 'depotId'),
    sortBy: storeTablesettings().productsSorting.column,
    sortDesc: storeTablesettings().productsSorting.isDesc,
    // sortDesc: false, // this.getKeyCookie('sorting_' + id, 'sortDesc', false),
    filterQuery: '',
    filterColumns: ['productId', 'description']
  },
  'NetbootProduct': {
    type: 'NetbootProduct',
    pageNumber: 1,
    perPage: 5,
    sortBy: storeTablesettings().productsSorting.column,
    sortDesc: storeTablesettings().productsSorting.isDesc,
    filterQuery: '',
    filterColumns: ['productId', 'description']
  },
  'Product': {
    type: 'Product',
    pageNumber: 1,
    perPage: 5,
    sortBy: storeTablesettings().productsSorting.column,
    sortDesc: storeTablesettings().productsSorting.isDesc,
    filterQuery: '',
    filterColumns: ['productId', 'description']
  }
})

async function updateTableData (type:string, v: typeof tableData.value.LocalbootProduct) {
  console.log('tabledata changed total', v)
  tableData.value[type] = reactive(v)
  fetchedData.value[currentType.value] = []
  fetchedData.value[currentType.value] = await _fetch(currentType.value)
}

onMounted(async ()=> fetchedData.value[currentType.value] = await _fetch(currentType.value))
watch(()=> tableData.value[currentType.value], async ()=>{
  console.log('tableData changed', tableData)
  fetchedData.value[currentType.value] = []
  fetchedData.value[currentType.value] = await _fetch(currentType.value)
}, { deep: true})

function toggleDetailsTooltip (row: any, tooltiptext: IObjectString2ObjectString2String) {
    // (row.item as ITableRowItemProducts).tooltiptext = tooltiptext
    // row.toggleDetails()
    console.log('TOGGLE ROW', row, tooltiptext)
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
async function _fetch(type: string) {
  const params = fetchProductsPrepareParams(type)
  const {data, error, headers} = await useApiGETBody('/opsidata/products', params)
  if (error) {
    console.error(error)
    useNotification().error(error)
    return []
  }
  totalItems.value = parseInt(headers['x-total-count'])
  return data.value
}
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
  //         thiss.totalItems = response.headers['x-total-count'] || 0
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

function fetchProductsPrepareParams (type: string) {
  const params = { ...tableData.value[type] }
  params.selectedDepots = JSON.stringify(selectionDepots.value)
  params.selectedClients = JSON.stringify(selectionClients.value)
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
    params.sortBy = '["client_version_outdated", "depot_version_diff", "not_on_all_depots" ]'
  } else if (params.sortBy === 'selected') {
    params.sortDesc = true
    params.selected = JSON.stringify(selectionProducts)
    // params.sortBy = '["selected", "productId"]'
  }
  return params
}
</script>

<style>
/* .VProducts {
  max-height: min-content;
} */
/* .products_horizontaltabs .nav-item{
  min-width: min-content;
}
.VProductGroupsExpanded {
  width: 98% ;
  height: 80vh;
} */
</style>
