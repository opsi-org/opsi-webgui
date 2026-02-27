<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

DataTable - A reusable table component with pagination and infinite scroll support.
-->
<template>
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <div ref="tableContainer" class="overflow-x-auto" :class="{ 'max-h-[600px] overflow-y-auto': infiniteScroll }"
            @scroll="handleScroll">
            <UTable :rows="displayedRows" :columns="tableColumns" :loading="loading" :empty-state="{
                icon: emptyIcon || icons.table,
                label: emptyLabel || $t('message.noItemsSelected')
            }" :ui="{
                tr: 'hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer',
                th: 'text-xs font-medium uppercase text-[var(--color-text-muted)]',
                td: 'text-sm'
            }" @select="handleRowClick">
                <!-- Column slots passed through -->
                <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
                    <slot :name="slotName" v-bind="slotProps" />
                </template>
            </UTable>

            <!-- Infinite scroll loading indicator -->
            <div v-if="infiniteScroll && hasMoreData && !loading"
                class="py-4 text-center text-sm text-[var(--color-text-muted)]">
                <UIcon :name="icons.loading" class="w-4 h-4 animate-spin inline mr-2" />
                {{ $t('scrollDownToLoadNextPage') }}
            </div>
        </div>

        <!-- Pagination footer -->
        <div v-if="!infiniteScroll && totalPages > 1"
            class="border-t border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
            <div class="text-sm text-[var(--color-text-muted)]">
                {{ $t('showing') }} {{ startIndex + 1 }}-{{ Math.min(endIndex, total) }} {{ $t('of') }} {{
                    total }}
            </div>
            <div class="flex items-center gap-2">
                <UButton :icon="icons.arrowLeft" variant="outline" color="neutral" size="xs"
                    :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" />
                <div class="flex items-center gap-1">
                    <template v-for="page in visiblePages" :key="page">
                        <span v-if="page === '...'" class="px-2 text-[var(--color-text-muted)]">...</span>
                        <UButton v-else :variant="page === currentPage ? 'solid' : 'ghost'"
                            :color="page === currentPage ? 'primary' : 'neutral'" size="xs" class="min-w-[32px]"
                            @click="goToPage(page as number)">
                            {{ page }}
                        </UButton>
                    </template>
                </div>
                <UButton :icon="icons.arrowRight" variant="outline" color="neutral" size="xs"
                    :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" />
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
interface Column {
    key: string
    label: string
    sortable?: boolean
    class?: string
}

interface Props {
    rows: any[]
    columns: Column[]
    loading?: boolean
    pageSize?: number
    infiniteScroll?: boolean
    emptyIcon?: string
    emptyLabel?: string
    rowKey?: string
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    pageSize: 20,
    infiniteScroll: false,
    rowKey: 'id'
})

const emit = defineEmits<{
    select: [row: any]
    loadMore: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const tableContainer = ref<HTMLElement | null>(null)
const currentPage = ref(1)
const loadedPages = ref(1)

// Computed
const total = computed(() => props.rows.length)
const totalPages = computed(() => Math.ceil(total.value / props.pageSize))

const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
const endIndex = computed(() => currentPage.value * props.pageSize)

const displayedRows = computed(() => {
    if (props.infiniteScroll) {
        return props.rows.slice(0, loadedPages.value * props.pageSize)
    }
    return props.rows.slice(startIndex.value, endIndex.value)
})

const hasMoreData = computed(() => {
    if (props.infiniteScroll) {
        return loadedPages.value * props.pageSize < total.value
    }
    return false
})

const tableColumns = computed(() => props.columns.map(col => ({
    ...col,
    id: col.key,
    accessorKey: col.key,
})))

const visiblePages = computed(() => {
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

// Methods
function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

function handleRowClick(row: any) {
    emit('select', row)
}

function handleScroll() {
    if (!props.infiniteScroll || !tableContainer.value || props.loading) return

    const { scrollTop, scrollHeight, clientHeight } = tableContainer.value
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMoreData.value) {
        loadedPages.value++
        emit('loadMore')
    }
}

// Reset pagination when rows change
watch(() => props.rows, () => {
    currentPage.value = 1
    loadedPages.value = 1
})
</script>
