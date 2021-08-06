<template>
  <div class="BarBPagination-Container">
    <b-input-group :prepend="$t('table.perpage')" size="sm" class="BarBPagination-PerPage">
      <b-form-select v-model="tabledata.perPage" :options="[1,2,5,10,20,30]" size="sm" class="BarBPagination-PerPage-Dropdown" />
    </b-input-group>
    <b-pagination
      v-model="localPageNumber"
      class="BarBPagination-Pages"
      first-number
      last-number
      size="sm"
      :per-page="tabledata.perPage"
      :total-rows="$props.totalRows"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BPagination } from 'bootstrap-vue'
import { ITableData } from '~/types/ttable'
@Component
export default class UIBBPangination extends BPagination {
  @Prop({}) tabledata!:ITableData;
  get localPageNumber () { return this.tabledata.pageNumber }
  set localPageNumber (pn) { this.tabledata.setPageNumber(pn) }
}
</script>

<style scoped>
.BarBPagination-Container{
  display: inline-flex !important;
  align-items: center !important;
  float: right !important;
  /* min-width: min-content !important; */
}
.BarBPagination-PerPage {
  /* min-width: 150px; */
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  display: contents !important;
}
.BarBPagination-Pages{
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  display: flex !important;
}
.BarBPagination-PerPage-Dropdown {
  max-width: inherit !important;
}
</style>
