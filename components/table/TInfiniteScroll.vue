<template>
  <div class="tablediv">
    <!-- {{ items }} -->
    <b-table
      id="table"
      ref="table"
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      sticky-header
      responsive
      primary-key="id"
    />
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders } from '../../.utils/types/ttable'
const selections = namespace('selections')
// import { BTable } from 'bootstrap-vue'
@Component
export default class TInfiniteScroll extends Vue {
  $axios: any
  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0

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

  mounted () {
    this.fetchItems()
    const tableScrollBody = (this.$refs.table as any).$el
    tableScrollBody.addEventListener('scroll', this.onScroll)
  }

  onScroll (event) {
    if (
      event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
      if (!this.isLoading) {
        this.fetchItems()
      }
    }
  }

  async fetchItems () {
    this.isLoading = true
    this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.tableData
    await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        // if (this.items.length === this.totalItems) { return }
        this.tableData.pageNumber++
        // console.error('response.data', response.data)
        this.items = this.items.concat(response.data)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        // this.items = this.items.concat(this.$t('message.errortext') as string)
      })
    this.isLoading = false
  }
}
</script>

<style>

</style>
