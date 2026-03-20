DataTable - A high-performance, feature-rich table component with:
- Infinite scroll OR pagination (switchable)
- Multi-select OR single-select (checkbox vs radio)
- Virtual scrolling for 50,000+ rows performance
- Column visibility toggle with localStorage persistence
- Sorting with localStorage persistence
- Filter
- Row actions
- Responsive design (desktop & mobile)
<template>
  <div class="data-table flex flex-col h-full min-h-0">
    <div class="shrink-0 flex flex-wrap items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-3 text-sm">
        <span class="text-(--color-text-muted)">
          <template v-if="displayMode === 'infinite'">
            {{ $t('showing') }} {{ displayedRowCount }} {{ $t('of') }} {{ totalRowCount }}
          </template>
          <template v-else>
            {{ $t('showing') }} {{ paginationStartIndex + 1 }}-{{ Math.min(paginationEndIndex, totalRowCount) }} {{
              $t('of') }} {{ totalRowCount }}
          </template>
        </span>
        <span v-if="selectedKeys.length > 0" class="text-opsi-blue font-medium">
          {{ selectedKeys.length }} {{ $t('selected') }}
        </span>
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
                    color="neutral" class="flex-1" @click="tableSettings.setDisplayMode('infinite')">
                    <UIcon :name="icons.arrowDown" class="w-3 h-3 mr-1" />
                    {{ $t('infiniteScroll') }}
                  </UButton>
                  <UButton size="xs"
                    :variant="tableSettings.settings.displayMode === 'pagination' ? 'solid' : 'outline'" color="neutral"
                    class="flex-1" @click="tableSettings.setDisplayMode('pagination')">
                    <UIcon :name="icons.table" class="w-3 h-3 mr-1" />
                    {{ $t('pagination') }}
                  </UButton>
                </div>
              </div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('selectionMode') }}</label>
                <div class="flex gap-1">
                  <UButton size="xs" :variant="tableSettings.settings.selectionMode === 'multi' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1" @click="tableSettings.setSelectionMode('multi')">
                    {{ $t('multiSelect') }}
                  </UButton>
                  <UButton size="xs" :variant="tableSettings.settings.selectionMode === 'single' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1" @click="tableSettings.setSelectionMode('single')">
                    {{ $t('singleSelect') }}
                  </UButton>
                </div>
              </div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('pageSize') }}</label>
                <USelect :model-value="tableSettings.settings.pageSize" :items="pageSizeOptions" size="xs"
                  class="w-full" @update:model-value="(v: number) => tableSettings.setPageSize(v)" />
              </div>

              <div class="mb-4">
                <label class="text-xs text-(--color-text-muted) block mb-1">{{ $t('sortBy') }}</label>
                <USelect :model-value="tableSettings.settings.sortColumn" :items="sortableColumnOptions" size="xs"
                  class="w-full"
                  @update:model-value="(v: string) => tableSettings.setSort(v, tableSettings.settings.sortDirection)" />
                <div class="flex gap-1 mt-1">
                  <UButton size="xs" :variant="tableSettings.settings.sortDirection === 'asc' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1"
                    @click="tableSettings.setSort(tableSettings.settings.sortColumn, 'asc')">
                    <UIcon :name="icons.sortAsc" class="w-3 h-3 mr-1" /> {{ $t('ascending') }}
                  </UButton>
                  <UButton size="xs" :variant="tableSettings.settings.sortDirection === 'desc' ? 'solid' : 'outline'"
                    color="neutral" class="flex-1"
                    @click="tableSettings.setSort(tableSettings.settings.sortColumn, 'desc')">
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

    <UCard :ui="{ body: 'p-0 sm:p-0' }" class="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div ref="tableContainer" class="flex-1 overflow-auto transition-all duration-200"
        :style="{ maxHeight: maxHeight }" @scroll="handleScroll">
        <div v-if="loading && sortedRows.length === 0"
          class="flex items-center justify-center py-12 text-(--color-text-muted)">
          <UIcon :name="icons.loading" class="w-6 h-6 animate-spin mr-2" />
          {{ $t('loading') }}
        </div>

        <table v-else class="w-full min-w-max table-auto" role="grid" :aria-label="tableLabel">
          <thead class="bg-(--color-surface) sticky top-0 z-10">
            <tr role="row">
              <th v-if="selectable" class="w-10 px-3 py-2 text-center whitespace-nowrap" role="columnheader"
                :aria-label="selectionMode === 'multi' ? 'Select all' : 'Selection'">
                <input v-if="selectionMode === 'multi'" type="checkbox" :checked="allSelected"
                  :indeterminate="someSelected" class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue"
                  aria-label="Select all rows" @change="toggleSelectAll" />
              </th>

              <th v-for="col in visibleColumns" :key="col.key" role="columnheader"
                :aria-sort="getSortAriaLabel(col.key)"
                class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-(--color-text-muted) whitespace-nowrap"
                :class="[col.headerClass, { 'cursor-pointer hover:bg-(--color-surface-hover)': col.sortable }]"
                :style="{ width: col.width, minWidth: col.minWidth, textAlign: col.align }"
                :tabindex="col.sortable ? 0 : undefined" @click="col.sortable && handleSort(col.key)"
                @keydown.enter="col.sortable && handleSort(col.key)">
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  <template v-if="col.sortable">
                    <UIcon v-if="tableSettings.settings.sortColumn === col.key"
                      :name="tableSettings.settings.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
                      class="w-3 h-3" />
                    <UIcon v-else :name="icons.sort" class="w-3 h-3 opacity-30" />
                  </template>
                </div>
              </th>

              <th v-if="hasActions" role="columnheader"
                class="w-24 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-(--color-text-muted) whitespace-nowrap sticky right-0 bg-(--color-surface)">
                {{ $t('actions') }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-(--color-border)">
            <tr v-if="virtualScrollEnabled && virtualTopHeight > 0" :style="{ height: virtualTopHeight + 'px' }">
              <td :colspan="totalColSpan" />
            </tr>

            <tr v-for="(row, idx) in virtualRows" :key="getRowKey(row)" role="row" :aria-selected="isSelected(row)"
              :tabindex="clickable ? 0 : undefined"
              class="hover:bg-(--color-surface-hover) transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-opsi-blue"
              :class="{
                'cursor-pointer': clickable || selectable,
                'bg-opsi-blue/5 dark:bg-opsi-blue/10': isSelected(row),
              }" @click="handleRowClick(row, $event)" @keydown.enter="handleRowClick(row, $event)">
              <td v-if="selectable" class="px-3 py-2 text-center" role="gridcell" @click.stop>
                <input v-if="selectionMode === 'multi'" type="checkbox" :checked="isSelected(row)"
                  class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue"
                  :aria-label="`Select row ${getRowKey(row)}`" @change="toggleSelection(row)" />
                <input v-else type="radio" :checked="isSelected(row)" :name="`${tableId}-selection`"
                  class="border-gray-300 text-opsi-blue focus:ring-opsi-blue"
                  :aria-label="`Select row ${getRowKey(row)}`" @change="selectSingle(row)" />
              </td>

              <td v-for="col in visibleColumns" :key="col.key" role="gridcell"
                class="px-3 py-2 text-sm text-(--color-text)" :class="col.class" :style="{ textAlign: col.align }">
                <slot :name="`cell-${col.key}`" :row="row" :value="getNestedValue(row, col.key)" :index="idx">
                  {{ formatCellValue(row, col) }}
                </slot>
              </td>

              <td v-if="hasActions" class="px-3 py-2 text-center sticky right-0 bg-(--color-surface)" @click.stop>
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

            <tr v-if="virtualScrollEnabled && virtualBottomHeight > 0" :style="{ height: virtualBottomHeight + 'px' }">
              <td :colspan="totalColSpan" />
            </tr>

            <tr v-if="sortedRows.length === 0 && !loading">
              <td :colspan="totalColSpan" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center gap-2 text-(--color-text-muted)">
                  <UIcon :name="emptyIcon || icons.table" class="w-8 h-8 opacity-50" />
                  <span>{{ emptyLabel || $t('message.noItemsFound') }}</span>
                </div>
              </td>
            </tr>

            <tr v-if="displayMode === 'infinite' && hasMoreData && !virtualScrollEnabled" class="scroll-sentinel">
              <td :colspan="totalColSpan" class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-2 text-(--color-text-muted) text-sm">
                  <UIcon :name="icons.loading" class="w-4 h-4 animate-spin" />
                  <span>{{ $t('loading') }}...</span>
                </div>
              </td>
            </tr>

            <tr
              v-else-if="displayMode === 'infinite' && sortedRows.length > 0 && !hasMoreData && !virtualScrollEnabled">
              <td :colspan="totalColSpan" class="px-4 py-3 text-center">
                <span class="text-xs text-(--color-text-muted)">{{ $t('allItemsLoaded') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <div v-if="displayMode === 'pagination' && totalPages > 1"
      class="shrink-0 border-t border-(--color-border) bg-(--color-surface) px-4 py-2 flex items-center justify-center gap-2">
      <UButton :icon="icons.arrowLeft" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)" />
      <div class="flex items-center gap-1">
        <template v-for="page in visiblePageNumbers" :key="page">
          <span v-if="page === '...'" class="px-2 text-(--color-text-muted)">...</span>
          <UButton v-else :variant="page === currentPage ? 'solid' : 'ghost'"
            :color="page === currentPage ? 'primary' : 'neutral'" size="xs" class="min-w-8"
            @click="goToPage(page as number)">
            {{ page }}
          </UButton>
        </template>
      </div>
      <UButton :icon="icons.arrowRight" variant="outline" color="neutral" size="xs"
        :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" />
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

interface Props {
  rows: T[]
  columns: DataTableColumnDef[]
  tableId: string
  rowKey?: string
  loading?: boolean

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

  virtualScrollThreshold?: number
  rowHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  loading: false,
  selectable: true,
  filterable: true,
  showRefresh: true,
  clickable: true,
  maxHeight: 'calc(100vh - 220px)',
  virtualScrollThreshold: 500,
  rowHeight: 48,
})

const emit = defineEmits<{
  (e: 'select', row: T): void
  (e: 'selection-change', rows: T[], keys: string[]): void
  (e: 'refresh'): void
  (e: 'update:filterQuery', query: string): void
  (e: 'row-action', action: string, row: T): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const slots = useSlots()

const tableSettings = useDataTableSettings(props.tableId)

const tableContainer = ref<HTMLElement | null>(null)
const selectedKeys = ref<string[]>([])
const filterQueryInternal = ref(props.filterQuery || '')
const currentPage = ref(1)
const loadedCount = ref(tableSettings.settings.pageSize)

const scrollTop = ref(0)

const displayMode = computed(() => tableSettings.settings.displayMode)
const selectionMode = computed(() => tableSettings.settings.selectionMode)
const pageSize = computed(() => tableSettings.settings.pageSize)

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

const filteredRows = computed(() => {
  if (!filterQueryInternal.value) return props.rows
  const query = filterQueryInternal.value.toLowerCase()
  return props.rows.filter((row) =>
    visibleColumns.value.some((col) => {
      const value = getNestedValue(row, col.key)
      return String(value || '').toLowerCase().includes(query)
    })
  )
})

const sortedRows = computed(() => {
  const { sortColumn, sortDirection } = tableSettings.settings
  if (!sortColumn) return filteredRows.value

  return [...filteredRows.value].sort((a, b) => {
    const aVal = getNestedValue(a, sortColumn)
    const bVal = getNestedValue(b, sortColumn)
    const comparison = String(aVal || '').localeCompare(String(bVal || ''), undefined, { numeric: true })
    return sortDirection === 'asc' ? comparison : -comparison
  })
})

const totalRowCount = computed(() => sortedRows.value.length)
const displayedRowCount = computed(() => {
  if (displayMode.value === 'infinite') {
    return Math.min(loadedCount.value, totalRowCount.value)
  }
  return Math.min(pageSize.value, totalRowCount.value)
})

const totalPages = computed(() => Math.ceil(totalRowCount.value / pageSize.value))
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

const virtualScrollEnabled = computed(() => sortedRows.value.length > props.virtualScrollThreshold)

const visibleRowCount = computed(() => {
  if (!virtualScrollEnabled.value) return sortedRows.value.length
  const containerHeight = tableContainer.value?.clientHeight || 600
  return Math.ceil(containerHeight / props.rowHeight) + 10
})

const virtualStartIndex = computed(() => {
  if (!virtualScrollEnabled.value) return 0
  return Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - 5)
})

const virtualTopHeight = computed(() => {
  if (!virtualScrollEnabled.value) return 0
  return virtualStartIndex.value * props.rowHeight
})

const virtualBottomHeight = computed(() => {
  if (!virtualScrollEnabled.value) return 0
  const endIndex = virtualStartIndex.value + visibleRowCount.value
  const remaining = sortedRows.value.length - endIndex
  return Math.max(0, remaining * props.rowHeight)
})

const virtualRows = computed<T[]>(() => {
  if (virtualScrollEnabled.value) {
    return sortedRows.value.slice(virtualStartIndex.value, virtualStartIndex.value + visibleRowCount.value)
  }

  if (displayMode.value === 'infinite') {
    return sortedRows.value.slice(0, loadedCount.value)
  }

  return sortedRows.value.slice(paginationStartIndex.value, paginationEndIndex.value)
})

const hasMoreData = computed(() => {
  if (displayMode.value === 'infinite') {
    return loadedCount.value < totalRowCount.value
  }
  return false
})

const allSelected = computed(() =>
  virtualRows.value.length > 0 && virtualRows.value.every((row) => isSelected(row))
)

const someSelected = computed(() =>
  selectedKeys.value.length > 0 && !allSelected.value
)

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
  tableSettings.setSort(column)
}

function handleRowClick(row: T, event: Event) {
  const target = event.target as HTMLElement
  if (target.closest('button') || target.closest('[role="button"]')) return

  if (props.selectable) {
    if (selectionMode.value === 'single') {
      selectSingle(row)
    } else {
      toggleSelection(row)
    }
  }

  if (props.clickable) {
    emit('select', row)
  }
}

function isSelected(row: T): boolean {
  return selectedKeys.value.includes(getRowKey(row))
}

function toggleSelection(row: T) {
  const key = getRowKey(row)
  const idx = selectedKeys.value.indexOf(key)
  if (idx >= 0) {
    selectedKeys.value.splice(idx, 1)
  } else {
    selectedKeys.value.push(key)
  }
  emitSelectionChange()
}

function selectSingle(row: T) {
  const key = getRowKey(row)
  selectedKeys.value = [key]
  emitSelectionChange()
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedKeys.value = []
  } else {
    selectedKeys.value = virtualRows.value.map((row) => getRowKey(row))
  }
  emitSelectionChange()
}

function clearSelection() {
  selectedKeys.value = []
  emitSelectionChange()
}

function emitSelectionChange() {
  const selected = props.rows.filter((row) => selectedKeys.value.includes(getRowKey(row)))
  emit('selection-change', selected, selectedKeys.value)
}

function handleRefresh() {
  loadedCount.value = pageSize.value
  currentPage.value = 1
  emit('refresh')
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function handleScroll() {
  if (!tableContainer.value) return

  const { scrollTop: st, scrollHeight, clientHeight } = tableContainer.value
  scrollTop.value = st

  if (displayMode.value === 'infinite' && !virtualScrollEnabled.value) {
    if (st + clientHeight >= scrollHeight - 100 && hasMoreData.value && !props.loading) {
      loadedCount.value += pageSize.value
    }
  }
}

watch(filterQueryInternal, (val) => {
  emit('update:filterQuery', val)
})

watch(() => props.filterQuery, (val) => {
  if (val !== undefined && val !== filterQueryInternal.value) {
    filterQueryInternal.value = val
  }
})

watch(() => props.selectedKeys, (newKeys) => {
  if (newKeys) {
    selectedKeys.value = [...newKeys]
  }
}, { immediate: true, deep: true })

watch(() => props.rows.length, () => {
  currentPage.value = 1
  loadedCount.value = pageSize.value
})

defineExpose({
  clearSelection,
  getSelectedRows: () => props.rows.filter((row) => selectedKeys.value.includes(getRowKey(row))),
  setSelectedKeys: (keys: string[]) => {
    selectedKeys.value = keys
    emitSelectionChange()
  },
  refresh: handleRefresh,
})
</script>

<style scoped>
/* Ensure smooth scrolling */
.data-table {
  contain: layout style;
}
</style>
