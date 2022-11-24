<template>
  <div
    @mouseover="incontextmenu ? onOver($refs.dropdown) : null"
    @mouseleave="incontextmenu ? onLeave($refs.dropdown) : null"
    @focusin="incontextmenu ? onOver($refs.dropdown) : null"
    @focusout="incontextmenu ? onLeave($refs.dropdown) : null"
  >
    <b-dropdown
      v-bind="$props"
      ref="dropdown"
      data-testid="DropdownDDTableSorting"
      variant="outline-primary border-0"
      :no-caret="!incontextmenu"
      :title="$t('button.sort.tablecolumns')"
      :class="{ 'rightmenu': $mq == 'mobile' }"
    >
      <template #button-content>
        <b-icon :icon="(sortDesc)? iconnames.sortDesc: iconnames.sort" />
        <small v-if="incontextmenu">{{ $t('button.sort.tablecolumns.title') }}</small>
      </template>
      <b-dropdown-form
        inline
        @keydown.prevent="changeSortDirection()"
        @click.prevent="changeSortDirection()"
      >
        <b-form-checkbox :aria-label="$t('button.sort.tablecolumns.sortDirection')" :checked="sortDesc" />
        <span class="sortDirection"> {{ $t('button.sort.tablecolumns.sortDirection') }} </span>
      </b-dropdown-form>
      <li class="li-delimiter" />
      <b-dropdown-item
        v-for="header in Object.values(headerData).filter(h=>h.sortable)"
        :key="header.key"
        :class="{'selectedSort': (sortBy==header.key)}"
        @keydown="changeSortBy(header.key)"
        @click="changeSortBy(header.key)"
      >
        {{ header.label }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableHeader } from '../../.utils/types/ttable'
import { Constants, HoverDropdown } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants, HoverDropdown] })
export default class DDTableSorting extends BDropdown {
  @Prop({ default: '' }) sortBy!: string
  @Prop({ default: false }) sortDesc!: boolean
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeader
  $mq:any
  iconnames: any
  onOver:any
  onLeave:any

  changeSortDirection () { this.$emit('update:sortDesc', (!this.sortDesc)) }
  changeSortBy (key:string) { this.$emit('update:sortBy', key) }
}
</script>
<style>
.selectedSort {
  color: var(--light) !important;
  background-color: var(--primary) !important;
}
.rightmenu .dropdown-menu {
  right: 0;
  left: auto;
}
</style>
