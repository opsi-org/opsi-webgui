<template>
  <div data-testid="VClients">
    <AlertAAlert ref="clientsViewAlert" />
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tableclients">
      <template #parent>
        <BarBCollapsePageHeader
          :id="id"
          :title="$t('title.clients')"
          :row-id="rowId"
          :collapsed="$mq=='mobile' || secondColumnOpened"
          :collapseable="true"
          :is-child-layout="secondColumnOpened"
          :is-loading-parent="isLoading"
          :fetch="$fetch"
          :enable-ondemand="true"
          :enable-depots="true"
          :enable-clients="true"
          :table-info.sync="tableInfo"
          :enable-show-products="true"
          :redirect="routeRedirectWith"
        />
        <LazyTableTInfiniteScrollSmooth
          v-if="items"
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
          ismultiselect="true"
          :selection="selectionClients"
          :setselection="setSelectionClients"
          :fetchitems="_fetch"
        >
          <template #contextcontent1="data">
            <DropdownDDClientActions :client-id="data.itemkey" :fetch="$fetch" :incontextmenu="true" />
          </template>
          <template #contextcontent2="{itemkey}">
            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              :label="$t('title.config')"
              :icon="iconnames.settingsobject"
              to="/clients/config"
              :ident="itemkey"
              :pressed="isRouteActive"
              :incontextmenu="true"
              :click="routeRedirectWith"
            />
            <ButtonBTNRowLinkTo
              :title="$t('title.log')"
              :label="$t('title.log')"
              :icon="iconnames.log"
              to="/clients/log"
              :ident="itemkey"
              :pressed="isRouteActive"
              :incontextmenu="true"
              :click="routeRedirectWith"
            />
          </template>
          <template #contextcontent-keepOpenOnClick>
              <!-- onhover -->
            <DropdownDDTableSorting
              :table-id="id"
              :incontextmenu="true"
              v-bind.sync="tableInfo"
            />
            <DropdownDDTableColumnVisibility
              :table-id="id"
              :headers.sync="tableInfo.headerData"
              :sort-by="tableInfo.sortBy"
              :multi="true"
              :incontextmenu="true"
            />
              <!-- onhover -->
          </template>
          <template #head(clientId)>
            <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
          </template>
          <template #head(version_outdated)>
            <div :title="$t('table.fields.versionOutdated')">
              <b-icon :icon="iconnames.product" />
              <b-icon font-scale="1.2" :icon="iconnames.productsOutdated" style="color: var(--warning);" />
            </div>
          </template>

          <template #head(actionResult_failed)>
            <div :title="$t('table.fields.actionResultFailed')">
              <b-icon :icon="iconnames.product" />
              <b-icon :icon="iconnames. productsFailedActionResult" class="rounded-circle" variant="danger" />
            </div>
          </template>
          <template #head(installationStatus_unknown)>
            <div :title="$t('table.fields.installationStatusUnknown')">
              <b-icon :icon="iconnames.product" />
              <b-icon :icon="iconnames. productInstallationStatusUnknown" class="rounded-circle" variant="dark" />
            </div>
          </template>
          <template #cell(uefi)="row">
            <b-form-checkbox v-model="row.item.uefi" :title="''+row.item.uefi" disabled />
          </template>
          <template #cell(clientId)="row">
            {{ row.item.clientId }}
          </template>
          <template #cell(description)="row">
            {{ row.item.description }}
          </template>
          <template #rowactions="row">
            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              :label="(headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.config'):''"
              :icon="iconnames.settingsobject"
              to="/clients/config"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :style="($route.path.includes('config')) ? 'background-color: var(--primary)': ''"
              :click="routeRedirectWith"
            />
            <ButtonBTNRowLinkTo
              :title="$t('title.log')"
              :label="(headerData.rowactions.mergeOnMobile==true && $mq=='mobile')? $t('title.log'):''"
              :icon="iconnames.log"
              to="/clients/log"
              :style="($route.path.includes('log')) ? 'background-color: var(--primary)': ''"
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
        </LazyTableTInfiniteScrollSmooth>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders, ITableInfo } from '../../.utils/types/ttable'
import { Constants, Synchronization } from '../../mixins/uib-mixins'
import QueueNested from '../../.utils/utils/QueueNested'
import { IObjectString2Boolean } from '~/.utils/types/tgeneral'
const selections = namespace('selections')
const config = namespace('config')
interface DeleteClient {
  clientid: string
}

@Component({ mixins: [Constants, Synchronization] })
export default class VClients extends Vue {
  syncSort: any
  iconnames: any
  $axios: any
  $t: any
  $mq: any
  $fetch:any
  $nuxt:any
  $router:any
  $route: any

  id: string = 'Clients'
  rowId: string = ''
  isLoading: Boolean = false
  // isLoadingEventReboot: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''

  deleteClient: DeleteClient = { clientid: '' }
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 15,
    sortBy: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortBy : 'clientId',
    sortDesc: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortDesc : false,
    filterQuery: '',
    selected: ''
  }

  headerData: ITableHeaders = {
    selected: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.selection') as string, key: 'selected', _fixed: true, sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('selected') : true,
      class: 'mobileVisibleOnlySelection'
    },
    clientId: { // eslint-disaconfigble-next-line object-property-newline
      label: this.$t('table.fields.id') as string,
      key: 'clientId',
      _fixed: true,
      sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('clientId') : true
    },
    description: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.description') as string, key: 'description', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('description') : false
    },
    ipAddress: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.ip') as string, key: 'ipAddress', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('ipAddress') : false
    },
    macAddress: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.mac') as string, key: 'macAddress', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('macAddress') : false
    },
    lastSeen: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.lastSeen') as string, key: 'lastSeen', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('lastSeen') : false
    },
    uefi: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.uefi') as string, key: 'uefi', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('uefi') : false
    },
    _majorStats: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.stats') as string, key: '_majorStats', _isMajor: true, visible: false
    },
    version_outdated: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.versionOutdated') as string, key: 'version_outdated', _majorKey: '_majorStats', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('version_outdated') : true
    },
    actionResult_failed: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.actionResultFailed') as string, key: 'actionResult_failed', _majorKey: '_majorStats', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('actionResult_failed') : true
    },
    installationStatus_unknown: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.installationStatusUnknown') as string, key: 'installationStatus_unknown', _majorKey: '_majorStats', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('installationStatus_unknown') : true
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions', label: this.$t('table.fields.rowactions') as string, _fixed: false, visible: this.$mq === 'mobile',
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('rowactions') : true,
      class: 'col-rowactions'
    }
  }

  tableInfo: ITableInfo = {
    sortBy: this.tableData.sortBy || 'clientId',
    sortDesc: this.tableData.sortDesc || false,
    headerData: this.headerData,
    filterQuery: this.tableData.filterQuery
  }

  cache_pages_no: number = 2 // number of pages which can be stored in parallel (cache)
  cache_pages: QueueNested = new QueueNested(this.cache_pages_no)

  @config.Getter public config!: IObjectString2Boolean
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () {
    this.setSelectionClients([])
    this.fetchPageOne()
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
        if (response.data === null) {
          return []
        } else {
          return response.data
        }
        // this.items = this.items.concat(response.data)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.clientsViewAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Clients', 'danger', detailedError)
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
    return this.$route.path.includes('config') || this.$route.path.includes('log') || this.$route.path.includes('products')
  }

  routeToChild (id: string) {
    this.routeRedirectWith('/clients/config', id)
  }
}
</script>

<style>
</style>
