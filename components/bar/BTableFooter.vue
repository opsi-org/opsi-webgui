<template>
  <div class="BTableFooter">
    <b-navbar
      toggleable="sm"
      data-testid="BarBTableFooter"
      variant="outline-primary"
      :class="{footer: $mq === 'desktop', footer_wrap: $mq === 'mobile'}"
    >
      <b-container fluid>
        <b-navbar-nav small>
          <!-- left -->
        </b-navbar-nav>
        <b-navbar-nav align="center" small class="ml-auto">
          <!-- center -->
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto" small>
          <!-- right -->
          <b-pagination
            v-if="pagination.totalpages > 1"
            v-model="pagination.tableData.pageNumber"
            :total-rows="pagination.totalRows"
            :per-page="pagination.tableData.perPage"
            last-number
          />
          <slot />
        </b-navbar-nav>
      </b-container>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class BarBTableFooter extends Vue {
  $mq: any
  @Prop({ default: () => { return () => { /* default */ } } }) pagination!: any
}
</script>

<style>
.BTableFooter .navbar {
  position: absolute;
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
