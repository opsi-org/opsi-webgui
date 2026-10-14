<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  ServersMainView - Server table with detail panel.
-->
<template>
  <CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelPanelLeave" @confirm="confirmPanelLeave" />

  <LayoutsPageLayout
    show-refresh
    :loading="loading"
    :show-panel="panelType === 'config'"
    :changes-detected="changesDetected && !autoRefreshEnabled"
    :changes-description="lastChangeDescription"
    @refresh="manualRefresh"
    @close-panel="closePanel"
  >
    <template #actions>
      <CoreAppTooltip v-if="isDepotAccessRestricted" :text="$t('opsiConfig.serverFeatures.depotAccess.disabled')">
        <CoreAppBadge color="warning" variant="subtle" size="xs" class="cursor-help" data-testid="servers-restricted-badge">
          {{ $t('auth.restricted') }}
        </CoreAppBadge>
      </CoreAppTooltip>
      <CoreAppButton
        :icon="icons.globalParameters"
        color="primary"
        size="sm"
        :title="String($t('config.globalParameters'))"
        data-testid="servers-open-global-parameters-panel"
        @click="openGlobalParametersPanel"
      >
        {{ $t('config.globalParameters') }}
      </CoreAppButton>
      <CoreAppButton
        v-if="!isReadOnly && hasServerWriteAccess"
        :icon="icons.add"
        color="primary"
        variant="soft"
        size="sm"
        :title="String($t('config.create'))"
        @click="showCreateConfigModal = true"
      >
        <span class="hidden sm:inline">{{ $t('config.create') }}</span>
      </CoreAppButton>
    </template>

    <CoreAppErrorBanner :error="error" @close="error = null" />
    <CoreAppErrorBanner :error="panelLinkError" @close="panelLinkError = null" />

    <HostsCreateConfigModal v-model:open="showCreateConfigModal" @created="handleConfigCreated" />

    <CoreAppDataTable
      :rows="servers"
      :columns="columns"
      :loading="loading"
      table-id="servers"
      row-key="depotId"
      :selectable="true"
      :filterable="true"
      :filter-query="currentFilterQuery"
      saved-searches-scope-id="servers"
      :advanced-filters="advancedFilters"
      :show-refresh="false"
      :total-items="totalItems"
      :row-offset="rowOffset"
      :selected-keys="selectionStore.selectedServers"
      :active-key="panelServer?.depotId"
      :sort-by-selection-enabled="sortBySelectionEnabled"
      @row-activate="handleRowActivate"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @update:filter-query="handleFilterQueryUpdate"
      @apply-saved-search="handleApplySavedSearch"
      @refresh="fetchServers"
    >
      <template #filter-actions="{ canSaveSearch, favorite }">
        <ServersAdvancedFiltersPopover
          :model-value="advancedFilters"
          :can-save-search="canSaveSearch"
          @update:model-value="handleAdvancedFiltersChange"
          @favorite="favorite"
        />
      </template>
      <template #cell-depotId="{ row }">
        <CoreAppIcon
          :name="(row as Server).type === 'OpsiConfigserver' ? icons.serverStack : icons.server"
          class="w-3.5 h-3.5 text-(--color-text-muted) mr-2"
        />
        <span :class="(row as Server).type === 'OpsiConfigserver' ? 'font-bold' : ''">{{ (row as Server).depotId }}</span>
      </template>
      <template #cell-type="{ row }">
        <CoreAppStatusBadge
          :status="(row as Server).type === 'OpsiConfigserver' ? 'info' : 'neutral'"
          variant="solid"
          :label="String((row as Server).type || '-')"
        />
      </template>
      <template #cell-description="{ row }">
        <span class="block truncate max-w-[18rem] text-sm leading-5" :title="(row as Server).description || undefined">
          {{ (row as Server).description || '-' }}
        </span>
      </template>
      <template #row-actions="{ row }">
        <CoreAppButton
          :icon="icons.config"
          variant="ghost"
          size="xs"
          :title="$t('config.title')"
          :color="panelServer?.depotId === (row as Server).depotId ? 'primary' : 'neutral'"
          :class="panelServer?.depotId === (row as Server).depotId ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
          @click.stop="openConfig(row as Server)"
        />
      </template>
    </CoreAppDataTable>

    <template #panel-title>
      <span class="flex items-center gap-2">
        <CoreAppIcon :name="panelServer || panelLinkLoading ? icons.server : icons.globalParameters" class="w-4 h-4 shrink-0" />
        {{ panelLinkLoading ? route.query.server : panelServer?.depotId || $t('config.globalParameters') }}
      </span>
    </template>
    <template #panel-subtitle
      ><template v-if="panelServer">- {{ $t('config.title') }}</template></template
    >
    <template #panel>
      <div v-if="panelType === 'config'" class="h-full flex flex-col min-h-0">
        <div v-if="panelLinkLoading" role="status" :aria-label="String($t('common.loading'))" class="py-8 flex justify-center">
          <CoreAppLoadingSpinner size="md" />
        </div>
        <HostsConfigTabs
          v-else
          ref="configTabsRef"
          :host-id="panelServer?.depotId || null"
          host-type="server"
          :tab="panelTab"
          :search="typeof route.query.search === 'string' ? route.query.search : undefined"
          :readonly="isReadOnly || !hasServerWriteAccess"
          @update:tab="panelTab = $event"
          @update:search="router.replace({ query: { ...route.query, search: $event || undefined } })"
        />
      </div>
    </template>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import { useDataTableSettings, type DataTableColumnDef } from '~/composables/data-table/useDataTableSettings'
  import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
  import type { Server } from '~/types'
  import type { ServerAdvancedFilters } from '~/components/servers/AdvancedFiltersPopover.vue'
  import { getStoredDataTableFilter } from '~/composables/data-table/useDataTableFilter'
  import { useSavedSearches } from '~/composables/useSavedSearches'
  import { CLEAR_ALL_FILTERS_EVENT } from '~/composables/useGlobalFavorites'
  import { useSelectionStore } from '~/stores/selectionStore'
  import { useUiStore } from '~/stores/uiStore'
  import { useDataTableFilterStore } from '~/stores/dataTableFilterStore'

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getServers } = useApiHelpers()
  const selectionStore = useSelectionStore()
  const uiStore = useUiStore()
  const dataTableFilterStore = useDataTableFilterStore()
  dataTableFilterStore.initialize()
  const router = useRouter()
  const route = useRoute()
  const { isReadOnly, hasServerWriteAccess, isDepotAccessRestricted } = useUserPermissions()
  const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefresh(fetchServers, {
    watchEvents: [
      'event:host_created',
      'event:host_updated',
      'event:host_deleted',
      'event:host_connected',
      'event:host_disconnected',
      'event:config_created',
      'event:config_updated',
      'event:config_deleted',
      'event:configState_created',
      'event:configState_updated',
      'event:configState_deleted',
      'event:app_state_changed',
    ],
  })

  const loading = ref(false)
  const error = ref<string | null>(null)
  const servers = ref<Server[]>([])
  const rowOffset = ref(0)
  const totalItems = ref(0)
  const panelServer = ref<Server | null>(null)
  const panelType = ref<'config' | null>(null)
  const panelTab = ref('attributes')
  const panelLinkError = ref<string | null>(null)
  const panelLinkLoading = ref(false)
  let panelLinkRequestId = 0
  let panelRouteReady = false
  let panelRouteHistoryPosition: number | undefined
  const lastPageParams = ref<PageChangeParams | null>(null)
  const currentFilterQuery = ref(typeof route.query.filter === 'string' ? route.query.filter : getStoredDataTableFilter('servers'))
  const fetchServersRequestId = ref(0)
  let fetchServersController: AbortController | null = null
  const advancedFilters = computed(() => dataTableFilterStore.advancedFilters.servers as ServerAdvancedFilters & Record<string, unknown>)

  function handleAdvancedFiltersChange(value: ServerAdvancedFilters) {
    dataTableFilterStore.setAdvancedFilters('servers', value)
    return fetchServers(buildInitialPageParams(lastPageParams.value?.filterQuery ?? currentFilterQuery.value))
  }

  function handleApplySavedSearch(value: { filterQuery: string; advancedFilters: Record<string, unknown> }) {
    // Otherwise a stale lastPageParams.filterQuery (captured on the last page-change) would win
    // over this new value in handleAdvancedFiltersChange's fallback below.
    lastPageParams.value = null
    currentFilterQuery.value = value.filterQuery
    return handleAdvancedFiltersChange(value.advancedFilters as ServerAdvancedFilters)
  }

  // Global Search favorites navigate here with ?savedSearchId=... (+ ?filter=... when the
  // favorite has quick-filter text). Always resolve both filterQuery and advancedFilters to
  // concrete values (even '' / {}) so a previously applied filter can't linger, then drop the
  // param. Runs both on first load and on later in-app navigation to a different favorite,
  // since navigating between two /servers?... URLs doesn't remount this component.
  function applyFavoriteFromRoute(savedSearchId: string) {
    const entry = useSavedSearches<ServerAdvancedFilters>('servers').get(savedSearchId)
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
  const tableSettings = useDataTableSettings('servers')
  const configTabsRef = ref<{
    hasAnyChanges: boolean
    discardAll: () => void
    refresh?: () => void
    saveAll: () => void
  } | null>(null)
  const showCreateConfigModal = ref(false)
  const sortBySelectionEnabled = computed(
    () => selectionStore.selectionSource === 'quickpanel' && selectionStore.selectedServers.length > 0,
  )

  const {
    showLeaveWarning,
    checkUnsavedAndDo,
    guardUnsavedChanges,
    confirmLeave: confirmPanelLeave,
    cancelLeave: cancelPanelLeave,
    setPanelQuery,
    clearPanelQuery,
  } = usePanelRouter({
    entityQueryKey: 'server',
    hasUnsavedChanges: () => configTabsRef.value?.hasAnyChanges ?? false,
    discardAllChanges: () => configTabsRef.value?.discardAll?.(),
    additionalQueryKeys: ['configType', 'search'],
  })

  const columns: DataTableColumnDef[] = [
    {
      key: 'depotId',
      label: String($t('fields.serverId')),
      labelKey: 'fields.serverId',
      sortable: true,
      alwaysVisible: true,
    },
    {
      key: 'description',
      label: String($t('common.description')),
      labelKey: 'common.description',
      sortable: true,
      maxWidth: '18rem',
      truncate: true,
      tooltip: true,
    },
    { key: 'type', label: String($t('common.type')), labelKey: 'common.type', sortable: true },
    {
      key: 'ip',
      label: String($t('fields.ip')),
      labelKey: 'fields.ip',
      sortable: true,
      visible: false,
    },
  ]

  function doOpenConfig(row: Server) {
    panelServer.value = row
    panelType.value = 'config'
    setPanelQuery(row.depotId, { configType: panelTab.value })
  }

  function updatePanelServer(id: string | null) {
    router.replace({
      query: { ...route.query, server: id || undefined, view: 'panel', panelType: 'config', configType: panelTab.value },
    })
  }

  function openGlobalParametersPanel() {
    checkUnsavedAndDo(() => {
      router.replace({
        query: {
          ...route.query,
          server: undefined,
          view: 'panel',
          panelType: 'config',
          configType: 'parameters',
          search: undefined,
        },
      })
    })
  }

  function normalizeConfigTab(tab: unknown) {
    return tab === 'parameters' || tab === 'parameter' ? 'parameters' : 'attributes'
  }

  async function openServerPanelFromRoute() {
    const requestId = ++panelLinkRequestId
    panelLinkError.value = null
    panelLinkLoading.value = false
    if (route.query.view !== 'panel') {
      panelServer.value = null
      panelType.value = null
      return
    }
    panelTab.value = normalizeConfigTab(route.query.configType)
    const serverId = typeof route.query.server === 'string' ? route.query.server : ''
    if (!serverId) {
      panelTab.value = 'parameters'
      panelServer.value = null
      panelType.value = 'config'
      return
    }
    if (panelServer.value?.depotId === serverId) return
    panelServer.value = null
    panelType.value = 'config'
    panelLinkLoading.value = true
    const result = await getServers({ filterQuery: JSON.stringify({ id: [serverId] }), pageNumber: 1, perPage: 1 })
    if (requestId !== panelLinkRequestId) return
    panelLinkLoading.value = false
    const server = result.data?.find((entry) => entry.depotId === serverId)
    if (!server) {
      panelType.value = null
      panelLinkError.value = result.error?.message || String($t('common.noData'))
      return
    }
    panelServer.value = server
    panelType.value = 'config'
  }

  onBeforeRouteUpdate((to, from) => {
    if (to.query.view === from.query.view && to.query.server === from.query.server) return true
    const { server: _server, view: _view, panelType: _panelType, configType: _configType, search: _search, ...context } = from.query
    const query = { ...context, ...to.query }
    const isHistoryNavigation = window.history.state?.position !== panelRouteHistoryPosition
    if (to.query.view === 'panel' && !isHistoryNavigation && JSON.stringify(query) !== JSON.stringify(to.query)) {
      return { path: to.path, query }
    }
    return guardUnsavedChanges()
  })

  watch(
    () => [route.query.server, route.query.view, route.query.configType],
    () => {
      if (panelRouteReady) void openServerPanelFromRoute()
    },
  )

  watch(
    () => route.fullPath,
    () => {
      panelRouteHistoryPosition = window.history.state?.position
    },
    { flush: 'post' },
  )

  function openConfig(row: Server) {
    checkUnsavedAndDo(() => doOpenConfig(row))
  }

  function doClosePanel() {
    panelServer.value = null
    panelType.value = null
    clearPanelQuery()
  }

  function closePanel() {
    checkUnsavedAndDo(() => doClosePanel())
  }

  function handleRowActivate(row: Server) {
    checkUnsavedAndDo(() => doOpenConfig(row))
  }

  function handleSelectionChange(_rows: Server[], keys: string[]) {
    selectionStore.setServers(keys, 'table')
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
    fetchServers(params)
  }

  function handleFilterQueryUpdate(value: string) {
    currentFilterQuery.value = value
    fetchServersController?.abort()
    if (lastPageParams.value) {
      lastPageParams.value = {
        ...lastPageParams.value,
        filterQuery: value,
      }
    }
  }

  function handleConfigCreated() {
    configTabsRef.value?.refresh?.()
  }

  function buildInitialPageParams(filterQuery = ''): PageChangeParams {
    return {
      pageNumber: 1,
      perPage: tableSettings.settings.pageSize,
      sortBy: tableSettings.settings.sortColumn || 'depotId',
      sortDesc: tableSettings.settings.sortDirection === 'desc',
      filterQuery,
      sortBySelection: sortBySelectionEnabled.value,
      onlySelected: false,
    }
  }

  async function fetchServers(params?: PageChangeParams) {
    const isInfinitePageRequest = params != null && params.pageNumber > 1
    const requestId = isInfinitePageRequest ? fetchServersRequestId.value : ++fetchServersRequestId.value
    if (!isInfinitePageRequest) fetchServersController?.abort()
    const controller = new AbortController()
    fetchServersController = controller
    loading.value = true
    error.value = null
    try {
      if (params) lastPageParams.value = params
      const isReload = !params
      const baseParams = lastPageParams.value ?? undefined
      const effectiveParams =
        isReload && baseParams && (rowOffset.value > 0 || baseParams.pageNumber > 1)
          ? { ...baseParams, pageNumber: 1, perPage: Math.max(baseParams.perPage, rowOffset.value + servers.value.length) }
          : baseParams
      const selectionSortActive = effectiveParams?.sortBySelection ?? sortBySelectionEnabled.value
      const p: Record<string, unknown> = {}
      if (effectiveParams) {
        p.pageNumber = effectiveParams.pageNumber
        p.perPage = effectiveParams.perPage
        p.sortBy = effectiveParams.sortBy
        p.sortDesc = effectiveParams.sortDesc
        p.filterQuery = effectiveParams.serverFilterQuery || effectiveParams.filterQuery
        if (effectiveParams.onlySelected) p.onlySelected = true
      }
      if (advancedFilters.value.type) p.serverTypeFilter = advancedFilters.value.type
      if ((selectionSortActive || effectiveParams?.onlySelected) && selectionStore.selectedServers.length > 0) {
        p.selected = selectionStore.selectedServersParam
      }
      const result = await getServers(p, { signal: controller.signal })
      if (requestId !== fetchServersRequestId.value) return
      if (result.error) {
        error.value = result.error.message
        return
      }
      if (result.data) {
        const newData = result.data as Server[]
        if (result.total !== null) totalItems.value = result.total
        if (!isReload && effectiveParams && effectiveParams.pageNumber > 1) {
          rowOffset.value += appendInfinitePage(servers.value, newData, effectiveParams.perPage, (server) => server.depotId)
        } else {
          servers.value = newData
          rowOffset.value = isReload && effectiveParams ? (effectiveParams.pageNumber - 1) * effectiveParams.perPage : 0
        }
        const cs = servers.value.find((d) => d.type === 'OpsiConfigserver')
        if (cs) {
          selectionStore.setConfigServer(cs.depotId)
        }
        if (selectionStore.selectedServers.length === 0) {
          const allDepotIds = servers.value.map((d) => d.depotId)
          if (allDepotIds.length > 0) selectionStore.setServers(allDepotIds)
        }
      }
    } catch (e) {
      if (requestId !== fetchServersRequestId.value) return
      if (controller.signal.aborted) return
      error.value = (e as Error).message
    } finally {
      if (requestId === fetchServersRequestId.value && fetchServersController === controller) {
        loading.value = false
        fetchServersController = null
      }
    }
  }

  watch(panelTab, (newTab) => {
    if (panelType.value === 'config' && panelServer.value) {
      router.replace({ query: { ...(route.query as Record<string, string>), configType: newTab } })
    }
  })

  watch(
    () => selectionStore.selectedServers.join(','),
    () => {
      if ((lastPageParams.value?.sortBySelection || sortBySelectionEnabled.value) && selectionStore.selectionSource !== 'table') {
        fetchServers()
      }
    },
  )

  onMounted(async () => {
    // Global Search favorites navigate here with ?savedSearchId=... - apply once on load; later
    // clicks on a different favorite are handled by the watch() above (no remount happens).
    const savedSearchId = route.query.savedSearchId as string | undefined
    if (savedSearchId) {
      await applyFavoriteFromRoute(savedSearchId)
    } else {
      await fetchServers(buildInitialPageParams(currentFilterQuery.value))
    }
    panelRouteHistoryPosition = window.history.state?.position
    panelRouteReady = true
    await openServerPanelFromRoute()
  })

  onUnmounted(() => {
    fetchServersController?.abort()
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
      currentFilterQuery.value = typeof newFilter === 'string' ? newFilter : getStoredDataTableFilter('servers')
    },
  )

  useShortcutContext({
    save: () => configTabsRef.value?.saveAll?.(),
    canSave: () => !!configTabsRef.value?.hasAnyChanges && !isReadOnly.value,
    discard: () => configTabsRef.value?.discardAll?.(),
    canDiscard: () => !!configTabsRef.value?.hasAnyChanges,
    closeActivePanel: () => {
      if (showCreateConfigModal.value) {
        showCreateConfigModal.value = false
        return true
      }
      if (!panelServer.value && !panelType.value) return false
      closePanel()
      return true
    },
  })

  defineShortcuts({
    ctrl_shift_n: {
      usingInput: true,
      handler: () => {
        showCreateConfigModal.value = !showCreateConfigModal.value
      },
    },
  })
</script>
