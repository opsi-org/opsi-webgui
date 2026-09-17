<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsInventoryPanel - Read-only single-client hardware/software inventory tables.
-->
<template>
  <LayoutsPageLayout>
    <template #filters>
      <CoreAppTabsNav v-model="activeTab" :tabs="tabs" />
      <template v-if="showClientSelector">
        <span class="h-5 w-px bg-(--color-border) mx-1" />
        <slot name="clientSelector">
          <HostsSelector
            v-model="clientSelectorModel"
            type="client"
            :placeholder="clientSelectorPlaceholder || String($t('clients.select'))"
            :allow-all="false"
            allow-clear
          />
        </slot>
      </template>
    </template>

    <template #actions>
      <CoreAppCheckbox
        v-if="activeTab === 'software'"
        v-model="includeKbUpdates"
        :label="String($t('inventory.includeKbUpdates'))"
        :ui="{ label: 'text-xs text-(--color-text-muted)' }"
      />
      <CoreAppButton
        :icon="icons.refresh"
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="!resolvedClientId"
        :loading="loading"
        :aria-label="String($t('common.refresh'))"
        :title="String($t('common.refresh'))"
        @click="refreshCurrentTab"
      />
      <CoreAppTooltip :text="String($t('inventory.exportDesc'))">
        <CoreAppButton
          :icon="icons.download"
          variant="outline"
          color="primary"
          size="sm"
          :disabled="!currentMeta || exporting"
          :loading="exporting"
          :aria-label="String($t('inventory.export'))"
          @click="exportCsv"
        />
      </CoreAppTooltip>
    </template>

    <div class="flex flex-col h-full min-h-0 gap-1.5">
      <CoreAppEmptyState v-if="!resolvedClientId" :icon="icons.inventory" :message="String($t('inventory.select'))" />
      <template v-else>
        <CoreAppAlertInline
          v-if="error"
          color="error"
          :title="String($t('common.error'))"
          :description="error"
          close
          @close="error = null"
        />
        <CoreAppAlertInline
          v-else-if="currentMeta?.truncated"
          color="warning"
          :title="String($t('inventory.limited'))"
          :description="String($t('inventory.limitedDesc', { count: currentMeta.count }))"
        />
        <CoreAppAlertInline
          v-else-if="currentMeta?.state === 'empty'"
          color="info"
          :title="String($t('inventory.empty'))"
          :description="String($t('inventory.emptyDesc'))"
        />

        <CoreAppEmptyState
          v-if="!loading && currentMeta?.state === 'not_scanned'"
          :icon="icons.inventory"
          :message="String($t('inventory.notScannedDesc'))"
        />
        <CoreAppDataTable
          v-else
          ref="dataTableRef"
          :key="tableId"
          :rows="tableRows"
          :columns="currentColumns"
          :loading="loading"
          :table-id="tableId"
          :filter-storage-id="tableId"
          :filter-query="currentFilterQuery"
          row-key="identifier"
          :selectable="false"
          :filterable="true"
          :show-refresh="false"
          :total-items="totalItems"
          :row-offset="rowOffset"
          max-height="100%"
          @page-change="handlePageChange"
          @update:filter-query="handleFilterQueryUpdate"
        >
          <template #status>
            <CoreAppTooltip v-if="currentMeta" :text="metaStateDesc(currentMeta.state)">
              <CoreAppBadge
                :color="metaStateColor(currentMeta.state)"
                :label="String($t(`inventory.${currentMeta.state === 'not_scanned' ? 'notScanned' : currentMeta.state}`))"
                size="xs"
              />
            </CoreAppTooltip>
            <span v-if="currentMeta?.lastScan" class="text-[0.6875rem] text-(--color-text-muted)">
              {{ $t('inventory.scannedAt') }}: {{ currentMeta.lastScan }}
            </span>
          </template>
          <template #cell-className="{ row }">
            <CoreAppTooltipTable :rows="hardwareRows(asHardwareItem(row))">
              <span class="inline-flex items-center gap-1.5">
                <CoreAppIcon
                  :name="classIcon(asHardwareItem(row).hardwareClass)"
                  class="w-4 h-4 shrink-0"
                  :class="classIconColor(asHardwareItem(row).hardwareClass)"
                />
                {{ asHardwareItem(row).className }}
                <CoreAppIcon :name="icons.info" class="w-3 h-3 text-(--color-text-muted)" aria-hidden="true" />
              </span>
            </CoreAppTooltipTable>
          </template>
          <template #cell-displayName="{ row }">
            <template v-if="activeTab === 'hardware'">
              <span class="block max-w-80 truncate">{{ asHardwareItem(row).displayName }}</span>
            </template>
            <CoreAppTooltipTable v-else :rows="softwareRows(asSoftwareItem(row))">
              <span class="inline-flex max-w-80 items-center gap-1 truncate">
                {{ asSoftwareItem(row).displayName }}
                <CoreAppBadge v-if="asSoftwareItem(row).isKbUpdate" color="info" :label="String($t('inventory.kbUpdate'))" size="xs" />
                <CoreAppIcon :name="icons.info" class="w-3 h-3 text-(--color-text-muted)" aria-hidden="true" />
              </span>
            </CoreAppTooltipTable>
          </template>
          <template #cell-identifier="{ row }">
            <span class="inline-flex items-center gap-1 font-mono text-xs">
              {{ String(row.identifier) }}
              <CoreAppButton
                :icon="clipboard.isCopied(String(row.identifier)) ? icons.check : icons.copy"
                variant="ghost"
                color="neutral"
                size="xs"
                :aria-label="String($t('common.copy'))"
                :title="String($t('common.copy'))"
                @click.stop="clipboard.copy(String(row.identifier))"
              />
            </span>
          </template>
        </CoreAppDataTable>
      </template>
    </div>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
  import { useDataTableSettings, type DataTableColumnDef } from '~/composables/data-table/useDataTableSettings'
  import { getStoredDataTableFilter } from '~/composables/data-table/useDataTableFilter'
  import type { HardwareInventoryItem, InventoryMeta, InventorySummary, SoftwareInventoryItem } from '~/types'

  type TabValue = 'hardware' | 'software'
  type InventoryItem = HardwareInventoryItem | SoftwareInventoryItem

  const props = withDefaults(
    defineProps<{
      clientId?: string | null
      panelMode?: boolean
      tab?: TabValue
      showClientSelector?: boolean
      clientSelectorPlaceholder?: string
    }>(),
    {
      clientId: null,
      panelMode: false,
      tab: 'hardware',
      showClientSelector: false,
      clientSelectorPlaceholder: undefined,
    },
  )

  const emit = defineEmits<{
    'update:tab': [value: TabValue]
    'update:clientId': [value: string | null]
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const clipboard = useClipboard()
  const {
    getClientInventorySummary,
    getClientHardwareInventory,
    getClientSoftwareInventory,
    exportHardwareInventoryCsv,
    exportSoftwareInventoryCsv,
  } = useApiHelpers()
  const hardwareTableSettings = useDataTableSettings('inventory-hardware')
  const softwareTableSettings = useDataTableSettings('inventory-software')

  const clientSelectorModel = ref(props.clientId || '')
  watch(
    () => props.clientId,
    (value) => {
      if (value !== clientSelectorModel.value) clientSelectorModel.value = value || ''
    },
    { immediate: true },
  )
  watch(clientSelectorModel, (value) => emit('update:clientId', value || null))

  const resolvedClientId = computed(() => props.clientId || (props.showClientSelector ? clientSelectorModel.value || null : null))
  const activeTab = ref<TabValue>(props.tab)
  watch(
    () => props.tab,
    (value) => {
      if (value && value !== activeTab.value) activeTab.value = value
    },
  )
  watch(activeTab, (value) => emit('update:tab', value))

  const tabs = computed(() => [
    {
      label: String($t('inventory.hardware')),
      value: 'hardware',
      icon: icons.hardware,
      count: summary.value?.hardware.count,
      tooltip: summaryTabTooltip(summary.value?.hardware),
    },
    {
      label: String($t('inventory.software')),
      value: 'software',
      icon: icons.software,
      count: summary.value?.software.count,
      tooltip: summaryTabTooltip(summary.value?.software),
    },
  ])

  const hardwareColumns: DataTableColumnDef[] = [
    { key: 'className', label: String($t('inventory.class')), labelKey: 'inventory.class', sortable: true, alwaysVisible: true },
    {
      key: 'displayName',
      label: String($t('inventory.displayName')),
      labelKey: 'inventory.displayName',
      sortable: true,
      alwaysVisible: true,
    },
    {
      key: 'hardwareClass',
      label: String($t('inventory.hardwareClass')),
      labelKey: 'inventory.hardwareClass',
      sortable: true,
      visible: false,
    },
    { key: 'identifier', label: String($t('inventory.identifier')), labelKey: 'inventory.identifier', visible: false },
    { key: 'firstseen', label: String($t('inventory.firstSeen')), labelKey: 'inventory.firstSeen', sortable: true, visible: false },
    { key: 'lastseen', label: String($t('inventory.scannedAt')), labelKey: 'inventory.scannedAt', sortable: true },
  ]

  const softwareColumns: DataTableColumnDef[] = [
    {
      key: 'displayName',
      label: String($t('inventory.displayName')),
      labelKey: 'inventory.displayName',
      sortable: true,
      alwaysVisible: true,
    },
    { key: 'version', label: String($t('inventory.version')), labelKey: 'inventory.version', sortable: true },
    { key: 'architecture', label: String($t('inventory.architecture')), labelKey: 'inventory.architecture' },
    { key: 'language', label: String($t('inventory.language')), labelKey: 'inventory.language' },
    { key: 'identifier', label: String($t('inventory.identifier')), labelKey: 'inventory.identifier', visible: false },
    { key: 'firstseen', label: String($t('inventory.firstSeen')), labelKey: 'inventory.firstSeen', sortable: true, visible: false },
    { key: 'lastseen', label: String($t('inventory.scannedAt')), labelKey: 'inventory.scannedAt', sortable: true },
  ]

  const loading = ref(false)
  const exporting = ref(false)
  const error = ref<string | null>(null)
  const currentMeta = ref<InventoryMeta | null>(null)
  const currentItems = ref<InventoryItem[]>([])
  const totalItems = ref(0)
  const rowOffset = ref(0)
  const lastPageParams = ref<PageChangeParams | null>(null)
  const includeKbUpdates = ref(true)
  const currentFilterQuery = ref(getStoredDataTableFilter('inventory-hardware'))
  let requestId = 0
  let fetchController: AbortController | null = null

  const dataTableRef = ref<{ refresh: () => void } | null>(null)
  const summary = ref<InventorySummary | null>(null)

  const INVENTORY_STALE_DAYS = 30

  function metaStateColor(state: InventoryMeta['state']) {
    return state === 'ok' ? 'success' : state === 'stale' ? 'warning' : 'neutral'
  }

  // Tooltip copy for the status badge: explains what each inventory state means.
  function metaStateDesc(state: InventoryMeta['state']): string {
    switch (state) {
      case 'ok':
        return String($t('inventory.okDesc', { days: INVENTORY_STALE_DAYS }))
      case 'stale':
        return String($t('inventory.staleDesc', { days: INVENTORY_STALE_DAYS }))
      case 'empty':
        return String($t('inventory.emptyDesc'))
      default:
        return String($t('inventory.notScannedDesc'))
    }
  }

  // Compact tab tooltip: scan state plus last-scan date, so the tab stays a single line.
  function summaryTabTooltip(meta: InventoryMeta | undefined): string {
    if (!meta) return ''
    const state = String($t(`inventory.${meta.state === 'not_scanned' ? 'notScanned' : meta.state}`))
    return meta.lastScan ? `${state} \u2013 ${$t('inventory.scannedAt')}: ${meta.lastScan}` : state
  }

  async function fetchSummary() {
    const clientId = resolvedClientId.value
    if (!clientId) return
    try {
      const result = await getClientInventorySummary(clientId)
      if (result.error) throw result.error
      summary.value = result.data ?? null
    } catch {
      summary.value = null
    }
  }

  function refreshCurrentTab() {
    dataTableRef.value?.refresh()
    fetchSummary()
  }

  const tableId = computed(() => `inventory-${activeTab.value}`)
  const tableRows = computed(() => currentItems.value as unknown as Record<string, unknown>[])
  const currentColumns = computed(() => (activeTab.value === 'hardware' ? hardwareColumns : softwareColumns))
  const currentTableSettings = computed(() => (activeTab.value === 'hardware' ? hardwareTableSettings : softwareTableSettings))

  const HARDWARE_CLASS_ICONS: Record<string, string> = {
    COMPUTER_SYSTEM: icons.client,
    BASE_BOARD: icons.hardware,
    CHASSIS: icons.chassis,
    PROCESSOR: icons.hardware,
    MEMORY_MODULE: icons.memory,
    HARD_DISK_DRIVE: icons.storage,
    DISK: icons.storage,
    NETWORK_CONTROLLER: icons.network,
    VIDEO_CONTROLLER: icons.display,
    MONITOR: icons.display,
    KEYBOARD: icons.keyboard,
    MOUSE: icons.mouse,
    PRINTER: icons.printer,
    SOUND_CARD: icons.audio,
    USB_DEVICE: icons.usb,
  }

  const HARDWARE_CLASS_COLORS: Record<string, string> = {
    COMPUTER_SYSTEM: 'text-blue-500 dark:text-blue-400',
    BASE_BOARD: 'text-violet-500 dark:text-violet-400',
    CHASSIS: 'text-slate-500 dark:text-slate-400',
    PROCESSOR: 'text-amber-500 dark:text-amber-400',
    MEMORY_MODULE: 'text-fuchsia-500 dark:text-fuchsia-400',
    HARD_DISK_DRIVE: 'text-orange-500 dark:text-orange-400',
    DISK: 'text-orange-500 dark:text-orange-400',
    NETWORK_CONTROLLER: 'text-cyan-600 dark:text-cyan-400',
    VIDEO_CONTROLLER: 'text-indigo-500 dark:text-indigo-400',
    MONITOR: 'text-indigo-500 dark:text-indigo-400',
    KEYBOARD: 'text-emerald-600 dark:text-emerald-400',
    MOUSE: 'text-teal-600 dark:text-teal-400',
    PRINTER: 'text-sky-600 dark:text-sky-400',
    SOUND_CARD: 'text-rose-500 dark:text-rose-400',
    USB_DEVICE: 'text-lime-600 dark:text-lime-400',
  }

  function classIcon(hardwareClass: string): string {
    return HARDWARE_CLASS_ICONS[hardwareClass.toUpperCase()] || icons.hardware
  }

  function classIconColor(hardwareClass: string): string {
    return HARDWARE_CLASS_COLORS[hardwareClass.toUpperCase()] || 'text-(--color-text-muted)'
  }

  function displayValue(value: unknown): string {
    return value === null || value === undefined || value === '' ? '-' : String(value)
  }

  function asHardwareItem(row: Record<string, unknown>): HardwareInventoryItem {
    return row as unknown as HardwareInventoryItem
  }

  function asSoftwareItem(row: Record<string, unknown>): SoftwareInventoryItem {
    return row as unknown as SoftwareInventoryItem
  }

  function hardwareRows(item: HardwareInventoryItem) {
    return item.attributes.map((attribute) => ({ key: attribute.label, value: displayValue(attribute.value) }))
  }

  function softwareRows(item: SoftwareInventoryItem) {
    return [
      { key: String($t('inventory.identifier')), value: item.identifier },
      { key: 'windowsSoftwareId', value: displayValue(item.windowsSoftwareId) },
      { key: 'licenseKey', value: displayValue(item.licenseKey) },
      { key: String($t('inventory.firstSeen')), value: displayValue(item.firstseen) },
    ]
  }

  function buildInitialPageParams(): PageChangeParams {
    const settings = currentTableSettings.value.settings
    return {
      pageNumber: 1,
      perPage: settings.pageSize,
      sortBy: settings.sortColumn || (activeTab.value === 'hardware' ? 'className' : 'displayName'),
      sortDesc: settings.sortDirection === 'desc',
      filterQuery: currentFilterQuery.value,
      sortBySelection: false,
      onlySelected: false,
    }
  }

  function backendSortKey(sortBy: string): string {
    if (activeTab.value === 'software' && sortBy === 'displayName') return 'name'
    return sortBy
  }

  async function fetchInventory(params: PageChangeParams) {
    const clientId = resolvedClientId.value
    if (!clientId) return

    lastPageParams.value = params
    const currentRequestId = ++requestId
    fetchController?.abort()
    const controller = new AbortController()
    fetchController = controller
    loading.value = true
    error.value = null

    try {
      const commonParams = {
        filterQuery: params.serverFilterQuery || params.filterQuery || undefined,
        sortBy: backendSortKey(params.sortBy),
        sortDesc: params.sortDesc,
        page: params.pageNumber,
        perPage: params.perPage,
      }
      const result =
        activeTab.value === 'hardware'
          ? await getClientHardwareInventory(clientId, commonParams, { signal: controller.signal })
          : await getClientSoftwareInventory(
              clientId,
              { ...commonParams, includeKbUpdates: includeKbUpdates.value },
              { signal: controller.signal },
            )

      if (currentRequestId !== requestId) return
      if (result.error) throw result.error

      currentMeta.value = result.data?.meta ?? null
      totalItems.value = result.total ?? result.data?.items.length ?? 0
      const pageItems = (result.data?.items ?? []) as InventoryItem[]
      if (params.displayMode === 'infinite' && params.pageNumber > 1) {
        rowOffset.value += appendInfinitePage(currentItems.value, pageItems, params.perPage)
      } else {
        currentItems.value = pageItems
        rowOffset.value = 0
      }
    } catch (caught) {
      if (currentRequestId !== requestId) return
      if (controller.signal.aborted) return
      error.value = caught instanceof Error ? caught.message : String($t('common.error'))
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
        fetchController = null
      }
    }
  }

  function handlePageChange(params: PageChangeParams) {
    currentFilterQuery.value = params.filterQuery
    fetchInventory(params)
  }

  function handleFilterQueryUpdate(value: string) {
    currentFilterQuery.value = value
    fetchController?.abort()
  }

  async function exportCsv() {
    const clientId = resolvedClientId.value
    if (!clientId) return
    const params = lastPageParams.value ?? buildInitialPageParams()
    exporting.value = true
    try {
      const commonParams = {
        filterQuery: params.serverFilterQuery || params.filterQuery || undefined,
        sortBy: backendSortKey(params.sortBy),
        sortDesc: params.sortDesc,
      }
      const result =
        activeTab.value === 'hardware'
          ? await exportHardwareInventoryCsv(clientId, commonParams)
          : await exportSoftwareInventoryCsv(clientId, { ...commonParams, includeKbUpdates: includeKbUpdates.value })
      if (result.error || !result.blob) {
        error.value = result.error?.message || String($t('common.error'))
        return
      }
      const url = URL.createObjectURL(result.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${clientId}_${activeTab.value}_inventory.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      exporting.value = false
    }
  }

  function resetAndFetch() {
    fetchController?.abort()
    currentMeta.value = null
    currentItems.value = []
    totalItems.value = 0
    rowOffset.value = 0
    lastPageParams.value = null
    currentFilterQuery.value = getStoredDataTableFilter(tableId.value)
    if (resolvedClientId.value) fetchInventory(buildInitialPageParams())
  }

  watch(() => [resolvedClientId.value, activeTab.value], resetAndFetch, { immediate: true })
  watch(resolvedClientId, () => fetchSummary(), { immediate: true })
  watch(includeKbUpdates, () => {
    if (activeTab.value === 'software') fetchInventory(buildInitialPageParams())
  })
  onUnmounted(() => fetchController?.abort())
</script>
