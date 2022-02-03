<template>
  <div class="tablediv">
    <b-table
      id="table"
      ref="table"
      :items="items"
      sticky-header
      responsive
      primary-key="table"
    />
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData } from '../../.utils/types/ttable'
const selections = namespace('selections')
// import { BTable } from 'bootstrap-vue'
@Component
export default class TTable extends Vue {
  $axios: any
  isLoading: Boolean = false
  items: Array<object> = []
  totalItems: number = 0

  tableData: ITableData = {
    pageNumber: 1,
    perPage: 5,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: () => {},
    setPerPage: () => {}
  }

  @selections.Getter public selectionDepots!: Array<string>

  // created () {
  //   this.fetchItems()
  // }

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
    if (this.items.length === this.totalItems) { return }
    this.isLoading = true
    const newItems = await this.callBackend()
    this.items = this.items.concat(newItems)
    this.isLoading = false
  }

  async callBackend () {
    this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.tableData
    await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.tableData.pageNumber++
        return response.data
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        return this.$t('message.errortext') as string
      })
  }
}
</script>

<style>

</style>
