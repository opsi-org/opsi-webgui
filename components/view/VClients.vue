<template>
  <div data-testid="VClients">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tableclients">
      <template #parent>
        <BarBPageHeader v-if="secondColumnOpened" title="Clients" />
        <BarBPageHeader>
          <template #left>
            <TreeTSDepots />
            <TreeTSHostGroups />
          </template>
          <template #right>
            <ButtonBTNRowLinkTo
              label="Show Products"
              icon="grid"
              to="/clients/products"
              ident="dummy"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
          </template>
        </BarBPageHeader>
        <TableTInfiniteScroll
          id="Clients"
          ref="Clients"
          primary-key="Clients"
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
          <!-- <template #head(actionResult_failed)="data">
            <small> <b>{{ data.label }} </b> </small>
            <ButtonBTNRowLinkTo
              title="Show failed products"
              icon="grid"
              to="/clients/products"
              sortby="actionResult"
              ident="dummyid"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
          </template> -->
          <template #cell(rowactions)="row">
            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              icon="gear"
              to="/clients/config"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <ButtonBTNRowLinkTo
              :title="$t('title.log')"
              icon="file-earmark-text"
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
              :title="row.detailsShowing ? 'Cancel' : 'Delete'"
              @click="row.toggleDetails"
            >
              <b-icon :icon="row.detailsShowing ? 'x' : 'trash'" />
              <span class="sr-only">{{ row.detailsShowing ? 'Cancel' : 'Delete' }}</span>
            </b-button>
          </template>
          <template #row-details="row">
            <b-card>
              {{ $t('message.deleteConfirm') }} <b>{{ row.item.ident }}</b> ?
              <b-button class="float-right" variant="danger" size="sm" @click="deleteOpsiClient(row.item.ident)">
                <b-icon icon="trash" /> {{ $t('message.delete') }}
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
import { Component, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '../../.utils/utils/scomponents'
import { ITableData, ITableHeaders } from '../../.utils/types/ttable'
const selections = namespace('selections')
interface DeleteClient {
  clientid: string
}

@Component export default class VClients extends Vue {
  $axios: any
  $mq: any
  $fetch:any
  $nuxt:any

  deleteClient: DeleteClient = {
    clientid: ''
  }

  rowId: string = ''
  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''

  tableData: ITableData = {
    pageNumber: 1,
    perPage: 15,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    selected: ''
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'selected', visible: true, _fixed: true, sortable: true },
    clientId: { label: this.$t('table.fields.id') as string, key: 'clientId', visible: true, _fixed: true, sortable: true },
    description: { label: this.$t('table.fields.description') as string, key: 'description', visible: false, sortable: true },
    ipAddress: { label: this.$t('table.fields.ip') as string, key: 'ipAddress', visible: false, sortable: true },
    macAddress: { label: this.$t('table.fields.hwAddr') as string, key: 'macAddress', visible: false, sortable: true },
    _majorStats: { label: this.$t('table.fields.stats') as string, key: '_majorStats', _isMajor: true, visible: false },
    version_outdated: { label: this.$t('table.fields.versionOutdated') as string, key: 'version_outdated', _majorKey: '_majorStats', visible: true, sortable: true },
    actionResult_failed: { label: this.$t('table.fields.actionRequestFailed') as string, key: 'actionResult_failed', _majorKey: '_majorStats', visible: true, sortable: true },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true }
  }

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () { this.$fetch() }
  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }

  async fetch () {
    this.isLoading = true
    this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    if (this.tableData.sortBy === 'selected') {
      this.tableData.sortBy = 'selected'
      this.tableData.sortDesc = true
      this.tableData.selected = JSON.stringify(this.selectionClients)
    }
    const params = this.tableData
    await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / this.tableData.perPage)
        if (response.data === null) {
          this.items = []
        } else {
          this.items = response.data
        }
        // this.items = this.items.concat(response.data)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.error = this.$t('message.errortext') as string
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
      .then((response) => {
        // eslint-disable-next-line no-console
        console.error(response)
        makeToast(this, id + this.$t('message.deleteMessage'), this.$t('message.success') as string, 'success')
        this.delFromSelectionClients(id)
      }).catch((error) => {
        makeToast(this, this.$t('message.errortext') as string, this.$t('message.error') as string, 'danger', 8000)
        // eslint-disable-next-line no-console
        console.error(error)
      })
  }
}
</script>

<style>
.actions_dropdown .btn-outline-primary{
  border: 0;
}
</style>
