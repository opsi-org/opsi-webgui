<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

EnhancedTable - A reusable table component with pagination and infinite scroll support.
-->
<template>
    <div class="enhanced-table">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex flex-wrap items-center gap-2">
                <!-- Clear Selection -->
                <UButton v-if="selectable && selectedRowKeys.length > 0" :icon="icons.clear" variant="outline"
                    color="neutral" size="sm" @click="clearSelection" :title="$t('clearSelection')">
                    <span class="hidden sm:inline">{{ selectedRowKeys.length }}</span>
                </UButton>

                <!-- Filter Input -->
                <div v-if="filterable" class="relative w-full sm:w-48">
                    <UInput v-model="filterQuery" :placeholder="$t('typeToFilter')" size="sm" class="w-full pl-8">
                    </UInput>
                    <UIcon :name="icons.filter"
                        class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <UButton v-if="filterQuery" :icon="icons.close" variant="link" color="neutral" size="xs"
                        :padded="false" class="absolute right-1 top-1/2 -translate-y-1/2" @click="filterQuery = ''" />
                </div>

                <!-- Column Settings -->
                <UPopover v-if="columnToggle">
                    <UButton :icon="icons.columns" variant="outline" color="neutral" size="sm"
                        :title="$t('columnSettings')" />
                    <template #content>
                        <div class="p-3 space-y-2 max-h-64 overflow-y-auto min-w-48">
                            <div class="text-xs font-medium text-[var(--color-text-muted)] uppercase mb-2">
                                {{ $t('columns') }}
                            </div>
                            <label v-for="col in toggleableColumns" :key="col.key"
                                class="flex items-center gap-2 cursor-pointer hover:bg-[var(--color-surface)] p-1 rounded">
                                <input type="checkbox" v-model="columnVisibility[col.key]" :disabled="col.alwaysVisible"
                                    class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue disabled:opacity-50" />
                                <span class="text-sm" :class="{ 'opacity-50': col.alwaysVisible }">{{ col.label
                                    }}</span>
                            </label>
                        </div>
                    </template>
                </UPopover>

                <!-- Refresh -->
                <UButton v-if="showRefresh" :icon="icons.refresh" variant="outline" color="neutral" size="sm"
                    :loading="loading" @click="refresh" :title="$t('refresh')" />
            </div>

            <!-- Right actions slot -->
            <div class="flex items-center gap-2">
                <slot name="toolbar-right" />
            </div>
        </div>

        <!-- Table Container -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <div ref="tableContainer" class="overflow-x-auto transition-all duration-200"
                :class="{ 'max-h-[calc(100vh-280px)] overflow-y-auto': infiniteScroll }" @scroll="handleScroll">

                <div v-if="loading && rows.length === 0"
                    class="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin mr-2" />
                    {{ $t('loading') }}
                </div>

                <table v-else class="w-full" role="grid" aria-label="Data table">
                    <thead class="bg-[var(--color-surface)] dark:bg-[var(--color-surface)] sticky top-0 z-10">
                        <tr role="row">
                            <th v-if="selectable" class="w-10 px-3 py-3 text-center" role="columnheader"
                                aria-label="Select all">
                                <input type="checkbox" :checked="allSelected" :indeterminate="someSelected"
                                    @change="toggleSelectAll" aria-label="Select all rows"
                                    class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue" />
                            </th>
                            <th v-for="col in visibleColumns" :key="col.key" role="columnheader"
                                :aria-sort="sortState.column === col.key ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : undefined"
                                class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]"
                                :class="[col.headerClass, { 'cursor-pointer hover:bg-[var(--color-surface-hover)]': col.sortable }]"
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
                                class="w-24 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                                {{ $t('actions') }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[var(--color-border)]">
                        <tr v-for="(row, idx) in displayedRows" :key="getRowKey(row, idx)" role="row"
                            :aria-selected="isSelected(row)" :tabindex="clickable ? 0 : undefined"
                            class="hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-opsi-blue)]"
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
                                class="px-3 py-3 text-sm text-[var(--color-text)]" :class="col.class"
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
                                <div class="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
                                    <UIcon :name="emptyIcon || icons.table" class="w-8 h-8 opacity-50" />
                                    <span>{{ emptyLabel || $t('message.noItemsSelected') }}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Infinite scroll indicator -->
                <div v-if="infiniteScroll && hasMoreData && !loading"
                    class="py-3 text-center text-sm text-[var(--color-text-muted)]">
                    <UIcon :name="icons.loading" class="w-4 h-4 animate-spin inline mr-2" />
                    {{ $t('scrollDownToLoadNextPage') }}
                </div>
            </div>

            <!-- Pagination Footer -->
            <div v-if="!infiniteScroll && pagination.total > pagination.pageSize"
                class="border-t border-[var(--color-border)] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div class="text-sm text-[var(--color-text-muted)]">
                    {{ $t('showing') }} {{ startIndex + 1 }}-{{ Math.min(endIndex, pagination.total) }} {{ $t('of') }}
                    {{ pagination.total }}
                </div>
                <div class="flex items-center gap-2">
                    <UButton :icon="icons.arrowLeft" variant="outline" color="neutral" size="xs"
                        :disabled="pagination.page === 1" @click="goToPage(pagination.page - 1)" />
                    <div class="flex items-center gap-1">
                        <template v-for="page in visiblePages" :key="page">
                            <span v-if="page === '...'" class="px-2 text-[var(--color-text-muted)]">...</span>
                            <UButton v-else :variant="page === pagination.page ? 'solid' : 'ghost'"
                                :color="page === pagination.page ? 'primary' : 'neutral'" size="xs" class="min-w-[32px]"
                                @click="goToPage(page as number)">
                                {{ page }}
                            </UButton>
                        </template>
                    </div>
                    <UButton :icon="icons.arrowRight" variant="outline" color="neutral" size="xs"
                        :disabled="pagination.page === totalPages" @click="goToPage(pagination.page + 1)" />
                </div>
            </div>
        </UCard>
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
const filterQuery = ref('')
const loadedPages = ref(1)
const selectedRowKeys = ref<string[]>([])
const columnVisibility = ref<Record<string, boolean>>({})

onMounted(() => {
    props.columns.forEach(col => {
        columnVisibility.value[col.key] = col.visible !== false
    })
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
    if (props.clickable) {
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
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMoreData.value) {
        loadedPages.value++
        emit('load-more')
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

defineExpose({
    refresh,
    clearSelection,
    getSelectedRows: () => props.rows.filter(row => selectedRowKeys.value.includes(getRowKey(row, -1))),
})
</script>
