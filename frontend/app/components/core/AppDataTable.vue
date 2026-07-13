<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppDataTable - Main data table with sorting, filtering, selection, and pagination.
-->
<template>
  <div class="data-table flex flex-col h-full min-h-0 min-w-0">
    <div class="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-3 text-small">
        <UButton v-if="selectedKeys.length > 0" :icon="icons.xCircle" variant="soft" color="primary" size="xs"
          :title="`${selectedKeys.length} ${$t('common.selected')} - ${$t('common.clearSelection')}`"
          @click="clearSelection">
          {{ selectedKeys.length }}
        </UButton>
        <UBadge v-if="effectiveSelectionMode === 'single'" color="info" variant="subtle" size="xs">
          {{ $t('settings.singleSelect') }}
        </UBadge>
      </div>

      <div class="flex items-center gap-2">
        <CoreAppFilterInput v-if="filterable" v-model="filterQueryInternal" :placeholder="String($t('common.filter'))"
          size="sm" input-class="w-full sm:w-56 md:w-72 lg:w-80" />

        <UPopover>
          <UButton :icon="icons.tableSettings" :aria-label="$t('settings.table')" variant="outline" color="primary"
            size="sm" :title="$t('settings.table')" data-testid="table-settings" />
          <template #content>
            <div class="p-3 min-w-105 overflow-y-auto bg-(--color-background) rounded shadow-lg">
              <div class="font-heading text-xs text-(--color-text-muted) mb-3">{{ $t('settings.table') }}</div>

              <div class="mb-4 grid grid-cols-[7rem_1fr] items-center gap-x-2 gap-y-3">
                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.display') }}</span>
                <div class="flex gap-0.5">
                  <UButton size="xs" class="flex-1" :color="'primary'"
                    :variant="tableSettings.settings.displayMode === 'infinite' ? 'solid' : 'outline'"
                    @click="changeDisplayMode('infinite')">
                    {{ $t('settings.infiniteScroll') }}
                  </UButton>
                  <UButton size="xs" class="flex-1" :color="'primary'"
                    :variant="tableSettings.settings.displayMode === 'pagination' ? 'solid' : 'outline'"
                    @click="changeDisplayMode('pagination')">
                    {{ $t('table.pagination') }}
                  </UButton>
                </div>

                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.selection') }}</span>
                <div class="flex gap-0.5">
                  <UButton size="xs" class="flex-1" :color="'primary'"
                    :variant="effectiveSelectionMode === 'multi' ? 'solid' : 'outline'"
                    @click="forceSelectionMode('multi')">
                    {{ $t('settings.multiSelect') }}
                  </UButton>
                  <UButton size="xs" class="flex-1" :color="'primary'"
                    :variant="effectiveSelectionMode === 'single' ? 'solid' : 'outline'"
                    @click="forceSelectionMode('single')">
                    {{ $t('settings.singleSelect') }}
                  </UButton>
                </div>

                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.pageSize') }}</span>
                <USelect :model-value="tableSettings.settings.pageSize" :items="pageSizeOptions" size="xs"
                  :aria-label="String($t('settings.pageSize'))"
                  @update:model-value="(v: number) => changePageSize(v)" />

                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.sortBy') }}</span>
                <div class="flex items-center gap-1">
                  <USelect :model-value="tableSettings.settings.sortColumn" :items="sortableColumnOptions" size="xs"
                    :aria-label="String($t('settings.sortBy'))" class="flex-1"
                    @update:model-value="(v: string) => handleSort(v)" />
                  <UButton size="xs" variant="ghost" color="neutral"
                    :icon="tableSettings.settings.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
                    :title="tableSettings.settings.sortDirection === 'asc' ? String($t('common.ascending')) : String($t('common.descending'))"
                    @click="changeSortDirection(tableSettings.settings.sortDirection === 'asc' ? 'desc' : 'asc')" />
                </div>
              </div>

              <div class="mb-4">
                <span class="text-xs text-(--color-text-muted) block mb-1">{{ $t('settings.columns') }}</span>
                <div class="space-y-1 max-h-40 overflow-y-auto">
                  <span v-for="col in toggleableColumns" :key="col.key"
                    class="flex items-center gap-2 p-1 rounded hover:bg-(--color-surface-hover) cursor-pointer">
                    <CoreAppCheckbox :model-value="isColumnVisibleComputed(col.key)" :disabled="col.alwaysVisible"
                      :aria-label="resolveColumnLabel(col)" @update:model-value="tableSettings.toggleColumn(col.key)" />
                    <span class="text-xs" :class="{ 'opacity-50': col.alwaysVisible }">{{ resolveColumnLabel(col)
                      }}</span>
                  </span>
                </div>
              </div>

              <UButton variant="outline" color="primary" size="xs" block @click="tableSettings.reset">
                {{ $t('common.resetDefaults') }}
              </UButton>
            </div>
          </template>
        </UPopover>

        <UButton v-if="showRefresh" :icon="icons.refresh" variant="ghost" color="neutral" size="sm" :loading="loading"
          :title="String($t('common.refresh'))" @click="handleRefresh" />
      </div>
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0 flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden' }"
      class="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- scrollable region with keyboard navigation, role=region + tabindex is correct ARIA -->
      <div ref="tableContainer"
        class="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-auto transition-all duration-200"
        :style="{ maxHeight: `calc(${maxHeight} - 48px)` }" tabindex="0" role="region"
        :aria-label="String($t('settings.table'))" @scroll="handleScroll" @keydown="handleTableKeydown">
        <div v-if="loading && rows.length === 0" class="py-12">
          <CoreAppLoadingSpinner size="lg" />
        </div>

        <div v-else>
          <table class="w-max min-w-full" role="grid">
            <thead class="bg-(--color-surface) sticky top-0 z-30">
              <tr>
                <th v-if="selectable" class="w-10 px-3 py-2.5 text-center whitespace-nowrap bg-(--color-surface)"
                  :aria-label="effectiveSelectionMode === 'multi' ? 'Select all' : 'Selection'">
                  <div class="flex items-center justify-center gap-1">
                    <input v-if="effectiveSelectionMode === 'multi'" type="checkbox" :checked="allSelected"
                      :indeterminate="someSelected"
                      class="rounded border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                      aria-label="Select all rows" @change="toggleSelectAll" />
                    <UButton v-if="selectedKeys.length > 0" size="xs" variant="ghost" color="neutral"
                      :icon="sortBySelection ? icons.sortDesc : icons.sort" :class="sortBySelection ? '' : 'opacity-30'"
                      class="p-0! w-4 h-4" :title="String($t('settings.sortBySelection'))"
                      @click.stop="sortBySelection = !sortBySelection" />
                  </div>
                </th>

                <th v-for="col in visibleColumns" :key="col.key" :aria-sort="getSortAriaLabel(col.key)"
                  class="px-3 py-2.5 text-left font-heading text-xs tracking-wider text-(--color-text-muted) whitespace-nowrap"
                  :class="[col.headerClass, { 'cursor-pointer hover:bg-(--color-surface-hover)': col.sortable }, col.stickyRight ? 'sticky z-40 bg-(--color-surface) shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]' : '']"
                  :style="{ width: col.width, minWidth: col.minWidth || '80px', textAlign: col.align, ...(col.stickyRight ? { right: hasActions ? actionsColWidth + 'px' : '0' } : {}) }"
                  :tabindex="col.sortable ? 0 : undefined" @click="col.sortable && handleSort(col.key)"
                  @keydown.enter="col.sortable && handleSort(col.key)">
                  <slot :name="(`header-cell-${col.key}` as any)" :column="col"
                    :sort-column="tableSettings.settings.sortColumn"
                    :sort-direction="tableSettings.settings.sortDirection">
                    <div class="flex items-center gap-1">
                      <template v-if="col.headerIcon">
                        <UTooltip :text="resolveColumnLabel(col)">
                          <UIcon :name="col.headerIcon" class="w-4 h-4" :aria-label="resolveColumnLabel(col)" />
                        </UTooltip>
                      </template>
                      <template v-else>
                        {{ resolveColumnLabel(col) }}
                      </template>
                      <template v-if="col.sortable">
                        <UIcon v-if="tableSettings.settings.sortColumn === col.key"
                          :name="tableSettings.settings.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
                          class="w-3 h-3" />
                        <UIcon v-else :name="icons.sort" class="w-3 h-3 opacity-30" />
                      </template>
                    </div>
                  </slot>
                </th>

                <th v-if="hasActions" ref="actionsHeaderRef"
                  class="min-w-24 px-3 py-2.5 text-center font-heading text-xs tracking-wider text-(--color-text-muted) whitespace-nowrap sticky right-0 bg-(--color-surface) z-40 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                  {{ $t('actions.title') }}
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-(--color-border)" :class="{ 'pb-2': displayMode === 'pagination' }">
              <tr v-for="(row, idx) in displayRows" :key="getRowKey(row)" :aria-selected="isSelected(row)" :tabindex="0"
                class="group hover:bg-(--color-surface-hover) transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-opsi-blue"
                :class="{
                  'cursor-pointer': true,
                  'bg-(--color-primary-soft-bg)': isHighlighted(row),
                  'shadow-[inset_3px_0_0_0_var(--color-primary)]': isActive(row),
                }" @click="handleRowClick(row, $event)" @keydown.enter="handleRowClick(row, $event)">
                <td v-if="selectable" class="px-3 py-2 text-center" role="gridcell"
                  @click.stop="handleCheckboxClick(row)">
                  <input v-if="effectiveSelectionMode === 'multi'" type="checkbox" :checked="isSelected(row)"
                    class="rounded border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                    :aria-label="'Select row ' + getRowKey(row)" />
                  <input v-else type="radio" :checked="isSelected(row)" :name="tableId + '-selection'"
                    class="border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                    :aria-label="'Select row ' + getRowKey(row)" />
                </td>

                <td v-for="col in visibleColumns" :key="col.key" role="gridcell"
                  class="px-3 py-2 text-small text-(--color-text) whitespace-nowrap"
                  :class="[col.class, col.stickyRight ? ['sticky z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]', isHighlighted(row) ? 'bg-(--color-row-selected)' : 'bg-(--color-background) group-hover:bg-(--color-surface-hover)'] : '']"
                  :style="{ textAlign: col.align, ...(col.stickyRight ? { right: hasActions ? actionsColWidth + 'px' : '0' } : {}) }">
                  <slot :name="(`cell-${col.key}` as any)" :row="row" :value="getNestedValue(row, col.key)"
                    :index="idx">
                    {{ formatCellValue(row, col) }}
                  </slot>
                </td>

                <td v-if="hasActions"
                  class="px-3 py-2 text-center sticky right-0 z-10 min-w-24 whitespace-nowrap shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                  :class="isHighlighted(row) ? 'bg-(--color-row-selected)' : 'bg-(--color-background) group-hover:bg-(--color-surface-hover)'"
                  @click.stop>
                  <div class="flex items-center justify-center gap-1 rounded-md transition-colors"
                    :class="isHighlighted(row) ? 'bg-(--color-primary)/10 ring-1 ring-(--color-primary)/30 px-1' : ''">
                    <slot name="row-actions" :row="row" :index="idx" :selected="isSelected(row)"
                      :active="isActive(row)" />
                  </div>
                </td>
              </tr>

              <tr v-if="rows.length === 0 && !loading">
                <td :colspan="totalColSpan" class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-(--color-text-muted)">
                    <UIcon :name="icons.table" class="w-8 h-8 opacity-50" />
                    <span>{{ $t('common.noResults') }}</span>
                  </div>
                </td>
              </tr>

              <tr v-if="displayMode === 'infinite' && hasMoreData" ref="scrollSentinel" class="scroll-sentinel">
                <td :colspan="totalColSpan" class="px-4 py-4 text-center">
                  <CoreAppLoadingSpinner size="sm" />
                </td>
              </tr>

              <tr v-else-if="displayMode === 'infinite' && rows.length > 0 && !hasMoreData">
                <td :colspan="totalColSpan" class="px-4 py-3 text-center">
                  <span class="text-xs text-(--color-text-muted)">{{ $t('table.allLoaded') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UCard>

    <div class="shrink-0 px-1 rounded-b-lg flex items-center justify-between gap-4">
      <span class="text-xs text-(--color-text-muted)">
        <template v-if="displayMode === 'infinite'">
          {{ $t('common.showing') }} {{ rows.length }} {{ $t('common.of') }} {{ serverTotal }}
        </template>
        <template v-else>
          {{ $t('common.showing') }} {{ paginationStartIndex + 1 }}-{{ Math.min(paginationEndIndex, serverTotal) }}
          {{ $t('common.of') }} {{ serverTotal }}
        </template>
      </span>
      <div v-if="displayMode === 'pagination' && totalPages > 1" class="flex items-center gap-1">
        <UButton :icon="icons.chevronLeft" :aria-label="$t('common.previous')" variant="outline" color="neutral"
          size="xs" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" />
        <template v-for="page in visiblePageNumbers" :key="page">
          <span v-if="page === '...'" class="px-2 text-(--color-text-muted)">...</span>
          <UButton v-else
            :aria-label="`${$t('common.page')} ${page}` + (page === currentPage ? ` (${$t('common.current')})` : '')"
            :variant="page === currentPage ? 'solid' : 'ghost'" :color="page === currentPage ? 'primary' : 'neutral'"
            size="xs" class="min-w-8" @click="goToPage(page as number)">
            {{ page }}
          </UButton>
        </template>
        <UButton :icon="icons.chevronRight" :aria-label="$t('common.next')" variant="outline" color="neutral" size="xs"
          :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { useDataTableSettings, type DataTableColumnDef } from '~/composables/useDataTableSettings'

export interface PageChangeParams {
  pageNumber: number
  perPage: number
  sortBy: string
  sortDesc: boolean
  filterQuery: string
}

interface Props {
  rows: T[]
  columns: DataTableColumnDef[]
  tableId: string
  rowKey?: string
  loading?: boolean
  totalItems?: number

  selectable?: boolean
  selectedKeys?: string[]
  activeKey?: string

  filterable?: boolean
  showRefresh?: boolean

  maxHeight?: string
  sortBySelectionEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  loading: false,
  totalItems: 0,
  selectable: true,
  filterable: true,
  showRefresh: true,
  maxHeight: 'calc(100vh - 220px)',
})

const emit = defineEmits<{
  (e: 'select', row: T): void
  (e: 'selection-change', rows: T[], keys: string[]): void
  (e: 'refresh'): void
  (e: 'row-activate', row: T): void
  (e: 'page-change', params: PageChangeParams): void
  (e: 'update:filterQuery', value: string): void
}>()

defineSlots<{
  [key: `header-cell-${string}`]: (props: { column: DataTableColumnDef; sortColumn: string; sortDirection: 'asc' | 'desc' }) => unknown
  [key: `cell-${string}`]: (props: { row: T; value: unknown; index: number }) => unknown
  'row-actions': (props: { row: T; index: number; selected: boolean; active: boolean }) => unknown
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const slots = useSlots()

const tableSettings = useDataTableSettings(props.tableId)

const tableContainer = ref<HTMLElement | null>(null)
const actionsHeaderRef = ref<HTMLElement | null>(null)
const actionsColWidth = ref(96)
const scrollSentinel = ref<HTMLElement | null>(null)
const selectedKeys = ref<string[]>([])
const filterQueryInternal = ref('')
const currentPage = ref(1)
const selectionModeOverride = ref<'single' | 'multi' | null>(null)
const sortBySelection = ref(props.sortBySelectionEnabled || false)
const lastClickedIndex = ref<number | null>(null)

watch(() => props.sortBySelectionEnabled, (v) => {
  if (v !== undefined) sortBySelection.value = v
})
let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null

const displayMode = computed(() => tableSettings.settings.displayMode)
const pageSize = computed(() => tableSettings.settings.pageSize)

const effectiveSelectionMode = computed(() => {
  if (selectionModeOverride.value) return selectionModeOverride.value
  return tableSettings.settings.selectionMode
})

const pageSizeOptions = computed(() => [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
])

const sortableColumnOptions = computed(() =>
  props.columns
    .filter((c) => c.sortable)
    .map((c) => ({ value: c.key, label: c.labelKey ? String($t(c.labelKey)) : c.label }))
)

const toggleableColumns = computed(() =>
  props.columns.filter((c) => !c.alwaysVisible && c.key !== 'actions')
)

const visibleColumns = computed(() =>
  props.columns.filter((c) => c.alwaysVisible || tableSettings.isColumnVisible(c.key, props.columns))
)

function isColumnVisibleComputed(key: string): boolean {
  return tableSettings.isColumnVisible(key, props.columns)
}

const hasActions = computed(() => !!slots['row-actions'])

const totalColSpan = computed(() => {
  let count = visibleColumns.value.length
  if (props.selectable) count++
  if (hasActions.value) count++
  return count
})

const serverTotal = computed(() => props.totalItems || props.rows.length)
const totalPages = computed(() => Math.max(1, Math.ceil(serverTotal.value / pageSize.value)))
const paginationStartIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const paginationEndIndex = computed(() => currentPage.value * pageSize.value)

const visiblePageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

const hasMoreData = computed(() => {
  if (displayMode.value === 'infinite') return props.rows.length < serverTotal.value
  return false
})

const displayRows = computed(() => {
  if (!sortBySelection.value || selectedKeys.value.length === 0) return props.rows
  const keySet = new Set(selectedKeys.value)
  const selected: T[] = []
  const unselected: T[] = []
  for (const row of props.rows) {
    if (keySet.has(getRowKey(row))) selected.push(row)
    else unselected.push(row)
  }
  return [...selected, ...unselected]
})

const allSelected = computed(() =>
  props.rows.length > 0 && props.rows.every((row) => isSelected(row))
)

const someSelected = computed(() =>
  selectedKeys.value.length > 0 && !allSelected.value
)

function getPageChangeParams(): PageChangeParams {
  return {
    pageNumber: currentPage.value,
    perPage: pageSize.value,
    sortBy: tableSettings.settings.sortColumn,
    sortDesc: tableSettings.settings.sortDirection === 'desc',
    filterQuery: filterQueryInternal.value,
  }
}

function emitPageChange() {
  emit('page-change', getPageChangeParams())
}

function getRowKey(row: T): string {
  return String(row[props.rowKey] ?? '')
}

function getNestedValue(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

function formatCellValue(row: T, col: DataTableColumnDef): string {
  const value = getNestedValue(row, col.key)
  if (value === null || value === undefined) return '-'
  if (value instanceof Date) return value.toLocaleString()
  return String(value)
}

function resolveColumnLabel(col: DataTableColumnDef): string {
  if (col.labelKey) return String($t(col.labelKey))
  return col.label
}

function getSortAriaLabel(colKey: string): 'ascending' | 'descending' | undefined {
  if (tableSettings.settings.sortColumn !== colKey) return undefined
  return tableSettings.settings.sortDirection === 'asc' ? 'ascending' : 'descending'
}

function handleSort(column: string) {
  const current = tableSettings.settings.sortColumn
  if (current === column) {
    tableSettings.settings.sortDirection = tableSettings.settings.sortDirection === 'asc' ? 'desc' : 'asc'
  } else {
    tableSettings.settings.sortColumn = column
    tableSettings.settings.sortDirection = 'asc'
  }
  currentPage.value = 1
  emitPageChange()
}

function changeSortDirection(dir: 'asc' | 'desc') {
  tableSettings.settings.sortDirection = dir
  currentPage.value = 1
  emitPageChange()
}

function changePageSize(size: number) {
  tableSettings.setPageSize(size)
  currentPage.value = 1
  emitPageChange()
}

function changeDisplayMode(mode: 'infinite' | 'pagination') {
  tableSettings.setDisplayMode(mode)
  currentPage.value = 1
  emitPageChange()
}

function handleRowClick(row: T, event: Event) {
  const target = event.target as HTMLElement
  if (target.closest('button') || target.closest('[role="button"]') || target.closest('input')) return

  if (effectiveSelectionMode.value === 'single') {
    selectSingle(row)
    emit('row-activate', row)
  } else {
    const mouseEvent = event as MouseEvent
    const currentIndex = displayRows.value.indexOf(row)
    if (mouseEvent.shiftKey && lastClickedIndex.value !== null && currentIndex >= 0) {
      shiftSelectRange(lastClickedIndex.value, currentIndex)
    } else {
      toggleSelection(row)
      lastClickedIndex.value = currentIndex >= 0 ? currentIndex : null
    }
  }
}

function shiftSelectRange(fromIndex: number, toIndex: number) {
  const start = Math.min(fromIndex, toIndex)
  const end = Math.max(fromIndex, toIndex)
  const rangeKeys = displayRows.value.slice(start, end + 1).map(r => getRowKey(r))
  const allAlreadySelected = rangeKeys.every(k => selectedKeys.value.includes(k))
  if (allAlreadySelected) {
    selectedKeys.value = selectedKeys.value.filter(k => !rangeKeys.includes(k))
  } else {
    const newSet = new Set([...selectedKeys.value, ...rangeKeys])
    selectedKeys.value = [...newSet]
  }
  emitSelectionChange()
}

function handleCheckboxClick(row: T) {
  if (effectiveSelectionMode.value === 'single') {
    selectSingle(row)
    emit('row-activate', row)
  } else {
    toggleSelection(row)
  }
}

function isSelected(row: T): boolean {
  return selectedKeys.value.includes(getRowKey(row))
}

function isActive(row: T): boolean {
  return props.activeKey != null && props.activeKey !== '' && getRowKey(row) === props.activeKey
}

function isHighlighted(row: T): boolean {
  return isSelected(row) || isActive(row)
}

function toggleSelection(row: T) {
  const key = getRowKey(row)
  const idx = selectedKeys.value.indexOf(key)
  if (idx >= 0) selectedKeys.value.splice(idx, 1)
  else selectedKeys.value.push(key)
  emitSelectionChange()
}

function selectSingle(row: T) {
  selectedKeys.value = [getRowKey(row)]
  emitSelectionChange()
}

function toggleSelectAll() {
  if (allSelected.value) selectedKeys.value = []
  else selectedKeys.value = props.rows.map((row) => getRowKey(row))
  emitSelectionChange()
}

function clearSelection() {
  selectedKeys.value = []
  selectionModeOverride.value = null
  sortBySelection.value = false
  emitSelectionChange()
}

function forceSelectionMode(mode: 'single' | 'multi') {
  selectionModeOverride.value = mode
  tableSettings.setSelectionMode(mode)
  if (mode === 'single' && selectedKeys.value.length > 1) {
    const lastKey = selectedKeys.value[selectedKeys.value.length - 1] || ''
    selectedKeys.value = [lastKey]
    emitSelectionChange()
  }
}

function emitSelectionChange() {
  const selected = props.rows.filter((row) => selectedKeys.value.includes(getRowKey(row)))
  emit('selection-change', selected, selectedKeys.value)
}

function handleRefresh() {
  currentPage.value = 1
  emitPageChange()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emitPageChange()
  }
}

function handleScroll() {
  if (!tableContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = tableContainer.value
  if (displayMode.value === 'infinite') {
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMoreData.value && !props.loading) {
      currentPage.value++
      emitPageChange()
    }
  }
}

let sentinelObserver: IntersectionObserver | null = null
let sentinelLoadPending = false
let actionsResizeObserver: ResizeObserver | null = null
let containerResizeObserver: ResizeObserver | null = null

function maybeFillViewport() {
  const el = tableContainer.value
  if (!el || displayMode.value !== 'infinite' || sentinelLoadPending) return
  if (
    needsMoreToFill({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      hasMore: hasMoreData.value,
      loading: props.loading,
    })
  ) {
    sentinelLoadPending = true
    currentPage.value++
    emitPageChange()
    setTimeout(() => {
      sentinelLoadPending = false
    }, 200)
  }
}

function observeActionsWidth() {
  if (actionsResizeObserver) {
    actionsResizeObserver.disconnect()
    actionsResizeObserver = null
  }
  if (!actionsHeaderRef.value) return
  actionsResizeObserver = new ResizeObserver(() => {
    if (actionsHeaderRef.value) {
      actionsColWidth.value = Math.ceil(actionsHeaderRef.value.getBoundingClientRect().width)
    }
  })
  actionsResizeObserver.observe(actionsHeaderRef.value)
  actionsColWidth.value = Math.ceil(actionsHeaderRef.value.getBoundingClientRect().width)
}

watch(actionsHeaderRef, () => observeActionsWidth())

onMounted(() => {
  observeActionsWidth()
  sentinelObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && displayMode.value === 'infinite' && hasMoreData.value && !props.loading && !sentinelLoadPending) {
        sentinelLoadPending = true
        currentPage.value++
        emitPageChange()
        // Reset guard after a short delay to allow loading state to propagate
        setTimeout(() => { sentinelLoadPending = false }, 200)
      }
    }
  }, { root: tableContainer.value, threshold: 0.1 })

  if (tableContainer.value) {
    containerResizeObserver = new ResizeObserver(() => maybeFillViewport())
    containerResizeObserver.observe(tableContainer.value)
  }
})

watch(
  () => props.rows.length,
  async () => {
    await nextTick()
    maybeFillViewport()
  },
)

watch(scrollSentinel, (el, oldEl) => {
  if (oldEl && sentinelObserver) sentinelObserver.unobserve(oldEl)
  if (el && sentinelObserver) sentinelObserver.observe(el)
})

onUnmounted(() => {
  if (sentinelObserver) {
    sentinelObserver.disconnect()
    sentinelObserver = null
  }
  if (actionsResizeObserver) {
    actionsResizeObserver.disconnect()
    actionsResizeObserver = null
  }
  if (containerResizeObserver) {
    containerResizeObserver.disconnect()
    containerResizeObserver = null
  }
})

function handleTableKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
    if (effectiveSelectionMode.value !== 'multi' || !props.selectable) return
    e.preventDefault()
    toggleSelectAll()
  }
}

watch(filterQueryInternal, (val) => {
  emit('update:filterQuery', val)
  if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
  filterDebounceTimer = setTimeout(() => {
    currentPage.value = 1
    emitPageChange()
  }, 400)
})

watch(() => props.selectedKeys, (newKeys) => {
  if (newKeys) {
    selectedKeys.value = [...newKeys]
    if (newKeys.length > 1 && effectiveSelectionMode.value === 'single') {
      selectionModeOverride.value = 'multi'
    }
    if (newKeys.length <= 1 && selectionModeOverride.value === 'multi'
      && tableSettings.settings.selectionMode === 'single') {
      selectionModeOverride.value = null
    }
  }
}, { immediate: true, deep: true })

defineExpose({
  clearSelection,
  getSelectedRows: () => props.rows.filter((row) => selectedKeys.value.includes(getRowKey(row))),
  setSelectedKeys: (keys: string[]) => {
    selectedKeys.value = keys
    emitSelectionChange()
  },
  refresh: handleRefresh,
  effectiveSelectionMode,
  getPageChangeParams,
})
</script>

<style scoped>
.data-table {
  contain: layout style;
}
</style>
