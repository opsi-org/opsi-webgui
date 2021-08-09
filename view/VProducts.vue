<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened">
    <template #parent>
      <BarBPageHeader>
        <template #left>
          <DropdownDDDepotIds />
          <DropdownDDClientIds />
          <!-- <DropdownDDDepotIds v-if="fetchedDataDepotIds.length > 1" />
          <DropdownDDClientIds v-if="fetchedDataDepotIds.length > 1" /> -->
          <TreeTSProductGroup />
        </template>
        <template #right>
          <ModalMProdSaveOverview />
        </template>
      </BarBPageHeader>
      <TableTProductsNetboot />
      <TableTProductsLocalboot />
      <b>Selection: </b> <br>
      Depots : {{ selectionDepots }} <br>
      Clients: {{ selectionClients }} <br>
      Products: {{ selectionProducts }} <br>
      <!-- Product Changes: {{ productChanges }} <br> -->
      <!-- Sorting By: <b>{{ tableData.sortBy }}</b>, Sort Direction:
      <b>{{ tableData.sortDesc ? 'Descending' : 'Ascending' }}</b> -->
      <!-- rowID {{ rowId }} <br>
      Filter Query: {{ tableData.filterQuery }} -->
    </template>
    <template #child>
      <NuxtChild :id="rowId" :as-child="true" />
    </template>
  </GridGTwoColumnLayout>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
// import { ITableData } from '~/types/ttable'
const selections = namespace('selections')
@Component
export default class VProducts extends Vue {
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  rowId: string = ''
  isLoading: boolean = true
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
