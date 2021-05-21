<template>
  <!-- v-model="tableData.pageNumber" -->
  <!-- :per-page="tableData.perPage"
  :total-rows="fetchedData.total" -->
  <!-- aria-controls="tableclients" -->
  <b-pagination
    class="BarBPagination"
    v-bind="$props"
    first-number
    last-number
    size="sm"
    align="fill"
  />
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator'
import { BPagination } from 'bootstrap-vue'
@Component
export default class BBreadcrumbRow extends BPagination {
}
</script>

<style scoped>
.BarBPagination{
  display: flex !important;
}
</style>
