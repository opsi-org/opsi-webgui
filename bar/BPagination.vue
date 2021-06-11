<template>
    <!-- v-if="$props.totalRows > tabledata.perPage" -->
  <b-pagination
    v-model="localPageNumber"
    class="BarBPagination"
    first-number
    last-number
    size="sm"
    align="fill"
    :per-page="tabledata.perPage"
    :total-rows="$props.totalRows"
  />
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BPagination } from 'bootstrap-vue'
import { ITableData } from '~/types/tsettings'
@Component
export default class UIBBPangination extends BPagination {
  @Prop({}) tabledata!:ITableData;
  get localPageNumber () { return this.tabledata.pageNumber }
  set localPageNumber (pn) { this.tabledata.setPageNumber(pn) }
}
</script>

<style scoped>
.BarBPagination{
  display: flex !important;
}
</style>
