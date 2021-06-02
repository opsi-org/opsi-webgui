<template>
  <GridGTwoColumnLayout breadcrumb="" :showchild="secondColumnOpened">
    <template #parent>
      <div>
        <div class="mt-3">
          <InputIFilter v-model="tableData.filterQuery" />
          Selection: {{ selectionDepots }}
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
            sort-icon-left
            select-mode="multi"
            selectable
            striped
            hover
          >
            <template #cell(actions)="row">
              <b-button
                :to="{ path: '/depots/config', params: { id: row.item.last_name }}"
                :class="{'nuxt-link-active': isRouteActive('/depots/config')}"
                @click="rowId = row.item.ident;"
              >
                config
              </b-button>
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
export default class VClients extends Vue {
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  rowId: string = ''
  fetchedData: object = {}
  isLoading: boolean = true
  secondColumnOpened: boolean = false
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

  isRouteActive (id: string) {
    if (this.$route.path.includes(id)) {
      this.secondColumnOpened = true
    } else {
      this.secondColumnOpened = false
    }
  }

  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }

  async fetch () {
    this.isLoading = true
    this.fetchedData = (await this.$axios.$post('/api/opsidata/depots', JSON.stringify(this.tableData))).result
    this.isLoading = false
  }
}
</script>

<style>

</style>
