<template>
  <div class="data-table flex flex-col h-full min-h-0">
    <div class="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-3 text-sm">
        <UTooltip v-if="selectedKeys.length > 0"
          :text="`${selectedKeys.length} ${$t('selected')} — ${$t('clearSelection')}`">
          <UButton :icon="icons.clear" variant="soft" color="primary" size="xs" @click="clearSelection">
            {{ selectedKeys.length }}
          </UButton>
        </UTooltip>
        <UBadge v-if="effectiveSelectionMode === 'single'" color="info" variant="subtle" size="xs">
          {{ $t('singleSelect') }}
        </UBadge>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="filterable" class="relative">
          <UInput v-model="filterQueryInternal" :placeholder="filterPlaceholder || String($t('typeToFilter'))" size="sm"
            :icon="icons.filter" class="w-32 sm:w-40" />
          <UButton v-if="filterQueryInternal" :icon="icons.close" variant="link" color="neutral" size="xs"
            :padded="false" class="absolute right-1 top-1/2 -translate-y-1/2" @click="filterQueryInternal = ''" />
        </div>

        <UPopover>
          <UButton :icon="icons.tableSettings" variant="ghost" color="neutral" size="sm" :title="$t('tableSettings')" />
          <template #content>
            <div class="p-3 w-85 max-h-250 overflow-y-auto">
              <div class="text-xs font-medium text-(--color-text-muted) uppercase mb-3">{{ $t('tableSettings') }}</div>

              <div class="mb-4 grid grid-cols-[7rem_1fr] items-center gap-x-2 gap-y-3">
                <label class="text-xs text-(--color-text-muted)">{{ $t('displayMode') }}</label>
                <div class="flex gap-0.5">
                  <button :class="[
                    'flex-1 px-2.5 py-1 text-xs font-medium rounded-l-lg transition-colors',
                    tableSettings.settings.displayMode === 'infinite'
                      ? 'bg-opsi-blue text-white'
                      : 'bg-(--color-surface-hover) text-(--color-text-muted) hover:bg-(--color-surface-hover)'
                  ]" @click="changeDisplayMode('infinite')">
                    {{ $t('infiniteScroll') }}
                  </button>
                  <button :class="[
                    'flex-1 px-2.5 py-1 text-xs font-medium rounded-r-lg transition-colors',
                    tableSettings.settings.displayMode === 'pagination'
                      ? 'bg-opsi-blue text-white'
                      : 'bg-(--color-surface-hover) text-(--color-text-muted) hover:bg-(--color-surface-hover)'
                  ]" @click="changeDisplayMode('pagination')">
                    {{ $t('pagination') }}
                  </button>
                </div>

                <label class="text-xs text-(--color-text-muted)">{{ $t('selectionMode') }}</label>
                <div class="flex gap-0.5">
                  <button :class="[
                    'flex-1 px-2.5 py-1 text-xs font-medium rounded-l-lg transition-colors',
                    effectiveSelectionMode === 'multi'
                      ? 'bg-opsi-blue text-white'
                      : 'bg-(--color-surface-hover) text-(--color-text-muted) hover:bg-(--color-surface-hover)'
                  ]" @click="forceSelectionMode('multi')">
                    {{ $t('multiSelect') }}
                  </button>
                  <button :class="[
                    'flex-1 px-2.5 py-1 text-xs font-medium rounded-r-lg transition-colors',
                    effectiveSelectionMode === 'single'
                      ? 'bg-opsi-blue text-white'
                      : 'bg-(--color-surface-hover) text-(--color-text-muted) hover:bg-(--color-surface-hover)'
                  ]" @click="forceSelectionMode('single')">
                    {{ $t('singleSelect') }}
                  </button>
                </div>

                <label class="text-xs text-(--color-text-muted)">{{ $t('pageSize') }}</label>
                <USelect :model-value="tableSettings.settings.pageSize" :items="pageSizeOptions" size="xs"
                  @update:model-value="(v: number) => changePageSize(v)" />

                <label class="text-xs text-(--color-text-muted)">{{ $t('sortBy') }}</label>
                <div class="flex items-center gap-1">
                  <USelect :model-value="tableSettings.settings.sortColumn" :items="sortableColumnOptions" size="xs"
                    class="flex-1" @update:model-value="(v: string) => handleSort(v)" />
                  <UTooltip :text="tableSettings.settings.sortDirection === 'asc' ? $t('ascending') : $t('descending')">
                    <button :class="[
                      'w-7 h-7 flex items-center justify-center rounded transition-colors',
                      'bg-(--color-surface-hover) hover:bg-(--color-surface-hover)'
                    ]" @click="changeSortDirection(tableSettings.settings.sortDirection === 'asc' ? 'desc' : 'asc')">
                      <UIcon :name="tableSettings.settings.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
                        class="w-3.5 h-3.5" />
                    </button>
                  </UTooltip>
                </div>
              </div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('columns') }}</label>
                <div class="space-y-1 max-h-40 overflow-y-auto">
                  <label v-for="col in toggleableColumns" :key="col.key"
                    class="flex items-center gap-2 p-1 rounded hover:bg-(--color-surface-hover) cursor-pointer">
                    <input type="checkbox" :checked="isColumnVisibleComputed(col.key)" :disabled="col.alwaysVisible"
                      class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue disabled:opacity-50"
                      @change="tableSettings.toggleColumn(col.key)" />
                    <span class="text-xs" :class="{ 'opacity-50': col.alwaysVisible }">{{ col.label }}</span>
                  </label>
                </div>
              </div>

              <UButton variant="ghost" color="neutral" size="xs" block @click="tableSettings.reset">
                {{ $t('resetDefaults') }}
              </UButton>
            </div>
          </template>
        </UPopover>

        <UButton v-if="showRefresh" :icon="icons.refresh" variant="ghost" color="neutral" size="sm" :loading="loading"
          :title="String($t('refresh'))" @click="handleRefresh" />

        <slot name="toolbar-right" />
      </div>
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }" class="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div ref="tableContainer" class="flex-1 overflow-x-auto overflow-y-auto transition-all duration-200"
        :style="{ maxHeight: displayMode === 'pagination' ? `calc(${maxHeight} - 48px)` : maxHeight }"
        @scroll="handleScroll">
        <div v-if="loading && rows.length === 0"
          class="flex items-center justify-center py-12 text-(--color-text-muted)">
          <UIcon :name="icons.loading" class="w-6 h-6 animate-spin mr-2" />
          {{ $t('loading') }}
        </div>

        <div v-else>
          <table class="min-w-full table-auto" role="grid" :aria-label="tableLabel">
            <thead class="bg-(--color-surface) sticky top-0 z-10">
              <tr role="row">
                <th v-if="selectable" class="w-10 px-3 py-2.5 text-center whitespace-nowrap bg-(--color-surface)"
                  role="columnheader" :aria-label="effectiveSelectionMode === 'multi' ? 'Select all' : 'Selection'">
                  <div class="flex items-center justify-center gap-1">
                    <input v-if="effectiveSelectionMode === 'multi'" type="checkbox" :checked="allSelected"
                      :indeterminate="someSelected" class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue"
                      aria-label="Select all rows" @change="toggleSelectAll" />
                    <UButton v-if="selectedKeys.length > 0" size="xs" variant="ghost" color="neutral"
                      :icon="sortBySelection ? icons.sortDesc : icons.sort" :class="sortBySelection ? '' : 'opacity-30'"
                      class="p-0! w-4 h-4" :title="String($t('sortBySelection'))"
                      @click.stop="sortBySelection = !sortBySelection" />
                  </div>
                </th>

                <th v-for="col in visibleColumns" :key="col.key" role="columnheader"
                  :aria-sort="getSortAriaLabel(col.key)"
                  class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-(--color-text-muted) whitespace-nowrap"
                  :class="[col.headerClass, { 'cursor-pointer hover:bg-(--color-surface-hover)': col.sortable }]"
                  :style="{ width: col.width, minWidth: col.minWidth || '80px', textAlign: col.align }"
                  :tabindex="col.sortable ? 0 : undefined" @click="col.sortable && handleSort(col.key)"
                  @keydown.enter="col.sortable && handleSort(col.key)">
                  <slot :name="(`header-cell-${col.key}` as any)" :column="col"
                    :sort-column="tableSettings.settings.sortColumn"
                    :sort-direction="tableSettings.settings.sortDirection">
                    <div class="flex items-center gap-1">
                      <template v-if="col.headerIcon">
                        <UTooltip :text="col.label">
                          <UIcon :name="col.headerIcon" class="w-4 h-4" />
                        </UTooltip>
                      </template>
                      <template v-else>
                        {{ col.label }}
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

                <th v-if="hasActions" role="columnheader"
                  class="w-24 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-(--color-text-muted) whitespace-nowrap sticky right-0 bg-(--color-surface)">
                  {{ $t('actions') }}
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-(--color-border)" :class="{ 'pb-2': displayMode === 'pagination' }">
              <tr v-for="(row, idx) in displayRows" :key="getRowKey(row)" role="row" :aria-selected="isSelected(row)"
                :tabindex="0"
                class="group hover:bg-(--color-surface-hover) transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-opsi-blue"
                :class="{
                  'cursor-pointer': true,
                  'bg-opsi-blue/5 dark:bg-opsi-blue/10': isSelected(row),
                }" @click="handleRowClick(row, $event)" @keydown.enter="handleRowClick(row, $event)">
                <td v-if="selectable" class="px-3 py-2 text-center" role="gridcell"
                  @click.stop="handleCheckboxClick(row)">
                  <input v-if="effectiveSelectionMode === 'multi'" type="checkbox" :checked="isSelected(row)"
                    class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue"
                    :aria-label="'Select row ' + getRowKey(row)" />
                  <input v-else type="radio" :checked="isSelected(row)" :name="tableId + '-selection'"
                    class="border-gray-300 text-opsi-blue focus:ring-opsi-blue"
                    :aria-label="'Select row ' + getRowKey(row)" />
                </td>

                <td v-for="col in visibleColumns" :key="col.key" role="gridcell"
                  class="px-3 py-2 text-sm text-(--color-text)" :class="col.class" :style="{ textAlign: col.align }">
                  <slot :name="(`cell-${col.key}` as any)" :row="row" :value="getNestedValue(row, col.key)"
                    :index="idx">
                    {{ formatCellValue(row, col) }}
                  </slot>
                </td>

                <td v-if="hasActions"
                  class="px-3 py-2 text-center sticky right-0 bg-(--color-surface) group-hover:bg-(--color-surface-hover)"
                  @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <slot name="row-actions" :row="row" :index="idx">
                      <template v-for="action in visibleActionsForRow(row)" :key="action.icon">
                        <UButton :icon="action.icon" variant="ghost"
                          :color="(action.color as 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral') || 'neutral'"
                          size="xs" :title="action.label" @click="action.handler(row)" />
                      </template>
                    </slot>
                  </div>
                </td>
              </tr>

              <tr v-if="rows.length === 0 && !loading">
                <td :colspan="totalColSpan" class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-(--color-text-muted)">
                    <UIcon :name="emptyIcon || icons.table" class="w-8 h-8 opacity-50" />
                    <span>{{ emptyLabel || $t('message.noItemsFound') }}</span>
                  </div>
                </td>
              </tr>

              <tr v-if="displayMode === 'infinite' && hasMoreData" class="scroll-sentinel">
                <td :colspan="totalColSpan" class="px-4 py-4 text-center">
                  <div class="flex items-center justify-center gap-2 text-(--color-text-muted) text-sm">
                    <UIcon :name="icons.loading" class="w-4 h-4 animate-spin" />
                    <span>{{ $t('loading') }}...</span>
                  </div>
                </td>
              </tr>

              <tr v-else-if="displayMode === 'infinite' && rows.length > 0 && !hasMoreData">
                <td :colspan="totalColSpan" class="px-4 py-3 text-center">
                  <span class="text-xs text-(--color-text-muted)">{{ $t('allItemsLoaded') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UCard>

    <div
      class="shrink-0 border-t border-(--color-border) bg-(--color-surface) px-4 py-2 mt-2 rounded-b-lg flex items-center justify-between gap-4">
      <span class="text-xs text-(--color-text-muted)">
        <template v-if="displayMode === 'infinite'">
          {{ $t('showing') }} {{ rows.length }} {{ $t('of') }} {{ serverTotal }}
        </template>
        <template v-else>
          {{ $t('showing') }} {{ paginationStartIndex + 1 }}-{{ Math.min(paginationEndIndex, serverTotal) }}
          {{ $t('of') }} {{ serverTotal }}
        </template>
      </span>
      <div v-if="displayMode === 'pagination' && totalPages > 1" class="flex items-center gap-1">
        <UButton :icon="icons.arrowLeft" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)" />
        <template v-for="page in visiblePageNumbers" :key="page">
          <span v-if="page === '...'" class="px-2 text-(--color-text-muted)">...</span>
          <UButton v-else :variant="page === currentPage ? 'solid' : 'ghost'"
            :color="page === currentPage ? 'primary' : 'neutral'" size="xs" class="min-w-8"
            @click="goToPage(page as number)">
            {{ page }}
          </UButton>
        </template>
        <UButton :icon="icons.arrowRight" variant="outline" color="neutral" size="xs"
          :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { useDataTableSettings, type DataTableColumnDef } from '~/composables/useDataTableSettings'

export interface DataTableAction<R = unknown> {
  icon: string
  label?: string
  color?: string
  handler: (row: R) => void
  visible?: (row: R) => boolean
}

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

  filterable?: boolean
  filterQuery?: string
  filterPlaceholder?: string
  showRefresh?: boolean
  clickable?: boolean
  actions?: DataTableAction<T>[]

  emptyIcon?: string
  emptyLabel?: string
  tableLabel?: string
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
  clickable: true,
  maxHeight: 'calc(100vh - 220px)',
})

const emit = defineEmits<{
  (e: 'select', row: T): void
  (e: 'selection-change', rows: T[], keys: string[]): void
  (e: 'refresh'): void
  (e: 'update:filterQuery', query: string): void
  (e: 'row-action', action: string, row: T): void
  (e: 'row-activate', row: T): void
  (e: 'page-change', params: PageChangeParams): void
}>()

defineSlots<{
  [key: `header-cell-${string}`]: (props: { column: DataTableColumnDef; sortColumn: string; sortDirection: 'asc' | 'desc' }) => any
  [key: `cell-${string}`]: (props: { row: T; value: unknown; index: number }) => any
  'row-actions': (props: { row: T; index: number }) => any
  'toolbar-right': () => any
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const slots = useSlots()

const tableSettings = useDataTableSettings(props.tableId)

const tableContainer = ref<HTMLElement | null>(null)
const selectedKeys = ref<string[]>([])
const filterQueryInternal = ref(props.filterQuery || '')
const currentPage = ref(1)
const selectionModeOverride = ref<'single' | 'multi' | null>(null)
const sortBySelection = ref(props.sortBySelectionEnabled || false)

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
  { value: 100, label: '100' },
])

const sortableColumnOptions = computed(() =>
  props.columns
    .filter((c) => c.sortable)
    .map((c) => ({ value: c.key, label: c.label }))
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

const hasActions = computed(() => !!props.actions?.length || !!slots['row-actions'])

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

function visibleActionsForRow(row: T): DataTableAction<T>[] {
  if (!props.actions) return []
  return props.actions.filter((action) => !action.visible || action.visible(row))
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
    toggleSelection(row)
  }
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

watch(filterQueryInternal, (val) => {
  emit('update:filterQuery', val)
  if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
  filterDebounceTimer = setTimeout(() => {
    currentPage.value = 1
    emitPageChange()
  }, 400)
})

watch(() => props.filterQuery, (val) => {
  if (val !== undefined && val !== filterQueryInternal.value) {
    filterQueryInternal.value = val
  }
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
