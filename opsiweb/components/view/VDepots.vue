<template>
  <GridGTwoColumnLayout breadcrumb="" :showchild="secondColumnOpened">
    <template #parent>
      <div>
        <div class="mt-3">
          <InputIFilter :data="tableData" />
          Selection: {{ selectionDepots }} <br />
          rowID {{ rowId }}
          <TableTTable
            id="tabledepots"
            datakey="depotId"
            :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
            :headers="headerData"
            :items="fetchedData.depots"
            :selection="selectionDepots"
            :onchangeselection="setSelectionDepots"
            :loading="isLoading"
            :totalrows="fetchedData.total"
            :no-local-sorting="true"
            :sort-by.sync="tableData.sortBy"
            :sort-desc.sync="tableData.sortDesc"
            select-mode="multi"
            selectable
          >
            <template #cell(actions)="row">
              <ButtonBTNRowLinkTo
                title="config"
                icon="gear"
                to="/depots/config"
                :ident="row.item.ident"
                :pressed="isRouteActive"
                :click="routeRedirectWith"
              />

              <ButtonBTNRowLinkTo
                title="log"
                icon="file-earmark-text"
                to="/depots/log"
                :ident="row.item.ident"
                :pressed="isRouteActive"
                :click="routeRedirectWith"
              />
            </template>
          </TableTTable>
          <BarBPagination
            :tabledata="tableData"
            :total-rows="fetchedData.total"
            aria-controls="tabledepots"
          />
        </div>
      </div>
    </template>
    <template #child>
      <NuxtChild :id="rowId" />
    </template>
  </GridGTwoColumnLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders } from '~/types/tsettings'
const selections = namespace('selections')
@Component
export default class VDepots extends Vue {
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  rowId: string = ''
  fetchedData: object = {}
  isLoading: boolean = true
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 3,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'sel', visible: true, _fixed: true },
    depotId: { label: 'Id', key: 'depotId', visible: true, _fixed: true },
    description: { label: 'Desc', key: 'description', visible: false },
    type: { label: 'type', key: 'type', visible: false },
    ip: { label: 'ip', key: 'ip', visible: false },
    _empty_: { label: '', key: '_empty_', visible: true, _fixed: true },
    actions: { key: 'actions', label: 'a', visible: true, _fixed: true }
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

  @Watch('tableData', { deep: true }) tableDataChanged () {
    console.log('tableData changed')
    this.$fetch()
  }

  async fetch () {
    this.isLoading = true
    this.fetchedData = (await this.$axios.$post('/api/opsidata/depots', JSON.stringify(this.tableData))).result
    this.isLoading = false
  }
}
</script>

<style>

</style>
