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
          :is-child-layout="secondColumnOpened"
          :is-loading-parent="isLoading"
          :fetch="triggerFetch"
          :enable-ondemand="true"
          :enable-depots="!child || $mq=='mobile'"
          :enable-clients="!child || $mq=='mobile'"
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
              ref="ref-products-localboot"
              :parent-id="id"
              :is-loading="isLoading"
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
              ref="ref-products-netboot"
              :parent-id="id"
              :is-loading="isLoading"
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
    selected: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.selection') as string, key: 'selected', _fixed: true, sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('selected') : true
    },
    installationStatus: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.instStatus') as string, key: 'installationStatus', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('installationStatus') : true
    },
    actionResult: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.actionResult') as string, key: 'actionResult', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('actionResult') : true
    },
    productId: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.productId') as string, key: 'productId', _fixed: true, sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('productId') : true
    },
    desc: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.description') as string, key: 'desc', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('desc') : false
    },
    name: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.name') as string, key: 'name', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('name') : false
    },
    // selectedDepots: { // eslint-disable-next-line object-property-newline
    //   label: this.$t('table.fields.depotIds') as string, key: 'selectedDepots', disabled: true,
    //   visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('selectedDepots') : false
    // },
    // selectedClients: { // eslint-disable-next-line object-property-newline
    //   label: this.$t('table.fields.clientsIds') as string, key: 'selectedClients', disabled: true,
    //   visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('selectedClients') : false
    // },
    version: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.version') as string, key: 'version', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('version') : false
    },
    actionProgress: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.actionProgress') as string, key: 'actionProgress', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('actionProgress') : false
    },
    actionRequest: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.actionRequest') as string, key: 'actionRequest', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('actionRequest') : false
    },
    rowactions: { // eslint-disable-next-line object-property-newline
      key: 'rowactions', label: this.$t('table.fields.rowactions') as string, _fixed: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('rowactions') : true,
      class: 'col-rowactions'
    }
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
      this.tableInfo.sortBy = Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortBy : this.sortby || 'productId'
    }
    this.updateColumnVisibility()
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.updateColumnVisibility()
  }
  // @Watch('tableInfo.sortBy', { deep: true }) selectionClientsChanged () {
  //   this.updateColumnVisibility()
  // }

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
    // this.headerData.selectedClients.disabled = b
    this.headerData.installationStatus.visible = b
    this.headerData.installationStatus.disabled = b
    this.headerData.actionResult.visible = b
    this.headerData.actionResult.disabled = b
    this.headerData.actionRequest.visible = b
    this.headerData.actionRequest.disabled = b
    this.headerData.actionProgress.disabled = b

    // store as new column visibility as cookie
    const visibleItems = {}
    Object.values(this.headerData).filter(k => !k._isMajor).forEach((h) => {
      if (h._majorKey) {
        visibleItems[this.headerData[h._majorKey].key] = h.visible || false
      } else {
        visibleItems[h.key] = h.visible || false
      }
    })
    Cookie.set('column_' + this.id, JSON.stringify(Object.keys(visibleItems).filter(k => visibleItems[k])), { expires: 365 })
  }

  async triggerFetch () {
    await this.$refs['ref-products-localboot'].$fetch()
    await this.$refs['ref-products-netboot'].$fetch()
  }

  async fetchProducts (thiss) {
    this.isLoading = true
    if (thiss.fetchOptions.fetchClients2Depots && thiss.selectionClients.length > 0) {
      await thiss.$axios.$get(`/api/opsidata/clientsdepots?selectedClients=[${thiss.selectionClients}]`)
        .then((response) => {
          thiss.fetchedDataClients2Depots = response
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          // throw new Error(error)
          // const ref = (this.$refs.productsViewAlert as any)
          // ref.alert('Failed to fetch: ClientsToDepots', 'danger', error)
          // thiss.error = thiss.$t('message.error.defaulttext') as string
          // thiss.error += error
        })
      thiss.fetchOptions.fetchClients2Depots = false
    }
    // const lastSyncSortBy = thiss.tableData.sortBy
    // const lastSyncSortDesc = thiss.tableData.sortDesc
    // const tableDataCopy = { ...thiss.tableData }
    if (thiss.fetchOptions.fetchClients) {
      const params = { ...thiss.tableData }
      params.selectedDepots = JSON.stringify(thiss.selectionDepots)
      params.selectedClients = JSON.stringify(thiss.selectionClients)
      if (params.sortBy === 'installationStatus') {
        params.sortBy = '["installationStatus", "installationStatusErrorLevel"]'
      } else if (params.sortBy === 'actionResult') {
        params.sortBy = '["actionResult", "actionResultErrorLevel"]'
      } else if (params.sortBy === 'depotVersions') {
        params.sortBy = 'depot_version_diff'
      } else if (params.sortBy === 'clientVersions') {
        params.sortBy = 'client_version_outdated'
      } else if (params.sortBy === 'desc') {
        params.sortBy = 'description'
      } else if (params.sortBy === '') {
        params.sortBy = 'productId'
      } else if (params.sortBy === 'version') {
        params.sortBy = '["client_version_outdated", "depot_version_diff" ]'
      } else if (params.sortBy === 'selected') {
        params.sortDesc = true
        params.selected = JSON.stringify(thiss.selectionProducts)
        // params.sortBy = '["selected", "productId"]'
      }
      await thiss.$axios.get('/api/opsidata/products', { params })
        .then((response) => {
          thiss.totalItems = response.headers['x-total-count'] || 0
          thiss.$emit('update:total' + thiss.id, thiss.totalItems)
          thiss.totalpages = Math.ceil(thiss.totalItems / params.perPage)
          thiss.items = response.data || []
          // eslint-disable-next-line no-console
          // console.log('products response', JSON.stringify(response))
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          thiss.error = thiss.$t('message.error.defaulttext') as string
          thiss.error += (error as IObjectString2Any).message
          const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
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
    // thiss.tableData.sortBy = lastSyncSortBy
    // thiss.tableData.sortDesc = lastSyncSortDesc
    this.isLoading = false
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
