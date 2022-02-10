<template>
  <div>
    <TableTInfiniteScroll
      id="Depots"
      ref="Depots"
      primary-key="Depots"
      :error="error"
      :is-loading="isLoading"
      :table-data="tableData"
      :header-data="headerData"
      :items="items"
      :total-items="totalItems"
      :totalpages="totalpages"
      :ismultiselect="ismultiselect"
      :selection="selectionDepots"
      :setselection="setSelectionDepots"
      :fetchitems="$fetch"
    >
      <template #head(clientId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </TableTInfiniteScroll>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders } from '../../.utils/types/ttable'
const selections = namespace('selections')
@Component
export default class TDepots extends Vue {
  @Prop({ }) ismultiselect!: boolean

  $axios: any
  $mq: any
  $fetch:any
  $nuxt:any

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
    filterQuery: '',
    setPageNumber: () => {},
    setPerPage: () => {}
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

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }

  async fetch () {
    this.isLoading = true
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
}
</script>
