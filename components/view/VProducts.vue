<template>
  <div data-testid="VProducts">
    <AlertAAlert ref="productsViewAlert" />
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <!-- TODO: Test multiselect=true, if its fine, remove table select mode settings-->
        <!-- :multiselect-toggler.sync="ismultiselect" -->
        <BarBCollapsePageHeader
          :id="id"
          :title="$t('title.products')"
          :row-id="rowId"
          :collapsed="$mq=='mobile' || secondColumnOpened"
          :collapseable="true"
          :enable-depots="!child"
          :enable-clients="!child"
          :enable-products="true"
          :enable-show-products="false"
          :table-info="tableInfo"
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
              :parent-id="id"
              :header-data.sync="tableInfo.headerData"
              :totallocalboot.sync="localboot"
              :multiselect="ismultiselect"
              :sort="{sortBy:tableInfo.sortBy, sortDesc:tableInfo.sortDesc}"
              :filter-query="tableInfo.filterQuery"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
              @fetch-products="fetchProducts"
            />
          </b-tab>
          <b-tab :title="$t('title.netboot') + ' (' + netboot + ')'">
            <TableTProductsNetboot
              :parent-id="id"
              :header-data="tableInfo.headerData"
              :totalnetboot.sync="netboot"
              :multiselect="ismultiselect"
              :sort="{sortBy:tableInfo.sortBy, sortDesc:tableInfo.sortDesc}"
              :filter-query="tableInfo.filterQuery"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
              @fetch-products="fetchProducts"
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
import { ITableHeaders, ITableInfo } from '~/.utils/types/ttable'
import { IObjectString2Any } from '~/.utils/types/tgeneral'
const selections = namespace('selections')
const settings = namespace('settings')
@Component
export default class VProducts extends Vue {
  $mq: any
  @Prop() child!: boolean
  @Prop({}) id!: string
  @Prop({}) sortby!: string
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  sortdesc: boolean = false
  rowId: string = ''
  isLoading: boolean = true
  ismultiselect: boolean = true
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

  tableInfo: ITableInfo = {
    sortBy: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortBy : this.sortby || 'productId',
    sortDesc: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortDesc : this.sortdesc || false,
    filterQuery: '',
    headerData: this.headerData
  }

  // created () {
  //   if (Cookie.get('multiselect_products')) {
  //     this.ismultiselect = JSON.parse(Cookie.get('multiselect_products') as unknown as any)
  //   }
  // }

  mounted () {
    if (this.secondColumnOpened && !this.child) {
      this.$router.push('/products/')
    }
    if (!this.tableInfo.sortBy) {
      this.tableInfo.sortBy = 'productId'
    }
    this.updateColumnVisibility()
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.updateColumnVisibility()
  }

  // @Watch('ismultiselect', { deep: true }) multiselectChanged () {
  //   Cookie.set('multiselect_products', JSON.stringify(this.ismultiselect), { expires: 365 })
  //   this.setSelectionProducts([])
  // }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
  }

  updateColumnVisibility () {
    const b = (this.selectionClients.length > 0)
    this.headerData.selectedClients.disabled = b
    this.headerData.installationStatus._fixed = b
    this.headerData.installationStatus.visible = b
    this.headerData.installationStatus.disabled = b
    this.headerData.actionResult._fixed = b
    this.headerData.actionResult.visible = b
    this.headerData.actionResult.disabled = b
    this.headerData.actionRequest._fixed = b
    this.headerData.actionRequest.visible = b
    this.headerData.actionRequest.disabled = b
    this.headerData.actionProgress.disabled = b
  }

  async fetchProducts (thiss) {
    thiss.isLoading = true
    if (thiss.fetchOptions.fetchClients2Depots && thiss.selectionClients.length > 0) {
      await thiss.$axios.$get(`/api/opsidata/clients/depots?selectedClients=[${thiss.selectionClients}]`)
        .then((response) => {
          thiss.fetchedDataClients2Depots = response
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          // const ref = (this.$refs.productsViewAlert as any)
          // ref.alert('Failed to fetch: ClientsToDepots', 'danger', error)
          thiss.error = thiss.$t('message.error.defaulttext') as string
          thiss.error += error
        })
      thiss.fetchOptions.fetchClients2Depots = false
    }

    if (thiss.fetchOptions.fetchClients) {
      thiss.tableData.selectedDepots = JSON.stringify(thiss.selectionDepots)
      thiss.tableData.selectedClients = JSON.stringify(thiss.selectionClients)
      if (thiss.tableData.sortBy === 'depotVersions') { thiss.tableData.sortBy = 'depot_version_diff' }
      if (thiss.tableData.sortBy === 'clientVersions') { thiss.tableData.sortBy = 'client_version_outdated' }
      if (thiss.tableData.sortBy === 'version') { thiss.tableData.sortBy = '[client_version_outdated, depot_version_diff ]' }
      if (thiss.tableData.sortBy === 'desc') { thiss.tableData.sortBy = 'description' }
      if (thiss.tableData.sortBy === '') { thiss.tableData.sortBy = 'productId' }
      if (thiss.tableData.sortBy === 'selected') {
        thiss.tableData.sortDesc = true
        thiss.tableData.selected = JSON.stringify(thiss.selectionProducts)
      }
      const params = thiss.tableData
      await thiss.$axios.get('/api/opsidata/products', { params })
        .then((response) => {
          thiss.totalItems = response.headers['x-total-count'] || 0
          thiss.$emit('update:total' + thiss.id, thiss.totalItems)
          thiss.totalpages = Math.ceil(thiss.totalItems / thiss.tableData.perPage)
          thiss.items = response.data || []
        }).catch((error) => {
          thiss.error = thiss.$t('message.error.defaulttext') as string
          thiss.error += (error as IObjectString2Any).message
          const detailedError = (error.message) ? error.message : '' + ' ' + (error.details) ? error.details : ''
          const ref = (this.$refs.productsViewAlert as any)
          ref.alert(this.$t('message.error.fetch') as string + 'Products', 'danger', detailedError)
        })
      // try {
      //   const params = thiss.tableData
      //   const response = (await thiss.$axios.get('/api/opsidata/products', { params }))
      //   thiss.totalItems = response.headers['x-total-count'] || 0

      //   thiss.$emit('update:total' + thiss.id, thiss.totalItems)
      //   thiss.totalpages = Math.ceil(thiss.totalItems / thiss.tableData.perPage)
      //   thiss.items = response.data || []
      // } catch (error) {
      //   thiss.error = thiss.$t('message.errortext') as string
      //   thiss.error += (error as IObjectString2Any).message
      //   const detailedError = (error.message) ? error.message : '' + ' ' + (error.details) ? error.details : ''
      //   const ref = (this.$refs.productsViewAlert as any)
      //   ref.alert(this.$t('message.error.fetch') as string + 'Products', 'danger', detailedError)
      //   // TODO: Error for: {"type":"LocalbootProduct","pageNumber":5,"perPage":5,"sortBy":"productId","sortDesc":false,"filterQuery":"","selectedDepots":["bonifax.uib.local","bonidepot.uib.local"],"selectedClients":["anna-tp-t14.uib.local","akunde1.uib.local"]} (important: pagenumber, perpage, clients bzw product zB 7zip)
      // }
    }
    thiss.isLoading = false
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
