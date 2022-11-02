<template>
  <div class="BTableFooter">
    <b-navbar
      toggleable="sm"
      data-testid="BTableFooter"
      variant="outline-primary"
      :class="{footer: $mq === 'desktop', footer_wrap: $mq === 'mobile'}"
    >
      <b-container fluid>
        <b-navbar-nav class="ml-auto" small>
          <!-- right -->
          <b-pagination
            v-if="pagination.totalpages > 1"
            v-model="pagination.tableData.pageNumber"
            :total-rows="pagination.totalRows"
            :per-page="pagination.tableData.perPage"
            last-number
            page-class="my-page-item"
          />
          <slot />
        </b-navbar-nav>
      </b-container>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

@Component
export default class BarBTableFooter extends Vue {
  $mq: any
  @Prop({ default: () => { return () => { /* default */ } } }) pagination!: any
  // @Watch('pagination.tableData.pageNumber') pageChanged () { this.colorizePageNumbers() }
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

<style>
.BTableFooter .paginationCurrent {
  background-color: var(--primary) !important;
  border: 1px solid var(--primary) !important;
  color: var(--light) !important;
}

.BTableFooter .navbar {
  bottom: 0px;
  right: 0;
  left: 0;
  margin-top: 10px;
  margin-bottom: 2px;
  display: inline;
  background-image: none !important;
  background-repeat: none !important;
  border: none !important;
}
.BTableFooter .navbar-nav {
  flex-direction: row;
}
.BTableFooter .b-pagination li span,
.BTableFooter .b-pagination li button {
  padding: 8px 12px;
  line-height: 1;
}
.BTableFooter .b-pagination{
  display: flex;
}
.BTableFooter .footer{
  height: var(--height-navbar) !important;
}
.footer_wrap {
  display: flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
}
</style>
