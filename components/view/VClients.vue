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
          :enable-depots="true"
          :enable-clients="true"
          :table-info.sync="tableInfo"
          :enable-show-products="true"
          :redirect="routeRedirectWith"
        />
        <TableTInfiniteScroll
          :id="id"
          :ref="id"
          :primary-key="id"
          rowident="clientId"
          :error="error"
          :is-loading="isLoading"
          :table-data="tableData"
          :header-data="headerData"
          :items="items"
          :total-items="totalItems"
          :totalpages="totalpages"
          ismultiselect="true"
          :selection="selectionClients"
          :setselection="setSelectionClients"
          :fetchitems="$fetch"
        >
          <template #head(clientId)>
            <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
          </template>
          <template #head(version_outdated)>
            <div :title="$t('table.fields.versionOutdated')">
              <b-icon :icon="iconnames.product" />
              <b-icon font-scale="1.2" :icon="iconnames.productsOutdated" />
            </div>
          </template>

          <template #head(actionResult_failed)>
            <div :title="$t('table.fields.actionResultFailed')">
              <b-icon :icon="iconnames.product" />
              <b-icon :icon="iconnames. productsFailedActionResult" />
            </div>
          </template>
          <template #head(installationStatus_unknown)>
            <div :title="$t('table.fields.installationStatusUnknown')">
              <b-icon :icon="iconnames.product" />
              <b-icon :icon="iconnames. productInstallationStatusUnknown" />
            </div>
          </template>
          <template #cell(uefi)="row">
            <b-form-checkbox v-model="row.item.uefi" :title="''+row.item.uefi" disabled />
          </template>
          <template #cell(rowactions)="row">
            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              :icon="iconnames.settingsobject"
              to="/clients/config"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <ButtonBTNRowLinkTo
              :title="$t('title.log')"
              :icon="iconnames.log"
              to="/clients/log"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <b-button
              v-b-tooltip.focus
              variant="outline-primary"
              size="sm"
              class="border-0"
              :disabled="(config)?config.read_only:false"
              :title="row.detailsShowing ? $t('label.cancel') : $t('label.delete')"
              @click="row.toggleDetails"
            >
              <b-icon :icon="row.detailsShowing ? iconnames.x : iconnames.delete" />
              <span class="sr-only">{{ row.detailsShowing ? $t('label.cancel') : $t('label.delete') }}</span>
            </b-button>
          </template>
          <template #row-details="row">
            <b-card>
              <AlertAAlert ref="deleteClientAlert" />
              {{ $t('message.confirm.deleteClient', { client: row.item.ident }) }}
              <b-button
                class="float-right"
                variant="danger"
                size="sm"
                :disabled="(config)?config.read_only:false"
                @click="deleteOpsiClient(row.item.ident)"
              >
                <b-icon :icon="iconnames.delete" /> {{ $t('label.delete') }}
              </b-button>
            </b-card>
          </template>
          <template
            v-for="slotName in Object.keys($scopedSlots)"
            #[slotName]="slotScope"
          >
            <slot :name="slotName" v-bind="slotScope" />
          </template>
        </TableTInfiniteScroll>
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
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { ITableData, ITableHeaders, ITableInfo } from '../../.utils/types/ttable'
import { Constants, Synchronization } from '../../mixins/uib-mixins'
const selections = namespace('selections')
const config = namespace('config-app')
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

  id: string = 'Clients'
  rowId: string = ''
  isLoading: Boolean = false
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
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('selected') : true
    },
    clientId: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.id') as string, key: 'clientId', _fixed: true, sortable: true,
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
      label: this.$t('table.fields.hwAddr') as string, key: 'macAddress', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('macAddress') : false
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
      label: this.$t('table.fields.installationStatus_unknown') as string, key: 'installationStatus_unknown', _majorKey: '_majorStats', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('installationStatus_unknown') : true
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions', label: this.$t('table.fields.rowactions') as string, _fixed: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('rowactions') : true
    }
  }

  tableInfo: ITableInfo = {
    sortBy: this.tableData.sortBy || 'clientId',
    sortDesc: this.tableData.sortDesc || false,
    headerData: this.headerData,
    filterQuery: this.tableData.filterQuery
  }

  @config.Getter public config!: IObjectString2Boolean
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () {
    this.setSelectionClients([])
    this.fetchPageOne()
  }

  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }
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
    this.isLoading = true
    const params = { ...this.tableData }
    params.selectedDepots = JSON.stringify(this.selectionDepots)
    params.selectedClients = JSON.stringify(this.selectionClients)
    if (params.sortBy === '') { params.sortBy = 'clientId' }
    if (params.sortBy === 'selected') {
      // params.sortBy = 'selected'
      params.sortDesc = true
      params.selected = JSON.stringify(this.selectionClients)
    }
    await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / params.perPage)
        if (response.data === null) {
          this.items = []
        } else {
          this.items = response.data
        }
        // this.items = this.items.concat(response.data)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.clientsViewAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Clients', 'danger', detailedError)
        this.error = this.$t('message.error.defaulttext') as string
        this.error += JSON.stringify(error.message)
      })
    this.isLoading = false
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
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

  async deleteOpsiClient (ident:string) {
    const id = ident
    await this.$axios.$delete('/api/opsidata/clients/' + id)
      .then(() => {
        const ref = (this.$refs.deleteClientAlert as any)
        ref.alert(this.$t('message.success.deleteClient', { client: id }) as string, 'success')
        this.delFromSelectionClients(id)
      }).catch((error) => {
        const ref = (this.$refs.deleteClientAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.deleteClient') as string, 'danger', detailedError)
      })
  }
}
</script>

<style>
.actions_dropdown .btn-outline-primary{
  border: 0;
}
</style>
