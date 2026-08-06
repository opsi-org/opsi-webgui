<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ServersMainView - Server table with detail panel.
-->
<template>
  <LayoutsPageLayout
    show-refresh
    :loading="loading"
    :show-panel="!!panelServer"
    @refresh="fetchServers"
    @close-panel="closePanel"
  >
    <template #actions>
      <CoreAppTooltip
        v-if="isDepotAccessRestricted"
        :text="$t('opsiConfig.serverFeatures.depotAccess.disabled')"
      >
        <CoreAppBadge
          color="warning"
          variant="subtle"
          size="xs"
          class="cursor-help"
          data-testid="servers-restricted-badge"
        >
          {{ $t('auth.restricted') }}
        </CoreAppBadge>
      </CoreAppTooltip>
      <CoreAppButton
        v-if="changesDetected && !autoRefreshEnabled"
        :icon="icons.refresh"
        color="warning"
        variant="soft"
        size="xs"
        data-testid="messagebus-changes-button"
        @click="manualRefresh"
        :title="lastChangeDescription"
      >
        {{ $t('bus.changes') }}
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

    <HostsCreateConfigModal v-model:open="showCreateConfigModal" @created="handleConfigCreated" />

    <CoreAppDataTable
      :rows="servers"
      :columns="columns"
      :loading="loading"
      table-id="servers"
      row-key="depotId"
      :selectable="true"
      :filterable="true"
      :show-refresh="false"
      :total-items="totalItems"
      :selected-keys="selectionStore.selectedServers"
      :active-key="panelServer?.depotId"
      :sort-by-selection-enabled="sortBySelectionEnabled"
      @row-activate="handleRowActivate"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @refresh="fetchServers"
    >
      <template #cell-depotId="{ row }">
        <CoreAppIcon
          :name="(row as Server).type === 'OpsiConfigserver' ? icons.serverStack : icons.server"
          class="w-3.5 h-3.5 text-(--color-text-muted) mr-2"
        />
        <span :class="(row as Server).type === 'OpsiConfigserver' ? 'font-bold' : ''">{{
          (row as Server).depotId
        }}</span>
      </template>
      <template #cell-type="{ row }">
        <CoreAppStatusBadge
          :status="(row as Server).type === 'OpsiConfigserver' ? 'info' : 'neutral'"
          variant="solid"
          :label="String((row as Server).type || '-')"
        />
      </template>
      <template #cell-description="{ row }">
        <span
          class="block truncate max-w-[18rem] text-sm leading-5"
          :title="(row as Server).description || undefined"
        >
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
          :class="
            panelServer?.depotId === (row as Server).depotId
              ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!'
              : ''
          "
          @click.stop="openConfig(row as Server)"
        />
      </template>
    </CoreAppDataTable>

    <template #panel-title>
      <span class="flex items-center gap-2">
        <CoreAppIcon :name="icons.server" class="w-4 h-4 shrink-0" />
        {{ panelServer?.depotId }}
      </span>
    </template>
    <template #panel-subtitle>{{ $t('config.title') }}</template>
    <template #panel>
      <div v-if="panelServer" class="h-full flex flex-col min-h-0">
        <HostsConfigTabs
          v-if="panelType === 'config'"
          ref="configTabsRef"
          :host-id="panelServer.depotId"
          host-type="server"
          :tab="panelTab"
          panel-mode
          :readonly="isReadOnly || !hasServerWriteAccess"
          @update:tab="panelTab = $event"
        />
      </div>

      <CoreAppNavigationGuardModal
        v-model="showLeaveWarning"
        @cancel="cancelPanelLeave"
        @confirm="confirmPanelLeave"
      />
    </template>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
  import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
  import type { Server } from '~/types'
  import { getStoredDataTableFilter } from '~/composables/useDataTableFilter'
  import { useSelectionStore } from '~/stores/selectionStore'

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getServers } = useApiHelpers()
  const selectionStore = useSelectionStore()
  const router = useRouter()
  const route = useRoute()
  const { isReadOnly, hasServerWriteAccess, isDepotAccessRestricted } = useUserPermissions()
  const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } =
    useAutoRefreshServers(fetchServers)

  const loading = ref(false)
  const error = ref<string | null>(null)
  const servers = ref<Server[]>([])
  const totalItems = ref(0)
  const panelServer = ref<Server | null>(null)
  const panelType = ref<'config' | null>(null)
  const panelTab = ref('parameters')
  const lastPageParams = ref<PageChangeParams | null>(null)
  const currentFilterQuery = ref(
    typeof route.query.filter === 'string' ? route.query.filter : getStoredDataTableFilter('servers')
  )
  const fetchServersRequestId = ref(0)
  const tableSettings = useDataTableSettings('servers')
  const configTabsRef = ref<{
    hasAnyChanges: boolean
    discardAll: () => void
    refresh?: () => void
  } | null>(null)
  const showCreateConfigModal = ref(false)
  const sortBySelectionEnabled = computed(
    () =>
      selectionStore.selectionSource === 'quickpanel' && selectionStore.selectedServers.length > 0
  )

  const {
    showLeaveWarning,
    checkUnsavedAndDo,
    confirmLeave: confirmPanelLeave,
    cancelLeave: cancelPanelLeave,
    setPanelQuery,
    clearPanelQuery,
  } = usePanelRouter({
    entityQueryKey: 'server',
    hasUnsavedChanges: () => configTabsRef.value?.hasAnyChanges ?? false,
    discardAllChanges: () => configTabsRef.value?.discardAll?.(),
    additionalQueryKeys: ['configType'],
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
    // Persist filter query to URL
    if (params.filterQuery || route.query.filter) {
      router.replace({
        query: {
          ...(route.query as Record<string, string>),
          filter: params.filterQuery || undefined,
        },
      })
    }
    fetchServers(params)
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
    }
  }

  async function fetchServers(params?: PageChangeParams) {
    const requestId = ++fetchServersRequestId.value
    loading.value = true
    error.value = null
    try {
      if (params) lastPageParams.value = params
      const effectiveParams = params ?? lastPageParams.value ?? undefined
      const selectionSortActive = effectiveParams?.sortBySelection ?? sortBySelectionEnabled.value
      const p: Record<string, unknown> = {}
      if (effectiveParams) {
        p.pageNumber = effectiveParams.pageNumber
        p.perPage = effectiveParams.perPage
        p.sortBy = effectiveParams.sortBy
        p.sortDesc = effectiveParams.sortDesc
        p.filterQuery = effectiveParams.filterQuery
      }
      if (selectionSortActive && selectionStore.selectedServers.length > 0) {
        p.selected = selectionStore.selectedServersParam
      }
      const result = await getServers(p)
      if (requestId !== fetchServersRequestId.value) return
      if (result.error) {
        error.value = result.error.message
        return
      }
      if (result.data) {
        const newData = result.data as Server[]
        if (result.total !== null) totalItems.value = result.total
        if (effectiveParams && effectiveParams.pageNumber > 1 && lastPageParams.value) {
          const existingIds = new Set(servers.value.map((s) => s.depotId))
          const unique = newData.filter((s) => !existingIds.has(s.depotId))
          servers.value = [...servers.value, ...unique]
        } else {
          servers.value = newData
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
      error.value = (e as Error).message
    } finally {
      if (requestId === fetchServersRequestId.value) {
        loading.value = false
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
      if (
        (lastPageParams.value?.sortBySelection || sortBySelectionEnabled.value) &&
        selectionStore.selectionSource !== 'table'
      ) {
        fetchServers()
      }
    }
  )

  onMounted(async () => {
    await fetchServers(buildInitialPageParams(currentFilterQuery.value))
    const serverId = route.query.server as string | undefined
    const configType = route.query.configType as string | undefined
    if (configType) {
      const normalized =
        configType === 'attribute'
          ? 'attributes'
          : configType === 'parameter'
            ? 'parameters'
            : configType
      if (normalized === 'parameters' || normalized === 'attributes') {
        panelTab.value = normalized
      }
    }
    if (serverId && route.query.view === 'panel') {
      const s = servers.value.find((sv) => sv.depotId === serverId)
      if (s) doOpenConfig(s)
    }
  })

  watch(
    () => route.query.filter,
    (newFilter) => {
      currentFilterQuery.value =
        typeof newFilter === 'string' ? newFilter : getStoredDataTableFilter('servers')
    }
  )
</script>
