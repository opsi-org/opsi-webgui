<template>
  <div>
    <el-text>{{ $t('title.depots') }}</el-text><br />
    <!-- <el-button :type="'danger'">Danger</el-button> -->
    <el-text>Depot Selection: {{ storeSelection.selectionDepots }}</el-text> <br />
    <!-- :filterable-columns="[columns['depotId']]" -->
    <InputIFilter
      :data="tableData"
      :filterable-columns="Object.values(columns)"
      @update="(v)=> {
        tableData.filterColumns = v.cols
        tableData.filterQuery = v.vals
      }"
    />
    <TableTDefault
      v-if="fetchedData.length > 0"
      row-id="depotId"
      :id="id"
      :columns="columns"
      :data="fetchedData"
      :sort-by="tableData.sortBy"
      @selection-changed="(id: string) => storeSelection.toggleSelectionDepots(id)"
      :is-mobile="props.isMobile"
      @selection-clear="storeSelection.clearSelectionDepots"
    >

    </TableTDefault>
<!-- <div data-testid="VDepots">
  <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tabledepots">
    <template #parent>
      <LazyBarBPageHeader v-if="tableloaded" :title="$t('title.depots')" />
      <BarBTableHeader :tableid="id" :table-data="tableData" :table-info.sync="tableInfo" :is-loading-parent="isLoading" :fetch="$fetch" />
      <TableTInfiniteScrollSmooth
        :id="id"
        :ref="id"
        :primary-key="id"
        rowident="depotId"
        :error="error"
        :is-loading="isLoading"
        :table-data="tableData"
        :header-data="headerData"
        :cache_pages="cache_pages"
        :total-items="totalItems"
        :totalpages="totalpages"
        :selection="selectionDepots"
        :setselection="setSelectionDepots"
        :fetchitems="_fetch"
        :items="items"
      >
        <template #contextcontent-specific-1="{itemkey}">
          <ButtonBTNRowLinkTo
            :title="$t('title.config')"
            :label="$t('title.config')"
            :icon="icon.settings"
            to="/depots/config"
            :ident="itemkey"
            :pressed="isRouteActive"
            :incontextmenu="true"
            :click="routeRedirectWith"
          />
        </template>
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
        <template #cell(depotId)="row">
          <small>
            <b v-if="row.item.depotId==opsiconfigserver">{{ row.item.depotId }}</b>
            {{ (row.item.depotId!=opsiconfigserver) ? row.item.depotId:'' }}
          </small>
        </template>
        <template #rowactions="row">
          <ButtonBTNRowLinkTo
            :title="$t('title.config')"
            :label="(headerData.rowactions.mergeOnMobile==true && $mq=='mobile') ? $t('title.config') : ''"
            :icon="icon.settings"
            to="/depots/config"
            :ident="row.item.ident"
            :pressed="isRouteActive"
            :click="routeRedirectWith"
          />
        </template>
      </TableTInfiniteScrollSmooth>
    </template>
    <template #child>
      <NuxtChild :id="rowId" :as-child="true" />
    </template>
  </GridGTwoColumnLayout>
</div> -->

<pre>
    {{ fetchedData }}
  </pre>
  </div>
</template>
<script setup lang="tsx">
// tsx used to create components inside ts code (see columns[...].cellRenderer)

import { useNotification } from '~/composables/mixins/useComponent';
import { useConfigserver } from '~/composables/mixins/useGet';

import type { ITableHeaderRow } from '~/types/ttableV3'

import { useCookies } from '~/composables/mixins/useCookies'
import { TableV2FixedDir, type CheckboxValueType } from 'element-plus';
import { useIcons } from '~/composables/mixins/useIcons';
const storeSelection = storeSelections()
const cookies = useCookies()
const icons = useIcons()
const $t = useI18n().t

const id = "server"
const emit = defineEmits(['change'])
const props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}}
})
const columns = reactive<ITableHeaderRow>({
    selected: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.selection'),
      key: 'selected',
      dataKey: 'selected',
      sortable: true,
      width: 50,
      maxWidth: 50,
      fixed: true,
      hidden: false
      // hidden: !cookies.includesCookie('column_' + id, 'selected', true)
    },
    depotId: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.id'),
      key: 'depotId',
      dataKey: 'depotId',
      sortable: true,
      width: 150,
      maxWidth: 350,
      fixed: true,
      hidden: false
    },
    description: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.description'),
      key: 'description',
      dataKey: 'description',
      sortable: true,
      width: 150,
      hidden: false
      // hidden: !cookies.includesCookie('column_' + id, 'description', false)
    },
    type: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.type'),
      key: 'type',
      dataKey: 'type',
      sortable: true,
      width: 140,
      maxWidth: 300,
      hidden: false
      // hidden: !cookies.includesCookie('column_' + id, 'type', true)
    },
    ip: { // eslint-disable-next-line object-property-newline
      title: $t('table.fields.ip'),
      key: 'ip',
      dataKey: 'ip',
      sortable: true,
      width: 100,
      maxWidth: 150,
      // hidden: !cookies.includesCookie('column_' + id, 'ip', false)
      hidden: false
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions',
      dataKey: 'rowactions',
      title: $t('table.fields.rowactions'),
      width: 150,
      maxWidth: 150,
      fixed: TableV2FixedDir.RIGHT,
      hidden: false,
      class: 'col-rowactions',
      cellRenderer: ({rowData}) => {
        const change = ()=>emit('change', rowData.depotId)
        return (
        <>
          <el-button size="small" onClick={change}>
            <iconIIcon icon={icons.settings} />
            {/* {rowData.depotId} */}
          </el-button>
        </>
      )},
      // <el-button size="small" type="danger">Delete</el-button>
      // <ButtonBTNRowLinkTo
      //       :title="$t('title.config')"
      //       :label="(headerData.rowactions.mergeOnMobile==true && $mq=='mobile') ? $t('title.config') : ''"
      //       :icon="icon.settings"
      //       to="/depots/config"
      //       :ident="row.item.ident"
      //       :pressed="isRouteActive"
      //       :click="routeRedirectWith"
      //     />
    }
})
const fetchedData = ref<Array<any>>([])

const handleChange = (id:string) => {
  console.log('handleSelectionChange', id)
  storeSelection.toggleSelectionDepots(id)
}
const tableData = reactive({
  pageNumber: 1,
  perPage: 20,
  sortBy: 'depotId', // this.getKeyCookie('sorting_' + id, 'sortBy', 'depotId'),
  sortDesc: false, // this.getKeyCookie('sorting_' + id, 'sortDesc', false),
  filterQuery: '',
  filterColumns: ['depotId']
})
onMounted(async ()=> fetchedData.value = await _fetch())

watch(()=> tableData, async ()=>{
  console.log('tableData changed', tableData)
  fetchedData.value = []
  fetchedData.value = await _fetch()
}, { deep: true})

async function _fetch() {
  const params = { ...tableData, selected: '' }

  if (params.sortBy === '') { params.sortBy = 'depotId' }
  if (params.sortBy === 'selected') {
    params.sortDesc = true
    params.selected = JSON.stringify([])
  }
  const {data, error} = await useApiGETBody('/opsidata/depots', params)
  '/api/opsidata/depots'
  if (error) {
    console.log(error)
    useNotification().error(error)
    return
  }
  console.log('Fetchresult data', data)
  console.log('Fetchresult data2', fetchedData.value)
  const opsiconfigserver = storeCache().opsiconfigserver
  if (opsiconfigserver){
    console.log('Fetchresult set configserver from store')
    storeSelection.pushToSelectionDepots(opsiconfigserver)
    emit('change', opsiconfigserver)
  } else{
    console.log('Fetchresult set configserver from result')
    storeSelection.pushToSelectionDepots(data.value[0].depotId)
    emit('change', data.value[0].depotId)
  }
  console.log('Fetchresult configserver', opsiconfigserver)
  console.log('Fetchresult selection', storeSelection.selectionDepots)
  for (const dId of storeSelection.selectionDepots) {
    data.value.filter((row:any) => {
      console.log('FilterSelected', row.depotId, dId)
      return row.depotId === dId
    }).forEach((row:any) => {
      console.log('ChangeSelected of row', row.depotId);
      row.selected = true
    })
  }
  console.log('DATA', data.value)
  return data.value;

}
/**
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders, ITableInfo } from '../../.utils/types/ttable'
import { IObjectString2String } from '../../.utils/types/tgeneral'
import QueueNested from '../../.utils/utils/QueueNested'
import { AlertToast, Synchronization } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
import { Client } from '../../mixins/get'
import { Cookies } from '../../mixins/cookies'
const selections = namespace('selections')
const cache = namespace('data-cache')

@Component({ mixins: [Icons, Synchronization, Client, Cookies, AlertToast] })
export default class VDepots extends Vue {
  showToastError: any // mixin
  icon: any
  syncSort: any
  includesCookie!: any // mixin cookies
  getKeyCookie!: any
  $axios: any
  $fetch: any
  $mq: any
  $t!: any
  $route: any
  $router: any
  getClientToDepot:any

  id: string = 'Depots'
  rowId: string = ''
  isLoading: boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''
  tableloaded: boolean = false
  fetchedDataClients2Depots: IObjectString2String = {}
  headerData: ITableHeaders = {
    selected: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.selection') as string, key: 'selected', _fixed: true, sortable: true,
      visible: this.includesCookie('column_' + this.id, 'selected', true)
    },
    depotId: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.id') as string, key: 'depotId', _fixed: true, sortable: true,
      visible: this.includesCookie('column_' + this.id, 'depotId', true)
    },
    description: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.description') as string, key: 'description', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'description', false)
    },
    type: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.type') as string, key: 'type', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'type', true)
    },
    ip: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.ip') as string, key: 'ip', sortable: true,
      visible: this.includesCookie('column_' + this.id, 'ip', false)
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions', label: this.$t('table.fields.rowactions') as string, _fixed: true,
      visible: this.includesCookie('column_' + this.id, 'rowactions', false),
      class: 'col-rowactions'
    }
  }

  cache_pages_no: number = 2 // number of pages which can be stored in parallel (cache)
  cache_pages: QueueNested = new QueueNested(this.cache_pages_no)

  tableData: ITableData = {
    pageNumber: 1,
    perPage: 20,
    sortBy: this.getKeyCookie('sorting_' + this.id, 'sortBy', 'depotId'),
    sortDesc: this.getKeyCookie('sorting_' + this.id, 'sortDesc', false),
    filterQuery: ''
  }

  tableInfo: ITableInfo = { sortBy: this.tableData.sortBy || 'depotId', sortDesc: this.tableData.sortDesc || false, headerData: this.headerData, filterQuery: this.tableData.filterQuery }

  @cache.Getter public opsiconfigserver!: string
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('tableData.filterQuery', { deep: true }) tdFilterQueryChanged () {
    this.tableData.pageNumber = 1
  }

  @Watch('tableData', { deep: true }) async tableDataChanged () {
    await this.$fetch()
  }

  @Watch('tableData.sortDesc', { deep: true }) tableDataSortDescChanged () { this.syncSort(this.tableData, this.tableInfo, false, this.id) }
  @Watch('tableData.sortBy', { deep: true }) tableDataSortByChanged () { this.syncSort(this.tableData, this.tableInfo, false, this.id) }
  @Watch('tableInfo', { deep: true }) sortPropChanged () { this.syncSort(this.tableInfo, this.tableData, false, this.id) }

  @Watch('selectionDepots', { deep: true }) depotsChanged () {
    const selectedClientsOnDepots = Object.fromEntries(Object.entries(this.fetchedDataClients2Depots).filter(
      ([_, value]) => this.selectionDepots.includes(value)
    ))
    this.setSelectionClients(Object.keys(selectedClientsOnDepots))
  }

  async mounted () {
    if (this.$mq !== 'mobile' && this.selectionDepots.length === 1 &&
    this.selectionDepots[0] === this.opsiconfigserver &&
    this.error !== '') {
      this.routeRedirectWith('/depots/config', this.opsiconfigserver)
    } else if (this.secondColumnOpened) {
      this.$router.push('/depots/')
    }

    if (this.selectionClients.length > 0) {
      await this.getClientToDepot(this.selectionClients)
    }
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

    if (params.sortBy === '') { params.sortBy = 'depotId' }
    if (params.sortBy === 'selected') {
      params.sortDesc = true
      params.selected = JSON.stringify(this.selectionDepots)
    }
    return await this.$axios.get('/api/opsidata/depots', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / params.perPage)
        this.tableloaded = true
        if (response.data === null) {
          this.isLoading = false
          return []
        } else {
          this.isLoading = false
          return response.data
        }
      }).catch((error) => {
        this.showToastError(error)
        this.isLoading = false
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
    return this.$route.path.includes('config') || this.$route.path.includes('log') || this.$route.path.includes('healthcheck')
  }
}
*/
</script>
