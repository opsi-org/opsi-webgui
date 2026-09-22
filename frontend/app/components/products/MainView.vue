<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsMainView - Product table with configuration panel and depot selection.
-->
<template>
  <CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelLeave" @confirm="confirmLeave" />

  <LayoutsPageLayout
    show-refresh
    :loading="loading"
    :show-panel="showConfigPanel"
    :allow-x-scroll="panelMode"
    :changes-detected="changesDetected && !autoRefreshEnabled"
    :changes-description="lastChangeDescription"
    @close-panel="closePanel"
    @refresh="manualRefresh"
  >
    <template #tabs>
      <slot name="tabs" />
    </template>
    <template #actions>
      <CoreAppTooltip v-if="isProductGroupAccessRestricted" :text="$t('opsiConfig.serverFeatures.productGroupAccess.disabled')">
        <CoreAppBadge color="warning" variant="subtle" size="xs" class="cursor-help" data-testid="products-restricted-badge">
          {{ $t('auth.restricted') }}
        </CoreAppBadge>
      </CoreAppTooltip>
      <ProductsQuickActionsDropdown :products="products" :compact="panelMode" @applied="fetchProducts" :class="panelMode ? '' : 'w-70'" />
      <CoreAppButton
        variant="outline"
        color="primary"
        size="sm"
        :icon="icons.onDemand"
        :title="String($t('products.processHelp'))"
        :aria-label="String($t('actions.processRequests'))"
        @click="processActionsOpen = true"
      >
        <span v-if="!panelMode">{{ $t('actions.processRequests') }}</span>
      </CoreAppButton>
    </template>

    <template #saveActions>
      <CoreAppUnsavedChangesModal
        :product-config-ref="productConfigTabsRef"
        :config-product-id="configProduct?.productId"
        mode="actionRequests"
        :selected-product-ids="selectedProductIds"
        :show-process-options="true"
        :client-ids="selectionStore.selectedClients"
        @save-all="handleSaveAll"
        @discard-all="discardActionRequestsOnly"
      />
    </template>

    <CoreAppErrorBanner :error="error" :show="!!(error || actionStatus)" @close="error = null">
      <CoreAppAlertInline
        v-if="actionStatus"
        :color="actionStatus.type"
        :title="actionStatus.title"
        variant="subtle"
        closable
        compact
        @close="closeActionStatus"
      >
        <template #description>
          <span class="inline-flex items-center gap-2 flex-wrap">
            <span class="font-normal text-xs">{{ actionStatus.message }}</span>
            <CoreAppButton
              v-if="bulkActionResult && bulkActionResult.details.length > 0"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="openBulkResultDetails"
            >
              {{ $t('common.details') }}
            </CoreAppButton>
          </span>
        </template>
      </CoreAppAlertInline>
    </CoreAppErrorBanner>

    <ProductsProcessActionsModal
      v-model:open="processActionsOpen"
      :selected-product-ids="selectedProductIds"
      @started="handleProcessActionsStarted"
      @completed="handleProcessActionsCompleted"
    />

    <CoreAppModal
      v-if="bulkResultModalMounted"
      v-model:open="bulkResultModalOpen"
      :dismissible="true"
      :ui="{ content: 'w-[94vw] max-w-4xl max-h-[84vh]' }"
    >
      <template #content>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-heading uppercase tracking-wide flex items-center gap-2 m-0">
              <CoreAppIcon :name="icons.onDemand" class="w-5 h-5" />
              {{ $t('actions.results') }} - {{ $t('actions.processRequests') }}
            </h3>
            <CoreAppButton
              :icon="icons.x"
              variant="ghost"
              color="neutral"
              :aria-label="String($t('common.close'))"
              @click="bulkResultModalOpen = false"
            />
          </div>

          <CoreAppActionResultsTable v-model:filter="bulkResultFilter" :details="bulkActionResult?.details ?? []" />
        </div>
      </template>
    </CoreAppModal>

    <CoreAppDataTable
      :key="tableId"
      :rows="products"
      :columns="columns"
      :loading="loading"
      :table-id="tableId"
      :filter-storage-id="filterStorageId"
      :filter-query="currentFilterQuery"
      saved-searches-scope-id="products"
      :advanced-filters="advancedFilters"
      row-key="productId"
      :selectable="true"
      :filterable="true"
      :show-refresh="false"
      :total-items="totalItems"
      :row-offset="rowOffset"
      :selected-keys="selectedTableKeys"
      :active-key="configProduct?.productId"
      :sort-by-selection-enabled="sortBySelectionEnabled"
      @row-activate="handleRowActivate"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @update:filter-query="handleFilterQueryUpdate"
      @apply-saved-search="handleApplySavedSearch"
      @refresh="fetchProducts"
    >
      <template #filter-actions="{ canSaveSearch, favorite }">
        <ProductsAdvancedFiltersPopover
          v-model="advancedFilters"
          :can-save-search="canSaveSearch"
          @update:model-value="handleAdvancedFiltersChange"
          @favorite="favorite"
        />
      </template>
      <template #header-cell-actionRequest="{ sortColumn, sortDirection }">
        <ProductsActionRequestDropdown
          mode="header"
          :has-clients-selected="selectionStore.selectedClients.length > 0"
          :has-products-selected="selectionStore.selectedProducts.length > 0"
          :sort-column="sortColumn"
          :sort-direction="sortDirection as 'asc' | 'desc'"
          @apply="handleBulkActionRequest"
        />
      </template>

      <template #cell-productId="{ row }">
        <div class="flex items-center gap-2">
          <img
            v-if="productIcons[(row as ProductRow).productId]"
            :src="productIcons[(row as ProductRow).productId]"
            :alt="(row as ProductRow).productId"
            loading="lazy"
            class="w-5 h-5 shrink-0 rounded object-contain"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <CoreAppIcon v-else :name="icons.product" class="w-4 h-4 shrink-0 text-neutral-400" />
          <CoreAppIcon
            v-if="(row as ProductRow).locked"
            :name="icons.lock"
            class="w-3.5 h-3.5 text-(--color-error) shrink-0"
            :title="$t('products.locked')"
          />
          <span class="text-sm leading-5 text-(--color-text)">{{ (row as ProductRow).productId }}</span>
        </div>
      </template>

      <template #cell-description="{ row }">
        <CoreAppTooltipTable
          v-if="(row as ProductRow).description"
          :rows="[
            { key: String($t('products.id')), value: (row as ProductRow).productId },
            {
              key: String($t('common.description')),
              value: (row as ProductRow).description || '-',
            },
          ]"
        >
          <span class="block truncate max-w-[14rem] text-sm leading-5 text-(--color-text)">
            {{ (row as ProductRow).description || '-' }}
          </span>
        </CoreAppTooltipTable>
        <span v-else class="block truncate max-w-[14rem] text-sm leading-5 text-(--color-text)">
          {{ (row as ProductRow).description || '-' }}
        </span>
      </template>

      <template #cell-version="{ row }">
        <ProductsVersionCell :row="row as ProductRow" />
      </template>

      <template #cell-installationStatus="{ row }">
        <ProductsInstallationStatusBadge
          :product-id="(row as ProductRow).productId"
          :status="(row as ProductRow).installationStatus"
          :status-details="(row as ProductRow).installationStatusDetails"
          :selected-clients="(row as ProductRow).selectedClients"
          icon-only
        />
      </template>

      <template #cell-actionResult="{ row }">
        <ProductsActionResultBadge
          :product-id="(row as ProductRow).productId"
          :result="(row as ProductRow).actionResult"
          :result-details="(row as ProductRow).actionResultDetails"
          :selected-clients="(row as ProductRow).selectedClients"
          icon-only
        />
      </template>

      <template #cell-actionRequest="{ row }">
        <div class="flex items-center gap-1.5">
          <ProductsActionRequestDropdown
            :product-id="(row as ProductRow).productId"
            :current-request="(row as ProductRow).actionRequest"
            :available-actions="(row as ProductRow).actions || []"
            :disabled="isReadOnly || selectionStore.selectedClients.length === 0"
            :request-details="(row as ProductRow).actionRequestDetails"
            :selected-clients="(row as ProductRow).selectedClients"
            :pending-request="pendingActionRequests.get((row as ProductRow).productId)?.actionRequest"
            @change="handleActionRequestChange((row as ProductRow).productId, (row as ProductRow).actionRequest || 'none', $event)"
          />
          <CoreAppStatusBadge
            v-if="getLiveStatus((row as ProductRow).productId)"
            :status="
              getLiveStatus((row as ProductRow).productId)?.kind === 'error'
                ? 'error'
                : getLiveStatus((row as ProductRow).productId)?.kind === 'updated'
                  ? 'success'
                  : 'info'
            "
            :icon="
              getLiveStatus((row as ProductRow).productId)?.kind === 'error'
                ? icons.xCircle
                : getLiveStatus((row as ProductRow).productId)?.kind === 'updated'
                  ? icons.checkCircle
                  : getLiveStatus((row as ProductRow).productId)?.kind === 'processing'
                    ? icons.onDemand
                    : icons.refresh
            "
            :tooltip="getLiveStatus((row as ProductRow).productId)?.tooltip || getLiveStatus((row as ProductRow).productId)?.message"
            variant="soft"
            size="xs"
          />
        </div>
      </template>

      <template #cell-actionProgress="{ row }">
        <span class="text-sm leading-5 text-(--color-text)">
          {{ (row as ProductRow).actionProgress || '-' }}
        </span>
      </template>

      <template #cell-actionSequence="{ row }">
        <span class="text-sm leading-5 text-(--color-text)">
          {{
            (row as ProductRow).actionSequence !== undefined && (row as ProductRow).actionSequence !== -1
              ? (row as ProductRow).actionSequence
              : '-'
          }}
        </span>
      </template>

      <template #cell-lastAction="{ row }">
        <span class="text-sm leading-5 text-(--color-text)">
          {{ (row as ProductRow).lastAction || '-' }}
        </span>
      </template>

      <template #cell-advice="{ row }">
        <CoreAppTooltipTable
          v-if="(row as ProductRow).advice"
          :rows="[
            { key: String($t('products.id')), value: (row as ProductRow).productId },
            { key: String($t('products.advice')), value: (row as ProductRow).advice || '-' },
          ]"
        >
          <span class="block truncate max-w-[14rem] text-sm leading-5 text-(--color-text)">
            {{ (row as ProductRow).advice || '-' }}
          </span>
        </CoreAppTooltipTable>
        <span v-else class="block truncate max-w-[14rem] text-sm leading-5 text-(--color-text)">
          {{ (row as ProductRow).advice || '-' }}
        </span>
      </template>

      <template #cell-priority="{ row }">
        <span class="text-sm leading-5 text-(--color-text)">{{ (row as ProductRow).priority ?? '-' }}</span>
      </template>

      <template #cell-modificationTime="{ row }">
        <span class="text-sm leading-5 text-(--color-text)">
          {{ formatModificationTime((row as ProductRow).modificationTime) }}
        </span>
      </template>

      <template #row-actions="{ row }">
        <CoreAppButton
          :icon="icons.config"
          variant="ghost"
          color="neutral"
          size="xs"
          :title="$t('config.title')"
          @click.stop="openProductConfig(row as ProductRow)"
        />
      </template>
    </CoreAppDataTable>

    <template #panel-title>
      <span class="flex items-center gap-2">
        <CoreAppIcon :name="icons.product" class="w-4 h-4 shrink-0" />
        {{ configProduct?.productId }}
      </span>
    </template>
    <template #panel-subtitle>
      <div v-if="configProduct">{{ $t('config.title') }}</div>
    </template>

    <template #panel-actions>
      <CoreAppUnsavedChangesModal
        :product-config-ref="panelPropertyConfigRef"
        :config-product-id="configProduct?.productId"
        mode="properties"
        @save-all="handlePanelSave"
        @discard-all="handlePanelDiscard"
      />
    </template>

    <template #panel>
      <div v-if="configProduct?.productId" class="flex flex-col h-full">
        <ProductsConfigTabs
          ref="configTabsComponentRef"
          :product-id="configProduct.productId"
          :panel-mode="true"
          :search="propertiesSearch"
          class="flex-1"
          @saved="onConfigSaved"
          @update:search="handlePropertiesSearchUpdate"
        />
      </div>
    </template>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import { useDataTableSettings, type DataTableColumnDef } from '~/composables/data-table/useDataTableSettings'
  import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
  import type {
    ProductRow,
    ProductType,
    ProductConfigTabsRef,
    ProductActionRequestChange,
    EditablePropertyValue,
    BulkActionResult,
    BulkActionDetail,
  } from '~/types'
  import type { ProductAdvancedFilters } from '~/components/products/AdvancedFiltersPopover.vue'
  import { getStoredDataTableFilter } from '~/composables/data-table/useDataTableFilter'
  import { useSavedSearches } from '~/composables/useSavedSearches'
  import { CLEAR_ALL_FILTERS_EVENT } from '~/composables/useGlobalFavorites'
  import { useSelectionStore } from '~/stores/selectionStore'
  import { useMessageBusStore } from '~/stores/messageBusStore'
  import { storeToRefs } from 'pinia'
  import { formatApiErrorMessage, normalizeActionResultDetails } from '~/composables/useApiHelpers'

  interface Props {
    productType: ProductType
    initialProductId?: string
    initialSortColumn?: string
    panelMode?: boolean
  }

  const props = defineProps<Props>()
  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getProducts, getServerIds, setClientProductActions, processActionRequests } = useApiHelpers()
  const { productIcons: cachedProductIcons, fetchProductIcons } = useCachedData()
  const selectionStore = useSelectionStore()
  const messageBusStore = useMessageBusStore()
  const { lastMsg: messageBusLastMsg } = storeToRefs(messageBusStore)
  const { isReadOnly, isProductGroupAccessRestricted } = useUserPermissions()
  const router = useRouter()
  const route = useRoute()

  type LiveStatusKind = 'saving' | 'processing' | 'updated' | 'error'
  interface ProductLiveStatus {
    kind: LiveStatusKind
    message: string
    tooltip?: string
  }

  const selectedTableKeys = computed(() => selectionStore.selectedProducts)
  const sortBySelectionEnabled = computed(
    () => selectionStore.selectionSource === 'quickpanel' && selectionStore.selectedProducts.length > 0,
  )

  const loading = ref(false)
  const error = ref<string | null>(null)
  const products = ref<ProductRow[]>([])
  const rowOffset = ref(0)
  const totalItems = ref(0)
  const configProduct = ref<ProductRow | null>(null)
  const showConfigPanel = ref(false)
  const actionStatus = ref<{
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  } | null>(null)
  const bulkActionResult = ref<BulkActionResult | null>(null)
  const bulkResultModalOpen = ref(false)
  const bulkResultModalMounted = ref(false)
  const bulkResultFilter = ref<'all' | 'failed' | 'succeeded'>('failed')
  const pendingActionRequests = ref(new Map<string, ProductActionRequestChange>())
  const savingActionRequests = ref(false)
  const processingProcessActions = ref(false)
  const configTabsComponentRef = ref<InstanceType<typeof import('./ConfigTabs.vue').default> | null>(null)
  const lastPageParams = ref<PageChangeParams | null>(null)
  const filterStorageId = computed(() => (props.panelMode ? 'clients-panel-products' : 'products'))
  const currentFilterQuery = ref(
    props.panelMode
      ? getStoredDataTableFilter(filterStorageId.value)
      : typeof route.query.filter === 'string'
        ? route.query.filter
        : getStoredDataTableFilter(filterStorageId.value),
  )
  const propertiesSearch = ref(typeof route.query.propertiesSearch === 'string' ? route.query.propertiesSearch : '')

  function handleProcessActionsStarted(clientCount: number, productCount: number) {
    processingProcessActions.value = true
    bulkActionResult.value = null
    actionStatus.value = {
      type: 'info',
      title: String($t('actions.live.processing')),
      message: String($t('actions.processingSummary', { totalProducts: productCount, totalClients: clientCount })),
    }
  }

  function handleProcessActionsCompleted(result: BulkActionResult) {
    processingProcessActions.value = false
    bulkActionResult.value = result
    actionStatus.value = {
      type: result.type,
      title: result.type === 'error' ? String($t('notify.errorActionsLoad')) : String($t('notify.product.actions.executed')),
      message: String(
        $t('actions.bulkSummary', {
          totalProducts: result.totalProducts,
          totalClients: result.totalClients,
          succeeded: result.succeeded,
          failed: result.failed,
        }),
      ),
    }
    if (result.details.length > 0) fetchProducts()
  }

  function handlePropertiesSearchUpdate(value: string) {
    propertiesSearch.value = value
    router.replace({ query: { ...route.query, propertiesSearch: value || undefined } })
  }
  const fetchProductsRequestId = ref(0)
  let fetchProductsController: AbortController | null = null
  const ADVANCED_FILTERS_KEY = 'opsi-webgui-products-advanced-filters'
  const advancedFilters = ref<ProductAdvancedFilters>(readStoredAdvancedFilters())

  function readStoredAdvancedFilters(): ProductAdvancedFilters {
    if (import.meta.server) return {}
    try {
      const raw = localStorage.getItem(ADVANCED_FILTERS_KEY)
      return raw ? (JSON.parse(raw) as ProductAdvancedFilters) : {}
    } catch {
      return {}
    }
  }

  function handleAdvancedFiltersChange(value: ProductAdvancedFilters) {
    advancedFilters.value = value
    if (!import.meta.server) localStorage.setItem(ADVANCED_FILTERS_KEY, JSON.stringify(value))
    return fetchProducts(buildInitialPageParams(lastPageParams.value?.filterQuery ?? currentFilterQuery.value))
  }

  function handleApplySavedSearch(value: { filterQuery: string; advancedFilters: Record<string, unknown> }) {
    // Otherwise a stale lastPageParams.filterQuery (captured on the last page-change) would win
    // over this new value in handleAdvancedFiltersChange's fallback below.
    lastPageParams.value = null
    currentFilterQuery.value = value.filterQuery
    return handleAdvancedFiltersChange(value.advancedFilters as ProductAdvancedFilters)
  }

  // Global Search favorites navigate here with ?savedSearchId=... (+ ?filter=... when the
  // favorite has quick-filter text). Always resolve both filterQuery and advancedFilters to
  // concrete values (even '' / {}) so a previously applied filter can't linger, then drop the
  // param. Runs both on first load and on later in-app navigation to a different favorite,
  // since navigating between two /products?... URLs doesn't remount this component.
  function applyFavoriteFromRoute(savedSearchId: string) {
    const entry = useSavedSearches<ProductAdvancedFilters>('products').get(savedSearchId)
    const fetchPromise = handleApplySavedSearch({
      filterQuery: entry?.filterQuery ?? '',
      advancedFilters: (entry?.advancedFilters as Record<string, unknown>) ?? {},
    })
    const { savedSearchId: _ssid, ...restQuery } = route.query
    router.replace({ query: restQuery })
    return fetchPromise
  }

  watch(
    () => route.query.savedSearchId,
    (id) => {
      if (typeof id === 'string' && id) applyFavoriteFromRoute(id)
    },
  )
  const productIcons = computed(() => (cachedProductIcons.value ?? {}) as Record<string, string>)
  const processActionsOpen = ref(false)
  const productLiveStatus = ref(new Map<string, ProductLiveStatus>())

  const showLeaveWarning = ref(false)
  const pendingAction = ref<(() => void) | null>(null)
  let resolveRouteLeave: ((ok: boolean) => void) | null = null

  function confirmLeave() {
    showLeaveWarning.value = false
    if (resolveRouteLeave) {
      resolveRouteLeave(true)
      resolveRouteLeave = null
    }
    if (pendingAction.value) {
      pendingAction.value()
      pendingAction.value = null
    }
  }

  function cancelLeave() {
    showLeaveWarning.value = false
    if (resolveRouteLeave) {
      resolveRouteLeave(false)
      resolveRouteLeave = null
    }
    pendingAction.value = null
  }

  onBeforeRouteLeave(() => {
    if (!hasUnsavedChanges.value) return true
    showLeaveWarning.value = true
    return new Promise<boolean>((resolve) => {
      resolveRouteLeave = resolve
    })
  })

  const tableId = computed(() => (props.productType === 'NetbootProduct' ? 'products-netboot' : 'products-localboot'))
  const localbootTableSettings = useDataTableSettings('products-localboot')
  const netbootTableSettings = useDataTableSettings('products-netboot')
  const tableSettings = computed(() => (props.productType === 'NetbootProduct' ? netbootTableSettings : localbootTableSettings))
  const selectedProductIds = computed(() => selectionStore.selectedProducts)

  const productConfigTabsRef = computed<ProductConfigTabsRef | null>(() => {
    const tabs = configTabsComponentRef.value
    if (!tabs) {
      if (pendingActionRequests.value.size === 0) return null
      return {
        hasAnyChanges: pendingActionRequests.value.size > 0,
        isSaving: savingActionRequests.value || processingProcessActions.value,
        changedCount: pendingActionRequests.value.size,
        changedProperties: new Map<string, EditablePropertyValue>(),
        changedActionRequests: pendingActionRequests.value,
        saveAll: saveAllChanges,
        discardAll: discardAllChanges,
        discardSingleProperty: () => {},
        discardSingleActionRequest: (pid: string) => {
          pendingActionRequests.value.delete(pid)
        },
        getOriginalPropertyValue: () => undefined,
        fmtVal: (v: unknown) => (v === null || v === undefined ? '-' : Array.isArray(v) ? v.join(', ') : String(v)),
        refresh: fetchProducts,
      }
    }
    return {
      hasAnyChanges: tabs.hasAnyChanges || pendingActionRequests.value.size > 0,
      isSaving: (tabs.isSaving as unknown as boolean) || savingActionRequests.value || processingProcessActions.value,
      changedCount: (tabs.changedCount || 0) + pendingActionRequests.value.size,
      changedProperties: tabs.changedProperties as unknown as Map<string, EditablePropertyValue>,
      changedActionRequests: pendingActionRequests.value,
      saveAll: saveAllChanges,
      discardAll: discardAllChanges,
      discardSingleProperty: tabs.discardSingleProperty,
      discardSingleActionRequest: (pid: string) => {
        pendingActionRequests.value.delete(pid)
      },
      getOriginalPropertyValue: tabs.getOriginalPropertyValue,
      fmtVal: tabs.fmtVal,
      refresh: fetchProducts,
    }
  })

  const panelPropertyConfigRef = computed<ProductConfigTabsRef | null>(() => {
    const tabs = configTabsComponentRef.value
    if (!tabs) return null
    return {
      hasAnyChanges: tabs.hasAnyChanges as unknown as boolean,
      isSaving: tabs.isSaving as unknown as boolean,
      changedCount: tabs.changedCount as unknown as number,
      changedProperties: tabs.changedProperties as unknown as Map<string, EditablePropertyValue>,
      changedActionRequests: new Map(),
      saveAll: tabs.saveAll,
      discardAll: tabs.discardAll,
      discardSingleProperty: tabs.discardSingleProperty,
      discardSingleActionRequest: () => {},
      getOriginalPropertyValue: tabs.getOriginalPropertyValue,
      fmtVal: tabs.fmtVal,
      refresh: tabs.refresh,
    }
  })

  const hasUnsavedChanges = computed(() => productConfigTabsRef.value?.hasAnyChanges || false)

  const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefreshProducts(fetchProducts)

  const columns: DataTableColumnDef[] = [
    {
      key: 'productId',
      label: String($t('products.id')),
      labelKey: 'products.id',
      sortable: true,
      alwaysVisible: true,
    },
    {
      key: 'installationStatus',
      label: String($t('products.status')),
      labelKey: 'products.status',
      headerIcon: icons.productInstallationStatusInstalled,
      sortable: true,
      class: 'text-center w-16',
      align: 'center',
    },
    {
      key: 'actionResult',
      label: String($t('actions.result')),
      labelKey: 'actions.result',
      headerIcon: icons.productActionResult,
      sortable: true,
      class: 'text-center w-16',
      align: 'center',
    },
    {
      key: 'version',
      label: String($t('common.version')),
      labelKey: 'common.version',
      sortable: true,
    },
    {
      key: 'description',
      label: String($t('common.description')),
      labelKey: 'common.description',
      sortable: true,
      maxWidth: '14rem',
      truncate: true,
      tooltip: true,
    },
    {
      key: 'advice',
      label: String($t('products.advice')),
      labelKey: 'products.advice',
      sortable: true,
      visible: false,
      maxWidth: '14rem',
      truncate: true,
      tooltip: true,
    },
    {
      key: 'priority',
      label: String($t('common.priority')),
      labelKey: 'common.priority',
      sortable: true,
      visible: false,
    },
    {
      key: 'modificationTime',
      label: String($t('fields.modifiedAt')),
      labelKey: 'fields.modifiedAt',
      sortable: true,
      visible: false,
    },
    {
      key: 'actionProgress',
      label: String($t('actions.progress')),
      labelKey: 'actions.progress',
      sortable: true,
    },
    {
      key: 'actionSequence',
      label: String($t('actions.sequence')),
      labelKey: 'actions.sequence',
      sortable: true,
      visible: false,
    },
    {
      key: 'lastAction',
      label: String($t('actions.last')),
      labelKey: 'actions.last',
      sortable: true,
      visible: false,
    },
    {
      key: 'actionRequest',
      label: String($t('actions.request')),
      labelKey: 'actions.request',
      sortable: true,
      class: 'w-36',
      minWidth: '80px',
      alwaysVisible: true,
      stickyRight: true,
    },
  ]

  function setLiveStatus(productIds: string[], status: ProductLiveStatus, ttlMs = 10000) {
    for (const productId of productIds) {
      productLiveStatus.value.set(productId, status)
    }
    if (ttlMs <= 0) return
    setTimeout(() => {
      for (const productId of productIds) {
        const current = productLiveStatus.value.get(productId)
        if (current && current.kind === status.kind && current.message === status.message) {
          productLiveStatus.value.delete(productId)
        }
      }
    }, ttlMs)
  }

  function getLiveStatus(productId: string): ProductLiveStatus | undefined {
    return productLiveStatus.value.get(productId)
  }

  function closeActionStatus() {
    actionStatus.value = null
    bulkActionResult.value = null
  }

  function openBulkResultDetails() {
    bulkResultModalMounted.value = true
    // Default to the failures view since that's what needs attention; fall back to all when nothing failed.
    bulkResultFilter.value = bulkActionResult.value?.failed ? 'failed' : 'all'
    nextTick(() => {
      bulkResultModalOpen.value = true
    })
  }

  const pendingLiveUpdateIds = new Set<string>()
  let liveUpdateFlushTimer: ReturnType<typeof setTimeout> | null = null
  function flushPendingLiveUpdates() {
    liveUpdateFlushTimer = null
    if (pendingLiveUpdateIds.size === 0) return
    const ids = [...pendingLiveUpdateIds]
    pendingLiveUpdateIds.clear()
    setLiveStatus(ids, { kind: 'updated', message: String($t('actions.live.updated')) }, 12000)
  }

  function extractProductIdsFromMessage(payload: unknown): string[] {
    const ids = new Set<string>()
    const visited = new Set<unknown>()
    const visit = (value: unknown, keyHint = '') => {
      if (value === null || value === undefined) return
      if (typeof value === 'string') {
        if (/(^|_)(productid|product_id)$/.test(keyHint.toLowerCase())) {
          ids.add(value)
        }
        return
      }
      if (typeof value !== 'object') return
      if (visited.has(value)) return
      visited.add(value)
      if (Array.isArray(value)) {
        for (const item of value) visit(item, keyHint)
        return
      }
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        visit(nested, key)
      }
    }
    visit(payload)
    return [...ids]
  }

  function getMessagebusEventName(msg: unknown): string {
    if (!msg || typeof msg !== 'object') return ''
    const record = msg as Record<string, unknown>
    const msgType = typeof record.type === 'string' ? record.type : ''
    if (!msgType) return ''
    if (msgType === 'event') {
      const eventField = typeof record.event === 'string' ? record.event : ''
      if (eventField) return eventField
      const channel = typeof record.channel === 'string' ? record.channel : ''
      return channel.replace(/^event:/, '')
    }
    return msgType
  }

  function openProductConfig(product: ProductRow) {
    if (configProduct.value && configProduct.value.productId !== product.productId && hasUnsavedChanges.value) {
      pendingAction.value = () => {
        discardAllChanges()
        doOpenProductConfig(product)
      }
      showLeaveWarning.value = true
      return
    }
    doOpenProductConfig(product)
  }

  function doOpenProductConfig(product: ProductRow) {
    configProduct.value = product
    showConfigPanel.value = true
    router.replace({ query: { ...route.query, product: product.productId, view: 'panel' } })
  }

  function formatModificationTime(value: string | undefined | null): string {
    if (!value) return '-'
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }

  function closePanel() {
    if (configTabsComponentRef.value?.hasAnyChanges) {
      pendingAction.value = () => {
        doClosePanel()
      }
      showLeaveWarning.value = true
      return
    }
    doClosePanel()
  }

  function doClosePanel() {
    showConfigPanel.value = false
    configProduct.value = null
    nextTick(() => {
      const { product: _p, view: _v, ...rest } = route.query
      router.replace({ query: rest })
    })
  }

  function handleRowActivate(row: ProductRow) {
    if (configProduct.value && configProduct.value.productId !== row.productId && hasUnsavedChanges.value) {
      pendingAction.value = () => {
        discardAllChanges()
        selectionStore.setProducts([row.productId], 'table')
        doOpenProductConfig(row)
      }
      showLeaveWarning.value = true
      return
    }
    selectionStore.setProducts([row.productId], 'table')
    openProductConfig(row)
  }

  function handleSelectionChange(_rows: ProductRow[], keys: string[]) {
    selectionStore.setProducts(keys, 'table')
  }

  function handleActionRequestChange(productId: string, oldReq: string, newReq: string) {
    if (newReq === oldReq || (newReq === 'none' && !oldReq)) pendingActionRequests.value.delete(productId)
    else
      pendingActionRequests.value.set(productId, {
        productId,
        actionRequest: newReq,
        oldRequest: oldReq || 'none',
      })
  }

  function handleBulkActionRequest(actionRequest: string) {
    const selectedProducts = selectionStore.selectedProducts
    if (selectedProducts.length === 0) return
    for (const productId of selectedProducts) {
      const product = products.value.find((p) => p.productId === productId)
      const oldReq = product?.actionRequest || 'none'
      if (actionRequest === oldReq || (actionRequest === 'none' && !oldReq)) {
        pendingActionRequests.value.delete(productId)
      } else {
        pendingActionRequests.value.set(productId, { productId, actionRequest, oldRequest: oldReq })
      }
    }
  }

  async function saveActionRequests(): Promise<{
    type: 'success' | 'error' | 'warning'
    message: string
  }> {
    if (pendingActionRequests.value.size === 0) return { type: 'success', message: String($t('notify.action.saved')) }
    if (selectionStore.selectedClients.length === 0) {
      return { type: 'error', message: String($t('clients.selectNone')) }
    }
    savingActionRequests.value = true
    const errors: string[] = []
    const savedIds: string[] = []
    try {
      const clientIds = selectionStore.selectedClients
      // Group pending products by their target actionRequest so all products sharing the
      // same value can be saved in a single request instead of one request per product.
      const productIdsByAction = new Map<string | undefined, string[]>()
      for (const [pid, change] of pendingActionRequests.value) {
        const group = productIdsByAction.get(change.actionRequest)
        if (group) group.push(pid)
        else productIdsByAction.set(change.actionRequest, [pid])
      }
      await Promise.all(
        [...productIdsByAction].map(async ([actionRequest, pids]) => {
          try {
            setLiveStatus(
              pids,
              {
                kind: 'saving',
                message: String($t('actions.live.saving')),
                tooltip: String($t('actions.request')),
              },
              0,
            )
            const r = await setClientProductActions({
              clientIds,
              productIds: pids,
              actionRequest,
            })
            if (r.error) throw r.error
            savedIds.push(...pids)
            setLiveStatus(pids, { kind: 'updated', message: String($t('actions.live.updated')) }, 12000)
          } catch (e) {
            errors.push(...pids.map((pid) => `${pid}: ${formatApiErrorMessage(e)}`))
            setLiveStatus(
              pids,
              {
                kind: 'error',
                message: String($t('actions.live.failed')),
                tooltip: formatApiErrorMessage(e),
              },
              15000,
            )
          }
        }),
      )
      const savedActionRequests = new Map(pendingActionRequests.value)
      for (const pid of savedIds) {
        pendingActionRequests.value.delete(pid)
      }
      for (const pid of savedIds) {
        const product = products.value.find((row) => row.productId === pid)
        const savedRequest = savedActionRequests.get(pid)?.actionRequest
        if (product && savedRequest !== undefined) product.actionRequest = savedRequest
      }
      if (errors.length > 0 && savedIds.length > 0) {
        return {
          type: 'warning',
          message: `${savedIds.length} saved, ${errors.length} failed: ${errors.join('; ')}`,
        }
      } else if (errors.length > 0) {
        return { type: 'error', message: errors.join('; ') }
      } else {
        return { type: 'success', message: String($t('notify.action.saved')) }
      }
    } catch (e) {
      return {
        type: 'error',
        message: e instanceof Error ? e.message : String($t('notify.errorActionsSave')),
      }
    } finally {
      savingActionRequests.value = false
    }
  }

  async function handleSaveAll(
    processOnDemand?: boolean,
    onDemandOptions?: { productIds?: string[]; visibility?: string; clientIds?: string[] },
    onResult?: (result: { type: 'success' | 'error' | 'warning'; message: string }) => void,
  ) {
    if (processOnDemand && processingProcessActions.value) return
    const clientIds = onDemandOptions?.clientIds || selectionStore.selectedClients
    const processedIds = (onDemandOptions?.productIds?.length ? onDemandOptions.productIds : selectedProductIds.value) || []
    if (processOnDemand && clientIds.length > 0) {
      processingProcessActions.value = true
      bulkActionResult.value = null
      actionStatus.value = {
        type: 'info',
        title: String($t('actions.live.processing')),
        message: String($t('actions.processingSummary', { totalProducts: processedIds.length, totalClients: clientIds.length })),
      }
    }
    const result = await saveActionRequests()
    if (result.type === 'error') {
      if (processOnDemand) {
        processingProcessActions.value = false
        actionStatus.value = { type: 'error', title: String($t('notify.errorActionsSave')), message: result.message }
      }
      onResult?.(result)
      return
    }
    if (processOnDemand) {
      if (clientIds.length > 0) {
        try {
          const productIds = onDemandOptions?.productIds || undefined
          if (processedIds.length > 0) {
            setLiveStatus(processedIds, { kind: 'processing', message: String($t('actions.live.processing')) }, 0)
          }
          const result = await processActionRequests(clientIds, productIds)
          if (result.error) throw result.error
          const resultData = result.data || {}
          if (processedIds.length > 0) {
            setLiveStatus(processedIds, { kind: 'updated', message: String($t('actions.live.updated')) }, 12000)
          }
          const details: BulkActionDetail[] = normalizeActionResultDetails(resultData)
          const failedCount = details.filter((d) => !d.success).length
          const succeededCount = details.length - failedCount
          bulkActionResult.value = {
            type: failedCount === 0 ? 'success' : succeededCount === 0 ? 'error' : 'warning',
            totalClients: details.length,
            totalProducts: processedIds.length,
            succeeded: succeededCount,
            failed: failedCount,
            details,
          }
          actionStatus.value = {
            type: bulkActionResult.value.type,
            title:
              bulkActionResult.value.type === 'error'
                ? String($t('notify.errorActionsLoad'))
                : String($t('notify.product.actions.executed')),
            message: String(
              $t('actions.bulkSummary', {
                totalProducts: processedIds.length,
                totalClients: details.length,
                succeeded: succeededCount,
                failed: failedCount,
              }),
            ),
          }
          onResult?.({ type: 'success', message: String($t('notify.product.actions.executed')) })
        } catch (e) {
          bulkActionResult.value = null
          actionStatus.value = { type: 'error', title: String($t('notify.errorActionsLoad')), message: formatApiErrorMessage(e) }
          if (processedIds.length > 0) {
            setLiveStatus(
              processedIds,
              {
                kind: 'error',
                message: String($t('actions.live.failed')),
                tooltip: formatApiErrorMessage(e),
              },
              15000,
            )
          }
          onResult?.({
            type: 'error',
            message: e instanceof Error ? e.message : String($t('notify.errorActionsLoad')),
          })
        } finally {
          processingProcessActions.value = false
        }
        return
      }
    }
    onResult?.(result)
  }

  async function handlePanelSave(
    _processOnDemand?: boolean,
    _options?: unknown,
    onResult?: (result: { type: 'success' | 'error' | 'warning'; message: string }) => void,
  ) {
    if (configTabsComponentRef.value?.hasAnyChanges) {
      try {
        await configTabsComponentRef.value.saveAll()
        onResult?.({ type: 'success', message: String($t('notify.host.params.saved')) })
      } catch (e) {
        onResult?.({ type: 'error', message: formatApiErrorMessage(e) })
      }
    }
  }

  function handlePanelDiscard() {
    configTabsComponentRef.value?.discardAll()
  }

  async function saveAllChanges() {
    if (configTabsComponentRef.value?.hasAnyChanges) await configTabsComponentRef.value.saveAll()
    if (pendingActionRequests.value.size > 0) await saveActionRequests()
  }

  function discardAllChanges() {
    configTabsComponentRef.value?.discardAll()
    pendingActionRequests.value.clear()
  }

  function discardActionRequestsOnly() {
    pendingActionRequests.value.clear()
  }

  function onConfigSaved() {
    // Product properties do not alter the list's aggregate fields. Avoid a
    // table reload (and retain the current bounded server-page window).
  }

  function handlePageChange(params: PageChangeParams) {
    lastPageParams.value = params
    currentFilterQuery.value = params.filterQuery
    // Sorting and paging reuse the existing filter; avoid unnecessary router
    // work unless the normalized query value actually changed.
    const routeFilter = typeof route.query.filter === 'string' ? route.query.filter : ''
    if (!props.panelMode && routeFilter !== params.filterQuery) {
      router.replace({
        query: {
          ...(route.query as Record<string, string>),
          filter: params.filterQuery || undefined,
        },
      })
    }
    fetchProducts(params)
  }

  function handleFilterQueryUpdate(value: string) {
    currentFilterQuery.value = value
    fetchProductsController?.abort()
    if (lastPageParams.value) {
      lastPageParams.value = {
        ...lastPageParams.value,
        filterQuery: value,
      }
    }
  }

  function buildInitialPageParams(filterQuery = ''): PageChangeParams {
    return {
      pageNumber: 1,
      perPage: tableSettings.value.settings.pageSize,
      sortBy: tableSettings.value.settings.sortColumn || 'productId',
      sortDesc: tableSettings.value.settings.sortDirection === 'desc',
      filterQuery,
      sortBySelection: sortBySelectionEnabled.value,
      onlySelected: false,
    }
  }

  function resetTableScopeState() {
    products.value = []
    rowOffset.value = 0
    totalItems.value = 0
    lastPageParams.value = null
    pendingActionRequests.value.clear()
    productLiveStatus.value.clear()
    selectionStore.setProducts([], 'table')
  }

  function translateSortBy(sortBy: string): string {
    switch (sortBy) {
      case 'version':
        return '["client_version_outdated", "depot_version_diff", "not_on_all_depots", "productVersion", "packageVersion", "productId"]'
      case 'version_outdated':
        return 'client_version_outdated'
      case 'installationStatus':
        return '["installationStatus", "installationStatusErrorLevel"]'
      case 'actionResult':
        return '["actionResultErrorLevel", "actionResult"]'
      case 'depotVersions':
        return 'depot_version_diff'
      case 'clientVersions':
        return 'client_version_outdated'
      case 'desc':
        return 'description'
      case '':
        return 'productId'
      default:
        return sortBy
    }
  }

  function ensureVersionColumnVisible() {
    if (!tableSettings.value.settings.visibleColumns.includes('version')) {
      tableSettings.value.settings.visibleColumns.push('version')
    }
  }

  function applyExternalSort(sortColumn: string | undefined) {
    if (!sortColumn) return
    tableSettings.value.setSort(sortColumn, 'desc')
    if (sortColumn === 'version_outdated') {
      ensureVersionColumnVisible()
    }
  }

  async function fetchProducts(params?: PageChangeParams) {
    const isInfinitePageRequest = params?.displayMode === 'infinite' && params.pageNumber > 1
    const requestId = isInfinitePageRequest ? fetchProductsRequestId.value : ++fetchProductsRequestId.value
    if (!isInfinitePageRequest) fetchProductsController?.abort()
    const controller = new AbortController()
    fetchProductsController = controller
    loading.value = true
    error.value = null
    try {
      if (params) lastPageParams.value = params
      const isReload = !params
      const baseParams = lastPageParams.value ?? undefined
      const effectiveParams =
        isReload && baseParams && (rowOffset.value > 0 || baseParams.pageNumber > 1)
          ? { ...baseParams, pageNumber: 1, perPage: Math.max(baseParams.perPage, rowOffset.value + products.value.length) }
          : baseParams
      const selectionSortActive = effectiveParams?.sortBySelection ?? sortBySelectionEnabled.value
      await selectionStore.ensureServersSelected()
      if (selectionStore.selectedServers.length === 0) {
        const depotResult = await getServerIds()
        const depots = depotResult.data || []
        if (depots.length > 0) {
          selectionStore.setServers(depots)
        } else {
          if (requestId !== fetchProductsRequestId.value) return
          error.value = String($t('servers.noSelection'))
          return
        }
      }

      const p: Record<string, unknown> = {
        type: props.productType,
        selectedDepots: selectionStore.selectedServersParam,
      }
      if (selectionStore.selectedClients.length > 0) p.selectedClients = `[${selectionStore.selectedClients.join(',')}]`
      if ((selectionSortActive || effectiveParams?.onlySelected) && selectionStore.selectedProducts.length > 0) {
        p.selected = `[${selectionStore.selectedProducts.join(',')}]`
      }
      if (effectiveParams) {
        p.pageNumber = effectiveParams.pageNumber
        p.perPage = effectiveParams.perPage
        if (effectiveParams.sortBy && !effectiveParams.sortBy.startsWith('__')) {
          p.sortBy = translateSortBy(effectiveParams.sortBy)
          p.sortDesc = effectiveParams.sortDesc
        }
        if (effectiveParams.serverFilterQuery || effectiveParams.filterQuery)
          p.filterQuery = effectiveParams.serverFilterQuery || effectiveParams.filterQuery
        if (effectiveParams.onlySelected) p.onlySelected = true
      } else if (currentFilterQuery.value) {
        p.filterQuery = currentFilterQuery.value
      } else {
        if (tableSettings.value.settings.sortColumn && !tableSettings.value.settings.sortColumn.startsWith('__')) {
          p.sortBy = translateSortBy(tableSettings.value.settings.sortColumn)
          p.sortDesc = tableSettings.value.settings.sortDirection === 'desc'
        }
      }
      if (advancedFilters.value.installationStatus) p.installationStatusFilter = advancedFilters.value.installationStatus
      if (advancedFilters.value.hasFailedActionResult) p.hasFailedActionResult = true
      if (advancedFilters.value.hasPendingActionRequest) p.hasPendingActionRequest = true
      if (advancedFilters.value.unused) p.unused = true

      const result = await getProducts(p, { signal: controller.signal })
      if (requestId !== fetchProductsRequestId.value) return
      if (result.error) throw result.error
      const newData = (result.data || []) as ProductRow[]
      if (result.total !== null) totalItems.value = result.total
      if (!isReload && effectiveParams?.displayMode === 'infinite' && effectiveParams.pageNumber > 1) {
        rowOffset.value += appendInfinitePage(products.value, newData, effectiveParams.perPage, (product) => product.productId)
      } else {
        products.value = newData
        rowOffset.value = isReload && effectiveParams ? (effectiveParams.pageNumber - 1) * effectiveParams.perPage : 0
      }
    } catch (e) {
      if (requestId !== fetchProductsRequestId.value) return
      if (controller.signal.aborted) return
      error.value = e instanceof Error ? e.message : String($t('products.none'))
    } finally {
      if (requestId === fetchProductsRequestId.value && fetchProductsController === controller) {
        loading.value = false
        fetchProductsController = null
      }
    }
  }

  watch(
    () => props.productType,
    () => {
      resetTableScopeState()
      fetchProducts(buildInitialPageParams(currentFilterQuery.value))
    },
  )

  watch(
    () => props.initialSortColumn,
    (newCol) => {
      if (newCol) {
        applyExternalSort(newCol)
        fetchProducts()
      }
    },
  )

  watch(
    () => route.query.sortBy,
    (newSortBy) => {
      if (typeof newSortBy !== 'string' || newSortBy === props.initialSortColumn) return
      applyExternalSort(newSortBy)
      fetchProducts()
    },
  )

  watch(
    () => route.query.filter,
    (newFilter) => {
      if (props.panelMode) return
      currentFilterQuery.value = typeof newFilter === 'string' ? newFilter : getStoredDataTableFilter(filterStorageId.value)
    },
    { immediate: true },
  )

  watch(
    () => route.query.product,
    (newProductId, oldProductId) => {
      if (!newProductId && showConfigPanel.value) {
        showConfigPanel.value = false
        configProduct.value = null
        return
      }
      if (!newProductId) return
      if (newProductId === oldProductId) return
      if (!showConfigPanel.value) return
      const p = products.value.find((pr) => pr.productId === newProductId)
      if (p) {
        configProduct.value = p
        showConfigPanel.value = true
      }
    },
  )

  function tryOpenPanelFromRoute() {
    const productId = route.query.product as string | undefined
    const view = route.query.view as string | undefined
    if (productId && view === 'panel' && products.value.length > 0) {
      const p = products.value.find((pr) => pr.productId === productId)
      if (p && (!showConfigPanel.value || configProduct.value?.productId !== productId)) {
        configProduct.value = p
        showConfigPanel.value = true
      }
    }
  }

  // Selecting many clients/depots one by one would otherwise fire one full
  // product request per click; coalesce them into a single refetch.
  let selectionScopeTimer: ReturnType<typeof setTimeout> | null = null
  function refetchForSelectionScope() {
    if (selectionScopeTimer) clearTimeout(selectionScopeTimer)
    selectionScopeTimer = setTimeout(() => {
      selectionScopeTimer = null
      fetchProducts(buildInitialPageParams(currentFilterQuery.value))
    }, 250)
  }

  onUnmounted(() => {
    if (selectionScopeTimer) clearTimeout(selectionScopeTimer)
    if (liveUpdateFlushTimer) clearTimeout(liveUpdateFlushTimer)
    fetchProductsController?.abort()
  })

  // Global Search "clear all filters" resets every scope; only react to it while this page is mounted.
  function handleClearAllFilters() {
    handleApplySavedSearch({ filterQuery: '', advancedFilters: {} })
    router.replace({ query: { ...route.query, filter: undefined } })
  }
  if (!import.meta.server) window.addEventListener(CLEAR_ALL_FILTERS_EVENT, handleClearAllFilters)
  onUnmounted(() => {
    if (!import.meta.server) window.removeEventListener(CLEAR_ALL_FILTERS_EVENT, handleClearAllFilters)
  })

  watch(() => selectionStore.selectedClients, refetchForSelectionScope)
  watch(() => selectionStore.selectedServers, refetchForSelectionScope)
  watch(
    () => selectionStore.selectedProducts.join(','),
    () => {
      if ((lastPageParams.value?.sortBySelection || sortBySelectionEnabled.value) && selectionStore.selectionSource !== 'table') {
        fetchProducts()
      }
    },
  )

  watch(messageBusLastMsg, (msg) => {
    const eventName = getMessagebusEventName(msg)
    if (!eventName.includes('productOnClient_')) return
    const ids = extractProductIdsFromMessage(msg)
    if (ids.length > 0) {
      for (const id of ids) pendingLiveUpdateIds.add(id)
    } else if (selectedProductIds.value.length > 0) {
      for (const id of selectedProductIds.value) pendingLiveUpdateIds.add(id)
    } else {
      return
    }
    // A bulk save can trigger hundreds of individual productOnClient_* messagebus
    // events; coalesce them into a single reactive update instead of one per event.
    if (!liveUpdateFlushTimer) {
      liveUpdateFlushTimer = setTimeout(flushPendingLiveUpdates, 200)
    }
  })

  onMounted(async () => {
    if (props.initialSortColumn) {
      applyExternalSort(props.initialSortColumn)
    } else if (typeof route.query.sortBy === 'string') {
      applyExternalSort(route.query.sortBy)
    }
    // Global Search favorites navigate here with ?savedSearchId=... - apply once on load; later
    // clicks on a different favorite are handled by the watch() above (no remount happens).
    const savedSearchId = route.query.savedSearchId as string | undefined
    if (savedSearchId) {
      await Promise.all([applyFavoriteFromRoute(savedSearchId), fetchProductIcons()])
    } else {
      await Promise.all([fetchProducts(buildInitialPageParams(currentFilterQuery.value)), fetchProductIcons()])
    }
    tryOpenPanelFromRoute()
  })

  defineExpose({ refresh: () => fetchProducts(), hasUnsavedChanges, discardAllChanges })

  useShortcutContext({
    save: saveAllChanges,
    canSave: () => hasUnsavedChanges.value && !isReadOnly.value,
    discard: discardAllChanges,
    canDiscard: () => hasUnsavedChanges.value,
    saveAndExecute: () => handleSaveAll(true, { productIds: selectionStore.selectedProducts }),
    canSaveAndExecute: () => hasUnsavedChanges.value && !isReadOnly.value && !processingProcessActions.value,
    closeActivePanel: () => {
      if (!showConfigPanel.value) return false
      closePanel()
      return true
    },
  })
</script>
