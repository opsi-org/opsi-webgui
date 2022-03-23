<template>
  <b-dropdown
    v-bind="$props"
    data-testid="DropdownDDTableSort"
    no-caret
    right
    lazy
    variant="outline-primary"
    size="sm"
    alt="Show column"
    class="DropdownDDTableSort fixed_column_selection noborder"
    :title="$t('button.sort.tablecolumns')"
  >
    <!-- dropleft -->
    <template #button-content>
      <b-icon :icon="(tableData.sortDesc)? iconnames.sortDesc: iconnames.sort" />
    </template>
    <li>
      <a
        class="dropdown-item"
        @click.prevent="changeSortDirection()"
      >
        <b-form-checkbox
          :checked="tableData.sortDesc"
        />
        <!-- :name="'hi'" -->
        {{ $t('button.sort.tablecolumns.sortDirection') }}
      </a>
      <a
        v-for="header in Object.values(headers).filter(h=>h.sortable)"
        :key="header.key"
        class="dropdown-item"
        :class="{
          'selected':tableData.sortBy==header.key,
        }"
        variant="primary"
        @click="changeSortBy(header.key)"
      >
        {{ header.label }}
      </a>
    </li>
  </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableData, ITableHeader } from '../../.utils/types/ttable'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class DDTableColumnVisibilty extends BDropdown {
  $mq:any
  iconnames: any
  @Prop({ default: 'table' }) tableId!: string
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeader
  @Prop({ default: () => { return () => { /* default */ } } }) tableData!: ITableData

  changeSortDirection () {
    this.tableData.sortDesc = !this.tableData.sortDesc
    console.log('new sort direction desc ', this.tableData.sortDesc)
  }

  changeSortBy (key:string) {
    this.tableData.sortBy = key
  }
}
</script>
<style>
.DropdownDDTableSort {
  max-width: fit-content !important;
  max-height: fit-content !important;
  display: unset !important;
}
.DropdownDDTableSort .dropdown-menu {
  height: max-content !important;
  z-index: 3 !important;
  /* position: sticky; */
}
.DropdownDDTableSort .dropdown-menu .dropdown-item {
  cursor: pointer;
  display: flex !important;
}
.DropdownDDTableSort a.selected {
  background-color: var(--primary);
}
.DropdownDDTableSort .noborder .btn-outline-primary{
  border: 0;
  box-shadow: none;
}
</style>
