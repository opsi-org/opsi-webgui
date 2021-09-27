<template>
  <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tabledepots">
    <template #parent>
      <BarBPageHeader v-if="$mq=='mobile'">
        <template #left>
          <InputIFilter v-if="$mq=='mobile'" :data="tableData" :additional-title="$t('table.fields.id')" />
        </template>
        <template #right>
          <DropdownDDTableColumnVisibilty v-if="$mq=='mobile'" :headers="headerData" />
        </template>
      </BarBPageHeader>
      <TableTCollapseableForMobile
        id="tabledepots"
        small
        datakey="depotId"
        :collapseable="false"
        :tabledata="tableData"
        :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
        :headers="headerData"
        :items="fetchedData.depots"
        :selection="selectionDepots"
        :onchangeselection="setSelectionDepots"
        :error-text="errorText"
        :busy="isLoading"
        :totalrows="fetchedData.total"
      >
        <template #head(depotId)>
          <InputIFilter ref="IFilterDepots" :data="tableData" :additional-title="$t('table.fields.id')" />
        </template>
        <template #cell(rowactions)="row">
          <ButtonBTNRowLinkTo
            :title="$t('title.config')"
            icon="gear"
            to="/depots/config"
            :ident="row.item.ident"
            :pressed="isRouteActive"
            :click="routeRedirectWith"
          />
        </template>
        <template #pagination>
          <BarBPagination
            :tabledata="tableData"
            :total-rows="fetchedData.total"
            aria-controls="tabledepots"
          />
        </template>
      </TableTCollapseableForMobile>
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

@Component export default class VDepots extends Vue {
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  rowId: string = ''
  fetchedData: object = {}
  errorText: string = ''
  isLoading: boolean = true
  tableData: ITableData = {
    pageNumber: 1,
    perPage: 10,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: (pn:number) => { this.tableData.pageNumber = pn }
  }

  headerData: ITableHeaders = {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    depotId: { label: this.$t('table.fields.id') as string, key: 'depotId', visible: true, _fixed: true, sortable: true },
    description: { label: this.$t('table.fields.description') as string, key: 'description', visible: false, sortable: true },
    type: { label: this.$t('table.fields.type') as string, key: 'type', visible: false, sortable: true },
    ip: { label: this.$t('table.fields.ip') as string, key: 'ip', visible: false, sortable: true },
    // _empty_: { label: this.$t('', key: '_empty_') as string, visible: true, _fixed: true },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true }
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
    // eslint-disable-next-line no-console
    console.log('tableData changed')
    this.$fetch()
  }

  async fetch () {
    this.isLoading = true
    const params = this.tableData
    await this.$axios.$get('/api/opsidata/depots', { params })
      .then((response) => {
        this.fetchedData = response.result
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.errorText = this.$t('message.errortext') as string
      })
    this.isLoading = false
  }
}
</script>
