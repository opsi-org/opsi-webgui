<template>
  <b-dropdown
    v-bind="$props"
    data-testid="DropdownDDTableSorting"
    no-caret
    right
    lazy
    variant="outline-primary"
    size="sm"
    alt="Show column"
    class="DropdownDDTableSorting fixed_column_selection noborder w-100 text-left"
    :toggle-class="{ 'DropdownDDTableSortingBtn w-100 h-100 text-left': true}"
    :title="$t('button.sort.tablecolumns')"
  >
    <!-- dropleft -->
    <template #button-content>
      <b-icon :icon="(sortDesc)? iconnames.sortDesc: iconnames.sort" />
    </template>
    <li>
      <a
        class="dropdown-item"
        @keydown.prevent="changeSortDirection()"
        @click.prevent="changeSortDirection()"
      >
        <b-form-checkbox
          :checked="sortDesc"
        />
        <!-- :name="'hi'" -->
        {{ $t('button.sort.tablecolumns.sortDirection') }}
      </a>
      <a
        v-for="header in Object.values(headerData).filter(h=>h.sortable)"
        :key="header.key"
        class="dropdown-item"
        :class="{
          'selected':sortBy==header.key,
        }"
        variant="primary"
        @keydown="changeSortBy(header.key)"
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
import { ITableHeader } from '../../.utils/types/ttable'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class DDTableSorting extends BDropdown {
  $mq:any
  iconnames: any
  @Prop({ default: '' }) sortBy!: string
  @Prop({ default: false }) sortDesc!: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeader

  changeSortDirection () { this.$emit('update:sortDesc', (!this.sortDesc)) }
  changeSortBy (key:string) { this.$emit('update:sortBy', key) }
}
</script>
<style>
.DropdownDDTableSorting {
  max-width: fit-content !important;
  /* max-height: inherit !important; */
  max-height: var(--component-height) !important;
  display: unset !important;
}
.DropdownDDTableSortingBtn {
  height: 100%;
  max-height: var(--component-height) !important;
}
.DropdownDDTableSorting .dropdown-menu {
  min-width: 220px !important;
  max-width: 250px !important;
  height: max-content !important;
  z-index: 3 !important;
  /* position: sticky; */
}
.DropdownDDTableSorting .dropdown-menu .dropdown-item {
  cursor: pointer;
  display: flex !important;
  /* flex-wrap: wrap; */
  padding-left: 1.2rem;
  padding-right: 5px;
  white-space: normal;
  font-weight: normal !important;
}
.DropdownDDTableSorting a.selected {
  background-color: var(--primary);
}
.DropdownDDTableSorting .noborder .btn-outline-primary{
  border: 0;
  box-shadow: none;
}
</style>
