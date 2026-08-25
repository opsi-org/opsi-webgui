<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsMainView - Client table with detail panel, filtering, and batch operations.
-->
<template>
  <CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelPanelLeave" @confirm="confirmPanelLeave" />

  <LayoutsPageLayout
    show-refresh
    :loading="loading"
    :show-panel="!!panelClient || !!panelType"
    :changes-detected="changesDetected && !autoRefreshEnabled"
    :changes-description="lastChangeDescription"
    @refresh="manualRefresh"
    @close-panel="closePanel"
  >
    <template #actions>
      <CoreAppTooltip v-if="isHostGroupAccessRestricted" :text="$t('opsiConfig.serverFeatures.hostGroupAccess.disabled')">
        <CoreAppBadge color="warning" variant="subtle" size="xs" class="cursor-help" data-testid="clients-restricted-badge">
          {{ $t('auth.restricted') }}
        </CoreAppBadge>
      </CoreAppTooltip>
      <CoreAppButton
        v-if="selectionStore.selectedClients.length > 0"
        :icon="icons.product"
        color="primary"
        size="sm"
        @click="openProductsPanel"
        :disabled="isReadOnly"
        :aria-label="String($t('products.title'))"
        data-testid="clients-open-products-panel"
      >
        {{ $t('products.title') }}
      </CoreAppButton>
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

    <CoreAppErrorBanner :error="error" @close="error = null" />

    <CoreAppDataTable
      :rows="clients"
      :columns="columns"
      :loading="loading"
      table-id="clients"
      row-key="clientId"
      :selectable="true"
      :filterable="true"
      :show-refresh="false"
      :total-items="totalItems"
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
      @refresh="fetchClients"
    >
      <template #header-cell-reachable="{ sortColumn, sortDirection }">
        <div class="flex items-center justify-center gap-1">
          <CoreAppTooltip :text="String($t('clients.reachable.help'))">
            <CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 cursor-help" />
          </CoreAppTooltip>
          <CoreAppIcon v-if="sortColumn === 'reachable'" :name="sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc" class="w-3 h-3" />
          <CoreAppIcon v-else :name="icons.sort" class="w-3 h-3 opacity-30" />
        </div>
      </template>
      <template #cell-clientId="{ row }">
        <div class="flex items-center gap-1.5">
          <CoreAppIcon
            v-if="blockedClients.has((row as OpsiClient).ipAddress || '')"
            :name="icons.lock"
            class="w-3.5 h-3.5 text-(--color-error-soft-text) shrink-0"
            :title="$t('clients.blocked')"
          />
          <CoreAppIcon v-else :name="icons.client" class="w-4 h-4 shrink-0 text-neutral-400" />
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
          :tooltip="$t('products.outdated.localboot')"
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
          :tooltip="$t('products.outdated.netboot')"
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
          :tooltip="$t('actions.request')"
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
          :tooltip="$t('products.statusInstalled')"
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
          :tooltip="$t('actions.success')"
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
          :tooltip="$t('actions.failed')"
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
          :active-action="panelClient?.clientId === (row as OpsiClient).clientId ? (panelType as 'config' | 'logs' | 'clone' | null) : null"
          @open-config="openPanel(row as OpsiClient, 'config')"
          @open-logs="openPanel(row as OpsiClient, 'logs')"
          @open-clone="openPanel(row as OpsiClient, 'clone')"
          @action-complete="handleActionComplete"
        />
      </template>
    </CoreAppDataTable>

    <template #panel-title>
      <span class="flex items-center gap-2">
        <CoreAppIcon
          :name="panelType === 'products' ? icons.product : panelType === 'add' ? icons.add : icons.client"
          class="w-4 h-4 text-(--color-text-muted) shrink-0"
        />
        <template v-if="panelType === 'products'">{{ $t('products.title') }}</template>
        <template v-else-if="panelType === 'add'">{{ $t('common.new') }}</template>
        <template v-else>{{ panelClient?.clientId }}</template>
      </span>
    </template>
    <template #panel-actions>
      <div v-if="panelClient && clientPanelViews.length > 1" class="flex items-center justify-end gap-1">
        <CoreAppTooltip v-for="view in clientPanelViews" :key="view.value" :text="view.label">
          <CoreAppButton
            :icon="view.icon"
            variant="ghost"
            size="xs"
            :color="panelType === view.value ? 'primary' : 'neutral'"
            :class="panelType === view.value ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
            :aria-label="view.label"
            @click="openPanel(panelClient, view.value as ClientPanelType)"
          />
        </CoreAppTooltip>
      </div>
    </template>
    <template #panel>
      <div v-if="panelClient" class="h-full flex flex-col min-h-0">
        <HostsConfigTabs
          v-if="panelType === 'config'"
          ref="configTabsRef"
          :host-id="panelClient.clientId"
          host-type="client"
          :tab="panelTab"
          panel-mode
          :readonly="isReadOnly"
          @update:tab="panelTab = $event"
        />
        <ClientsLogsView v-if="panelType === 'logs'" :client-id="panelClient.clientId" panel-mode />
        <ClientsCloneForm
          v-if="panelType === 'clone'"
          ref="cloneFormRef"
          :source-id="panelClient.clientId"
          panel-mode
          @saved="fetchClients"
        />
      </div>
      <template v-if="panelType === 'products'">
        <ProductsMainView
          ref="productsTableRef"
          panel-mode
          :product-type="panelProductType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'"
          :initial-sort-column="productsSortColumn"
        >
          <template #tabs>
            <CoreAppTabsNav v-model="panelProductType" :tabs="panelProductTypes" />
          </template>
        </ProductsMainView>
      </template>
      <ClientsAddForm v-if="panelType === 'add'" panel-mode @saved="handleAddSaved" />
    </template>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
  import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
  import type { Client as OpsiClient } from '~/types'
  import { getStoredDataTableFilter } from '~/composables/useDataTableFilter'
  import { useSelectionStore } from '~/stores/selectionStore'
  import { useMessageBusStore } from '~/stores/messageBusStore'
  import { storeToRefs } from 'pinia'

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getClients, getServerIds, getBlockedClients } = useApiHelpers()
  const selectionStore = useSelectionStore()
  const messageBusStore = useMessageBusStore()
  const { lastMsg: messageBusLastMsg } = storeToRefs(messageBusStore)
  const router = useRouter()
  const route = useRoute()
  const { isReadOnly, canCreateClients, isHostGroupAccessRestricted } = useUserPermissions()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const clients = ref<OpsiClient[]>([])
  const totalItems = ref(0)
  type ClientPanelType = 'config' | 'logs' | 'clone'

  const panelClient = ref<OpsiClient | null>(null)
  const panelType = ref<ClientPanelType | 'products' | 'add' | null>(null)
  const panelTab = ref('parameters')
  const DEFAULT_CLIENT_PANEL_VIEW_KEY = 'opsi-webgui-default-client-panel-view'
  const SHOW_ALL_CLIENT_ROW_ACTIONS_KEY = 'opsi-webgui-show-all-client-row-actions'
  const defaultClientPanelView = ref<ClientPanelType>('config')
  const showAllClientRowActions = ref(false)
  const panelProductType = ref('localboot')
  const panelProductTypes = [
    { label: String($t('products.localboot')), value: 'localboot' },
    { label: String($t('products.netboot')), value: 'netboot' },
  ]
  const clientPanelViews = computed(() => [
    { label: String($t('config.title')), value: 'config', icon: icons.config },
    { label: String($t('logs.title')), value: 'logs', icon: icons.log },
    ...(isReadOnly.value || !canCreateClients.value
      ? []
      : [{ label: String($t('clients.clone.title')), value: 'clone', icon: icons.clone }]),
  ])
  const clientPanelViewOptions = computed(() => clientPanelViews.value.map(({ label, value }) => ({ label, value: String(value) })))
  const reachableStatus = ref<Record<string, boolean | undefined>>({})
  // Clients whose state came from a live host_connected/host_disconnected event
  const reachableLiveIds = ref<Set<string>>(new Set())
  const blockedClients = ref<Set<string>>(new Set())
  const lastPageParams = ref<PageChangeParams | null>(null)
  const currentFilterQuery = ref(typeof route.query.filter === 'string' ? route.query.filter : getStoredDataTableFilter('clients'))
  const fetchClientsRequestId = ref(0)
  const tableSettings = useDataTableSettings('clients')
  const productsSortColumn = ref<string | undefined>(undefined)
  const configTabsRef = ref<{ hasAnyChanges?: boolean; discardAll?: () => void } | null>(null)
  const productsTableRef = ref<{
    hasUnsavedChanges?: boolean
    discardAllChanges?: () => void
  } | null>(null)
  const cloneFormRef = ref<{ hasChanges?: boolean } | null>(null)
  const showLeaveWarning = ref(false)
  const pendingPanelAction = ref<(() => void) | null>(null)
  let resolveRouteLeave: ((ok: boolean) => void) | null = null

  onBeforeRouteLeave(() => {
    const hasChanges = configTabsRef.value?.hasAnyChanges || productsTableRef.value?.hasUnsavedChanges || cloneFormRef.value?.hasChanges
    if (!hasChanges) return true
    showLeaveWarning.value = true
    return new Promise<boolean>((resolve) => {
      resolveRouteLeave = resolve
    })
  })

  const sortBySelectionEnabled = computed(
    () => selectionStore.selectionSource === 'quickpanel' && selectionStore.selectedClients.length > 0,
  )

  const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefreshClients(fetchClients)

  const columns: DataTableColumnDef[] = [
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
      key: 'reachable',
      label: String($t('clients.reachable.status')),
      labelKey: 'clients.reachable.status',
      headerIcon: icons.clientReachable,
      sortable: true,
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
    const query: Record<string, string> = {
      ...(route.query as Record<string, string>),
      client: client.clientId,
      view: 'panel',
      panelType: type,
    }
    if (type === 'config') query.configType = panelTab.value
    router.replace({ query })
  }

  function openPanel(client: OpsiClient, type: ClientPanelType) {
    checkUnsavedAndDo(() => doOpenPanel(client, type))
  }

  function openProductsPanel() {
    checkUnsavedAndDo(() => {
      panelClient.value = null
      panelType.value = 'products'
      router.replace({
        query: {
          ...route.query,
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
      router.replace({ query: { ...route.query, view: 'panel', panelType: 'add' } })
    })
  }

  function openProductsPanelForClient(client: OpsiClient, sortColumn: string, productType?: 'localboot' | 'netboot') {
    selectionStore.setClients([client.clientId], 'table')
    productsSortColumn.value = sortColumn
    panelProductType.value = productType || 'localboot'
    panelClient.value = null
    panelType.value = 'products'
    router.replace({
      query: {
        ...route.query,
        view: 'panel',
        panelType: 'products',
        sortBy: sortColumn,
        type: panelProductType.value,
      },
    })
  }

  function handleAddSaved() {
    closePanel()
    fetchClients()
  }

  function closePanel() {
    checkUnsavedAndDo(() => {
      panelClient.value = null
      panelType.value = null
      const { client: _c, view: _v, panelType: _pt, configType: _ct, sortBy: _sb, type: _ty, ...rest } = route.query
      router.replace({ query: rest })
    })
  }

  function checkUnsavedAndDo(action: () => void) {
    const hasConfigChanges = configTabsRef.value?.hasAnyChanges
    const hasProductChanges = productsTableRef.value?.hasUnsavedChanges
    if (hasConfigChanges || hasProductChanges) {
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
      doOpenPanel(row, defaultClientPanelView.value)
    })
  }

  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
    return match?.[1] ? decodeURIComponent(match[1]) : null
  }

  function setDefaultClientPanelView(value: string) {
    if (!clientPanelViewOptions.value.some((option) => option.value === value)) return
    defaultClientPanelView.value = value as ClientPanelType
    document.cookie = `${DEFAULT_CLIENT_PANEL_VIEW_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`
  }

  function setShowAllClientRowActions(value: boolean) {
    showAllClientRowActions.value = value
    localStorage.setItem(SHOW_ALL_CLIENT_ROW_ACTIONS_KEY, String(value))
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
    // Persist filter query to URL
    if (params.filterQuery || route.query.filter) {
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
    }
  }

  async function fetchClients(params?: PageChangeParams) {
    const requestId = ++fetchClientsRequestId.value
    loading.value = true
    error.value = null
    try {
      if (params) lastPageParams.value = params
      // A reload without params must refetch every row that is currently
      // loaded, not just the last requested page.
      const isReload = !params
      const baseParams = lastPageParams.value ?? undefined
      const effectiveParams =
        isReload && baseParams
          ? { ...baseParams, pageNumber: 1, perPage: reloadWindowPerPage(baseParams.perPage, clients.value.length) }
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
        selectedClients: `[${selectionStore.selectedClients.join(',')}]`,
      }
      if (selectionSortActive && selectionStore.selectedClients.length > 0) p.selected = `[${selectionStore.selectedClients.join(',')}]`
      if (effectiveParams) {
        p.pageNumber = effectiveParams.pageNumber
        p.perPage = effectiveParams.perPage
        p.sortBy = effectiveParams.sortBy
        p.sortDesc = effectiveParams.sortDesc
        p.filterQuery = effectiveParams.filterQuery
      } else if (currentFilterQuery.value) {
        p.filterQuery = currentFilterQuery.value
      }
      const result = await getClients(p)
      if (requestId !== fetchClientsRequestId.value) return
      if (result.error) error.value = result.error.message
      else if (result.data) {
        const newData = result.data as OpsiClient[]
        if (result.total !== null) totalItems.value = result.total
        if (!isReload && effectiveParams && effectiveParams.pageNumber > 1) {
          const existingIds = new Set(clients.value.map((c) => c.clientId))
          const unique = newData.filter((c) => !existingIds.has(c.clientId))
          clients.value = [...clients.value, ...unique]
        } else {
          clients.value = newData
        }
        for (const client of newData) {
          if (typeof client.reachable === 'boolean' && !reachableLiveIds.value.has(client.clientId)) {
            reachableStatus.value[client.clientId] = client.reachable
          }
        }
      }
    } catch (e) {
      if (requestId !== fetchClientsRequestId.value) return
      error.value = (e as Error).message
    } finally {
      if (requestId === fetchClientsRequestId.value) {
        loading.value = false
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

  watch(panelType, (newType) => {
    if (newType !== 'config' && newType !== 'logs' && newType !== 'clone') return
    defaultClientPanelView.value = newType
    document.cookie = `${DEFAULT_CLIENT_PANEL_VIEW_KEY}=${newType}; path=/; max-age=31536000; SameSite=Lax`
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
    const storedDefaultPanelView = getCookie(DEFAULT_CLIENT_PANEL_VIEW_KEY)
    showAllClientRowActions.value = localStorage.getItem(SHOW_ALL_CLIENT_ROW_ACTIONS_KEY) === 'true'
    if (
      storedDefaultPanelView === 'config' ||
      storedDefaultPanelView === 'logs' ||
      (storedDefaultPanelView === 'clone' && canCreateClients.value && !isReadOnly.value)
    ) {
      defaultClientPanelView.value = storedDefaultPanelView
    }
    const routeSortBy = route.query.sortBy as string | undefined
    if (routeSortBy) productsSortColumn.value = routeSortBy
    const routeProductType = route.query.type as string | undefined
    if (routeProductType === 'localboot' || routeProductType === 'netboot') {
      panelProductType.value = routeProductType
    }
    await Promise.all([fetchClients(buildInitialPageParams(currentFilterQuery.value)), fetchBlockedClients()])
    const clientId = route.query.client as string | undefined
    const pType = route.query.panelType as 'config' | 'logs' | 'clone' | 'products' | 'add' | undefined
    const configType = route.query.configType as string | undefined
    if (configType) {
      const normalized = configType === 'attribute' ? 'attributes' : configType === 'parameter' ? 'parameters' : configType
      if (normalized === 'parameters' || normalized === 'attributes') {
        panelTab.value = normalized
      }
    }
    if (clientId && route.query.view === 'panel') {
      const c = clients.value.find((cl) => cl.clientId === clientId)
      const clientPanelType = pType === 'logs' || pType === 'clone' ? pType : defaultClientPanelView.value
      if (c) doOpenPanel(c, clientPanelType)
      return
    }

    if (route.query.view === 'panel' && pType === 'products') {
      panelClient.value = null
      panelType.value = 'products'
      return
    }

    if (route.query.view === 'panel' && pType === 'add') {
      panelClient.value = null
      panelType.value = 'add'
    }
  })

  watch(
    () => route.query.filter,
    (newFilter) => {
      currentFilterQuery.value = typeof newFilter === 'string' ? newFilter : getStoredDataTableFilter('clients')
    },
  )
</script>
