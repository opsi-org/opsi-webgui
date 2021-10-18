<template>
  <div class="BarBPagination-Container" data-testid="BarBTablePagination">
    <b-input-group :prepend="$t('table.perpage')" size="sm" class="BarBPagination-PerPage">
      <b-form-select v-model="localPerPage" :options="options" size="sm" class="BarBPagination-PerPage-Dropdown" data-testid="BarBTablePagination-PerPage"/>
    </b-input-group>
    <b-pagination
      v-model="localPageNumber"
      class="BarBPagination-Pages"
      data-testid="BarBTablePagination-Pagination"
      first-number
      last-number
      size="sm"
      :per-page="localPerPage"
      :total-rows="$props.totalRows"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BPagination } from 'bootstrap-vue'
import { ITableData } from '~/scripts/types/ttable'

@Component
export default class BTablePagination extends BPagination {
  @Prop({}) tabledata!:ITableData
  @Prop({}) totalRows!:Number
  @Prop({ default: false }) open:boolean = false
  get options () { return [1, 2, 5, 10, 20, 30].filter(x => x <= this.totalRows) }
  get localPageNumber () { return this.tabledata.pageNumber }
  set localPageNumber (pn) { this.tabledata.setPageNumber(pn) }
  get localPerPage () { return this.tabledata.perPage }
  set localPerPage (pn) { this.tabledata.setPerPage(pn) }
}
</script>

<style scoped>
.BarBPagination-Container{
  display: inline-flex !important;
  align-items: center !important;
  float: right !important;
  margin-bottom: 10px !important;
  margin-right: 10px !important;
}
.BarBPagination-PerPage {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  display: contents !important;
}
.BarBPagination-Pages{
  margin-left: 25px !important;
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  display: flex !important;
}
.BarBPagination-PerPage-Dropdown {
  max-width: inherit !important;
}
</style>
