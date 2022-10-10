<template>
  <div v-if="onhover!==false" @mouseover="onOver" @mouseleave="onLeave" @focusin="onOver" @focusout="onLeave">
    <b-dropdown
      ref="dropdown"
      v-bind="$props"
      data-testid="DropdownDDTableSorting"
      lazy
      :no-caret="incontextmenu == false"
      :toggle-tag="incontextmenu !== false ? 'li': 'button'"
      :variant="incontextmenu !== false ? 'outline-primary': 'outline-primary'"
      size="sm"
      alt="Show column"
      class="DropdownDDTableSorting fixed_column_selection noborder w-100 text-left"
      :class="{ 'absolutright': (incontextmenu !== false) }"
      :toggle-class="{
        'DropdownDDTableSortingBtn w-100 h-100 text-left': true,
        'dropdown-item': (incontextmenu !== false) }"
      :title="$t('button.sort.tablecolumns')"
    >
      <!-- dropleft -->
      <template #button-content>
        <b-icon :icon="(sortDesc)? iconnames.sortDesc: iconnames.sort" />
        {{ incontextmenu !== false ? $t('button.sort.tablecolumns.title'): '' }}
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
          <span class="sortDirection"> {{ $t('button.sort.tablecolumns.sortDirection') }} </span>
        </a>
      </li>
      <li class="li-delimiter" />
      <li
        v-for="header in Object.values(headerData).filter(h=>h.sortable)"
        :key="header.key"
        :class="{'selected': (sortBy==header.key)}"
        variant="primary"
        @keydown="changeSortBy(header.key)"
        @click="changeSortBy(header.key)"
      >
        <a class="bg-secondary">
          {{ header.label }}
        </a>
        {{ (sortBy==header.key) }}
      </li>
    </b-dropdown>
  </div>
  <b-dropdown
    v-else
    v-bind="$props"
    data-testid="DropdownDDTableSorting"
    dropright
    lazy
    :no-caret="incontextmenu == false"
    :toggle-tag="incontextmenu !== false ? 'li': 'button'"
    :variant="incontextmenu !== false ? 'outline-primary': 'outline-primary'"
    size="sm"
    alt="Show column"
    class="DropdownDDTableSorting fixed_column_selection noborder w-100 text-left"
    :class="{ 'absolutright': (incontextmenu !== false) }"
    :toggle-class="{
      'DropdownDDTableSortingBtn w-100 h-100 text-left': true,
      'dropdown-item': (incontextmenu !== false) }"
    :title="$t('button.sort.tablecolumns')"
  >
    <!-- dropleft -->
    <template #button-content>
      <b-icon :icon="(sortDesc)? iconnames.sortDesc: iconnames.sort" />
      <small v-if="incontextmenu !== false" style="font-size: 85%;">{{ $t('button.sort.tablecolumns.title') }}</small>
    </template>
    <b-dropdown-form
      @keydown.prevent="changeSortDirection()"
      @click.prevent="changeSortDirection()"
    >
      <b-form-checkbox
        :checked="sortDesc"
      />
      <small class="sortDirection"> {{ $t('button.sort.tablecolumns.sortDirection') }} </small>
    </b-dropdown-form>
    <li class="li-delimiter" />
    <b-dropdown-form
      v-for="header in Object.values(headerData).filter(h=>h.sortable)"
      :key="header.key"
      :class="{'selected': (sortBy==header.key)}"
      class="dropdown-item"
      variant="primary"
      @keydown="changeSortBy(header.key)"
      @click="changeSortBy(header.key)"
    >
      <small>{{ header.label }}</small>
    </b-dropdown-form>
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
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: false }) onhover!: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeader

  changeSortDirection () { this.$emit('update:sortDesc', (!this.sortDesc)) }
  changeSortBy (key:string) { this.$emit('update:sortBy', key) }

  onOver () {
    if (this.$refs.dropdown) {
      this.$refs.dropdown.visible = true
    }
  }

  onLeave () {
    if (this.$refs.dropdown) {
      this.$refs.dropdown.visible = false
    }
  }
}
</script>
<style>
.DropdownDDTableSorting {
  max-width: fit-content !important;
  /* max-height: inherit !important; */
  max-height: var(--component-height) !important;
  display: unset !important;
}
.DropdownDDTableSorting.absolutright {
  min-width: 100% !important;
  width: 100% !important;
}
.DropdownDDTableSortingBtn {
  height: 100%;
  max-height: var(--component-height) !important;
}
.DropdownDDTableSortingBtn::after {
  float: right;
  margin-top: 10px;
}
.DropdownDDTableSorting .dropdown-menu {
  min-width: 220px !important;
  max-width: 350px !important;
  height: max-content !important;
  z-index: 300 !important;
  /* left: 25px !important; */
}
.DropdownDDTableSorting .dropdown-menu .dropdown-item {
  /* padding-top: 2px !important;
  padding-bottom: 2px !important;
  padding-left: 2px !important;
  padding-right: 2px !important; */
  /* margin: 0px !important; */
}
.DropdownDDTableSorting .dropdown-menu .dropdown-item:hover {
  /* background-color: var(--light); */
  /* background-color: initial; */
  /* display: block !important; */
  display: inline-flex !important;
}
.DropdownDDTableSorting .dropdown-menu li {
  cursor: pointer;
  padding-left: 5px;
  padding-right: 5px;
  white-space: normal;
  font-weight: 300 !important;
}
.DropdownDDTableSorting .dropdown-menu li .b-dropdown-form {
  margin: 0px !important;
  padding: 0px !important;
  padding-left: 15px !important;
  padding-right: 15px !important;
}
.DropdownDDTableSorting .dropdown-menu li .b-dropdown-form .custom-control {
  display: inline-block;
  padding-bottom: 5px !important;
}
.DropdownDDTableSorting.absolutright > li {
  border: unset !important;
  /* color: var(--light) !important; */
}
.DropdownDDTableSorting.absolutright > li:hover {
  border: unset !important;
  /* color: var(--light) !important; */
}
.DropdownDDTableSorting  .dropdown-menu li.selected {
  color: var(--light) !important;
  background-color: var(--primary) !important;
}
.DropdownDDTableSorting .noborder .btn-outline-primary{
  border: 0;
  box-shadow: none;
}
</style>
