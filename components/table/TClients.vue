<template>
  <div>
    <TableTInfiniteScroll
      id="tableclients"
      ref="tableclients"
      primary-key="tableclients"
      :error="error"
      :is-loading="isLoading"
      :table-data="tableData"
      :header-data="headerData"
      :items="items"
      :total-items="totalItems"
      :totalpages="totalpages"
      :ismultiselect="ismultiselect"
      :selection="selectionClients"
      :setselection="setSelectionClients"
      :fetchitems="$fetch"
    >
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
export default class TClients extends Vue {
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
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: () => {},
    setPerPage: () => {}
  }

  headerData: ITableHeaders = {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    clientId: { label: this.$t('table.fields.id') as string, key: 'clientId', visible: true, _fixed: true, sortable: true },
    description: { label: this.$t('table.fields.description') as string, key: 'description', visible: false, sortable: true },
    ipAddress: { label: this.$t('table.fields.ip') as string, key: 'ipAddress', visible: false, sortable: true },
    macAddress: { label: this.$t('table.fields.hwAddr') as string, key: 'macAddress', visible: false, sortable: true },
    _majorStats: { label: this.$t('table.fields.stats') as string, key: '_majorStats', _isMajor: true, visible: false },
    version_outdated: { label: this.$t('table.fields.versionOutdated') as string, key: 'version_outdated', _majorKey: '_majorStats', visible: true, sortable: true },
    actionResult_failed: { label: this.$t('table.fields.actionRequestFailed') as string, key: 'actionResult_failed', _majorKey: '_majorStats', visible: true, sortable: true },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true }
  }

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () { this.$fetch() }
  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }

  async fetch () {
    this.isLoading = true
    this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.tableData
    await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / this.tableData.perPage)
        if (response.data === null) {
          this.items = []
        } else {
          this.items = response.data
        }
        // this.items = this.items.concat(response.data)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.error = this.$t('message.errortext') as string
      })
    this.isLoading = false
  }
}
</script>
