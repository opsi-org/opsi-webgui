<template>
  hallo
  <div
    :class="{ incontextmenu: incontextmenu !== false }"
    @mouseover="
      incontextmenu !== false
        ? useHoverDropdown().onOver($refs.sortdropdown)
        : null
    "
    @mouseleave="
      incontextmenu !== false
        ? useHoverDropdown().onLeave($refs.sortdropdown)
        : null
    "
    @focusin="
      incontextmenu !== false
        ? useHoverDropdown().onOver($refs.sortdropdown)
        : null
    "
    @focusout="
      incontextmenu !== false
        ? useHoverDropdown().onLeave($refs.sortdropdown)
        : null
    "
  >
    <b-dropdown
      v-bind="$props"
      ref="sortdropdown"
      size="sm"
      data-testid="DropdownDDTableSorting"
      class="DDTableSorting !border-none"
      :variant="incontextmenu !== false ? undefined : 'outline-primary'"
      :no-caret="incontextmenu === false"
      :title="incontextmenu ? '' : $t('button.sort.tablecolumns')"
      :class="{
        rightmenu: $mq == 'mobile',
        'dropdown-item contextmenu ': incontextmenu !== false,
      }"
      :dropright="incontextmenu !== false"
    >
      <template #button-content>
        <IconIIcon :icon="sortDesc ? icons.sortDesc : icons.sort" />
        <span v-if="incontextmenu !== false">{{
          $t('button.sort.tablecolumns.title')
        }}</span>
      </template>
      <div
        class="dropdown-item sortDirection"
        :class="{ incontextmenu: incontextmenu }"
        :tabindex="incontextmenu !== false ? undefined : 0"
        @keydown.prevent="changeSortDirection()"
        @click.prevent="changeSortDirection()"
      >
        <b-form-checkbox
          :aria-label="$t('button.sort.tablecolumns.sortDirection')"
          :checked="sortDesc"
          >{{ $t('button.sort.tablecolumns.sortDirection') }}</b-form-checkbox
        >
      </div>
      <b-dropdown-divider />

      <template v-if="incontextmenu !== false">
        <ul>
          <li
            v-for="header in Object.values(headerData).filter(
              (h: any) => h.sortable,
            )"
            :key="header.key"
            class="dropdown-item"
            :class="{
              selectedSort: sortBy == header.key,
              incontextmenu: incontextmenu,
            }"
            @keydown="changeSortBy(header.key)"
            @click="changeSortBy(header.key)"
          >
            <a> {{ header.label }} </a>
          </li>
        </ul>
      </template>
      <template v-else>
        <b-dropdown-item
          v-for="header in Object.values(headerData).filter((h) => h.sortable)"
          :key="header.key"
          :class="{
            selectedSort: sortBy == header.key,
            incontextmenu: incontextmenu !== false,
          }"
          @keydown="changeSortBy(header.key)"
          @click="changeSortBy(header.key)"
        >
          {{ header.label }}
        </b-dropdown-item>
      </template>
    </b-dropdown>
  </div>
</template>

<script setup lang="ts">
  // import { Component, Prop } from 'nuxt-property-decorator'
  // import { BDropdown } from 'bootstrap-vue'
  import { useHoverDropdown } from '~/composables/mixins/useComponent'
  import { useIcons } from '~/composables/mixins/useIcons'
  import type { ITableHeader } from '~/types/ttable'
  import type { PropType } from 'vue'
  const $t = useI18n().t
  const $mq = useMQ().$mq
  const icons = useIcons()

  // const hoverDropdown
  // @Component({ mixins: [Icons, HoverDropdown] })
  // export default class DDTableSorting extends BDropdown {
  const props = defineProps({
    sortBy: { type: String, default: '' },
    sortDesc: { type: Boolean, default: false },
    incontextmenu: { type: Boolean, default: false },
    headerData: { type: Object as PropType<ITableHeader>, default: () => {} },
  })
  const $emit = defineEmits(['update:sortDesc', 'update:sortBy'])
  // @Prop({ default: '' }) sortBy!: string
  // @Prop({ default: false }) sortDesc!: boolean
  // @Prop({ default: false }) incontextmenu!: boolean
  // @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeader
  // $mq:any
  // icon: any
  // onOver:any
  // onLeave:any

  function changeSortDirection() {
    $emit('update:sortDesc', !props.sortDesc)
  }
  function changeSortBy(key: string) {
    $emit('update:sortBy', key)
  }
</script>
<style>
  .selectedSort .dropdown-item {
    color: var(--light) !important;
    background-color: var(--primary-dark) !important;
  }
  .DDTableSorting .dropdown-menu li.selectedSort {
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
