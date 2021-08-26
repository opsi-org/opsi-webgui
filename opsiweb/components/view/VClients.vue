<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
    <template #parent>
      <BarBPageHeader>
        <template #left>
          <!-- <InputIFilter :data="tableData" /> -->
          <DropdownDDDepotIds />
          <!-- DOUBT: why fetchedDataDepotIds -->
          <!-- <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" /> -->
          <TreeTSHostGroup />
        </template>
      </BarBPageHeader>
      <IconILoading v-if="isLoading" />
      <p v-else-if="errorText">
        {{ errorText }}
      </p>
      <TableTCollapseableForMobile
        v-else
        id="tableclients"
        datakey="clientId"
        :collapseable="false"
        :tabledata="tableData"
        :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
        :headers="headerData"
        :items="fetchedData.clients"
        :selection="selectionClients"
        :onchangeselection="setSelectionClients"
        :loading="isLoading"
        :totalrows="fetchedData.total"
      >
        <template #head(clientId)>
          <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
        </template>
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
          <b-dropdown no-caret>
            <template #button-content>
              <b-icon icon="three-dots-vertical" />
            </template>
            <ModalMDeleteClient :id="row.item.ident.trim()" :update-table.sync="updateTable" />
          </b-dropdown>
        </template>
        <template #pagination>
          <BarBPagination
            :tabledata="tableData"
            :total-rows="fetchedData.total"
            aria-controls="tableclients"
          />
        </template>
      </TableTCollapseableForMobile>
      <!-- <b>Selection: </b> <br>
      Depots : {{ selectionDepots }} <br>
      Clients : {{ selectionClients }} <br> -->
      <!-- rowID {{ rowId }} <br>
      Filter Query: {{ tableData.filterQuery }} -->
    </template>
    <template #child>
      <NuxtChild :id="rowId" :as-child="true" />
    </template>
  </GridGTwoColumnLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders } from '~/types/ttable'
const selections = namespace('selections')
interface IFetchOptions {
  fetchClients:boolean,
  fetchDepotIds:boolean,
}
@Component
export default class VClients extends Vue {
  rowId: string = ''
  isLoading: boolean = true
  errorText: string = ''
  fetchedData: object = {}
  fetchedDataDepotIds: Array<string> = []
  fetchOptions: IFetchOptions = { fetchClients: true, fetchDepotIds: true }
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 5,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  updateTable: boolean = false

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true },
    clientId: { label: 'table.fields.id', key: 'clientId', visible: true, _fixed: true, sortable: true },
    description: { label: 'table.fields.description', key: 'description', visible: false, sortable: true },
    ipAddress: { label: 'table.fields.ip', key: 'ipAddress', visible: false, sortable: true },
    macAddress: { label: 'table.fields.hwAddr', key: 'macAddress', visible: false, sortable: true },
    _majorStats: { label: 'table.fields.stats', key: '_majorStats', _isMajor: true, visible: false },
    version_outdated: { label: 'v outated', key: 'version_outdated', _majorKey: '_majorStats', visible: false, sortable: true },
    actionResult_failed: { label: 'aR failed', key: 'actionResult_failed', _majorKey: '_majorStats', visible: false, sortable: true },
    rowactions: { key: 'rowactions', label: 'a', visible: true, _fixed: true }
  }

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () { this.$fetch() }

  @Watch('tableData', { deep: true })
  tableDataChanged () { this.$fetch() }

  @Watch('updateTable', { deep: true }) updateTableChanged () { if (this.updateTable === true) { this.$fetch() } }

  async fetch () {
    this.isLoading = true
    if (this.fetchOptions.fetchClients) {
      this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
      const params = this.tableData
      await this.$axios.$get('/api/opsidata/clients', { params })
        .then((response) => {
          this.fetchedData = response.result
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = (this as any).$t('message.errortext')
        })
    }
    if (this.fetchOptions.fetchDepotIds) {
      await this.$axios.$get('/api/opsidata/depotIds')
        .then((response) => {
          this.fetchedDataDepotIds = response.result
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = (this as any).$t('message.errortext')
        })
      this.fetchOptions.fetchDepotIds = false
    }
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
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }
}
</script>

<style>

</style>
