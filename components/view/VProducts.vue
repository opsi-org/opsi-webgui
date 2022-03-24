<template>
  <div data-testid="VProducts">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <BarBCollapsePageHeader
          :id="'Products'"
          :title="$t('title.products')"
          :row-id="rowId"
          :collapsed="!secondColumnOpened"
          :collapseable="true"
          :enable-depots="!child"
          :enable-clients="!child"
          :enable-products="true"
          :enable-show-products="false"
          :enable-show-changes="changesProducts.filter((o) => o.user === username).length != 0"
          :table-info="{tableData, headerData}"
          :multiselect-toggler.sync="ismultiselect"
          :redirect-on-close-to="(child)? '/clients/': undefined"
          :redirect="routeRedirectWith"
        />
        <b-tabs class="products_horizontaltabs">
          <b-tab disabled>
            <template #title>
              <small> <b> {{ selectionProducts.length }}/{{ parseInt(localboot) + parseInt(netboot) }} </b> </small>
            </template>
          </b-tab>
          <b-tab :title="$t('title.localboot') + ' (' + localboot + ')'" active>
            <TableTProductsLocalboot
              :table-data="tableDataLocal"
              :header-data="headerData"
              :totallocalboot.sync="localboot"
              :multiselect="ismultiselect"
              :sortby="sortby"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
            />
          </b-tab>
          <b-tab :title="$t('title.netboot') + ' (' + netboot + ')'">
            <TableTProductsNetboot
              :table-data="tableDataLocal"
              :header-data="headerData"
              :totalnetboot.sync="netboot"
              :multiselect="ismultiselect"
              :sortby="sortby"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
            />
          </b-tab>
        </b-tabs>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import Cookie from 'js-cookie'
import { Component, Vue, Watch, Prop, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { ITableData, ITableHeaders } from '~/.utils/types/ttable'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')
@Component
export default class VProducts extends Vue {
  @Prop() child!: boolean;
  @Prop({}) id!: string;
  @Prop({}) sortby!: string;
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @settings.Getter public expert!: boolean;
  @changes.Getter public changesProducts!: Array<ChangeObj>;

  rowId: string = '';
  isLoading: boolean = true;
  ismultiselect: boolean = false;
  localboot: string = ''
  netboot: string = ''

  headerData: ITableHeaders = {
    selected: { label: this.$t('table.fields.selection') as string, key: 'selected', visible: true, _fixed: true, sortable: true },
    installationStatus: { label: this.$t('table.fields.instStatus') as string, key: 'installationStatus', visible: true, sortable: true },
    actionResult: { label: this.$t('table.fields.actionResult') as string, key: 'actionResult', visible: true, sortable: true },
    productId: { label: this.$t('table.fields.productId') as string, key: 'productId', visible: true, _fixed: true, sortable: true },
    desc: { label: this.$t('table.fields.description') as string, key: 'desc', visible: false, sortable: true },
    name: { label: this.$t('table.fields.name') as string, key: 'name', visible: false, sortable: true },
    selectedDepots: { label: this.$t('table.fields.depotIds') as string, key: 'selectedDepots', visible: false, disabled: true },
    selectedClients: { label: this.$t('table.fields.clientsIds') as string, key: 'selectedClients', visible: false, disabled: true },
    version: { label: this.$t('table.fields.version') as string, key: 'version', visible: false, sortable: true },
    actionProgress: { label: this.$t('table.fields.actionProgress') as string, key: 'actionProgress', visible: false, sortable: true },
    actionRequest: { label: this.$t('table.fields.actionRequest') as string, key: 'actionRequest', visible: false, sortable: true, _fixed: false },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true, class: '' }
  }

  tableData: ITableData = {
    type: 'LocalbootProduct',
    pageNumber: 1,
    perPage: 15,
    sortBy: this.sortby ? this.sortby : 'productId',
    sortDesc: false,
    filterQuery: ''
  }

  created () {
    if (Cookie.get('multiselect_products')) {
      this.ismultiselect = JSON.parse(Cookie.get('multiselect_products') as unknown as any)
    }
  }

  mounted () {
    this.updateColumnVisibility()
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.updateColumnVisibility()
  }

  updateColumnVisibility () {
    if (this.selectionClients.length > 0) {
      this.headerData.selectedClients.disabled = true
      this.headerData.installationStatus._fixed = true
      this.headerData.installationStatus.visible = true
      this.headerData.installationStatus.disabled = true
      this.headerData.actionResult._fixed = true
      this.headerData.actionResult.visible = true
      this.headerData.actionResult.disabled = true
      this.headerData.actionRequest._fixed = true
      this.headerData.actionRequest.visible = true
      this.headerData.actionRequest.disabled = true
    } else {
      this.headerData.selectedClients.disabled = false
      this.headerData.installationStatus._fixed = false
      this.headerData.installationStatus.visible = false
      this.headerData.installationStatus.disabled = false
      this.headerData.actionResult._fixed = false
      this.headerData.actionResult.visible = false
      this.headerData.actionResult.disabled = false
      this.headerData.actionRequest._fixed = false
      this.headerData.actionRequest.visible = false
      this.headerData.actionRequest.disabled = false
    }
    // if (this.$mq === 'mobile') {

    // }
  }

  get tableDataLocal () {
    const t = { ...this.tableData }
    t.type = 'LocalbootProduct'
    return t
  }

  get tableDataNet () {
    const t = { ...this.tableData }
    t.type = 'NetbootProduct'
    return t
  }

  @Watch('ismultiselect', { deep: true }) multiselectChanged () {
    Cookie.set('multiselect_products', JSON.stringify(this.ismultiselect), { expires: 365 })
    this.setSelectionProducts([])
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  get username () {
    return localStorage.getItem('username')
  }
}
</script>

<style>
.products_horizontaltabs .nav-item{
  min-width: min-content;
}
.changeslink.btn-link {
  font-weight: bold;
  color: green;
}
</style>
