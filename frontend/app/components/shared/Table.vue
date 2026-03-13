<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Table - A reusable table component with pagination and infinite scroll support.
-->
<template>
    <div class="data-table flex flex-col h-full min-h-0"
        :style="infiniteScroll ? 'max-height: calc(100vh - 180px); min-height: 300px' : ''">
        <!-- Table Container (scrollable) -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div ref="tableContainer" class="flex-1 overflow-y-auto transition-all duration-200" @scroll="handleScroll">

                <div v-if="loading && rows.length === 0"
                    class="flex items-center justify-center py-12 text-(--color-text-muted)">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin mr-2" />
                    {{ $t('loading') }}
                </div>

                <table v-else class="w-full" role="grid" aria-label="Data table">
                    <thead class="bg-(--color-surface) dark:bg-(--color-surface) sticky top-0 z-10">
                        <tr role="row">
                            <th v-if="selectable" class="w-10 px-3 py-3 text-center" role="columnheader"
                                aria-label="Select all">
                                <input type="checkbox" :checked="allSelected" :indeterminate="someSelected"
                                    @change="toggleSelectAll" aria-label="Select all rows"
                                    class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue" />
                            </th>
                            <th v-for="col in visibleColumns" :key="col.key" role="columnheader"
                                :aria-sort="sortState.column === col.key ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : undefined"
                                class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-(--color-text-muted)"
                                :class="[col.headerClass, { 'cursor-pointer hover:bg-(--color-surface-hover)': col.sortable }]"
                                :style="{ width: col.width, minWidth: col.minWidth, textAlign: col.align }"
                                @click="col.sortable && handleSort(col.key)"
                                @keydown.enter="col.sortable && handleSort(col.key)"
                                :tabindex="col.sortable ? 0 : undefined">
                                <div class="flex items-center gap-1">
                                    {{ col.label }}
                                    <template v-if="col.sortable">
                                        <UIcon v-if="sortState.column === col.key"
                                            :name="sortState.direction === 'asc' ? icons.sortAsc : icons.sortDesc"
                                            class="w-3 h-3" />
                                        <UIcon v-else :name="icons.sort" class="w-3 h-3 opacity-30" />
                                    </template>
                                </div>
                            </th>
                            <th v-if="hasActions" role="columnheader"
                                class="w-24 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-(--color-text-muted)">
                                {{ $t('actions') }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-(--color-border)">
                        <tr v-for="(row, idx) in displayedRows" :key="getRowKey(row, idx)" role="row"
                            :aria-selected="isSelected(row)" :tabindex="clickable ? 0 : undefined"
                            class="hover:bg-(--color-surface) dark:hover:bg-(--color-surface-hover) transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--color-opsi-blue)]"
                            :class="{
                                'cursor-pointer': clickable,
                                'table-row-selected': isSelected(row)
                            }" @click="handleRowClick(row)" @keydown.enter="handleRowClick(row)">
                            <td v-if="selectable" class="px-3 py-3 text-center" role="gridcell" @click.stop>
                                <input type="checkbox" :checked="isSelected(row)" @change="toggleSelection(row)"
                                    :aria-label="`Select row ${getRowKey(row, idx)}`"
                                    class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue" />
                            </td>
                            <td v-for="col in visibleColumns" :key="col.key" role="gridcell"
                                class="px-3 py-3 text-sm text-(--color-text)]" :class="col.class"
                                :style="{ textAlign: col.align }">
                                <slot :name="`${col.key}-data`" :row="row" :value="getNestedValue(row, col.key)">
                                    {{ formatCellValue(row, col) }}
                                </slot>
                            </td>
                            <td v-if="hasActions" class="px-3 py-3 text-center" @click.stop>
                                <div class="flex items-center justify-center gap-1">
                                    <slot name="row-actions" :row="row">
                                        <template v-for="action in visibleActions(row)" :key="action.icon">
                                            <UButton :icon="action.icon" variant="ghost"
                                                :color="(action.color as any) || 'neutral'" size="xs"
                                                :title="action.label" @click="action.handler(row)" />
                                        </template>
                                    </slot>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="displayedRows.length === 0 && !loading">
                            <td :colspan="totalColumns" class="px-4 py-12 text-center">
                                <div class="flex flex-col items-center gap-2 text-(--color-text-muted)">
                                    <UIcon :name="emptyIcon || icons.table" class="w-8 h-8 opacity-50" />
                                    <span>{{ emptyLabel || $t('message.noItemsSelected') }}</span>
                                </div>
                            </td>
                        </tr>
                        <!-- Infinite scroll sentinel -->
                        <tr v-if="infiniteScroll && hasMoreData" ref="scrollSentinel" class="scroll-sentinel">
                            <td :colspan="totalColumns" class="px-4 py-4 text-center">
                                <div class="flex items-center justify-center gap-2 text-(--color-text-muted) text-sm">
                                    <UIcon :name="icons.loading" class="w-4 h-4 animate-spin" />
                                    <span>{{ $t('loading') }}...</span>
                                </div>
                            </td>
                        </tr>
                        <!-- End of data marker -->
                        <tr v-else-if="infiniteScroll && displayedRows.length > 0 && !hasMoreData">
                            <td :colspan="totalColumns" class="px-4 py-3 text-center">
                                <span class="text-xs text-(--color-text-muted)">{{ $t('allItemsLoaded') }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </UCard>

        <!-- Fixed Bottom Bar -->
        <div
            class="shrink-0 border-t border-(--color-border) bg-(--color-surface) dark:bg-(--color-background) px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <!-- Left side: Showing X of Y + Table controls -->
            <div class="flex items-center gap-3">
                <!-- Showing info -->
                <div class="text-sm text-(--color-text-muted)">
                    <template v-if="infiniteScroll">
                        {{ $t('showing') }} {{ displayedRows.length }} {{ $t('of') }} {{ sortedRows.length }} {{
                            $t('items') }}
                        <span v-if="hasMoreData" class="ml-1 text-opsi-blue">
                            ({{ $t('scrollForMore') }})
                        </span>
                    </template>
                    <template v-else>
                        {{ $t('showing') }} {{ Math.min(displayedRows.length, startIndex + 1) }}-{{ Math.min(endIndex,
                            pagination.total) }} {{ $t('of') }} {{ pagination.total }}
                    </template>
                </div>

                <!-- Separator -->
                <div v-if="(selectable && selectedRowKeys.length > 0) || columnToggle || showRefresh || filterable"
                    class="hidden sm:block w-px h-4 bg-(--color-border)" />

                <!-- Clear Selection -->
                <UButton v-if="selectable && selectedRowKeys.length > 0" :icon="icons.clear" variant="ghost"
                    color="neutral" size="xs" @click="clearSelection" :title="$t('clearSelection')">
                    {{ selectedRowKeys.length }} {{ $t('selected') }}
                </UButton>

                <!-- Column Settings -->
                <UPopover v-if="columnToggle">
                    <UButton :icon="icons.columns" variant="ghost" color="neutral" size="xs"
                        :title="$t('columnSettings')" />
                    <template #content>
                        <div class="p-3 space-y-2 max-h-64 overflow-y-auto min-w-48">
                            <div class="text-xs font-medium text-(--color-text-muted) uppercase mb-2">
                                {{ $t('columns') }}
                            </div>
                            <label v-for="col in toggleableColumns" :key="col.key"
                                class="flex items-center gap-2 cursor-pointer hover:bg-(--color-surface) p-1 rounded">
                                <input type="checkbox" v-model="columnVisibility[col.key]" :disabled="col.alwaysVisible"
                                    class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue disabled:opacity-50" />
                                <span class="text-sm" :class="{ 'opacity-50': col.alwaysVisible }">{{ col.label
                                    }}</span>
                            </label>
                        </div>
                    </template>
                </UPopover>

                <!-- Filter Input (compact) -->
                <div v-if="filterable" class="relative">
                    <UInput v-model="filterQuery" :placeholder="$t('filter')" size="xs" class="w-32"
                        :icon="icons.filter" />
                    <UButton v-if="filterQuery" :icon="icons.close" variant="link" color="neutral" size="xs"
                        :padded="false" class="absolute right-1 top-1/2 -translate-y-1/2" @click="filterQuery = ''" />
                </div>

                <!-- Refresh -->
                <UButton v-if="showRefresh" :icon="icons.refresh" variant="ghost" color="neutral" size="xs"
                    :loading="loading" @click="refresh" :title="$t('refresh')" />
            </div>

            <!-- Right side: Pagination controls -->
            <div v-if="!infiniteScroll && pagination.total > pagination.pageSize" class="flex items-center gap-2">
                <UButton :icon="icons.arrowLeft" variant="outline" color="neutral" size="xs"
                    :disabled="pagination.page === 1" @click="goToPage(pagination.page - 1)" />
                <div class="flex items-center gap-1">
                    <template v-for="page in visiblePages" :key="page">
                        <span v-if="page === '...'" class="px-2 text-(--color-text-muted)">...</span>
                        <UButton v-else :variant="page === pagination.page ? 'solid' : 'ghost'"
                            :color="page === pagination.page ? 'primary' : 'neutral'" size="xs" class="min-w-8"
                            @click="goToPage(page as number)">
                            {{ page }}
                        </UButton>
                    </template>
                </div>
                <UButton :icon="icons.arrowRight" variant="outline" color="neutral" size="xs"
                    :disabled="pagination.page === totalPages" @click="goToPage(pagination.page + 1)" />
            </div>

            <!-- Right side: Actions slot for custom buttons -->
            <div class="flex items-center gap-2">
                <slot name="toolbar-right" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { TableColumn, TableSortState, TablePaginationState, TableAction } from '~/types/table.types'

interface Props {
    rows: T[]
    columns: TableColumn<T>[]
    loading?: boolean
    rowKey?: string
    pageSize?: number
    totalItems?: number
    currentPage?: number
    infiniteScroll?: boolean
    selectable?: boolean
    filterable?: boolean
    columnToggle?: boolean
    showRefresh?: boolean
    clickable?: boolean
    defaultSortColumn?: string
    defaultSortDirection?: 'asc' | 'desc'
    actions?: TableAction<T>[]
    emptyIcon?: string
    emptyLabel?: string
    selectedKeys?: string[] // External selected keys for sync
    syncSelection?: boolean // Enable bidirectional sync
    tableId?: string // When set, column visibility is persisted to localStorage
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    rowKey: 'id',
    pageSize: 20,
    totalItems: 0,
    currentPage: 1,
    infiniteScroll: false,
    selectable: false,
    filterable: true,
    columnToggle: true,
    showRefresh: true,
    clickable: true,
    defaultSortDirection: 'asc',
    syncSelection: false,
})

const emit = defineEmits<{
    (e: 'select', row: T): void
    (e: 'selection-change', rows: T[]): void
    (e: 'refresh'): void
    (e: 'page-change', page: number): void
    (e: 'sort-change', sort: TableSortState): void
    (e: 'filter-change', query: string): void
    (e: 'load-more'): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const tableContainer = ref<HTMLElement | null>(null)
const scrollSentinel = ref<HTMLElement | null>(null)
const filterQuery = ref('')
const loadedPages = ref(1)
const selectedRowKeys = ref<string[]>([])
const columnVisibility = ref<Record<string, boolean>>({})
let intersectionObserver: IntersectionObserver | null = null

const STORAGE_PREFIX = 'opsi-table-cols-'

onMounted(() => {
    // Load column visibility - from localStorage if tableId set, otherwise from column defaults
    const savedCols = props.tableId ? loadPersistedColumns(props.tableId) : null
    props.columns.forEach(col => {
        if (savedCols && col.key in savedCols) {
            columnVisibility.value[col.key] = savedCols[col.key] ?? true
        } else {
            columnVisibility.value[col.key] = col.visible !== false
        }
    })

    // Setup IntersectionObserver for infinite scroll after next tick so DOM is ready
    if (props.infiniteScroll) {
        nextTick(() => {
            setupIntersectionObserver()
        })
    }
})

// Persist column visibility changes
watch(columnVisibility, (newVis) => {
    if (props.tableId) {
        persistColumns(props.tableId, newVis)
    }
}, { deep: true })

function loadPersistedColumns(tableId: string): Record<string, boolean> | null {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + tableId)
        return raw ? JSON.parse(raw) : null
    } catch { return null }
}

function persistColumns(tableId: string, vis: Record<string, boolean>) {
    try {
        localStorage.setItem(STORAGE_PREFIX + tableId, JSON.stringify(vis))
    } catch { /* quota exceeded - ignore */ }
}

onUnmounted(() => {
    if (intersectionObserver) {
        intersectionObserver.disconnect()
        intersectionObserver = null
    }
})

function setupIntersectionObserver() {
    if (!tableContainer.value) return

    // Disconnect any previous observer
    if (intersectionObserver) {
        intersectionObserver.disconnect()
    }

    intersectionObserver = new IntersectionObserver(
        (entries) => {
            const entry = entries[0]
            if (entry && entry.isIntersecting && hasMoreData.value && !props.loading) {
                loadMoreData()
            }
        },
        {
            root: tableContainer.value,
            rootMargin: '200px 0px',
            threshold: 0.1
        }
    )

    // Try to observe sentinel immediately if it exists
    nextTick(() => {
        observeSentinel()
    })
}

function observeSentinel() {
    if (!intersectionObserver) return

    // Find the sentinel element by class
    const sentinel = tableContainer.value?.querySelector('.scroll-sentinel')
    if (sentinel) {
        intersectionObserver.observe(sentinel)
    }
}

function loadMoreData() {
    if (props.loading) return
    loadedPages.value++
    emit('load-more')
}

// Re-observe when rows change
watch(() => props.rows.length, async () => {
    if (props.infiniteScroll && intersectionObserver) {
        await nextTick()
        observeSentinel()
    }
})

const sortState = ref<TableSortState>({
    column: props.defaultSortColumn || '',
    direction: props.defaultSortDirection || 'asc'
})

const pagination = computed<TablePaginationState>(() => ({
    page: props.currentPage,
    pageSize: props.pageSize,
    total: props.totalItems || props.rows.length
}))

const toggleableColumns = computed(() =>
    props.columns.filter(col => !col.alwaysVisible)
)

const visibleColumns = computed(() =>
    props.columns.filter(col =>
        col.alwaysVisible || columnVisibility.value[col.key] !== false
    )
)

const hasActions = computed(() =>
    (props.actions && props.actions.length > 0) || !!useSlots()['row-actions']
)

const totalColumns = computed(() => {
    let count = visibleColumns.value.length
    if (props.selectable) count++
    if (hasActions.value) count++
    return count
})

const filteredRows = computed(() => {
    if (!filterQuery.value) return props.rows
    const query = filterQuery.value.toLowerCase()
    return props.rows.filter(row =>
        visibleColumns.value.some(col => {
            const value = getNestedValue(row, col.key)
            return String(value || '').toLowerCase().includes(query)
        })
    )
})

const sortedRows = computed(() => {
    if (!sortState.value.column) return filteredRows.value
    return [...filteredRows.value].sort((a, b) => {
        const aVal = getNestedValue(a, sortState.value.column)
        const bVal = getNestedValue(b, sortState.value.column)
        const comparison = String(aVal || '').localeCompare(String(bVal || ''), undefined, { numeric: true })
        return sortState.value.direction === 'asc' ? comparison : -comparison
    })
})

const startIndex = computed(() => (pagination.value.page - 1) * pagination.value.pageSize)
const endIndex = computed(() => pagination.value.page * pagination.value.pageSize)
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))

const displayedRows = computed(() => {
    if (props.totalItems > 0) {
        return props.infiniteScroll
            ? sortedRows.value.slice(0, loadedPages.value * pagination.value.pageSize)
            : sortedRows.value
    }
    return props.infiniteScroll
        ? sortedRows.value.slice(0, loadedPages.value * pagination.value.pageSize)
        : sortedRows.value.slice(startIndex.value, endIndex.value)
})

const hasMoreData = computed(() => {
    if (props.infiniteScroll) {
        return loadedPages.value * pagination.value.pageSize < sortedRows.value.length
    }
    return false
})

// Watch for sentinel element appearing/disappearing
watch(() => hasMoreData.value, async (hasMore) => {
    if (hasMore && intersectionObserver) {
        await nextTick()
        observeSentinel()
    }
})

const visiblePages = computed(() => {
    const pages: (number | string)[] = []
    const total = totalPages.value
    const current = pagination.value.page

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

const allSelected = computed(() =>
    displayedRows.value.length > 0 && displayedRows.value.every(row => isSelected(row))
)

const someSelected = computed(() =>
    selectedRowKeys.value.length > 0 && !allSelected.value
)

function getRowKey(row: T, index: number): string {
    return String(row[props.rowKey] ?? index)
}

function getNestedValue(obj: T, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part: string) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part]
        }
        return undefined
    }, obj)
}

function formatCellValue(row: T, col: TableColumn<T>): string {
    const value = getNestedValue(row, col.key)
    if (col.formatter) return String(col.formatter(value, row))
    if (value === null || value === undefined) return '-'
    if (value instanceof Date) return value.toLocaleString()
    return String(value)
}

function visibleActions(row: T): TableAction<T>[] {
    if (!props.actions) return []
    return props.actions.filter(action => !action.visible || action.visible(row))
}

function handleSort(column: string) {
    if (sortState.value.column === column) {
        sortState.value.direction = sortState.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
        sortState.value.column = column
        sortState.value.direction = 'asc'
    }
    emit('sort-change', { ...sortState.value })
}

function handleRowClick(row: T) {
    if (props.selectable) {
        // Clicking a row toggles its selection (like checkbox)
        toggleSelection(row)
    } else if (props.clickable) {
        emit('select', row)
    }
}

function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        emit('page-change', page)
    }
}

function handleScroll() {
    if (!props.infiniteScroll || !tableContainer.value || props.loading) return
    const { scrollTop, scrollHeight, clientHeight } = tableContainer.value
    // Fallback scroll detection - load more when near bottom
    if (scrollTop + clientHeight >= scrollHeight - 200 && hasMoreData.value) {
        loadMoreData()
    }
}

function refresh() {
    loadedPages.value = 1
    emit('refresh')
}

function isSelected(row: T): boolean {
    const key = getRowKey(row, -1)
    return selectedRowKeys.value.includes(key)
}

function toggleSelection(row: T) {
    const key = getRowKey(row, -1)
    const idx = selectedRowKeys.value.indexOf(key)
    if (idx >= 0) {
        selectedRowKeys.value.splice(idx, 1)
    } else {
        selectedRowKeys.value.push(key)
    }
    emitSelectionChange()
}

function toggleSelectAll() {
    if (allSelected.value) {
        selectedRowKeys.value = []
    } else {
        selectedRowKeys.value = displayedRows.value.map((row, idx) => getRowKey(row, idx))
    }
    emitSelectionChange()
}

function clearSelection() {
    selectedRowKeys.value = []
    emitSelectionChange()
}

function emitSelectionChange() {
    const selected = props.rows.filter(row => selectedRowKeys.value.includes(getRowKey(row, -1)))
    emit('selection-change', selected)
}

watch(filterQuery, (val) => {
    emit('filter-change', val)
})

watch(() => props.rows, () => {
    loadedPages.value = 1
})

// Sync external selection to internal state
watch(() => props.selectedKeys, (newKeys) => {
    if (props.syncSelection && newKeys) {
        selectedRowKeys.value = [...newKeys]
    }
}, { immediate: true, deep: true })

defineExpose({
    refresh,
    clearSelection,
    getSelectedRows: () => props.rows.filter(row => selectedRowKeys.value.includes(getRowKey(row, -1))),
    setSelectedKeys: (keys: string[]) => {
        selectedRowKeys.value = keys
        emitSelectionChange()
    },
})
</script>
