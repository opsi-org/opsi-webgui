<template>
  <div class="data-table flex flex-col h-full min-h-0">
    <div class="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-3 text-sm">
        <span class="text-(--color-text-muted)">
          <template v-if="displayMode === 'infinite'">
            {{ $t('showing') }} {{ rows.length }} {{ $t('of') }} {{ serverTotal }}
          </template>
          <template v-else>
            {{ $t('showing') }} {{ paginationStartIndex + 1 }}-{{ Math.min(paginationEndIndex, serverTotal) }} {{
              $t('of') }} {{ serverTotal }}
          </template>
        </span>
        <UBadge v-if="selectedKeys.length > 0" color="primary" variant="subtle" size="sm">
          {{ selectedKeys.length }} {{ $t('selected') }}
        </UBadge>
        <UBadge v-if="effectiveSelectionMode === 'single'" color="info" variant="subtle" size="xs">
          {{ $t('singleSelect') }}
        </UBadge>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="filterable" class="relative">
          <UInput v-model="filterQueryInternal" :placeholder="filterPlaceholder || String($t('filter'))" size="sm"
            :icon="icons.filter" class="w-32 sm:w-40" />
          <UButton v-if="filterQueryInternal" :icon="icons.close" variant="link" color="neutral" size="xs"
            :padded="false" class="absolute right-1 top-1/2 -translate-y-1/2" @click="filterQueryInternal = ''" />
        </div>

        <UPopover>
          <UButton :icon="icons.tableSettings" variant="ghost" color="neutral" size="sm" :title="$t('tableSettings')" />
          <template #content>
            <div class="p-3 w-75 max-h-250 overflow-y-auto">
              <div class="text-xs font-medium text-(--color-text-muted) uppercase mb-3">{{ $t('tableSettings') }}</div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('displayMode') }}</label>
                <div class="flex gap-1">
                  <UButton size="xs" :variant="tableSettings.settings.displayMode === 'infinite' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1" @click="changeDisplayMode('infinite')">
                    <UIcon :name="icons.arrowDown" class="w-3 h-3 mr-1" />
                    {{ $t('infiniteScroll') }}
                  </UButton>
                  <UButton size="xs"
                    :variant="tableSettings.settings.displayMode === 'pagination' ? 'solid' : 'outline'" color="neutral"
                    class="flex-1" @click="changeDisplayMode('pagination')">
                    <UIcon :name="icons.table" class="w-3 h-3 mr-1" />
                    {{ $t('pagination') }}
                  </UButton>
                </div>
              </div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('selectionMode') }}</label>
                <div class="flex gap-1">
                  <UButton size="xs" :variant="effectiveSelectionMode === 'multi' ? 'solid' : 'outline'" color="neutral"
                    class="flex-1" @click="forceSelectionMode('multi')">
                    {{ $t('multiSelect') }}
                  </UButton>
                  <UButton size="xs" :variant="effectiveSelectionMode === 'single' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1" @click="forceSelectionMode('single')">
                    {{ $t('singleSelect') }}
                  </UButton>
                </div>
              </div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('pageSize') }}</label>
                <USelect :model-value="tableSettings.settings.pageSize" :items="pageSizeOptions" size="xs"
                  class="w-full" @update:model-value="(v: number) => changePageSize(v)" />
              </div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('sortBy') }}</label>
                <USelect :model-value="tableSettings.settings.sortColumn" :items="sortableColumnOptions" size="xs"
                  class="w-full" @update:model-value="(v: string) => handleSort(v)" />
                <div class="flex gap-1 mt-1">
                  <UButton size="xs" :variant="tableSettings.settings.sortDirection === 'asc' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1" @click="changeSortDirection('asc')">
                    <UIcon :name="icons.sortAsc" class="w-3 h-3 mr-1" /> {{ $t('ascending') }}
                  </UButton>
                  <UButton size="xs" :variant="tableSettings.settings.sortDirection === 'desc' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1" @click="changeSortDirection('desc')">
                    <UIcon :name="icons.sortDesc" class="w-3 h-3 mr-1" /> {{ $t('descending') }}
                  </UButton>
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

        <UButton v-if="selectedKeys.length > 0" :icon="icons.clear" variant="ghost" color="neutral" size="sm"
          :title="String($t('clearSelection'))" @click="clearSelection" />

        <slot name="toolbar-right" />
      </div>
    </div>

    <!-- Table -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }" class="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div ref="tableContainer" class="flex-1 overflow-auto transition-all duration-200"
        :style="{ maxHeight: maxHeight }" @scroll="handleScroll">
        <div v-if="loading && rows.length === 0"
          class="flex items-center justify-center py-12 text-(--color-text-muted)">
          <UIcon :name="icons.loading" class="w-6 h-6 animate-spin mr-2" />
          {{ $t('loading') }}
        </div>

        <div v-else class="min-w-full">
          <table class="w-full table-auto" role="grid" :aria-label="tableLabel" :style="{ minWidth: tableMinWidth }">
            <thead class="bg-(--color-surface) sticky top-0 z-10">
              <tr role="row">
                <th v-if="selectable" class="w-10 px-3 py-2.5 text-center whitespace-nowrap" role="columnheader"
                  :aria-label="effectiveSelectionMode === 'multi' ? 'Select all' : 'Selection'">
                  <input v-if="effectiveSelectionMode === 'multi'" type="checkbox" :checked="allSelected"
                    :indeterminate="someSelected" class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue"
                    aria-label="Select all rows" @change="toggleSelectAll" />
                </th>

                <th v-for="col in visibleColumns" :key="col.key" role="columnheader"
                  :aria-sort="getSortAriaLabel(col.key)"
                  class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-(--color-text-muted) whitespace-nowrap"
                  :class="[col.headerClass, { 'cursor-pointer hover:bg-(--color-surface-hover)': col.sortable }]"
                  :style="{ width: col.width, minWidth: col.minWidth || '80px', textAlign: col.align }"
                  :tabindex="col.sortable ? 0 : undefined" @click="col.sortable && handleSort(col.key)"
                  @keydown.enter="col.sortable && handleSort(col.key)">
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
                </th>

                <th v-if="hasActions" role="columnheader"
                  class="w-24 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-(--color-text-muted) whitespace-nowrap sticky right-0 bg-(--color-surface)">
                  {{ $t('actions') }}
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-(--color-border)">
              <tr v-for="(row, idx) in rows" :key="getRowKey(row)" role="row" :aria-selected="isSelected(row)"
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
                  <slot :name="'cell-' + col.key" :row="row" :value="getNestedValue(row, col.key)" :index="idx">
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

    <!-- Pagination -->
    <div v-if="displayMode === 'pagination'"
      class="shrink-0 border-t border-(--color-border) bg-(--color-surface) px-4 py-2 mt-2 rounded-b-lg flex items-center justify-end gap-4">
      <span class="text-xs text-(--color-text-muted)">
        {{ $t('page') }} {{ currentPage }} {{ $t('of') }} {{ totalPages }}
        ({{ serverTotal }} {{ $t('items') }})
      </span>
      <div v-if="totalPages > 1" class="flex items-center gap-1">
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

const icons = useIcons()
const { t: $t } = useI18n()
const slots = useSlots()

const tableSettings = useDataTableSettings(props.tableId)

const tableContainer = ref<HTMLElement | null>(null)
const selectedKeys = ref<string[]>([])
const filterQueryInternal = ref(props.filterQuery || '')
const currentPage = ref(1)
const selectionModeOverride = ref<'single' | 'multi' | null>(null)
let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null

const displayMode = computed(() => tableSettings.settings.displayMode)
const pageSize = computed(() => tableSettings.settings.pageSize)

const effectiveSelectionMode = computed(() => {
  if (selectionModeOverride.value) return selectionModeOverride.value
  return tableSettings.settings.selectionMode
})

const tableMinWidth = computed(() => {
  const selCol = props.selectable ? 48 : 0
  const actCol = hasActions.value ? 96 : 0
  const colWidth = visibleColumns.value.length * 120
  return `${selCol + actCol + colWidth}px`
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
