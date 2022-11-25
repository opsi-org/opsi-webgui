<template>
  <div
    @mouseover="incontextmenu ? onOver($refs.sortdropdown) : null"
    @mouseleave="incontextmenu ? onLeave($refs.sortdropdown) : null"
    @focusin="incontextmenu ? onOver($refs.sortdropdown) : null"
    @focusout="incontextmenu ? onLeave($refs.sortdropdown) : null"
  >
    <b-dropdown
      v-bind="$props"
      ref="sortdropdown"
      data-testid="DropdownDDTableSorting"
      variant="outline-primary border-0"
      :no-caret="!incontextmenu"
      :title="incontextmenu ? '' : $t('button.sort.tablecolumns')"
      :class="{ 'rightmenu': $mq == 'mobile', 'dropdown-item contextmenu': incontextmenu }"
      :dropright="incontextmenu"
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
.selectedSort .dropdown-item {
  color: var(--light) !important;
  background-color: var(--primary) !important;
}
.rightmenu .dropdown-menu {
  right: 0;
  left: auto;
}
.contextmenu .btn{
  text-align: left;
  padding-left: 0;
  width: 100%;
}
.contextmenu .btn::after {
  float: right;
  margin-top: 10px;
}
</style>
