<template>
  <div data-testid="VProducts">
    <AlertAAlert ref="productsViewAlert" />
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <LazyBarBPageHeader
          v-if="tableloaded"
          :title="$t('title.products')"
          :tableid="id"
          :table-info.sync="tableInfo"
          :is-loading-parent="isLoading"
          :fetch="$fetch"
          navbartype="collapse"
          :childopened="secondColumnOpened"
          :closeroute="(child)? '/clients/': null"
        />
        <b-tabs class="products_horizontaltabs" lazy>
          <b-tab disabled>
            <template #title>
              <small> <b class="count">
                {{ $t('count/all', { count: selectionProducts.length, all: parseInt(localboot) + totalnetboot}) }}
              </b> </small>
            </template>
          </b-tab>
          <b-tab active>
            <template #title>
              <span class="localboot"> {{ $t('title.localboot') + ' (' + localboot + ')' }} </span>
            </template>
            <TableTProductsLocalboot
              ref="ref-products-localboot"
              :parent-id="id"
              :is-loading="isLoading"
              :table-info.sync="tableInfo"
              :totallocalboot.sync="localboot"
              :sort="{sortBy:tableInfo.sortBy, sortDesc:tableInfo.sortDesc}"
              :filter-query="tableInfo.filterQuery"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
              @fetch-products="fetchProducts"
            />
          </b-tab>
          <b-tab>
            <template #title>
              <span class="netboot"> {{ $t('title.netboot') + ' (' + totalnetboot+ ')' }} </span>
            </template>
            <TableTProductsNetboot
              ref="ref-products-netboot"
              :parent-id="id"
              :is-loading="isLoading"
              :table-info="tableInfo"
              :totalnetboot.sync="netboot"
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
  $route:any
  $router:any
  $t:any
  $axios: any
  @Prop() child!: boolean
  @Prop({}) id!: string
  @Prop({}) sortby!: string
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  sortdesc: boolean = false
  rowId: string = ''
  isLoading: boolean = false
  localboot: string = ''
  netboot: string = ''
  totalnetboot: number = 0
  tableloaded: boolean = false

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
    name: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.name') as string, key: 'name', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('name') : false
    },
    desc: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.description') as string, key: 'desc', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('desc') : false
    },
    modificationTime: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.modificationTime') as string, key: 'modificationTime', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('modificationTime') : false
    },
    priority: { // eslint-disable-next-line object-property-newline
      label: this.$t('table.fields.priority') as string, key: 'priority', sortable: true,
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('priority') : false
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
      visible: Cookie.get('column_' + this.id) ? JSON.parse(Cookie.get('column_' + this.id) as unknown as any).includes('rowactions') : false,
      class: 'col-rowactions'
    }
  }

  tableInfo: ITableInfo = {
    sortBy: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortBy : this.sortby || 'productId',
    sortDesc: Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortDesc : this.sortdesc || false,
    filterQuery: '',
    headerData: this.headerData
  }

  mounted () {
    if (this.secondColumnOpened && !this.child) {
      this.$router.push('/products/')
    }
    // if (!this.tableInfo.sortBy) {
    //   this.tableInfo.sortBy = Cookie.get('sorting_' + this.id) ? JSON.parse(Cookie.get('sorting_' + this.id) as unknown as any).sortBy : this.sortby || 'productId'
    // }
    this.updateColumnVisibility()
  }

  async fetch () {
    await this.getNetbootProductsCount()
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.updateColumnVisibility()
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
  }

  async getNetbootProductsCount () {
    const params: any = {}
    params.selectedDepots = JSON.stringify(this.selectionDepots)
    params.type = 'NetbootProduct'
    await this.$axios.$get('/api/opsidata/products/count', { params })
      .then((response) => {
        this.totalnetboot = response
      })
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
    if (this.$refs['ref-products-localboot']) {
      await (this.$refs['ref-products-localboot'] as any).fetchWrapper()
    }
    if (this.$refs['ref-products-netboot']) {
      await (this.$refs['ref-products-netboot'] as any).fetchWrapper()
    }
  }

  async fetchProducts (thiss) {
    thiss.isLoadingTable = true // have to be "thiss" -> overwise sorting breaks - whyever
    if (thiss.fetchOptions.fetchClients2Depots && thiss.selectionClients.length > 0) {
      await thiss.$axios.$get(`/api/opsidata/clientsdepots?selectedClients=[${thiss.selectionClients}]`)
        .then((response) => {
          thiss.fetchedDataClients2Depots = response
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
        })
      thiss.fetchOptions.fetchClients2Depots = false
    }

    if (thiss.fetchOptions.fetchClients) {
      const params = { ...thiss.tableData }
      params.selectedDepots = JSON.stringify(thiss.selectionDepots)
      params.selectedClients = JSON.stringify(thiss.selectionClients)
      if (params.sortBy === 'installationStatus') {
        params.sortBy = '["installationStatus", "installationStatusErrorLevel"]'
      } else if (params.sortBy === 'actionResult') {
        params.sortBy = '["actionResultErrorLevel", "actionResult"]'
      } else if (params.sortBy === 'depotVersions') {
        params.sortBy = 'depot_version_diff'
      } else if (params.sortBy === 'clientVersions') {
        params.sortBy = 'client_version_outdated'
      } else if (params.sortBy === 'desc') {
        params.sortBy = 'description'
      } else if (params.sortBy === '') {
        params.sortBy = 'productId'
      } else if (params.sortBy === 'version') {
        params.sortBy = '["client_version_outdated", "depot_version_diff", "not_on_all_depots" ]'
      } else if (params.sortBy === 'selected') {
        params.sortDesc = true
        params.selected = JSON.stringify(thiss.selectionProducts)
        // params.sortBy = '["selected", "productId"]'
      }
      const myitems = await thiss.$axios.get('/api/opsidata/products', { params })
        .then((response) => {
          thiss.totalItems = response.headers['x-total-count'] || 0
          thiss.$emit('update:total' + thiss.id, thiss.totalItems)
          thiss.totalpages = Math.ceil(thiss.totalItems / params.perPage)
          thiss.items = response.data || []
          thiss.isLoadingTable = false // have to be "thiss" -> overwise sorting breaks - whyever
          const items = response.data || []
          this.tableloaded = true
          return items
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          thiss.error = thiss.$t('message.error.defaulttext') as string
          thiss.error += (error as IObjectString2Any).message
          const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
          const ref = (this.$refs.productsViewAlert as any)
          ref.alert(this.$t('message.error.fetch') as string + 'Products', 'danger', detailedError)
          thiss.isLoadingTable = false // have to be "thiss" -> overwise sorting breaks - whyever
        })
      thiss.setItemsCache(myitems)
      return myitems
    }
  }
}
</script>

<style>
.products_horizontaltabs .nav-item{
  min-width: min-content;
}
</style>