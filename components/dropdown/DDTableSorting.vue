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
      <b-icon :icon="(sortDesc)? iconnames.sortDesc: iconnames.sort" />
    </template>
    <li>
      <a
        class="dropdown-item"
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
export default class DDTableColumnVisibilty extends BDropdown {
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
