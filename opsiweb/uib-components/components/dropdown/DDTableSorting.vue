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
      size="sm"
      data-testid="DropdownDDTableSorting"
      class="DDTableSorting"
      :variant="incontextmenu? 'transparent border-0' : 'outline-primary border-0'"
      :no-caret="!incontextmenu"
      :title="incontextmenu ? '' : $t('button.sort.tablecolumns')"
      :class="{ 'rightmenu': $mq == 'mobile', 'dropdown-item contextmenu': incontextmenu }"
      :dropright="incontextmenu"
    >
      <template #button-content>
        <b-icon :icon="(sortDesc)? icon.sortDesc: icon.sort" />
        <span v-if="incontextmenu">{{ $t('button.sort.tablecolumns.title') }}</span>
      </template>
      <div class="dropdown-item sortDirection" :tabindex="incontextmenu ? undefined : 0" @keydown.prevent="changeSortDirection()" @click.prevent="changeSortDirection()">
        <b-form-checkbox :aria-label="$t('button.sort.tablecolumns.sortDirection')" :checked="sortDesc">{{ $t('button.sort.tablecolumns.sortDirection') }}</b-form-checkbox>
      </div>
      <b-dropdown-divider />

      <template v-if="incontextmenu">
        <ul>
          <li
            v-for="header in Object.values(headerData).filter(h=>h.sortable)"
            :key="header.key"
            class="dropdown-item"
            :class="{'selectedSort': (sortBy==header.key)}"
            @keydown="changeSortBy(header.key)"
            @click="changeSortBy(header.key)"
          >
            <a> {{ header.label }} </a>
          </li>
        </ul>
      </template>
      <template v-else>
        <b-dropdown-item
          v-for="header in Object.values(headerData).filter(h=>h.sortable)"
          :key="header.key"
          :class="{'selectedSort': (sortBy==header.key)}"
          @keydown="changeSortBy(header.key)"
          @click="changeSortBy(header.key)"
        >
          {{ header.label }}
        </b-dropdown-item>
      </template>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BDropdown } from 'bootstrap-vue'
import { ITableHeader } from '../../.utils/types/ttable'
import { HoverDropdown } from '../../mixins/component'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons, HoverDropdown] })
export default class DDTableSorting extends BDropdown {
  @Prop({ default: '' }) sortBy!: string
  @Prop({ default: false }) sortDesc!: boolean
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeader
  $mq:any
  icon: any
  onOver:any
  onLeave:any

  changeSortDirection () { this.$emit('update:sortDesc', (!this.sortDesc)) }
  changeSortBy (key:string) { this.$emit('update:sortBy', key) }
}
</script>
<style>
.selectedSort .dropdown-item {
  color: var(--light) !important;
  background-color: var(--primary-dark) !important;
}
.DDTableSorting  .dropdown-menu li.selectedSort {
  color: var(--light) !important;
  background-color: var(--primary) !important;
}
.rightmenu .dropdown-menu {
  right: 0;
  left: auto;
}
.sortDirectionWrapper > div {
  display: inline-block !important;
}
</style>
