<template>
  <div data-testid="VClients">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tableclients">
      <template #parent>
        <BarBPageHeader>
          <template #left>
            <!-- <InputIFilter :data="tableData" /> -->
            <!-- <DropdownDDDepotIds /> -->
            <TreeTSDepots />
            <!-- <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" /> -->
            <TreeTSHostGroupLazyLoad />
            <InputIFilter v-if="$mq=='mobile'" :data="tableData" :additional-title="$t('table.fields.id')" />
          </template>
          <template #right>
            <CheckboxCBMultiselection :multiselect.sync="ismultiselect" />
            <DropdownDDTableColumnVisibilty v-if="$mq=='mobile'" :headers="headerData" />
            <ButtonBTNClearSelection style="margin-left: 10px;" store="clients" />
          </template>
        </BarBPageHeader>
        <TableTCollapseableForMobile
          id="tableclients"
          datakey="clientId"
          :collapseable="false"
          :tabledata="tableData"
          :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
          :headers="headerData"
          :items="fetchedData"
          :selection="selectionClients"
          :onchangeselection="setSelectionClients"
          :routechild="routeToChild"
          :busy="isLoading"
          :error-text="errorText"
          :totalrows="totalData"
          :ismultiselect="ismultiselect"
        >
          <template #head(_majorStats)>
            {{ '' }}
          </template>
          <template #head(clientId)>
            <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
          </template>
          <template #cell(actionResult_failed)="row">
            <ButtonBTNRowLinkTo
              :label="row.item.version_outdated"
              to="/clients/products"
              sortby="actionResult"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <!-- <b-badge variant="danger">
              {{ row.item.actionResult_failed }}
            </b-badge> -->
          </template>
          <template #cell(rowactions)="row">
            <ButtonBTNRowLinkTo
              title="Products"
              icon="grid"
              to="/clients/products"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />

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
            <b-badge variant="outline-primary">
              <b-dropdown variant="outline-primary" class="actions_dropdown" size="sm" no-caret>
                <template #button-content>
                  <b-icon icon="three-dots-vertical" />
                </template>
                <ModalMDeleteClient :id="row.item.ident.trim()" :update-table.sync="updateTable" />
              </b-dropdown>
            </b-badge>
          </template>
          <template #pagination>
            <BarBTablePagination
              :tabledata="tableData"
              :total-rows="totalData"
              aria-controls="tableclients"
            />
          </template>
        </TableTCollapseableForMobile>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import Cookie from 'js-cookie'
import { ITableData, ITableHeaders } from '~/scripts/types/ttable'
const auth = namespace('auth')
const selections = namespace('selections')
interface IFetchOptions {
  fetchClients:boolean,
  fetchDepotIds:boolean,
}
@Component export default class VClients extends Vue {
  ismultiselect: boolean = false
  rowId: string = ''
  isLoading: boolean = true
  errorText: string = 'lalala'
  fetchedData: Array<string> = []
  totalData: number = 0
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchDepotIds: true }
  updateTable: boolean = false
  tableData: ITableData = {
    pageNumber: 1,
    perPage: Cookie.get('perpage_clients') ? Cookie.get('perpage_clients') as unknown as number : 10,
    setPerPage: (pp:number) => {
      this.tableData.perPage = pp
      Cookie.set('perpage_clients', this.tableData.perPage as unknown as string, { expires: 365 })
    },
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    clientId: { label: this.$t('table.fields.id') as string, key: 'clientId', visible: true, _fixed: true, sortable: true },
    description: { label: this.$t('table.fields.description') as string, key: 'description', visible: false, sortable: true },
    ipAddress: { label: this.$t('table.fields.ip') as string, key: 'ipAddress', visible: false, sortable: true },
    macAddress: { label: this.$t('table.fields.hwAddr') as string, key: 'macAddress', visible: false, sortable: true },
    _majorStats: { label: this.$t('table.fields.stats') as string, key: '_majorStats', _isMajor: true, visible: false },
    version_outdated: { label: this.$t('table.fields.versionOutdated') as string, key: 'version_outdated', _majorKey: '_majorStats', visible: true, sortable: true },
    actionResult_failed: { label: this.$t('table.fields.actionRequestFailed') as string, key: 'actionResult_failed', _majorKey: '_majorStats', visible: true, sortable: true },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true }
  }

  // @auth.Mutation public setSession!: () => void
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  // @settings.Mutation public setColumnLayoutCollapsed!: (tableId: string, value: boolean) => void

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () { this.$fetch() }
  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }
  @Watch('updateTable', { deep: true }) updateTableChanged () { if (this.updateTable === true) { this.$fetch() } }
  // @Watch('secondColumnOpened') layoutColumnChanged () {
  //   this.setColumnLayoutCollapsed('tableclients', Boolean(this.secondColumnOpened && this.rowId))
  // }
  @Watch('ismultiselect', { deep: true }) multiselectChanged () {
    this.setSelectionClients([])
  }

  async fetch () {
    this.isLoading = true
    if (this.fetchOptions.fetchClients) {
      this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
      const params = this.tableData
      await this.$axios.get('/api/opsidata/clients', { params })
        .then((response) => {
          this.fetchedData = response.data
          // this.setSession()
          this.totalData = response.headers['x-total-count']
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = this.$t('message.errortext') as string
        })
    }
    if (this.fetchOptions.fetchDepotIds) {
      await this.$axios.$get('/api/opsidata/depot_ids')
        .then((response) => {
          this.fetchedDataDepotIds = response
          // this.setSession()
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = this.$t('message.errortext') as string
        })
      this.fetchOptions.fetchDepotIds = false
    }
    this.isLoading = false
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
    if (this.$route.path.includes('products')) {
      this.setClientSelection(rowIdent)
    }
  }

  setClientSelection (id: string) {
    this.setSelectionClients([id])
    // this.pushToSelectionClients(id)
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
.actions_dropdown .btn-outline-primary{
  border: 0;
}
</style>
