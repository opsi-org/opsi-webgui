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
        <template v-if="selectable">
          <CoreAppButton
            v-if="selectedKeys.length > 0"
            :icon="icons.xCircle"
            variant="soft"
            color="primary"
            size="xs"
            :title="`${selectedKeys.length} ${$t('common.selected')} - ${$t('common.clearSelection')}`"
            @click="clearSelection"
          >
            {{ selectedKeys.length }}
          </CoreAppButton>
          <CoreAppTooltip v-if="selectedKeys.length > 0" :text="String($t('settings.showOnlySelected'))">
            <CoreAppButton
              size="xs"
              variant="ghost"
              :color="onlySelected ? 'primary' : 'neutral'"
              :icon="onlySelected ? icons.eyeOff : icons.eye"
              :aria-label="String($t('settings.showOnlySelected'))"
              data-testid="show-only-selected"
              @click="onlySelected = !onlySelected"
            />
          </CoreAppTooltip>
          <CoreAppBadge v-if="effectiveSelectionMode === 'single'" color="info" variant="subtle" size="xs">
            {{ $t('settings.singleSelect') }}
          </CoreAppBadge>
        </template>
        <slot name="status" />
      </div>

      <div class="flex items-center gap-2">
        <UFieldGroup v-if="filterable" class="min-w-0">
          <CoreAppHoverPopover
            v-if="savedSearchesScopeId"
            :aria-label="String($t('common.advancedFilters'))"
            content-class="min-w-80 max-w-100"
          >
            <CoreAppButton
              :icon="icons.filter"
              :aria-label="String($t('common.advancedFilters'))"
              variant="outline"
              :color="advancedFiltersActiveCount > 0 || savedSearchEntries.length > 0 ? 'primary' : 'neutral'"
              size="sm"
              data-testid="filters-and-saved-searches"
            >
              <template v-if="advancedFiltersActiveCount > 0">{{ advancedFiltersActiveCount }}</template>
            </CoreAppButton>

            <template #content>
              <div class="flex flex-col gap-2">
                <div v-if="$slots['filter-actions']" class="flex flex-col gap-2">
                  <slot name="filter-actions" :can-save-search="canSaveSearch" :favorite="favoriteCurrentSearch" />
                </div>
                <hr v-if="$slots['filter-actions']" class="border-(--color-border)" />
                <CoreAppSavedSearchesDropdown
                  v-model:filter-query="filterQueryInternal"
                  :entries="savedSearchEntries"
                  :can-save="canSaveQuery"
                  @apply="applySavedSearch"
                  @delete="removeSavedSearches"
                  @save="saveCurrentQuery"
                  @toggle-favorite="toggleSavedSearchFavorite"
                />
                <hr class="border-(--color-border)" />
                <div class="flex justify-end gap-2">
                  <CoreAppButton variant="soft" color="error" size="xs" :disabled="!canSaveSearch" @click="clearAllFilters">
                    {{ $t('globalSearch.clearAllFilters') }}
                  </CoreAppButton>
                  <CoreAppButton
                    variant="soft"
                    :color="favoriteFeedback ? 'warning' : 'primary'"
                    size="xs"
                    :icon="icons.starSolid"
                    :disabled="!canSaveSearch"
                    data-testid="favorite-advanced-filters"
                    @click="favorite"
                  >
                    {{ $t('savedSearches.saveAsFavorite') }}
                  </CoreAppButton>
                </div>
              </div>
            </template>
          </CoreAppHoverPopover>
          <slot v-else name="filter-actions" :can-save-search="canSaveSearch" :favorite="favoriteCurrentSearch" />
          <CoreAppFilterInput
            v-model="filterQueryInternal"
            v-model:options="filterOptions"
            :placeholder="String($t('common.filter'))"
            size="sm"
            show-options
            :saveable="!!savedSearchesScopeId"
            :pattern-valid="localMatcher.valid"
            input-class="w-full sm:w-56 md:w-72 lg:w-80"
            @save="saveCurrentQuery"
          />
        </UFieldGroup>

        <CoreAppHoverPopover :title="String($t('settings.table'))" content-class="min-w-96">
          <CoreAppButton
            :icon="icons.tableSettings"
            :aria-label="$t('settings.table')"
            variant="outline"
            color="primary"
            size="sm"
            data-testid="table-settings"
          />
          <template #content>
            <div class="max-h-[70vh] overflow-y-auto">
              <div class="mb-3 grid grid-cols-[6.5rem_1fr] items-center gap-x-2 gap-y-2.5">
                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.display') }}</span>
                <div class="flex gap-0.5">
                  <CoreAppButton
                    size="xs"
                    class="flex-1"
                    :color="'primary'"
                    :variant="tableSettings.settings.displayMode === 'infinite' ? 'solid' : 'outline'"
                    @click="changeDisplayMode('infinite')"
                  >
                    {{ $t('settings.infiniteScroll') }}
                  </CoreAppButton>
                  <CoreAppButton
                    size="xs"
                    class="flex-1"
                    :color="'primary'"
                    :variant="tableSettings.settings.displayMode === 'pagination' ? 'solid' : 'outline'"
                    @click="changeDisplayMode('pagination')"
                  >
                    {{ $t('table.pagination') }}
                  </CoreAppButton>
                </div>

                <template v-if="selectable">
                  <span class="text-xs text-(--color-text-muted)">{{ $t('settings.selection') }}</span>
                  <div class="flex gap-0.5">
                    <CoreAppButton
                      size="xs"
                      class="flex-1"
                      :color="'primary'"
                      :variant="effectiveSelectionMode === 'multi' ? 'solid' : 'outline'"
                      @click="forceSelectionMode('multi')"
                    >
                      {{ $t('settings.multiSelect') }}
                    </CoreAppButton>
                    <CoreAppButton
                      size="xs"
                      class="flex-1"
                      :color="'primary'"
                      :variant="effectiveSelectionMode === 'single' ? 'solid' : 'outline'"
                      @click="forceSelectionMode('single')"
                    >
                      {{ $t('settings.singleSelect') }}
                    </CoreAppButton>
                  </div>
                </template>

                <template v-if="panelViewOptions?.length">
                  <span class="text-xs text-(--color-text-muted)">{{ $t('settings.panelView') }}</span>
                  <CoreAppSelectMenu
                    :model-value="panelView"
                    :items="panelViewOptions"
                    size="xs"
                    open-on-hover
                    :aria-label="String($t('settings.panelView'))"
                    @update:model-value="(v: string) => emit('update:panelView', v)"
                  />
                </template>

                <template v-if="rowActionsOptions">
                  <span class="text-xs text-(--color-text-muted)">{{ $t('settings.rowActions') }}</span>
                  <CoreAppCheckbox
                    :model-value="rowActionsOptions.showAll"
                    :label="String($t('settings.showAllRowActions'))"
                    size="xs"
                    :ui="{ label: 'text-xs' }"
                    @update:model-value="(value: boolean) => emit('update:showAllRowActions', value)"
                  />
                </template>

                <span class="flex items-center gap-1 text-xs text-(--color-text-muted)">
                  {{ $t('settings.pageSize') }}
                  <CoreAppTooltip :text="String($t('settings.pageSizeHelp'))">
                    <CoreAppIcon :name="icons.info" class="w-3 h-3 cursor-help" />
                  </CoreAppTooltip>
                </span>
                <CoreAppSelectMenu
                  :model-value="tableSettings.settings.pageSize"
                  :items="pageSizeOptions"
                  size="xs"
                  open-on-hover
                  :aria-label="String($t('settings.pageSize'))"
                  @update:model-value="(v: number) => changePageSize(v)"
                />

                <span class="text-xs text-(--color-text-muted)">{{ $t('settings.sortBy') }}</span>
                <div class="flex items-center gap-1">
                  <CoreAppSelectMenu
                    :model-value="tableSettings.settings.sortColumn"
                    :items="sortableColumnOptions"
                    size="xs"
                    open-on-hover
                    :aria-label="String($t('settings.sortBy'))"
                    class="flex-1"
                    @update:model-value="(v: string) => handleSort(v)"
                  />
                  <CoreAppButton
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
                <h4 class="m-0 mb-1 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
                  {{ $t('settings.columns') }}
                </h4>
                <div class="space-y-0.5 max-h-40 overflow-y-auto">
                  <CoreAppCheckbox
                    v-for="col in toggleableColumns"
                    :key="col.key"
                    :model-value="isColumnVisibleComputed(col.key)"
                    :disabled="col.alwaysVisible"
                    :label="resolveColumnLabel(col)"
                    size="xs"
                    :ui="{ root: 'w-full px-1 py-1 rounded hover:bg-(--color-surface-hover)', label: 'text-xs w-full cursor-pointer' }"
                    @update:model-value="(value: boolean) => setColumnVisibility(col.key, value)"
                  />
                </div>
              </div>

              <CoreAppButton variant="outline" color="primary" size="xs" block @click="resetTableSettings">
                {{ $t('common.resetDefaults') }}
              </CoreAppButton>
            </div>
          </template>
        </CoreAppHoverPopover>

        <CoreAppButton
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

    <CoreAppCard
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
                  :aria-label="effectiveSelectionMode === 'multi' ? String($t('common.selectAll')) : String($t('settings.selection'))"
                >
                  <div class="flex items-center justify-center gap-1">
                    <input
                      v-if="effectiveSelectionMode === 'multi'"
                      type="checkbox"
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      class="rounded border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                      :aria-label="String($t('common.selectAll'))"
                      @change="toggleSelectAll"
                    />
                    <CoreAppButton
                      v-if="selectedKeys.length > 0"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      :icon="sortBySelection ? icons.sortDesc : icons.sort"
                      :class="sortBySelection ? '' : 'opacity-80'"
                      class="p-0! max-w-0.5 max-h-0.5"
                      :title="String($t('settings.sortBySelection'))"
                      @click.stop="sortBySelection = !sortBySelection"
                    />
                  </div>
                </th>

                <th
                  v-for="col in visibleColumns"
                  :key="col.key"
                  :aria-sort="getSortAriaLabel(col.key)"
                  class="px-[0.4rem] py-0.5 text-left text-[0.6875rem] font-medium tracking-wide text-(--color-text-muted) whitespace-nowrap"
                  :class="[
                    col.headerClass,
                    { 'cursor-pointer hover:bg-(--color-surface-hover)': col.sortable },
                    col.stickyRight ? 'sticky z-40 bg-(--color-surface) shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]' : '',
                  ]"
                  :style="{
                    width: col.width,
                    minWidth: col.minWidth || '52px',
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
                        <CoreAppTooltip :text="resolveColumnLabel(col)">
                          <CoreAppIcon :name="col.headerIcon" class="w-4 h-4" :aria-label="resolveColumnLabel(col)" />
                        </CoreAppTooltip>
                      </template>
                      <template v-else>
                        {{ resolveColumnLabel(col) }}
                      </template>
                      <template v-if="col.sortable">
                        <CoreAppIcon
                          v-if="tableSettings.settings.sortColumn === col.key"
                          :name="tableSettings.settings.sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
                          class="w-2 h-2"
                        />
                        <CoreAppIcon v-else :name="icons.sort" class="w-2 h-2 opacity-80" />
                      </template>
                    </div>
                  </slot>
                </th>

                <th
                  v-if="hasActions"
                  ref="actionsHeaderRef"
                  class="min-w-10 px-0.5 py-0.5 text-center text-[0.6875rem] font-medium tracking-wide text-(--color-text-muted) whitespace-nowrap sticky right-0 bg-(--color-surface) z-40 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                >
                  <span class="sr-only">{{ $t('actions.title') }}</span>
                </th>
              </tr>
            </thead>

            <tbody class="data-table-body" :class="{ 'pb-2': displayMode === 'pagination' }">
              <tr v-if="topSpacerHeight > 0" aria-hidden="true" class="virtual-spacer" :style="{ height: topSpacerHeight + 'px' }">
                <td :colspan="totalColSpan" class="p-0"></td>
              </tr>
              <tr
                v-for="(row, idx) in displayRows"
                :key="getRowKey(row)"
                :aria-selected="isSelected(row)"
                :tabindex="0"
                class="group data-table-row cursor-pointer hover:bg-(--color-surface-hover) focus:outline-none focus:ring-2 focus:ring-inset focus:ring-opsi-blue focus:ring-offset-1 focus:ring-offset-(--color-background)"
                :class="{
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
                    :aria-label="`${String($t('common.selectRow'))} ${getRowKey(row)}`"
                  />
                  <input
                    v-else
                    type="radio"
                    :checked="isSelected(row)"
                    :name="tableId + '-selection'"
                    class="border-(--color-border) text-opsi-blue focus:ring-opsi-blue"
                    :aria-label="`${String($t('common.selectRow'))} ${getRowKey(row)}`"
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
                  <slot :name="`cell-${col.key}` as any" :row="row" :value="getNestedValue(row, col.key)" :index="displayStartIndex + idx">
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
                    :class="isHighlighted(row) ? 'bg-primary/10 ring-1 ring-primary/30 px-0.5' : ''"
                  >
                    <slot
                      name="row-actions"
                      :row="row"
                      :index="displayStartIndex + idx"
                      :selected="isSelected(row)"
                      :active="isActive(row)"
                    />
                  </div>
                </td>
              </tr>

              <tr v-if="bottomSpacerHeight > 0" aria-hidden="true" class="virtual-spacer" :style="{ height: bottomSpacerHeight + 'px' }">
                <td :colspan="totalColSpan" class="p-0"></td>
              </tr>

              <tr v-if="visibleRows.length === 0 && !loading">
                <td :colspan="totalColSpan" class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-(--color-text-muted)">
                    <CoreAppIcon :name="icons.table" class="w-8 h-8 opacity-50" />
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
    </CoreAppCard>

    <div class="shrink-0 px-1 rounded-b-lg flex items-center justify-between gap-4">
      <span class="text-xs text-(--color-text-muted)">
        <template v-if="displayMode === 'infinite'">
          {{ $t('common.showing') }} {{ rows.length }} {{ $t('common.of') }} {{ serverTotal }}
        </template>
        <template v-else>
          {{ $t('common.showing') }} {{ paginationStartIndex + 1 }}-{{ Math.min(paginationEndIndex, serverTotal) }} {{ $t('common.of') }}
          {{ serverTotal }}
        </template>
        <span v-if="onlySelected" class="ml-1 text-(--color-warning-soft-text)">{{ $t('settings.showOnlySelectedHint') }}</span>
      </span>
      <div v-if="displayMode === 'pagination' && totalPages > 1" class="flex items-center gap-1">
        <CoreAppButton
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
          <CoreAppButton
            v-else
            :aria-label="`${$t('common.page')} ${page}` + (page === currentPage ? ` (${$t('common.current')})` : '')"
            :variant="page === currentPage ? 'solid' : 'ghost'"
            :color="page === currentPage ? 'primary' : 'neutral'"
            size="xs"
            class="min-w-7"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </CoreAppButton>
        </template>
        <CoreAppButton
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
  import { useDataTableSettings, type DataTableColumnDef } from '~/composables/data-table/useDataTableSettings'
  import { getStoredDataTableFilter, saveStoredDataTableFilter } from '~/composables/data-table/useDataTableFilter'
  import { createTextFilterOptions, createTextMatcher, hasTextFilterOptions, type TextFilterOptions } from '~/composables/useTextFilter'
  import { useSavedSearches } from '~/composables/useSavedSearches'
  import { useDataTableVirtualization } from '~/composables/data-table/useDataTableVirtualization'

  export interface PageChangeParams {
    pageNumber: number
    perPage: number
    sortBy: string
    sortDesc: boolean
    filterQuery: string
    serverFilterQuery?: string
    sortBySelection: boolean
    onlySelected: boolean
    displayMode?: 'infinite' | 'pagination'
  }

  interface Props {
    rows: T[]
    columns: DataTableColumnDef[]
    tableId: string
    filterStorageId?: string
    rowKey?: string
    loading?: boolean
    totalItems?: number
    rowOffset?: number

    selectable?: boolean
    selectedKeys?: string[]
    activeKey?: string

    filterable?: boolean
    filterQuery?: string
    showRefresh?: boolean
    savedSearchesScopeId?: string
    advancedFilters?: Record<string, unknown>

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
    rowOffset: 0,
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
    (e: 'apply-saved-search', value: { filterQuery: string; advancedFilters: Record<string, unknown> }): void
  }>()

  defineSlots<{
    [key: `header-cell-${string}`]: (props: { column: DataTableColumnDef; sortColumn: string; sortDirection: 'asc' | 'desc' }) => unknown
    [key: `cell-${string}`]: (props: { row: T; value: unknown; index: number }) => unknown
    'filter-actions': (props: { canSaveSearch: boolean; favorite: () => void }) => unknown
    status: () => unknown
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
  const onlySelected = computed({
    get: () => tableSettings.settings.onlySelected ?? false,
    set: (value: boolean) => {
      tableSettings.settings.onlySelected = value
    },
  })
  const lastClickedIndex = ref<number | null>(null)
  const filterOptions = ref<TextFilterOptions>(createTextFilterOptions())
  const favoriteFeedback = ref(false)

  // A regular expression cannot be translated into the server side LIKE search, so the
  // server returns the unfiltered page and the pattern is applied to the loaded rows only.
  // Match case / whole word stay server compatible because LIKE '%x%' is a superset of both.
  const serverFilterQuery = computed(() => (filterOptions.value.regex ? '' : filterQueryInternal.value))

  const savedSearchScope = computed(() => props.savedSearchesScopeId || '')
  const {
    savedSearches,
    save: persistSavedSearch,
    remove: removeSavedSearch,
    get: getSavedSearch,
    toggleFavorite: toggleSavedSearchFavoriteState,
  } = useSavedSearches<Record<string, unknown>>(savedSearchScope)
  const savedSearchEntries = computed(() =>
    savedSearches.value.map((entry) => ({ id: entry.id, label: entry.name, favorite: entry.favorite })),
  )

  function toggleSavedSearchFavorite(id: string) {
    toggleSavedSearchFavoriteState(id)
  }

  const hasActiveAdvancedFilters = computed(() =>
    Object.values(props.advancedFilters ?? {}).some((value) => value !== undefined && value !== '' && value !== false),
  )

  const advancedFiltersActiveCount = computed(
    () => Object.values(props.advancedFilters ?? {}).filter((value) => value !== undefined && value !== '' && value !== false).length,
  )
  const canSaveQuery = computed(() => !!filterQueryInternal.value.trim())
  const canSaveSearch = computed(() => !!filterQueryInternal.value.trim() || hasActiveAdvancedFilters.value)

  // Generic, single-place naming for a save/favorite: reused for every scope instead of each
  // advanced-filters popover describing its own conditions. Falls back to a timestamp only if
  // there is truly nothing else to describe (both quick filter and advanced filters are empty).
  function describeActiveFilters(): string {
    return Object.entries(props.advancedFilters ?? {})
      .filter(([, value]) => value !== undefined && value !== '' && value !== false)
      .map(([key, value]) => (value === true ? key : `${key}: ${value}`))
      .join(', ')
  }

  function currentSearchName() {
    const query = filterQueryInternal.value.trim()
    const advanced = describeActiveFilters()
    if (query && advanced) return `${query} · ${advanced}`
    return query || advanced || `${$t('savedSearches.title')} ${new Date().toLocaleString()}`
  }

  function saveCurrentQuery() {
    if (!canSaveQuery.value) return
    persistSavedSearch(currentSearchName(), filterQueryInternal.value, { ...(props.advancedFilters ?? {}) })
  }

  // Every saved search represents the complete table search state.
  function favoriteCurrentSearch() {
    if (!canSaveSearch.value) return
    const entry = persistSavedSearch(currentSearchName(), filterQueryInternal.value, { ...(props.advancedFilters ?? {}) })
    if (!entry.favorite) toggleSavedSearchFavoriteState(entry.id)
  }

  function favorite() {
    favoriteCurrentSearch()
    favoriteFeedback.value = true
    window.setTimeout(() => (favoriteFeedback.value = false), 800)
  }

  function removeSavedSearches(ids: string[]) {
    removeSavedSearch(ids)
  }

  function applySavedSearch(id: string) {
    const entry = getSavedSearch(id)
    if (!entry) return
    filterQueryInternal.value = entry.filterQuery
    emit('apply-saved-search', { filterQuery: entry.filterQuery, advancedFilters: entry.advancedFilters })
  }

  function clearAllFilters() {
    filterQueryInternal.value = ''
    emit('apply-saved-search', { filterQuery: '', advancedFilters: {} })
  }

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

  watch(onlySelected, () => {
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
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 250, label: '250' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
  ])

  const sortableColumnOptions = computed(() =>
    props.columns.filter((c) => c.sortable).map((c) => ({ value: c.key, label: c.labelKey ? String($t(c.labelKey)) : c.label })),
  )

  const toggleableColumns = computed(() => props.columns.filter((c) => !c.alwaysVisible && c.key !== 'actions'))

  const visibleColumns = computed(() => props.columns.filter((c) => c.alwaysVisible || tableSettings.isColumnVisible(c.key, props.columns)))

  const nestedPathCache = new Map<string, string[]>()

  function nestedPath(key: string): string[] {
    let path = nestedPathCache.get(key)
    if (!path) {
      path = key.split('.')
      nestedPathCache.set(key, path)
    }
    return path
  }

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
    if (displayMode.value === 'infinite') {
      return hasMoreInfiniteData(autoPageStalled.value, props.rowOffset + props.rows.length, serverTotal.value)
    }
    return false
  })

  const localMatcher = computed(() => createTextMatcher(filterQueryInternal.value, filterOptions.value))

  const filterableColumns = computed(() => props.columns.filter((col) => col.key !== 'actions'))

  const visibleRows = computed(() => {
    const test = localMatcher.value.test
    if (!props.filterable || !hasTextFilterOptions(filterOptions.value) || !test) return props.rows
    const cols = filterableColumns.value
    return props.rows.filter((row) => {
      for (const col of cols) {
        if (test(formatCellValue(row, col))) return true
      }
      return false
    })
  })

  const rowOffsetRef = computed(() => props.rowOffset)
  const {
    virtualizationActive,
    displayStartIndex,
    displayRows,
    topSpacerHeight,
    bottomSpacerHeight,
    resetRowHeightMeasurement,
    refreshContainerHeight,
    updateVirtualWindow,
    scrollToTop,
  } = useDataTableVirtualization({ containerRef: tableContainer, rowOffset: rowOffsetRef, rows: visibleRows })

  watch(
    () => visibleColumns.value.map((c) => c.key).join(','),
    () => resetRowHeightMeasurement(),
  )

  const allSelected = computed(() => visibleRows.value.length > 0 && visibleRows.value.every((row) => isSelected(row)))

  const someSelected = computed(() => selectedKeys.value.length > 0 && !allSelected.value)

  function getPageChangeParams(): PageChangeParams {
    return {
      pageNumber: currentPage.value,
      perPage: pageSize.value,
      sortBy: tableSettings.settings.sortColumn,
      sortDesc: tableSettings.settings.sortDirection === 'desc',
      filterQuery: filterQueryInternal.value,
      serverFilterQuery: serverFilterQuery.value,
      sortBySelection: sortBySelection.value,
      onlySelected: onlySelected.value,
      displayMode: displayMode.value,
    }
  }

  function emitPageChange() {
    emit('page-change', getPageChangeParams())
  }

  function getRowKey(row: T): string {
    return String(row[props.rowKey] ?? '')
  }

  function getNestedValue(obj: T, path: string): unknown {
    const parts = nestedPath(path)
    if (parts.length === 1) return (obj as Record<string, unknown>)[path]
    return parts.reduce((acc: unknown, part: string) => {
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
    scrollToTop()
    emitPageChange()
  }

  function changeSortDirection(dir: 'asc' | 'desc') {
    tableSettings.settings.sortDirection = dir
    currentPage.value = 1
    scrollToTop()
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
      const currentIndex = visibleRows.value.indexOf(row)
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
    const rangeKeys = visibleRows.value.slice(start, end + 1).map((r) => getRowKey(r))
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
    else selectedKeys.value = visibleRows.value.map((row) => getRowKey(row))
    emitSelectionChange()
  }

  function clearSelection() {
    selectedKeys.value = []
    selectionModeOverride.value = null
    sortBySelection.value = false
    onlySelected.value = false
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
    scrollToTop()
    emitPageChange()
  }

  function resetTableSettings() {
    tableSettings.reset()
    selectionModeOverride.value = null
    sortBySelection.value = Boolean(props.sortBySelectionEnabled && (props.selectedKeys?.length ?? 0) > 0)
    onlySelected.value = false
    autoPageStalled.value = false
    autoPageRowCountAtRequest = -1
    currentPage.value = 1
    emitPageChange()
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      scrollToTop()
      emitPageChange()
    }
  }

  let scrollFrame: number | null = null

  function handleScroll() {
    updateVirtualWindow()
    if (displayMode.value !== 'infinite' || scrollFrame !== null) return
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null
      const el = tableContainer.value
      if (!el) return
      if (shouldPrefetchNextPage({ scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight })) {
        requestNextInfinitePage()
      }
    })
  }

  let sentinelObserver: IntersectionObserver | null = null
  let sentinelLoadPending = false
  let actionsResizeObserver: ResizeObserver | null = null
  let containerResizeObserver: ResizeObserver | null = null
  const autoPageStalled = ref(false)
  let autoPageRowCountAtRequest = -1

  function requestNextInfinitePage() {
    if (displayMode.value !== 'infinite' || autoPageStalled.value || sentinelLoadPending || props.loading || !hasMoreData.value) {
      return
    }
    sentinelLoadPending = true
    autoPageRowCountAtRequest = props.rowOffset + props.rows.length
    currentPage.value++
    emitPageChange()
    setTimeout(() => {
      sentinelLoadPending = false
    }, 140)
  }

  function resetInfinitePagingState() {
    if (displayMode.value !== 'infinite') return
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
      { root: tableContainer.value, rootMargin: '400px 0px', threshold: 0 },
    )

    if (tableContainer.value) {
      containerResizeObserver = new ResizeObserver(() => {
        refreshContainerHeight()
        updateVirtualWindow()
        maybeFillViewport()
      })
      containerResizeObserver.observe(tableContainer.value)
    }

    if (props.filterable && filterQueryInternal.value) {
      emit('update:filterQuery', filterQueryInternal.value)
      currentPage.value = 1
      emitPageChange()
    }
  })

  watch(
    () => [props.rows.length, props.rowOffset],
    async ([newLength, newOffset], [oldLength, oldOffset]) => {
      if (newLength !== oldLength || newOffset !== oldOffset) {
        // Row set changed: allow auto-paging again.
        autoPageStalled.value = false
        autoPageRowCountAtRequest = -1
        resetRowHeightMeasurement()
      }
      await nextTick()
      updateVirtualWindow()
      resetInfinitePagingState()
      maybeFillViewport()
    },
  )

  watch(
    () => props.loading,
    (loading) => {
      if (!loading) {
        if (isAutoPageStalled(autoPageRowCountAtRequest, props.rowOffset + props.rows.length)) {
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
    if (scrollFrame !== null) {
      cancelAnimationFrame(scrollFrame)
      scrollFrame = null
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

  watch(
    () => filterOptions.value.regex,
    () => {
      if (!filterQueryInternal.value) return
      currentPage.value = 1
      emitPageChange()
    },
  )

  watch(filterQueryInternal, (val) => {
    saveStoredDataTableFilter(effectiveFilterStorageId.value, val)
    emit('update:filterQuery', val)
    scrollToTop()
    if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
    filterDebounceTimer = setTimeout(
      () => {
        currentPage.value = 1
        emitPageChange()
      },
      val ? 300 : 120,
    )
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
        if (newKeys.length === 0 && onlySelected.value) {
          onlySelected.value = false
        }
        if (newKeys.length > 1 && effectiveSelectionMode.value === 'single') {
          selectionModeOverride.value = 'multi'
        }
        if (newKeys.length <= 1 && selectionModeOverride.value === 'multi' && tableSettings.settings.selectionMode === 'single') {
          selectionModeOverride.value = null
        }
      }
    },
    { immediate: true },
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

  .data-table--compact .data-table-row > td {
    height: 1.875rem;
    max-height: 1.875rem;
    overflow: hidden;
  }

  .data-table-body .data-table-row {
    border-bottom: 0;
  }

  .data-table tbody tr.virtual-spacer td {
    padding: 0;
    border: 0;
  }
</style>
