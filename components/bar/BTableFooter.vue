<template>
  <div class="fixed-bottom">
    <b-navbar
      toggleable="md"
      fixed="bottom"
      data-testid="BarBTableFooter"
      variant="outline-primary"
      :class="{auth_footer: $mq === 'desktop', auth_footer_wrap: $mq === 'mobile'}"
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
            v-model="pagination.tableData.pageNumber"
            :total-rows="pagination.totalRows"
            :per-page="pagination.tableData.perPage"
            last-number
          />
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
.fixed-bottom .navbar {
  margin-bottom: 0;
}
.auth_footer{
  height: var(--height-navbar) !important;
}
.auth_footer_wrap {
  display: flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
}
</style>
