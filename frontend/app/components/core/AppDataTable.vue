<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppDataTable - Main data table with sorting, filtering, selection, and pagination.
-->
<template>
  <div class="data-table flex flex-col h-full min-h-0 min-w-0" :class="{ 'data-table--compact': isCompactDensity }">
    <div class="shrink-0 flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
      <div class="flex items-center gap-3 text-sm">
        <UButton
          v-if="selectedKeys.length > 0"
          :icon="icons.xCircle"
          variant="soft"
          color="primary"
          size="xs"
          :title="`${selectedKeys.length} ${$t('common.selected')} - ${$t('common.clearSelection')}`"
          @click="clearSelection"
        >
          {{ selectedKeys.length }}
        </UButton>
        <UBadge v-if="effectiveSelectionMode === 'single'" color="info" variant="subtle" size="xs">
          {{ $t('settings.singleSelect') }}
        </UBadge>
      </div>

      <div class="flex items-center gap-2">
        <CoreAppFilterInput
          v-if="filterable"
          v-model="filterQueryInternal"
          :placeholder="String($t('common.filter'))"
          size="sm"
          input-class="w-full sm:w-56 md:w-72 lg:w-80"
        />

        <UPopover v-model:open="tableSettingsOpen">
          <UButton
            :icon="icons.tableSettings"
            :aria-label="$t('settings.table')"
            variant="outline"
            color="primary"
            size="sm"
            :title="$t('settings.table')"
            data-testid="table-settings"
          />
          <template #content>
            <div class="p-2.5 min-w-96 overflow-y-auto bg-(--color-background) rounded shadow-lg">
              <div class="text-sm font-medium text-(--color-text-muted) mb-2.5">
                {{ $t('settings.table') }}
              </div>

              <div class="mb-3 grid grid-cols-[6.5rem_1fr] items-center gap-x-2 gap-y-2.5">
                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.display') }}</span>
                <div class="flex gap-0.5">
                  <UButton
                    size="xs"
                    class="flex-1"
                    :color="'primary'"
                    :variant="tableSettings.settings.displayMode === 'infinite' ? 'solid' : 'outline'"
                    @click="changeDisplayMode('infinite')"
                  >
                    {{ $t('settings.infiniteScroll') }}
                  </UButton>
                  <UButton
                    size="xs"
                    class="flex-1"
                    :color="'primary'"
                    :variant="tableSettings.settings.displayMode === 'pagination' ? 'solid' : 'outline'"
                    @click="changeDisplayMode('pagination')"
                  >
                    {{ $t('table.pagination') }}
                  </UButton>
                </div>

                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.selection') }}</span>
                <div class="flex gap-0.5">
                  <UButton
                    size="xs"
                    class="flex-1"
                    :color="'primary'"
                    :variant="effectiveSelectionMode === 'multi' ? 'solid' : 'outline'"
                    @click="forceSelectionMode('multi')"
                  >
                    {{ $t('settings.multiSelect') }}
                  </UButton>
                  <UButton
                    size="xs"
                    class="flex-1"
                    :color="'primary'"
                    :variant="effectiveSelectionMode === 'single' ? 'solid' : 'outline'"
                    @click="forceSelectionMode('single')"
                  >
                    {{ $t('settings.singleSelect') }}
                  </UButton>
                </div>

                <template v-if="panelViewOptions?.length">
                  <span class="text-xs text-(--color-text-muted)">{{ $t('settings.panelView') }}</span>
                  <USelect
                    :model-value="panelView"
                    :items="panelViewOptions"
                    size="xs"
                    :aria-label="String($t('settings.panelView'))"
                    @update:model-value="(v: string) => emit('update:panelView', v)"
                  />
                </template>

                <template v-if="rowActionsOptions">
                  <span class="text-xs text-(--color-text-muted)">{{ $t('settings.rowActions') }}</span>
                  <div class="flex items-center gap-2">
                    <CoreAppCheckbox
                      :model-value="rowActionsOptions.showAll"
                      :aria-label="String($t('settings.showAllRowActions'))"
                      @update:model-value="(value: boolean) => emit('update:showAllRowActions', value)"
                    />
                    <span class="text-xs">{{ $t('settings.showAllRowActions') }}</span>
                  </div>
                </template>

                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.pageSize') }}</span>
                <USelect
                  :model-value="tableSettings.settings.pageSize"
                  :items="pageSizeOptions"
                  size="xs"
                  :aria-label="String($t('settings.pageSize'))"
                  @update:model-value="(v: number) => changePageSize(v)"
                />

                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.sortBy') }}</span>
                <div class="flex items-center gap-1">
                  <USelect
                    :model-value="tableSettings.settings.sortColumn"
                    :items="sortableColumnOptions"
                    size="xs"
                    :aria-label="String($t('settings.sortBy'))"
                    class="flex-1"
                    @update:model-value="(v: string) => handleSort(v)"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :icon="tableSettings.settings.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
                    :title="
                      tableSettings.settings.sortDirection === 'asc' ? String($t('common.ascending')) : String($t('common.descending'))
                    "
                    @click="toggleSortDirection"
                  />
                </div>
              </div>

              <div class="mb-4">
                <span class="text-xs text-(--color-text-muted) block mb-1">{{ $t('settings.columns') }}</span>
                <div class="space-y-0.5 max-h-40 overflow-y-auto">
                  <button
                    v-for="col in toggleableColumns"
                    :key="col.key"
                    type="button"
                    class="w-full text-left flex items-center gap-2 px-1 py-1 rounded hover:bg-(--color-surface-hover) cursor-pointer"
                    @click="onToggleableColumnRowClick($event, col)"
                  >
                    <CoreAppCheckbox
                      :model-value="isColumnVisibleComputed(col.key)"
                      :disabled="col.alwaysVisible"
                      :aria-label="resolveColumnLabel(col)"
                      @click.stop
                      @update:model-value="(value: boolean) => setColumnVisibility(col.key, value)"
                    />
                    <span class="text-xs" :class="{ 'opacity-50': col.alwaysVisible }">{{ resolveColumnLabel(col) }}</span>
                  </button>
                </div>
              </div>

              <UButton variant="outline" color="primary" size="xs" block @click="resetTableSettings">
                {{ $t('common.resetDefaults') }}
              </UButton>
            </div>
          </template>
        </UPopover>

        <UButton
          v-if="showRefresh"
          :icon="icons.refresh"
          variant="ghost"
          color="neutral"
          size="sm"
          :loading="loading"
          :title="String($t('common.refresh'))"
          @click="handleRefresh"
        />
      </div>
    </div>

    <UCard
      :ui="{ body: 'p-0 sm:p-0 flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden' }"
      :style="{ maxHeight: effectiveMaxHeight }"
      class="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- scrollable region with keyboard navigation, role=region + tabindex is correct ARIA -->
      <div
        ref="tableContainer"
        class="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-auto transition-all duration-100"
        tabindex="0"
        role="region"
        :aria-label="String($t('settings.table'))"
        @scroll="handleScroll"
        @keydown="handleTableKeydown"
      >
        <div v-if="loading && rows.length === 0" class="py-12">
          <CoreAppLoadingSpinner size="lg" />
        </div>

        <div v-else>
          <table class="w-max min-w-full" role="grid">
            <thead class="bg-(--color-surface) sticky top-0 z-30">
              <tr>
                <th
                  v-if="selectable"
                  class="w-9 px-1 py-0.5 text-center whitespace-nowrap bg-(--color-surface)"
                  :aria-label="effectiveSelectionMode === 'multi' ? 'Select all' : 'Selection'"
                >
                  <div class="flex items-center justify-center gap-1">
                    <input
                      v-if="effectiveSelectionMode === 'multi'"
                      type="checkbox"
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      class="rounded border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                      aria-label="Select all rows"
                      @change="toggleSelectAll"
                    />
                    <UButton
                      v-if="selectedKeys.length > 0"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      :icon="sortBySelection ? icons.sortDesc : icons.sort"
                      :class="sortBySelection ? '' : 'opacity-30'"
                      class="p-0! w-4 h-4"
                      :title="String($t('settings.sortBySelection'))"
                      @click.stop="sortBySelection = !sortBySelection"
                    />
                  </div>
                </th>

                <th
                  v-for="col in visibleColumns"
                  :key="col.key"
                  :aria-sort="getSortAriaLabel(col.key)"
                  class="px-[0.4rem] py-0.5 text-left text-xs font-medium tracking-wide text-(--color-text-muted) whitespace-nowrap"
                  :class="[
                    col.headerClass,
                    { 'cursor-pointer hover:bg-(--color-surface-hover)': col.sortable },
                    col.stickyRight ? 'sticky z-40 bg-(--color-surface) shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]' : '',
                  ]"
                  :style="{
                    width: col.width,
                    minWidth: col.minWidth || '68px',
                    maxWidth: col.maxWidth,
                    textAlign: col.align,
                    ...(col.stickyRight ? { right: hasActions ? actionsColWidth + 'px' : '0' } : {}),
                  }"
                  :tabindex="col.sortable ? 0 : undefined"
                  @click="col.sortable && handleSort(col.key)"
                  @keydown.enter="col.sortable && handleSort(col.key)"
                >
                  <slot
                    :name="`header-cell-${col.key}` as any"
                    :column="col"
                    :sort-column="tableSettings.settings.sortColumn"
                    :sort-direction="tableSettings.settings.sortDirection"
                  >
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
                        <UIcon
                          v-if="tableSettings.settings.sortColumn === col.key"
                          :name="tableSettings.settings.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
                          class="w-2 h-2"
                        />
                        <UIcon v-else :name="icons.sort" class="w-2 h-2 opacity-30" />
                      </template>
                    </div>
                  </slot>
                </th>

                <th
                  v-if="hasActions"
                  ref="actionsHeaderRef"
                  class="min-w-12 px-0.5 py-0.5 text-center text-xs font-medium tracking-wide text-(--color-text-muted) whitespace-nowrap sticky right-0 bg-(--color-surface) z-40 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                >
                  {{ $t('actions.title') }}
                </th>
              </tr>
            </thead>

            <tbody class="data-table-body" :class="{ 'pb-2': displayMode === 'pagination' }">
              <tr
                v-for="(row, idx) in displayRows"
                :key="getRowKey(row)"
                :aria-selected="isSelected(row)"
                :tabindex="0"
                class="group data-table-row hover:bg-(--color-surface-hover) focus:outline-none focus:ring-2 focus:ring-inset focus:ring-opsi-blue focus:ring-offset-1 focus:ring-offset-(--color-background)"
                :class="{
                  'cursor-pointer': true,
                  'bg-(--color-primary-soft-bg)': isHighlighted(row),
                  'shadow-[inset_3px_0_0_0_var(--color-primary)]': isActive(row),
                }"
                @click="handleRowClick(row, $event)"
                @keydown.enter="handleRowClick(row, $event)"
              >
                <td v-if="selectable" class="px-1 py-px text-center align-middle" role="gridcell" @click.stop="handleCheckboxClick(row)">
                  <input
                    v-if="effectiveSelectionMode === 'multi'"
                    type="checkbox"
                    :checked="isSelected(row)"
                    class="rounded border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                    :aria-label="'Select row ' + getRowKey(row)"
                  />
                  <input
                    v-else
                    type="radio"
                    :checked="isSelected(row)"
                    :name="tableId + '-selection'"
                    class="border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                    :aria-label="'Select row ' + getRowKey(row)"
                  />
                </td>

                <td
                  v-for="col in visibleColumns"
                  :key="col.key"
                  role="gridcell"
                  class="px-[0.4rem] py-px text-sm leading-4 text-(--color-text) whitespace-nowrap align-middle"
                  :class="[
                    col.class,
                    col.stickyRight
                      ? [
                          'sticky z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]',
                          isHighlighted(row)
                            ? 'bg-(--color-row-selected)'
                            : 'bg-(--color-background) group-hover:bg-(--color-surface-hover)',
                        ]
                      : '',
                  ]"
                  :style="{
                    width: col.width,
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                    textAlign: col.align,
                    ...(col.stickyRight ? { right: hasActions ? actionsColWidth + 'px' : '0' } : {}),
                  }"
                >
                  <slot :name="`cell-${col.key}` as any" :row="row" :value="getNestedValue(row, col.key)" :index="idx">
                    <CoreAppTooltip v-if="col.tooltip && getTooltipValue(row, col)" :text="getTooltipValue(row, col)">
                      <span :class="getCellContentClass(col)">{{ formatCellValue(row, col) }}</span>
                    </CoreAppTooltip>
                    <span v-else :class="getCellContentClass(col)">{{ formatCellValue(row, col) }}</span>
                  </slot>
                </td>

                <td
                  v-if="hasActions"
                  class="px-0.5 py-px text-center sticky right-0 z-10 min-w-10 whitespace-nowrap shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                  :class="
                    isHighlighted(row) ? 'bg-(--color-row-selected)' : 'bg-(--color-background) group-hover:bg-(--color-surface-hover)'
                  "
                  @click.stop
                >
                  <div
                    class="flex items-center justify-center gap-0 rounded-md transition-colors"
                    :class="isHighlighted(row) ? 'bg-(--color-primary)/10 ring-1 ring-(--color-primary)/30 px-0.5' : ''"
                  >
                    <slot name="row-actions" :row="row" :index="idx" :selected="isSelected(row)" :active="isActive(row)" />
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
          {{ $t('common.showing') }} {{ paginationStartIndex + 1 }}-{{ Math.min(paginationEndIndex, serverTotal) }} {{ $t('common.of') }}
          {{ serverTotal }}
        </template>
      </span>
      <div v-if="displayMode === 'pagination' && totalPages > 1" class="flex items-center gap-1">
        <UButton
          :icon="icons.chevronLeft"
          :aria-label="$t('common.previous')"
          variant="outline"
          color="neutral"
          size="xs"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        />
        <template v-for="page in visiblePageNumbers" :key="page">
          <span v-if="page === '...'" class="px-2 text-(--color-text-muted)">...</span>
          <UButton
            v-else
            :aria-label="`${$t('common.page')} ${page}` + (page === currentPage ? ` (${$t('common.current')})` : '')"
            :variant="page === currentPage ? 'solid' : 'ghost'"
            :color="page === currentPage ? 'primary' : 'neutral'"
            size="xs"
            class="min-w-7"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </UButton>
        </template>
        <UButton
          :icon="icons.chevronRight"
          :aria-label="$t('common.next')"
          variant="outline"
          color="neutral"
          size="xs"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
  import { useDataTableSettings, type DataTableColumnDef } from '~/composables/useDataTableSettings'
  import { getStoredDataTableFilter, saveStoredDataTableFilter } from '~/composables/useDataTableFilter'

  export interface PageChangeParams {
    pageNumber: number
    perPage: number
    sortBy: string
    sortDesc: boolean
    filterQuery: string
    sortBySelection: boolean
  }

  interface Props {
    rows: T[]
    columns: DataTableColumnDef[]
    tableId: string
    filterStorageId?: string
    rowKey?: string
    loading?: boolean
    totalItems?: number

    selectable?: boolean
    selectedKeys?: string[]
    activeKey?: string

    filterable?: boolean
    filterQuery?: string
    showRefresh?: boolean

    maxHeight?: string
    sortBySelectionEnabled?: boolean
    panelView?: string
    panelViewOptions?: Array<{ value: string; label: string }>
    rowActionsOptions?: { showAll: boolean }
  }

  const props = withDefaults(defineProps<Props>(), {
    rowKey: 'id',
    loading: false,
    totalItems: 0,
    selectable: true,
    filterable: true,
    showRefresh: true,
    maxHeight: 'calc(100vh - 180px)',
  })

  const emit = defineEmits<{
    (e: 'select', row: T): void
    (e: 'selection-change', rows: T[], keys: string[]): void
    (e: 'refresh'): void
    (e: 'row-activate', row: T): void
    (e: 'page-change', params: PageChangeParams): void
    (e: 'update:filterQuery', value: string): void
    (e: 'update:panelView', value: string): void
    (e: 'update:showAllRowActions', value: boolean): void
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
  const effectiveFilterStorageId = computed(() => props.filterStorageId || props.tableId)

  const tableContainer = ref<HTMLElement | null>(null)
  const actionsHeaderRef = ref<HTMLElement | null>(null)
  const actionsColWidth = ref(48)
  const scrollSentinel = ref<HTMLElement | null>(null)
  const selectedKeys = ref<string[]>([])
  const selectedKeysSet = computed(() => new Set(selectedKeys.value))
  const filterQueryInternal = ref(
    props.filterQuery !== undefined ? props.filterQuery : getStoredDataTableFilter(effectiveFilterStorageId.value),
  )
  const currentPage = ref(1)
  const selectionModeOverride = ref<'single' | 'multi' | null>(null)
  const sortBySelection = ref(Boolean(props.sortBySelectionEnabled && (props.selectedKeys?.length ?? 0) > 0))
  const tableSettingsOpen = ref(false)
  const lastClickedIndex = ref<number | null>(null)

  watch(
    () => props.sortBySelectionEnabled,
    (enabled, wasEnabled) => {
      if (enabled && !wasEnabled && selectedKeys.value.length > 0 && !sortBySelection.value) {
        sortBySelection.value = true
      }
    },
  )

  watch(sortBySelection, () => {
    currentPage.value = 1
    emitPageChange()
  })

  let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null

  const displayMode = computed(() => tableSettings.settings.displayMode)
  const pageSize = computed(() => tableSettings.settings.pageSize)
  const isCompactDensity = computed(() => true)
  const effectiveMaxHeight = computed(() => {
    if (props.maxHeight !== 'calc(100vh - 180px)') return props.maxHeight
    return isCompactDensity.value ? 'calc(100vh - 155px)' : props.maxHeight
  })

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
    props.columns.filter((c) => c.sortable).map((c) => ({ value: c.key, label: c.labelKey ? String($t(c.labelKey)) : c.label })),
  )

  const toggleableColumns = computed(() => props.columns.filter((c) => !c.alwaysVisible && c.key !== 'actions'))

  const visibleColumns = computed(() => props.columns.filter((c) => c.alwaysVisible || tableSettings.isColumnVisible(c.key, props.columns)))

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
    if (displayMode.value === 'infinite') return hasMoreInfiniteData(autoPageStalled.value, props.rows.length, serverTotal.value)
    return false
  })

  const displayRows = computed(() => props.rows)

  const allSelected = computed(() => props.rows.length > 0 && props.rows.every((row) => isSelected(row)))

  const someSelected = computed(() => selectedKeys.value.length > 0 && !allSelected.value)

  function getPageChangeParams(): PageChangeParams {
    return {
      pageNumber: currentPage.value,
      perPage: pageSize.value,
      sortBy: tableSettings.settings.sortColumn,
      sortDesc: tableSettings.settings.sortDirection === 'desc',
      filterQuery: filterQueryInternal.value,
      sortBySelection: sortBySelection.value,
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

  function getTooltipValue(row: T, col: DataTableColumnDef): string {
    const value = formatCellValue(row, col)
    return value === '-' ? '' : value
  }

  function getCellContentClass(col: DataTableColumnDef): string {
    return col.truncate ? 'block min-w-0 truncate leading-4' : 'block leading-4'
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

  function toggleSortDirection() {
    changeSortDirection(tableSettings.settings.sortDirection === 'asc' ? 'desc' : 'asc')
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
    const rangeKeys = displayRows.value.slice(start, end + 1).map((r) => getRowKey(r))
    const rangeKeySet = new Set(rangeKeys)
    const currentSelected = selectedKeysSet.value
    const allAlreadySelected = rangeKeys.every((k) => currentSelected.has(k))
    if (allAlreadySelected) {
      selectedKeys.value = selectedKeys.value.filter((k) => !rangeKeySet.has(k))
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
    return selectedKeysSet.value.has(getRowKey(row))
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
    const selectedSet = selectedKeysSet.value
    const selected = props.rows.filter((row) => selectedSet.has(getRowKey(row)))
    emit('selection-change', selected, selectedKeys.value)
  }

  function handleRefresh() {
    autoPageStalled.value = false
    autoPageRowCountAtRequest = -1
    currentPage.value = 1
    emitPageChange()
  }

  function resetTableSettings() {
    tableSettings.reset()
    selectionModeOverride.value = null
    sortBySelection.value = Boolean(props.sortBySelectionEnabled && (props.selectedKeys?.length ?? 0) > 0)
    autoPageStalled.value = false
    autoPageRowCountAtRequest = -1
    currentPage.value = 1
    tableSettingsOpen.value = false
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
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        requestNextInfinitePage()
      }
    }
  }

  let sentinelObserver: IntersectionObserver | null = null
  let sentinelLoadPending = false
  let actionsResizeObserver: ResizeObserver | null = null
  let containerResizeObserver: ResizeObserver | null = null
  // Guard against endless next-page requests when the server reports a total
  // larger than the rows it actually returns (e.g. restricted depot access):
  // if a next-page request completes without adding new rows, stop auto-paging
  // until the row set changes again (filter, refresh, external reload).
  const autoPageStalled = ref(false)
  let autoPageRowCountAtRequest = -1

  function requestNextInfinitePage() {
    if (displayMode.value !== 'infinite' || autoPageStalled.value || sentinelLoadPending || props.loading || !hasMoreData.value) {
      return
    }
    sentinelLoadPending = true
    autoPageRowCountAtRequest = props.rows.length
    currentPage.value++
    emitPageChange()
    setTimeout(() => {
      sentinelLoadPending = false
    }, 140)
  }

  function resetInfinitePagingState() {
    if (displayMode.value !== 'infinite') return
    // Keep currentPage aligned with the amount of currently loaded rows.
    // This prevents stale high page numbers after external scope resets
    // (e.g. server selection changes from quickpanel).
    const inferredPage = Math.max(1, Math.ceil(props.rows.length / pageSize.value))
    if (currentPage.value > inferredPage) {
      currentPage.value = inferredPage
    }
    sentinelLoadPending = false
  }

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
      requestNextInfinitePage()
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
    sentinelObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            requestNextInfinitePage()
          }
        }
      },
      { root: tableContainer.value, threshold: 0.1 },
    )

    if (tableContainer.value) {
      containerResizeObserver = new ResizeObserver(() => maybeFillViewport())
      containerResizeObserver.observe(tableContainer.value)
    }

    if (props.filterable && filterQueryInternal.value) {
      emit('update:filterQuery', filterQueryInternal.value)
      currentPage.value = 1
      emitPageChange()
    }
  })

  watch(
    () => props.rows.length,
    async (newLength, oldLength) => {
      if (newLength !== oldLength) {
        // Row set changed: allow auto-paging again.
        autoPageStalled.value = false
        autoPageRowCountAtRequest = -1
      }
      await nextTick()
      resetInfinitePagingState()
      maybeFillViewport()
    },
  )

  watch(
    () => props.loading,
    (loading) => {
      if (!loading) {
        // A next-page request finished without adding rows: stall auto-paging
        // to avoid an endless request loop on inconsistent data/total.
        if (isAutoPageStalled(autoPageRowCountAtRequest, props.rows.length)) {
          autoPageStalled.value = true
        }
        autoPageRowCountAtRequest = -1
        resetInfinitePagingState()
      }
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

  function toggleColumnFromRow(col: DataTableColumnDef) {
    if (col.alwaysVisible) return
    tableSettings.toggleColumn(col.key)
  }

  function setColumnVisibility(key: string, visible: boolean) {
    const next = [...tableSettings.settings.visibleColumns]
    const hasKey = next.includes(key)
    if (visible && !hasKey) {
      next.push(key)
      tableSettings.setVisibleColumns(next)
      return
    }
    if (!visible && hasKey) {
      tableSettings.setVisibleColumns(next.filter((columnKey) => columnKey !== key))
    }
  }

  function onToggleableColumnRowClick(event: MouseEvent, col: DataTableColumnDef) {
    const target = event.target as HTMLElement
    if (target.closest("[role='checkbox'], input[type='checkbox'], label")) {
      return
    }
    toggleColumnFromRow(col)
  }

  watch(filterQueryInternal, (val) => {
    saveStoredDataTableFilter(effectiveFilterStorageId.value, val)
    emit('update:filterQuery', val)
    if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
    filterDebounceTimer = setTimeout(() => {
      currentPage.value = 1
      emitPageChange()
    }, 160)
  })

  watch(
    () => props.filterQuery,
    (newFilter) => {
      if (newFilter === undefined) return
      if (newFilter !== filterQueryInternal.value) {
        filterQueryInternal.value = newFilter
        saveStoredDataTableFilter(effectiveFilterStorageId.value, newFilter)
      }
    },
  )

  watch(
    () => [props.tableId, effectiveFilterStorageId.value],
    () => {
      if (props.filterQuery !== undefined) {
        if (props.filterQuery !== filterQueryInternal.value) {
          filterQueryInternal.value = props.filterQuery
        }
        saveStoredDataTableFilter(effectiveFilterStorageId.value, props.filterQuery)
        return
      }

      const storedFilter = getStoredDataTableFilter(effectiveFilterStorageId.value)
      if (storedFilter !== filterQueryInternal.value) {
        filterQueryInternal.value = storedFilter
      }
    },
  )

  watch(
    () => props.selectedKeys,
    (newKeys) => {
      if (newKeys) {
        selectedKeys.value = [...newKeys]
        if (newKeys.length === 0 && sortBySelection.value) {
          sortBySelection.value = false
        }
        if (newKeys.length > 1 && effectiveSelectionMode.value === 'single') {
          selectionModeOverride.value = 'multi'
        }
        if (newKeys.length <= 1 && selectionModeOverride.value === 'multi' && tableSettings.settings.selectionMode === 'single') {
          selectionModeOverride.value = null
        }
      }
    },
    { immediate: true, deep: true },
  )

  defineExpose({
    clearSelection,
    getSelectedRows: () => props.rows.filter((row) => selectedKeysSet.value.has(getRowKey(row))),
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
    contain: layout style paint;
  }

  .data-table--compact thead th {
    padding-top: 0.3125rem;
    padding-bottom: 0.3125rem;
  }

  .data-table--compact tbody td {
    padding-top: 0.1875rem;
    padding-bottom: 0.1875rem;
    padding-left: 0.4rem;
    padding-right: 0.4rem;
  }

  .data-table--compact tbody td .leading-5 {
    line-height: 1.15rem;
  }

  .data-table--compact tbody td .text-sm {
    font-size: 0.8125rem;
  }

  .data-table-row {
    content-visibility: auto;
    contain-intrinsic-size: 36px;
  }

  .data-table--compact .data-table-row {
    contain-intrinsic-size: 30px;
  }

  .data-table-body .data-table-row {
    border-bottom: 0;
  }
</style>
