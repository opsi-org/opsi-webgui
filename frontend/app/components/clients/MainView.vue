<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsMainView - Client table with detail panel, filtering, and batch operations.
-->
<template>
  <CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelPanelLeave" @confirm="confirmPanelLeave" />

  <LayoutsPageLayout
    panel-key="clients"
    show-refresh
    :loading="loading"
    :show-panel="panelLinkLoading || !!panelClient || !!panelType"
    :changes-detected="changesDetected && !autoRefreshEnabled"
    :changes-description="lastChangeDescription"
    @refresh="manualRefresh"
    @close-panel="closePanel"
  >
    <template v-if="panelType === 'products'" #workspace="{ main, panel, split }">
      <ProductsMainView
        ref="productsTableRef"
        panel-mode
        :product-type="panelProductType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'"
        :initial-sort-column="productsSortColumn"
      >
        <template #tabs>
          <CoreAppTabsNav v-model="panelProductType" :tabs="panelProductTypes" />
        </template>
        <template #workspace="products">
          <component
            :is="split"
            :panels="[
              { key: 'clients-main', view: main },
              { key: 'clients', view: panel, body: products.main },
              ...(products.showPanel ? [{ key: 'clients/products', view: products.panel }] : []),
            ]"
          />
        </template>
      </ProductsMainView>
    </template>
    <template #actions>
      <CoreAppTooltip v-if="isHostGroupAccessRestricted" :text="$t('opsiConfig.serverFeatures.hostGroupAccess.disabled')">
        <CoreAppBadge color="warning" variant="subtle" size="xs" class="cursor-help" data-testid="clients-restricted-badge">
          {{ $t('auth.restricted') }}
        </CoreAppBadge>
      </CoreAppTooltip>
      <CoreAppTooltip :text="String($t('products.viewCatalogHint'))">
        <CoreAppButton
          :icon="icons.product"
          color="primary"
          size="sm"
          @click="openProductsPanel"
          :disabled="isReadOnly"
          :aria-label="String($t('products.title'))"
          data-testid="clients-open-products-panel"
        >
          {{ $t('products.title') }}
          <span class="inline-flex items-center gap-1">
            (<CoreAppIcon :name="productScopeIcon" class="w-4 h-4" /> {{ productScopeCount }})
          </span>
        </CoreAppButton>
      </CoreAppTooltip>
      <CoreAppButton
        :icon="icons.add"
        color="primary"
        size="sm"
        @click="openAddPanel"
        :disabled="isReadOnly || !canCreateClients"
        :aria-label="String($t('common.new'))"
      >
        <span class="hidden sm:inline">{{ $t('common.new') }}</span>
      </CoreAppButton>
    </template>

    <CoreAppErrorBanner :error="error" :show="!!(error || actionStatus)" @close="error = null">
      <CoreAppAlertInline
        v-if="actionStatus"
        :color="actionStatus.type"
        :title="actionStatus.title"
        :description="actionStatus.message"
        variant="subtle"
        closable
        compact
        @close="actionStatus = null"
      />
    </CoreAppErrorBanner>

    <CoreAppErrorBanner :error="panelLinkError" :show="!!panelLinkError" @close="panelLinkError = null" />

    <CoreAppDataTable
      :rows="clients"
      :columns="columns"
      :loading="loading"
      table-id="clients"
      row-key="clientId"
      :selectable="true"
      :filterable="true"
      :filter-query="currentFilterQuery"
      saved-searches-scope-id="clients"
      :advanced-filters="advancedFilters"
      :show-refresh="false"
      :total-items="totalItems"
      :row-offset="rowOffset"
      :selected-keys="selectionStore.selectedClients"
      :active-key="panelClient?.clientId"
      :sort-by-selection-enabled="sortBySelectionEnabled"
      :panel-view="defaultClientPanelView"
      :panel-view-options="clientPanelViewOptions"
      :row-actions-options="{ showAll: showAllClientRowActions }"
      @row-activate="handleRowActivate"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @update:filter-query="handleFilterQueryUpdate"
      @update:panel-view="setDefaultClientPanelView"
      @update:show-all-row-actions="setShowAllClientRowActions"
      @apply-saved-search="handleApplySavedSearch"
      @refresh="fetchClients"
    >
      <template #filter-actions="{ canSaveSearch, favorite }">
        <ClientsAdvancedFiltersPopover
          :model-value="advancedFilters"
          :can-save-search="canSaveSearch"
          @update:model-value="handleAdvancedFiltersChange"
          @favorite="favorite"
        />
      </template>
      <template #header-cell-reachable="{ sortColumn, sortDirection }">
        <div class="flex items-center justify-center gap-1">
          <CoreAppTooltip :text="String($t('clients.reachable.help'))">
            <CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 cursor-help" />
          </CoreAppTooltip>
          <CoreAppIcon v-if="sortColumn === 'reachable'" :name="sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc" class="w-2 h-2" />
          <CoreAppIcon v-else :name="icons.sort" class="w-2 h-2 opacity-80" />
        </div>
      </template>
      <template #header-cell-actions>
        <ClientsQuickActionsDropdown
          :client-ids="selectionStore.selectedClients"
          compact
          :disabled="isReadOnly"
          @action-complete="handleActionComplete"
        />
      </template>
      <template #cell-clientId="{ row }">
        <div class="flex items-center gap-1.5">
          <CoreAppIcon
            v-if="blockedClients.has((row as OpsiClient).ipAddress || '')"
            :name="icons.lock"
            class="w-3.5 h-3.5 text-(--color-error-soft-text) shrink-0"
            :title="$t('clients.blocked')"
          />
          <CoreAppTooltip v-if="(row as OpsiClient).operatingSystem" :text="String((row as OpsiClient).operatingSystem)">
            <CoreAppIcon
              :name="operatingSystemIcon((row as OpsiClient).operatingSystem)"
              class="w-3.5 h-3.5 shrink-0"
              :class="operatingSystemIconColor((row as OpsiClient).operatingSystem)"
              :aria-label="String((row as OpsiClient).operatingSystem)"
            />
          </CoreAppTooltip>
          <span>{{ (row as OpsiClient).clientId }}</span>
        </div>
      </template>
      <template #cell-description="{ row }">
        <span class="block truncate max-w-[16rem] text-sm leading-5" :title="(row as OpsiClient).description || undefined">
          {{ (row as OpsiClient).description || '-' }}
        </span>
      </template>
      <template #cell-macAddress="{ row }">
        <span class="text-sm text-(--color-text)">{{ (row as OpsiClient).macAddress || '-' }}</span>
      </template>
      <template #cell-ipAddress="{ row }">
        <span class="text-sm text-(--color-text)">{{ (row as OpsiClient).ipAddress || '-' }}</span>
      </template>
      <template #cell-lastSeen="{ row }">
        {{ (row as OpsiClient).lastSeen ? new Date((row as OpsiClient).lastSeen as string).toLocaleString() : '-' }}
      </template>
      <template #cell-uefi="{ row }">
        <CoreAppStatusBadge v-if="(row as OpsiClient).uefi" status="info" label="UEFI" />
        <span v-else class="text-(--color-text-muted)">-</span>
      </template>
      <template #cell-version_outdated="{ row }">
        <CoreAppStatusBadge
          :value="(row as OpsiClient).version_outdated"
          :icon="icons.productsOutdated"
          label="L"
          :tooltip="`${$t('products.statusBadgeClickHint')}: ${$t('products.outdated.localboot')}`"
          status="warning"
          size="xs"
          clickable
          @click="openProductsPanelForClient(row as OpsiClient, 'version_outdated')"
        />
      </template>
      <template #cell-version_outdated_netboot="{ row }">
        <CoreAppStatusBadge
          :value="(row as OpsiClient).version_outdated_netboot"
          :icon="icons.productsOutdated"
          label="N"
          :tooltip="`${$t('products.statusBadgeClickHint')}: ${$t('products.outdated.netboot')}`"
          status="warning"
          size="xs"
          clickable
          @click="openProductsPanelForClient(row as OpsiClient, 'version_outdated', 'netboot')"
        />
      </template>
      <template #cell-actionRequest_set="{ row }">
        <CoreAppStatusBadge
          :value="(row as OpsiClient).actionRequest_set"
          :icon="icons.onDemand"
          :tooltip="`${$t('products.statusBadgeClickHint')}: ${$t('actions.request')}`"
          size="xs"
          status="info"
          clickable
          @click="openProductsPanelForClient(row as OpsiClient, 'actionRequest')"
        />
      </template>
      <template #cell-installationStatus_installed="{ row }">
        <CoreAppStatusBadge
          :value="(row as OpsiClient).installationStatus_installed"
          :icon="icons.productInstallationStatusInstalled"
          :tooltip="`${$t('products.statusBadgeClickHint')}: ${$t('products.statusInstalled')}`"
          status="success"
          size="xs"
          clickable
          @click="openProductsPanelForClient(row as OpsiClient, 'installationStatus')"
        />
      </template>
      <template #cell-actionResult_successful="{ row }">
        <CoreAppStatusBadge
          :value="(row as OpsiClient).actionResult_successful"
          :icon="icons.productActionResultSuccessful"
          :tooltip="`${$t('products.statusBadgeClickHint')}: ${$t('actions.success')}`"
          status="success"
          size="xs"
          clickable
          @click="openProductsPanelForClient(row as OpsiClient, 'actionResult')"
        />
      </template>
      <template #cell-actionResult_failed="{ row }">
        <CoreAppStatusBadge
          :value="(row as OpsiClient).actionResult_failed"
          :icon="icons.productsFailedActionResult"
          :tooltip="`${$t('products.statusBadgeClickHint')}: ${$t('actions.failed')}`"
          status="error"
          size="xs"
          clickable
          @click="openProductsPanelForClient(row as OpsiClient, 'actionResult')"
        />
      </template>
      <template #cell-reachable="{ row }">
        <ClientsReachableBadge :reachable="reachableStatus[(row as OpsiClient).clientId]" />
      </template>
      <template #row-actions="{ row }">
        <ClientsRowActionsDropdown
          :client-id="(row as OpsiClient).clientId"
          :default-action="defaultClientPanelView"
          :show-all-actions="showAllClientRowActions"
          :active-action="
            panelType === 'products'
              ? selectionStore.selectedClients.includes((row as OpsiClient).clientId)
                ? 'products'
                : null
              : panelClient?.clientId === (row as OpsiClient).clientId
                ? (panelType as 'config' | 'logs' | 'inventory' | 'clone' | null)
                : null
          "
          @open-products="openProductsPanelFromRow(row as OpsiClient)"
          @open-config="openPanel(row as OpsiClient, 'config')"
          @open-logs="openPanel(row as OpsiClient, 'logs')"
          @open-inventory="openPanel(row as OpsiClient, 'inventory')"
          @open-clone="openPanel(row as OpsiClient, 'clone')"
          @action-complete="handleActionComplete"
        />
      </template>
    </CoreAppDataTable>

    <template #panel-title>
      <span class="flex items-center gap-2">
        <CoreAppIcon
          :name="panelType === 'products' ? icons.product : panelType === 'add' ? icons.add : icons.client"
          class="w-4 h-4 text-(--color-text) shrink-0"
        />
        <template v-if="panelType === 'products'">
          <CoreAppIcon :name="productScopeIcon" class="w-3.5 h-3.5" />
          {{ productScopeLabel }}
        </template>
        <template v-else-if="panelType === 'add'">{{ $t('common.new') }}</template>
        <template v-else>
          {{ panelClient?.clientId || (panelLinkLoading ? route.query.client : '') }}
          <span v-if="panelType" class="font-normal text-(--color-text)">– {{ clientPanelTitle }}</span>
        </template>
      </span>
    </template>
    <template #panel-actions>
      <div v-if="clientPanelActionTarget && clientPanelViews.length > 1" class="flex items-center justify-end gap-1">
        <CoreAppTooltip v-for="view in clientPanelViews" :key="view.value" :text="view.label">
          <CoreAppButton
            :icon="view.icon"
            variant="ghost"
            size="xs"
            :color="panelType === view.value ? 'primary' : 'neutral'"
            :class="panelType === view.value ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
            :aria-label="view.label"
            @click="openClientPanelView(clientPanelActionTarget, view.value)"
          />
        </CoreAppTooltip>
      </div>
    </template>
    <template #panel>
      <div v-if="panelLinkLoading" role="status" :aria-label="String($t('common.loading'))" class="py-8 flex justify-center">
        <CoreAppLoadingSpinner size="md" />
      </div>
      <div v-else-if="panelClient" class="h-full flex flex-col min-h-0">
        <HostsConfigTabs
          v-if="panelType === 'config'"
          ref="configTabsRef"
          :host-id="panelClient.clientId"
          host-type="client"
          :tab="panelTab"
          :readonly="isReadOnly"
          @update:tab="panelTab = $event"
        />
        <ClientsLogsView v-if="panelType === 'logs'" :client-id="panelClient.clientId" />
        <ClientsInventoryPanel
          v-if="panelType === 'inventory'"
          :client-id="panelClient.clientId"
          :tab="panelInventoryTab"
          @update:tab="panelInventoryTab = $event"
        />
        <ClientsCloneForm v-if="panelType === 'clone'" ref="cloneFormRef" :source-id="panelClient.clientId" @saved="fetchClients" />
      </div>
      <ClientsAddForm v-if="panelType === 'add'" ref="addFormRef" @saved="handleAddSaved" />
    </template>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import { useDataTableSettings, type DataTableColumnDef } from '~/composables/data-table/useDataTableSettings'
  import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
  import type { Client as OpsiClient } from '~/types'
  import type { ClientAdvancedFilters } from '~/components/clients/AdvancedFiltersPopover.vue'
  import { getStoredDataTableFilter } from '~/composables/data-table/useDataTableFilter'
  import { useSavedSearches } from '~/composables/useSavedSearches'
  import { CLEAR_ALL_FILTERS_EVENT } from '~/composables/useGlobalFavorites'
  import { useSelectionStore } from '~/stores/selectionStore'
  import { useMessageBusStore } from '~/stores/messageBusStore'
  import { useDataTableFilterStore } from '~/stores/dataTableFilterStore'
  import { storeToRefs } from 'pinia'

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getClients, getServerIds, getBlockedClients } = useApiHelpers()
  const selectionStore = useSelectionStore()
  const messageBusStore = useMessageBusStore()
  const dataTableFilterStore = useDataTableFilterStore()
  dataTableFilterStore.initialize()
  const { lastMsg: messageBusLastMsg } = storeToRefs(messageBusStore)
  const router = useRouter()
  const route = useRoute()
  const { isReadOnly, canCreateClients, isHostGroupAccessRestricted } = useUserPermissions()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const panelLinkError = ref<string | null>(null)
  const panelLinkLoading = ref(false)
  let panelLinkRequestId = 0
  let panelRouteReady = false
  let panelRouteHistoryPosition: number | undefined
  const actionStatus = ref<{ type: 'success'; title: string; message: string } | null>(null)
  let actionStatusTimer: ReturnType<typeof setTimeout> | null = null
  const clients = ref<OpsiClient[]>([])
  const rowOffset = ref(0)
  const totalItems = ref(0)
  type ClientPanelType = 'config' | 'logs' | 'clone' | 'inventory'
  type DefaultClientPanelView = ClientPanelType | 'products'

  const panelClient = ref<OpsiClient | null>(null)
  const panelType = ref<ClientPanelType | 'products' | 'add' | null>(null)
  const panelTab = ref('attributes')
  const panelInventoryTab = ref<'hardware' | 'software'>('hardware')
  const tableSettings = useDataTableSettings('clients')
  const defaultClientPanelView = computed<DefaultClientPanelView>({
    get: () => tableSettings.settings.defaultPanelView ?? 'config',
    set: (value) => {
      tableSettings.settings.defaultPanelView = value
    },
  })
  const showAllClientRowActions = computed(() => tableSettings.settings.showAllRowActions ?? false)
  const panelProductType = ref<'localboot' | 'netboot'>('localboot')
  const panelProductTypes = [
    { label: String($t('products.localboot')), value: 'localboot' },
    { label: String($t('products.netboot')), value: 'netboot' },
  ]
  const productScopeIcon = computed(() => (selectionStore.selectedClients.length > 0 ? icons.client : icons.server))
  const productScopeCount = computed(() =>
    selectionStore.selectedClients.length > 0 ? selectionStore.selectedClients.length : selectionStore.selectedServers.length,
  )
  const productScopeLabel = computed(() => {
    const clients = selectionStore.selectedClients
    const servers = selectionStore.selectedServers
    if (clients.length === 1) return `${clients[0]} – ${String($t('products.title'))}`
    if (clients.length > 1) return `${clients.length} ${String($t('clients.title'))} – ${String($t('products.title'))}`
    return `${servers.length} ${String($t('servers.title'))} – ${String($t('products.title'))}`
  })
  const clientPanelTitle = computed(() =>
    panelType.value === 'clone' ? String($t('clients.clone.title')) : String($t(`${panelType.value}.title`)),
  )
  const clientPanelViews = computed<Array<{ label: string; value: DefaultClientPanelView; icon: string }>>(() => [
    ...(!isReadOnly.value ? [{ label: String($t('products.title')), value: 'products' as const, icon: icons.product }] : []),
    { label: String($t('config.title')), value: 'config', icon: icons.config },
    { label: String($t('logs.title')), value: 'logs', icon: icons.log },
    { label: String($t('inventory.title')), value: 'inventory', icon: icons.inventory },
    ...(isReadOnly.value || !canCreateClients.value
      ? []
      : [{ label: String($t('clients.clone.title')), value: 'clone' as const, icon: icons.clone }]),
  ])
  const clientPanelActionTarget = computed(() => {
    if (panelClient.value) return panelClient.value
    if (panelType.value !== 'products' || selectionStore.selectedClients.length !== 1) return null
    const [clientId] = selectionStore.selectedClients
    return clientId ? (clients.value.find((client) => client.clientId === clientId) ?? null) : null
  })
  const clientPanelViewOptions = computed(() => clientPanelViews.value.map(({ label, value }) => ({ label, value: String(value) })))
  const reachableStatus = ref<Record<string, boolean | undefined>>({})
  // Clients whose state came from a live host_connected/host_disconnected event
  const reachableLiveIds = ref<Set<string>>(new Set())
  const blockedClients = ref<Set<string>>(new Set())
  const lastPageParams = ref<PageChangeParams | null>(null)
  const currentFilterQuery = ref(typeof route.query.filter === 'string' ? route.query.filter : getStoredDataTableFilter('clients'))
  const fetchClientsRequestId = ref(0)
  let fetchClientsController: AbortController | null = null
  const advancedFilters = computed(() => dataTableFilterStore.advancedFilters.clients as ClientAdvancedFilters & Record<string, unknown>)

  function handleAdvancedFiltersChange(value: ClientAdvancedFilters) {
    dataTableFilterStore.setAdvancedFilters('clients', value)
    return fetchClients(buildInitialPageParams(lastPageParams.value?.filterQuery ?? currentFilterQuery.value))
  }

  function handleApplySavedSearch(value: { filterQuery: string; advancedFilters: Record<string, unknown> }) {
    // Otherwise a stale lastPageParams.filterQuery (captured on the last page-change) would win
    // over this new value in handleAdvancedFiltersChange's fallback below.
    lastPageParams.value = null
    currentFilterQuery.value = value.filterQuery
    return handleAdvancedFiltersChange(value.advancedFilters as ClientAdvancedFilters)
  }

  // Global Search favorites navigate here with ?savedSearchId=... (+ ?filter=... when the
  // favorite has quick-filter text). Always resolve both filterQuery and advancedFilters to
  // concrete values (even '' / {}) so a previously applied filter can't linger, then drop the
  // param. Runs both on first load and on later in-app navigation to a different favorite,
  // since navigating between two /clients?... URLs doesn't remount this component.
  function applyFavoriteFromRoute(savedSearchId: string) {
    const entry = useSavedSearches<ClientAdvancedFilters>('clients').get(savedSearchId)
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
  const productsSortColumn = ref<string | undefined>(undefined)
  const configTabsRef = ref<{ hasAnyChanges?: boolean; discardAll?: () => void; saveAll?: () => void } | null>(null)
  const productsTableRef = ref<{
    hasUnsavedChanges?: boolean
    discardAllChanges?: () => void
    saveAll?: () => void
  } | null>(null)
  const cloneFormRef = ref<{ hasChanges?: boolean; refresh?: () => void } | null>(null)
  const addFormRef = ref<{ hasChanges?: boolean; resetForm?: () => void } | null>(null)
  const showLeaveWarning = ref(false)
  const pendingPanelAction = ref<(() => void) | null>(null)
  let resolveRouteLeave: ((ok: boolean) => void) | null = null

  onBeforeRouteLeave(() => {
    const hasChanges =
      configTabsRef.value?.hasAnyChanges ||
      productsTableRef.value?.hasUnsavedChanges ||
      cloneFormRef.value?.hasChanges ||
      addFormRef.value?.hasChanges
    if (!hasChanges) return true
    showLeaveWarning.value = true
    return new Promise<boolean>((resolve) => {
      resolveRouteLeave = resolve
    })
  })

  const sortBySelectionEnabled = computed(
    () => selectionStore.selectionSource === 'quickpanel' && selectionStore.selectedClients.length > 0,
  )

  function operatingSystemIcon(operatingSystem?: string | null): string {
    const value = (operatingSystem || '').toLowerCase()
    if (value.includes('windows')) return icons.windows
    if (value.includes('mac') || value.includes('darwin') || value.includes('os x')) return icons.apple
    if (value.includes('linux') || value.includes('unix') || value.includes('debian') || value.includes('ubuntu')) return icons.linux
    return icons.info
  }

  function operatingSystemIconColor(operatingSystem?: string | null): string {
    const value = (operatingSystem || '').toLowerCase()
    if (value.includes('windows')) return 'text-(--color-os-windows)'
    if (value.includes('mac') || value.includes('darwin') || value.includes('os x')) return 'text-(--color-os-macos)'
    if (value.includes('linux') || value.includes('unix') || value.includes('debian') || value.includes('ubuntu'))
      return 'text-(--color-os-linux)'
    return 'text-(--color-text-muted)'
  }

  const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefresh(fetchClients, {
    watchEvents: ['event:host_created', 'event:host_updated', 'event:host_deleted'],
  })

  const columns: DataTableColumnDef[] = [
    {
      key: 'reachable',
      label: String($t('clients.reachable.status')),
      labelKey: 'clients.reachable.status',
      headerIcon: icons.clientReachable,
      sortable: true,
      class: 'text-center w-10 p-0',
    },
    {
      key: 'clientId',
      label: String($t('clients.id')),
      labelKey: 'clients.id',
      sortable: true,
      alwaysVisible: true,
    },
    {
      key: 'version_outdated',
      label: String($t('products.outdated.localboot')),
      labelKey: 'products.outdated.localboot',
      headerIcon: icons.productsOutdated,
      sortable: true,
      class: 'text-center w-10',
      minWidth: '50px',
    },
    {
      key: 'version_outdated_netboot',
      label: String($t('products.outdated.netboot')),
      labelKey: 'products.outdated.netboot',
      headerIcon: icons.productsOutdated,
      sortable: true,
      class: 'text-center w-10',
      minWidth: '50px',
    },
    {
      key: 'installationStatus_installed',
      label: String($t('products.statusInstalled')),
      labelKey: 'products.statusInstalled',
      headerIcon: icons.productInstallationStatusInstalled,
      sortable: true,
      class: 'text-center w-10',
      minWidth: '50px',
    },
    {
      key: 'actionRequest_set',
      label: String($t('actions.request')),
      labelKey: 'actions.request',
      headerIcon: icons.onDemand,
      sortable: true,
      class: 'text-center w-10',
      minWidth: '50px',
    },
    {
      key: 'actionResult_failed',
      label: String($t('actions.failed')),
      labelKey: 'actions.failed',
      headerIcon: icons.productsFailedActionResult,
      sortable: true,
      class: 'text-center w-10',
      minWidth: '50px',
    },
    {
      key: 'actionResult_successful',
      label: String($t('actions.success')),
      labelKey: 'actions.success',
      headerIcon: icons.productActionResultSuccessful,
      sortable: true,
      visible: false,
      class: 'text-center w-10',
      minWidth: '50px',
    },
    {
      key: 'description',
      label: String($t('common.description')),
      labelKey: 'common.description',
      sortable: true,
      maxWidth: '16rem',
      truncate: true,
      tooltip: true,
    },
    {
      key: 'lastSeen',
      label: String($t('fields.lastSeen')),
      labelKey: 'fields.lastSeen',
      sortable: true,
    },
    {
      key: 'macAddress',
      label: String($t('fields.mac')),
      labelKey: 'fields.mac',
      sortable: true,
      visible: false,
    },
    {
      key: 'ipAddress',
      label: String($t('fields.ip')),
      labelKey: 'fields.ip',
      sortable: true,
      visible: false,
    },
    { key: 'uefi', label: 'UEFI', sortable: true, visible: false },
  ]

  function doOpenPanel(client: OpsiClient, type: ClientPanelType) {
    panelClient.value = client
    panelType.value = type
    const { configType: _ct, inventoryTab: _it, sortBy: _sortBy, type: _type, ...restQuery } = route.query as Record<string, string>
    const query: Record<string, string> = {
      ...restQuery,
      client: client.clientId,
      view: 'panel',
      panelType: type,
    }
    if (type === 'config') query.configType = panelTab.value
    if (type === 'inventory') query.inventoryTab = panelInventoryTab.value
    router.replace({ query })
  }

  function openPanel(client: OpsiClient, type: ClientPanelType) {
    checkUnsavedAndDo(() => doOpenPanel(client, type))
  }

  function openClientPanelView(client: OpsiClient, type: DefaultClientPanelView) {
    if (type === 'products') {
      checkUnsavedAndDo(() => openProductsPanelForClient(client, productsSortColumn.value ?? 'productId', panelProductType.value))
      return
    }
    openPanel(client, type)
  }

  function isIndependentClientPanel(type: unknown): type is ClientPanelType {
    return type === 'config' || type === 'logs' || type === 'inventory' || type === 'clone'
  }

  function normalizeConfigTab(tab: unknown): 'parameters' | 'attributes' {
    return tab === 'parameters' || tab === 'parameter' ? 'parameters' : 'attributes'
  }

  async function openClientPanelFromRoute() {
    const requestId = ++panelLinkRequestId
    panelLinkError.value = null
    panelLinkLoading.value = false
    const clientId = route.query.client
    const type = route.query.panelType
    if (route.query.view === 'panel' && type === 'add') {
      panelClient.value = null
      panelType.value = 'add'
      return
    }
    if (route.query.view !== 'panel' || !isIndependentClientPanel(type) || typeof clientId !== 'string' || !clientId) {
      if (isIndependentClientPanel(panelType.value) || panelType.value === 'add') {
        panelClient.value = null
        panelType.value = null
      }
      return
    }
    if (type === 'inventory') {
      panelInventoryTab.value = route.query.inventoryTab === 'software' ? 'software' : 'hardware'
    }
    if (type === 'config') panelTab.value = normalizeConfigTab(route.query.configType)
    if (panelClient.value?.clientId === clientId && panelType.value === type) return
    panelClient.value = null
    panelType.value = null
    panelLinkLoading.value = true
    const result = await getClients({ filterQuery: JSON.stringify({ id: [clientId] }), pageNumber: 1, perPage: 1 })
    if (requestId !== panelLinkRequestId) return
    panelLinkLoading.value = false
    const client = result.data?.find((entry) => entry.clientId === clientId)
    if (!client) {
      panelClient.value = null
      panelType.value = null
      panelLinkError.value = result.error?.message || String($t('common.noData'))
      return
    }
    panelClient.value = client
    panelType.value = type
  }

  onBeforeRouteUpdate((to, from) => {
    const opensClientPanel =
      to.query.view === 'panel' &&
      (to.query.panelType === 'add' || (isIndependentClientPanel(to.query.panelType) && typeof to.query.client === 'string'))
    const leavesEditablePanel =
      from.query.view === 'panel' &&
      (from.query.panelType === 'config' || from.query.panelType === 'clone' || from.query.panelType === 'add')
    if (!opensClientPanel && !leavesEditablePanel) return true
    if (from.query.view === to.query.view && from.query.panelType === to.query.panelType && from.query.client === to.query.client)
      return true
    const {
      client: _client,
      view: _view,
      panelType: _panelType,
      configType: _configType,
      inventoryTab: _inventoryTab,
      ...context
    } = from.query
    const query = opensClientPanel
      ? {
          ...context,
          ...(to.query.panelType === 'add' ? {} : { client: to.query.client }),
          view: 'panel',
          panelType: to.query.panelType,
          ...(to.query.panelType === 'config' ? { configType: normalizeConfigTab(to.query.configType) } : {}),
          ...(to.query.panelType === 'inventory' ? { inventoryTab: to.query.inventoryTab === 'software' ? 'software' : 'hardware' } : {}),
        }
      : { ...context, ...to.query }
    const isHistoryNavigation = window.history.state?.position !== panelRouteHistoryPosition
    if (!isHistoryNavigation && JSON.stringify(query) !== JSON.stringify(to.query)) return { path: to.path, query }
    if (opensClientPanel && panelClient.value?.clientId === to.query.client && panelType.value === to.query.panelType) return true
    if (
      !configTabsRef.value?.hasAnyChanges &&
      !productsTableRef.value?.hasUnsavedChanges &&
      !cloneFormRef.value?.hasChanges &&
      !addFormRef.value?.hasChanges
    )
      return true
    showLeaveWarning.value = true
    return new Promise<boolean>((resolve) => {
      resolveRouteLeave = resolve
    })
  })

  watch(
    () => [route.query.client, route.query.view, route.query.panelType, route.query.configType, route.query.inventoryTab],
    () => {
      if (panelRouteReady) void openClientPanelFromRoute()
    },
  )

  watch(
    () => route.fullPath,
    () => {
      panelRouteHistoryPosition = window.history.state?.position
    },
    { flush: 'post' },
  )

  function openProductsPanel() {
    checkUnsavedAndDo(() => {
      panelClient.value = null
      panelType.value = 'products'
      const {
        client: _client,
        configType: _configType,
        inventoryTab: _inventoryTab,
        sortBy: _sortBy,
        type: _type,
        ...restQuery
      } = route.query
      router.replace({
        query: {
          ...restQuery,
          view: 'panel',
          panelType: 'products',
          sortBy: productsSortColumn.value,
          type: panelProductType.value,
        },
      })
    })
  }

  function openAddPanel() {
    checkUnsavedAndDo(() => {
      panelClient.value = null
      panelType.value = 'add'
      const { client: _client, configType: _configType, inventoryTab: _inventoryTab, ...restQuery } = route.query
      router.replace({ query: { ...restQuery, view: 'panel', panelType: 'add' } })
    })
  }

  function openProductsPanelForClient(client: OpsiClient, sortColumn: string, productType?: 'localboot' | 'netboot') {
    selectionStore.setClients([client.clientId], 'table')
    productsSortColumn.value = sortColumn
    panelProductType.value = productType || 'localboot'
    panelClient.value = null
    panelType.value = 'products'
    const { client: _client, configType: _configType, inventoryTab: _inventoryTab, ...restQuery } = route.query
    router.replace({
      query: {
        ...restQuery,
        view: 'panel',
        panelType: 'products',
        sortBy: sortColumn,
        type: panelProductType.value,
      },
    })
  }

  function openProductsPanelFromRow(client: OpsiClient) {
    checkUnsavedAndDo(() => openProductsPanelForClient(client, 'productId'))
  }

  function handleAddSaved() {
    if (actionStatusTimer) clearTimeout(actionStatusTimer)
    actionStatus.value = {
      type: 'success',
      title: String($t('common.success')),
      message: String($t('clients.create.ok')),
    }
    actionStatusTimer = setTimeout(() => {
      actionStatus.value = null
      actionStatusTimer = null
    }, 5000)
    closePanel()
    fetchClients()
  }

  onBeforeUnmount(() => {
    if (actionStatusTimer) clearTimeout(actionStatusTimer)
  })

  function closePanel() {
    checkUnsavedAndDo(() => {
      panelLinkRequestId++
      panelLinkLoading.value = false
      panelClient.value = null
      panelType.value = null
      const { client: _c, view: _v, panelType: _pt, configType: _ct, inventoryTab: _it, sortBy: _sb, type: _ty, ...rest } = route.query
      router.replace({ query: rest })
    })
  }

  function checkUnsavedAndDo(action: () => void) {
    const hasConfigChanges = configTabsRef.value?.hasAnyChanges
    const hasProductChanges = productsTableRef.value?.hasUnsavedChanges
    if (hasConfigChanges || hasProductChanges || cloneFormRef.value?.hasChanges || addFormRef.value?.hasChanges) {
      pendingPanelAction.value = action
      showLeaveWarning.value = true
      return
    }
    action()
  }

  function confirmPanelLeave() {
    showLeaveWarning.value = false
    configTabsRef.value?.discardAll?.()
    productsTableRef.value?.discardAllChanges?.()
    cloneFormRef.value?.refresh?.()
    addFormRef.value?.resetForm?.()
    if (resolveRouteLeave) {
      resolveRouteLeave(true)
      resolveRouteLeave = null
    }
    if (pendingPanelAction.value) {
      pendingPanelAction.value()
      pendingPanelAction.value = null
    }
  }

  function cancelPanelLeave() {
    showLeaveWarning.value = false
    if (resolveRouteLeave) {
      resolveRouteLeave(false)
      resolveRouteLeave = null
    }
    pendingPanelAction.value = null
  }

  function handleRowActivate(row: OpsiClient) {
    checkUnsavedAndDo(() => {
      selectionStore.setClients([row.clientId], 'table')
      if (defaultClientPanelView.value === 'products') openProductsPanelForClient(row, 'productId')
      else doOpenPanel(row, defaultClientPanelView.value)
    })
  }

  function setDefaultClientPanelView(value: string) {
    if (!clientPanelViewOptions.value.some((option) => option.value === value)) return
    defaultClientPanelView.value = value as DefaultClientPanelView
  }

  function setShowAllClientRowActions(value: boolean) {
    tableSettings.settings.showAllRowActions = value
  }

  function handleSelectionChange(_rows: OpsiClient[], keys: string[]) {
    selectionStore.setClients(keys, 'table')
  }

  function handleActionComplete(action: string, success: boolean) {
    if ((action === 'delete' || action === 'rename') && success) fetchClients()
  }

  function handlePageChange(params: PageChangeParams) {
    lastPageParams.value = params
    currentFilterQuery.value = params.filterQuery
    // Sorting and paging reuse the existing filter; avoid unnecessary router
    // work unless the normalized query value actually changed.
    const routeFilter = typeof route.query.filter === 'string' ? route.query.filter : ''
    if (routeFilter !== params.filterQuery) {
      router.replace({
        query: {
          ...(route.query as Record<string, string>),
          filter: params.filterQuery || undefined,
        },
      })
    }
    fetchClients(params)
  }

  function handleFilterQueryUpdate(value: string) {
    currentFilterQuery.value = value
    fetchClientsController?.abort()
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
      perPage: tableSettings.settings.pageSize,
      sortBy: tableSettings.settings.sortColumn || 'clientId',
      sortDesc: tableSettings.settings.sortDirection === 'desc',
      filterQuery,
      sortBySelection: sortBySelectionEnabled.value,
      onlySelected: false,
    }
  }

  async function fetchClients(params?: PageChangeParams) {
    const isInfinitePageRequest = params != null && params.pageNumber > 1
    const requestId = isInfinitePageRequest ? fetchClientsRequestId.value : ++fetchClientsRequestId.value
    if (!isInfinitePageRequest) fetchClientsController?.abort()
    const controller = new AbortController()
    fetchClientsController = controller
    loading.value = true
    error.value = null
    try {
      if (params) lastPageParams.value = params
      const isReload = !params
      const baseParams = lastPageParams.value ?? undefined
      const effectiveParams =
        isReload && baseParams && (rowOffset.value > 0 || baseParams.pageNumber > 1)
          ? { ...baseParams, pageNumber: 1, perPage: Math.max(baseParams.perPage, rowOffset.value + clients.value.length) }
          : baseParams
      const selectionSortActive = effectiveParams?.sortBySelection ?? sortBySelectionEnabled.value
      await selectionStore.ensureServersSelected()
      if (selectionStore.selectedServers.length === 0) {
        const depotResult = await getServerIds()
        const depots = depotResult.data || []
        if (depots.length > 0) selectionStore.setServers(depots)
        else {
          error.value = String($t('servers.noSelection'))
          return
        }
      }
      const p: Record<string, unknown> = {
        selectedDepots: selectionStore.selectedServersParam,
      }
      if (selectionStore.selectedClients.length > 0) {
        p.selectedClients = `[${selectionStore.selectedClients.join(',')}]`
      }
      if ((selectionSortActive || effectiveParams?.onlySelected) && selectionStore.selectedClients.length > 0) {
        p.selected = `[${selectionStore.selectedClients.join(',')}]`
      }
      if (effectiveParams) {
        p.pageNumber = effectiveParams.pageNumber
        p.perPage = effectiveParams.perPage
        p.sortBy = effectiveParams.sortBy
        p.sortDesc = effectiveParams.sortDesc
        if (effectiveParams.serverFilterQuery || effectiveParams.filterQuery)
          p.filterQuery = effectiveParams.serverFilterQuery || effectiveParams.filterQuery
        if (effectiveParams.onlySelected) p.onlySelected = true
      } else if (currentFilterQuery.value) {
        p.filterQuery = currentFilterQuery.value
      }
      if (advancedFilters.value.reachable !== undefined) p.reachableFilter = advancedFilters.value.reachable
      if (advancedFilters.value.notSeenSinceDays !== undefined && advancedFilters.value.notSeenSinceDays !== null) {
        p.notSeenSinceDays = advancedFilters.value.notSeenSinceDays
      }
      if (advancedFilters.value.hasFailedProducts) p.hasFailedProducts = true
      if (advancedFilters.value.hasOutdatedProducts) p.hasOutdatedProducts = true
      if (advancedFilters.value.operatingSystem) p.operatingSystem = advancedFilters.value.operatingSystem
      const result = await getClients(p, { signal: controller.signal })
      if (controller.signal.aborted) return
      if (requestId !== fetchClientsRequestId.value) return
      if (result.error) error.value = result.error.message
      else if (result.data) {
        const newData = result.data as OpsiClient[]
        if (result.total !== null) totalItems.value = result.total
        if (!isReload && effectiveParams && effectiveParams.pageNumber > 1) {
          rowOffset.value += appendInfinitePage(clients.value, newData, effectiveParams.perPage, (client) => client.clientId)
        } else {
          clients.value = newData
          rowOffset.value = isReload && effectiveParams ? (effectiveParams.pageNumber - 1) * effectiveParams.perPage : 0
        }
        for (const client of newData) {
          if (typeof client.reachable === 'boolean' && !reachableLiveIds.value.has(client.clientId)) {
            reachableStatus.value[client.clientId] = client.reachable
          }
        }
      }
    } catch (e) {
      if (requestId !== fetchClientsRequestId.value) return
      if (controller.signal.aborted) return
      error.value = (e as Error).message
    } finally {
      if (requestId === fetchClientsRequestId.value && fetchClientsController === controller) {
        loading.value = false
        fetchClientsController = null
      }
    }
  }

  async function fetchBlockedClients() {
    try {
      const result = await getBlockedClients()
      if (result.data) {
        const blockedIps = Array.isArray(result.data) ? result.data : Object.keys(result.data)
        blockedClients.value = new Set(blockedIps)
      }
    } catch {
      /* silently fail */
    }
  }

  function extractHostId(msg: unknown): string | undefined {
    if (!msg || typeof msg !== 'object') return undefined
    const visited = new Set<unknown>()
    const queue: unknown[] = [msg]

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current || typeof current !== 'object' || visited.has(current)) continue
      visited.add(current)

      if (Array.isArray(current)) {
        queue.push(...current)
        continue
      }

      const record = current as Record<string, unknown>
      for (const [key, value] of Object.entries(record)) {
        if (typeof value === 'string' && /(hostId|host_id|clientId|client_id|objectId|object_id)$/i.test(key)) {
          return value
        }
        if (value && typeof value === 'object') queue.push(value)
      }
    }

    return undefined
  }

  function getMessageEventName(msg: unknown): string {
    if (!msg || typeof msg !== 'object') return ''
    const record = msg as Record<string, unknown>
    const msgType = typeof record.type === 'string' ? record.type : ''
    if (msgType === 'event') {
      if (typeof record.event === 'string') return record.event
      if (typeof record.channel === 'string') return record.channel.replace(/^event:/, '')
    }
    return msgType
  }

  watch(messageBusLastMsg, (msg) => {
    if (!msg || typeof msg !== 'object') return
    const eventName = getMessageEventName(msg)
    if (!eventName) return

    if (eventName === 'host_connected' || eventName === 'host_disconnected') {
      const hostId = extractHostId(msg)
      if (hostId) {
        reachableStatus.value[hostId] = eventName === 'host_connected'
        reachableLiveIds.value.add(hostId)
      }
    }
  })

  watch(
    () => selectionStore.selectedClients.join(','),
    () => {
      if ((lastPageParams.value?.sortBySelection || sortBySelectionEnabled.value) && selectionStore.selectionSource !== 'table') {
        fetchClients()
      }
    },
  )

  watch(
    () => selectionStore.selectedServers.join(','),
    () => {
      fetchClients(buildInitialPageParams(currentFilterQuery.value))
      fetchBlockedClients()
    },
  )

  watch(panelTab, (newTab) => {
    if (panelType.value === 'config' && panelClient.value) {
      router.replace({ query: { ...(route.query as Record<string, string>), configType: newTab } })
    }
  })

  watch(panelInventoryTab, (newTab) => {
    if (panelType.value === 'inventory' && panelClient.value) {
      router.replace({ query: { ...(route.query as Record<string, string>), inventoryTab: newTab } })
    }
  })

  watch(panelType, (newType) => {
    if (newType !== 'config' && newType !== 'logs' && newType !== 'clone' && newType !== 'inventory') return
    if (panelClient.value) doOpenPanel(panelClient.value, newType)
  })

  watch(panelProductType, (newType) => {
    if (panelType.value === 'products') {
      router.replace({ query: { ...(route.query as Record<string, string>), type: newType } })
    }
  })

  watch(
    () => route.query.sortBy,
    (sortBy) => {
      if (typeof sortBy === 'string') {
        productsSortColumn.value = sortBy
      }
    },
  )

  watch(
    () => route.query.type,
    (newType) => {
      if (newType === 'localboot' || newType === 'netboot') {
        panelProductType.value = newType
      }
    },
  )

  onMounted(async () => {
    panelRouteHistoryPosition = window.history.state?.position
    if (
      (defaultClientPanelView.value === 'clone' && (!canCreateClients.value || isReadOnly.value)) ||
      (defaultClientPanelView.value === 'products' && isReadOnly.value)
    ) {
      defaultClientPanelView.value = 'config'
    }
    const routeSortBy = route.query.sortBy as string | undefined
    if (routeSortBy) productsSortColumn.value = routeSortBy
    const routeProductType = route.query.type as string | undefined
    if (routeProductType === 'localboot' || routeProductType === 'netboot') {
      panelProductType.value = routeProductType
    }
    // Global Search favorites navigate here with ?savedSearchId=... - apply once on load; later
    // clicks on a different favorite are handled by the watch() above (no remount happens).
    const savedSearchId = route.query.savedSearchId as string | undefined
    if (savedSearchId) {
      await Promise.all([applyFavoriteFromRoute(savedSearchId), fetchBlockedClients()])
    } else {
      await Promise.all([fetchClients(buildInitialPageParams(currentFilterQuery.value)), fetchBlockedClients()])
    }
    panelRouteReady = true
    if (route.query.view === 'panel' && (isIndependentClientPanel(route.query.panelType) || route.query.panelType === 'add')) {
      await openClientPanelFromRoute()
      return
    }
    const clientId = route.query.client as string | undefined
    const pType = route.query.panelType
    if (clientId && route.query.view === 'panel') {
      const c = clients.value.find((cl) => cl.clientId === clientId)
      if (c) {
        if (defaultClientPanelView.value === 'products') openProductsPanelForClient(c, 'productId')
        else doOpenPanel(c, defaultClientPanelView.value)
      }
      return
    }

    if (route.query.view === 'panel' && pType === 'products') {
      panelClient.value = null
      panelType.value = 'products'
      return
    }
  })

  onUnmounted(() => {
    fetchClientsController?.abort()
    panelLinkRequestId++
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

  watch(
    () => route.query.filter,
    (newFilter) => {
      currentFilterQuery.value = typeof newFilter === 'string' ? newFilter : getStoredDataTableFilter('clients')
    },
  )

  useShortcutContext({
    save: () => configTabsRef.value?.saveAll?.() ?? productsTableRef.value?.saveAll?.(),
    canSave: () => !!(configTabsRef.value?.hasAnyChanges || productsTableRef.value?.hasUnsavedChanges) && !isReadOnly.value,
    discard: () => {
      configTabsRef.value?.discardAll?.()
      productsTableRef.value?.discardAllChanges?.()
    },
    canDiscard: () => !!(configTabsRef.value?.hasAnyChanges || productsTableRef.value?.hasUnsavedChanges),
    closeActivePanel: () => {
      if (!panelClient.value && !panelType.value) return false
      closePanel()
      return true
    },
  })

  defineShortcuts({
    ctrl_shift_n: {
      usingInput: true,
      handler: () => {
        if (!isReadOnly.value && canCreateClients.value) openAddPanel()
      },
    },
  })
</script>
