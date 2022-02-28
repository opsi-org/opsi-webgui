<template>
  <div data-testid="VClients">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tableclients">
      <template #parent>
        <div v-if="secondColumnOpened" style="height: 48px" />
        <BarBPageHeader>
          <template #left>
            <TreeTSDepots />
            <TreeTSHostGroupLazyLoad />
          </template>
          <!-- <template #right>
            <CheckboxCBMultiselection :multiselect.sync="ismultiselect" />
          </template> -->
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
          <template #cell(actionResult_failed)="row">
            <ButtonBTNRowLinkTo
              :label="row.item.version_outdated"
              to="/clients/products"
              sortby="actionResult"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
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
                <ModalMDeleteClient :id="row.item.ident.trim()" />
              </b-dropdown>
            </b-badge>
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
import { ITableData, ITableHeaders } from '../../.utils/types/ttable'
const selections = namespace('selections')

@Component export default class VClients extends Vue {
  $axios: any
  $mq: any
  $fetch:any
  $nuxt:any

  // ismultiselect: boolean = false
  rowId: string = ''

  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''

  tableData: ITableData = {
    pageNumber: 1,
    perPage: 15,
    selected: [],
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: ''
  }

  headerData: ITableHeaders = {
    sel: { label: '', key: 'sel', visible: true, _fixed: true, sortable: true },
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

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () { this.$fetch() }
  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }
  // @Watch('ismultiselect', { deep: true }) multiselectChanged () { this.setSelectionClients([]) }

  async fetch () {
    this.isLoading = true
    this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    if (this.tableData.sortBy === 'sel') {
      this.tableData.sortDesc = true
      this.tableData.selected = this.selectionClients
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
    // this.setClientSelection(rowIdent)
    this.$router.push(to)
  }

  // setClientSelection (id: string) {
  //   this.setSelectionClients([id])
  // }

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
