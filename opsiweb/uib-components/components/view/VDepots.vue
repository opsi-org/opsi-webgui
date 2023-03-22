<template>
  <div data-testid="VDepots">
    <AlertAAlert ref="depotsViewAlert" />
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tabledepots">
      <template #parent>
        <!-- v-if="$mq == 'mobile'" -->
        <LazyBarBPageHeader
          v-if="tableloaded"
          :title="$t('title.depots') + ' (' + totalItems + ')'"
          :tableid="id"
          :table-info.sync="tableInfo"
          :is-loading-parent="isLoading"
          :fetch="$fetch"
        />
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
              :icon="iconnames.settingsobject"
              to="/depots/config"
              :ident="itemkey"
              :pressed="isRouteActive"
              :incontextmenu="true"
              :click="routeRedirectWith"
            />
            <!-- <ButtonBTNRowLinkTo
              v-if="itemkey==opsiconfigserver"
              :title="$t('title.healthcheck')"
              :label="$t('title.healthcheck')"
              :icon="iconnames.healthcheck"
              to="/depots/healthcheck"
              :ident="itemkey"
              :pressed="isRouteActive"
              :incontextmenu="true"
              :click="routeRedirectWith"
            /> -->
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
          <template #head(depotId)>
            <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
          </template>
          <template #cell(depotId)="row">
            <b v-if="row.item.depotId==opsiconfigserver">
              {{ row.item.depotId }}
            </b>
            {{ (row.item.depotId!=opsiconfigserver) ? row.item.depotId:'' }}
          </template>
          <template #rowactions="row">
            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              :label="(headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.config'):''"
              :icon="iconnames.settingsobject"
              to="/depots/config"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <!-- <ButtonBTNRowLinkTo
              v-if="row.item.ident==opsiconfigserver"
              :title="$t('title.healthcheck')"
              :label="(headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.healthcheck'):''"
              :icon="iconnames.healthcheck"
              to="/depots/healthcheck"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            /> -->
          </template>
        </TableTInfiniteScrollSmooth>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders, ITableInfo } from '../../.utils/types/ttable'
import { IObjectString2String } from '../../.utils/types/tgeneral'
import QueueNested from '../../.utils/utils/QueueNested'
import { Constants, Synchronization } from '../../mixins/uib-mixins'
const selections = namespace('selections')
const cache = namespace('data-cache')

@Component({ mixins: [Constants, Synchronization] })
export default class VDepots extends Vue {
  iconnames: any
  syncSort: any
  $axios: any
  $fetch: any
  $mq: any
  $t: any
  $route: any
  $router: any

  id: string = 'Depots'
  rowId: string = ''
  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''
  tableloaded: boolean = false
  fetchedDataClients2Depots: IObjectString2String = {}

  cache_pages_no: number = 2 // number of pages which can be stored in parallel (cache)
  cache_pages: QueueNested = new QueueNested(this.cache_pages_no)

  tableData: ITableData = {
    pageNumber: 1,
    perPage: 15,
    sortBy: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortBy : 'depotId',
    sortDesc: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortDesc : false,
    filterQuery: ''
  }

  headerData: ITableHeaders = {
    selected: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.selection') as string, key: 'selected', _fixed: true, sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('selected') : true
    },
    depotId: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.id') as string, key: 'depotId', _fixed: true, sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('depotId') : true
    },
    description: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.description') as string, key: 'description', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('description') : false
    },
    type: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.type') as string, key: 'type', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('type') : true
    },
    ip: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.ip') as string, key: 'ip', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('ip') : false
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions', label: this.$t('table.fields.rowactions') as string, _fixed: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('rowactions') : false,
      class: 'col-rowactions'
    }
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
    if (this.$mq === 'desktop' && this.selectionDepots.length === 1 &&
    this.selectionDepots[0] === this.opsiconfigserver &&
    this.error !== '') {
      this.routeRedirectWith('/depots/config', this.opsiconfigserver)
    } else if (this.secondColumnOpened) {
      this.$router.push('/depots/')
    }

    if (this.selectionClients.length > 0) {
      await this.$axios.$get(`/api/opsidata/clientsdepots?selectedClients=[${this.selectionClients}]`)
        .then((response) => {
          this.fetchedDataClients2Depots = response
        }).catch((error) => {
          this.fetchedDataClients2Depots = {}
          throw new Error(error)
        })
    }
  }

  async fetch () {
    const items = await this._fetch()

    await Vue.nextTick(() => {
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
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.depotsViewAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Depots', 'danger', detailedError)
        this.error = this.$t('message.error.defaulttext') as string
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
</script>