<template>
  <b-navbar
    toggleable="sm"
    data-testid="BTableFooter"
    variant="outline-primary"
    :class="{footer: $mq !== 'mobile', footer_wrap: $mq === 'mobile'}"
  >
    <b-navbar-nav class="ml-auto" small>
      <b-pagination
        v-if="pagination.totalpages > 1"
        v-model="pagination.tableData.pageNumber"
        size="sm"
        :total-rows="pagination.totalRows"
        :per-page="pagination.tableData.perPage"
        last-number
        page-class="my-page-item"
      />
      <slot />
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

@Component
export default class BarBTableFooter extends Vue {
  $mq: any
  @Prop({ default: () => { return () => { /* default */ } } }) pagination!: any
  @Watch('pagination.cache_pages.first_page_number') firstPageChanged () { this.colorizePageNumbers() }
  @Watch('pagination.cache_pages.last_page_number') lastPageChanged () { this.colorizePageNumbers() }

  colorizePageNumbers () {
    const elPagination = document.querySelectorAll('.pagination.b-pagination .my-page-item')
    elPagination.forEach((el) => {
      const btn = el.children[0] as HTMLElement

      if (btn.textContent === this.pagination.cache_pages.first_page_number.toString() ||
          btn.textContent === this.pagination.cache_pages.last_page_number.toString()) {
        btn.classList.add('paginationCurrent')
      } else {
        btn.classList.remove('paginationCurrent')
      }
    })
  }
}
</script>
