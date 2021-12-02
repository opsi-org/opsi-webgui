<template>
  <div data-testid="VProducts">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <BarBPageHeader>
          <template #left>
            <TreeTSDepots />
            <TreeTSHostGroupLazyLoad />
            <!-- <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" />
          <DropdownDDClientIds v-if="fetchedDataDepotIds.length > 1" /> -->
            <TreeTSProductGroup />
          </template>
          <template #right>
            <CheckboxCBMultiselection :multiselect.sync="ismultiselect" />
            <ModalMProdSaveOverview v-if="expert && changesProducts" :changelist="changesProducts.filter(o => o.user === username)" />
          </template>
        </BarBPageHeader>
        <TableTProductsNetboot :multiselect="ismultiselect" :rowident="rowId" :route-redirect-with="routeRedirectWith" />
        <TableTProductsLocalboot :multiselect="ismultiselect" :rowident="rowId" :route-redirect-with="routeRedirectWith" />
        <ButtonBTNClearSelection store="products" />
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from 'uib-components/.utils/types/tchanges'
// import { ITableData } from 'uib-components/.utils/types/ttable'
// const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')
@Component
export default class VProducts extends Vue {
  // @selections.Getter public selectionClients!: Array<string>
  // @selections.Getter public selectionDepots!: Array<string>
  // @selections.Getter public selectionProducts!: Array<string>
  // @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @settings.Getter public expert!: boolean
  @changes.Getter public changesProducts!: Array<ChangeObj>

  rowId: string = ''
  isLoading: boolean = true
  ismultiselect: boolean = false
  // fetchedDataDepotIds: Array<string> = []
  // fetchOptions: IFetchOptions = { fetchClients: true, fetchClients2Depots: true, fetchDepotIds: true }
  // tableData: ITableData = {
  //   type: 'LocalbootProduct',
  //   pageNumber: 1,
  //   perPage: 5,
  //   sortBy: 'productId',
  //   sortDesc: false,
  //   filterQuery: '',
  //   setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  // }

  // tableDataNetboot: ITableData = {
  //   type: 'NetbootProduct',
  //   pageNumber: 1,
  //   perPage: 3,
  //   sortBy: (this.selectionClients.length > 0) ? 'actionRequest' : 'productId',
  //   sortDesc: false,
  //   filterQuery: '',
  //   setPageNumber: (pn:number) => { this.tableDataNetboot.pageNumber = pn }
  // }

  // @Watch('selectionDepots', { deep: true })
  // selectionDepotsChanged () {
  //   this.fetchedDataClients2Depots = {}
  //   this.fetchOptions.fetchClients2Depots = true
  //   this.$fetch()
  // }

  // @Watch('selectionClients', { deep: true })
  // selectionClientsChanged () {
  //   this.fetchedDataClients2Depots = {}
  //   this.fetchOptions.fetchClients2Depots = true
  //   this.$fetch()
  //   this.updateColumnVisibility()
  // }

  // @Watch('tableData', { deep: true })
  // tableDataChanged () { this.$fetch() }

  // mounted () {
  //   this.updateColumnVisibility()
  // }

  // async beforeMount () {
  //   this.tableData.selectedDepots = this.selectionDepots
  //   this.tableData.selectedClients = this.selectionClients
  //   if (this.tableData.sortBy === 'depotVersions') { this.tableData.sortBy = 'depot_version_diff' }
  //   if (this.tableData.sortBy === 'clientVersions') { this.tableData.sortBy = 'client_versoin_outdated' }
  //   this.fetchedData = (await this.$axios.$post(
  //     '/api/opsidata/products',
  //     JSON.stringify(this.tableData)
  //   )).result
  // }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
  }

  // isRouteActive (to: string, rowIdent: string) {
  //   return this.$route.path.includes(to) && this.rowId === rowIdent
  // }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  get username () {
    return localStorage.getItem('username')
  }
}
</script>
