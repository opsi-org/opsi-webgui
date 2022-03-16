<template>
  <div data-testid="VDepots">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tabledepots">
      <template #parent>
        <TableTInfiniteScroll
          id="Depots"
          ref="Depots"
          primary-key="Depots"
          rowident="depotId"
          :error="error"
          :is-loading="isLoading"
          :table-data="tableData"
          :header-data="headerData"
          :items="items"
          :total-items="totalItems"
          :totalpages="totalpages"
          :ismultiselect="true"
          :selection="selectionDepots"
          :setselection="setSelectionDepots"
          :fetchitems="$fetch"
        >
          <template #head(depotId)>
            <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
          </template>
          <template #cell(depotId)="row">
            <b v-if="row.item.depotId==opsiconfigserver">
              {{ row.item.depotId }}
            </b>
            {{(row.item.depotId!=opsiconfigserver) ? row.item.depotId:''}}
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
        </TableTInfiniteScroll>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders } from '../../.utils/types/ttable'
const selections = namespace('selections')
const cache = namespace('data-cache')

@Component export default class VDepots extends Vue {
  $axios: any
  $fetch: any
  $mq: any

  rowId: string = ''
  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''

  tableData: ITableData = {
    pageNumber: 1,
    perPage: 15,
    sortBy: 'depotId',
    sortDesc: false,
    filterQuery: ''
  }

  headerData: ITableHeaders = {
    selected: { label: '', key: 'selected', visible: true, _fixed: true, sortable: true },
    depotId: { label: this.$t('table.fields.id') as string, key: 'depotId', visible: true, _fixed: true, sortable: true },
    description: { label: this.$t('table.fields.description') as string, key: 'description', visible: false, sortable: true },
    type: { label: this.$t('table.fields.type') as string, key: 'type', visible: false, sortable: true },
    ip: { label: this.$t('table.fields.ip') as string, key: 'ip', visible: false, sortable: true },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true }
  }

  @cache.Getter public opsiconfigserver!: string
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }

  mounted () {
    if (this.$mq === 'desktop' && this.selectionDepots.length === 1 && this.selectionDepots[0] === this.opsiconfigserver) {
      this.routeRedirectWith('/depots/config', this.opsiconfigserver)
    }
  }

  async fetch () {
    this.isLoading = true
    if (this.tableData.sortBy === 'selected') {
      this.tableData.sortDesc = true
      this.tableData.sortBy = 'selected'
      this.tableData.selected = JSON.stringify(this.selectionDepots)
    }
    const params = this.tableData
    await this.$axios.get('/api/opsidata/depots', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / this.tableData.perPage)
        if (response.data === null) {
          this.items = []
        } else {
          this.items = response.data
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.error = this.$t('message.errortext') as string
      })
    this.isLoading = false
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
}
</script>
