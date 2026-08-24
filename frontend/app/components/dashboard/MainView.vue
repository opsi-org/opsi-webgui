<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  DashboardMainView - Dashboard overview with statistics cards and quick navigation.
-->
<template>
  <LayoutsPageLayout :show-filter="false" :show-refresh="true" :loading="loading" @refresh="refreshAll">
    <div class="@container h-full flex flex-col min-h-0 overflow-y-auto gap-2 lg:gap-3">
      <div class="grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-4 gap-2 lg:gap-3 shrink-0">
        <DashboardInfoCard :icon="icons.serverStack" :label="$t('servers.config')" :value="serverHostname" />
        <div
          class="group opsi-card opsi-card-hover cursor-pointer transition-all duration-200"
          role="button"
          tabindex="0"
          :aria-label="$t('diag.health')"
          @click="navigateTo('/admin/diagnostics/healthcheck')"
          @keydown.enter="navigateTo('/admin/diagnostics/healthcheck')"
          @keydown.space.prevent="navigateTo('/admin/diagnostics/healthcheck')"
        >
          <div class="flex items-center gap-2 mb-3 mt-2">
            <CoreAppIcon :name="icons.health" class="w-5 h-5" aria-hidden="true" />
            <CoreAppHeading size="xs">{{ $t('diag.health') }}</CoreAppHeading>
            <CoreAppIcon
              :name="icons.chevronRight"
              class="ml-auto w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </div>
          <div v-if="healthCounts" class="flex items-center gap-2 flex-wrap mt-4" aria-hidden="true">
            <CoreAppStatusBadge v-if="healthCounts.error > 0" status="error" :value="healthCounts.error" :label="$t('common.errors')" />
            <CoreAppStatusBadge
              v-if="healthCounts.warning > 0"
              status="warning"
              :value="healthCounts.warning"
              :label="$t('common.warnings')"
            />
            <CoreAppStatusBadge v-if="healthCounts.ok > 0" status="success" :value="healthCounts.ok" :label="$t('common.ok')" />
          </div>
          <CoreAppLoadingSpinner v-else size="sm" />
        </div>

        <!-- User Config + Restrictions Card -->
        <div
          class="opsi-card @2xl:col-span-2"
          role="region"
          tabindex="0"
          :aria-label="$t('users.current') + ': ' + (sharedUserConfig?.user || userStore.username || '-')"
        >
          <div class="flex items-center gap-3 mb-3">
            <CoreAppIcon :name="icons.user" class="w-4.5 h-4.5" aria-hidden="true" />
            <div class="flex-1 min-w-0">
              <p class="font-heading text-xs text-(--color-text-muted) tracking-widest m-0">
                {{ $t('users.current') }}
              </p>
              <p class="font-semibold truncate text-sm">
                {{ sharedUserConfig?.user || userStore.username || '-' }}
              </p>
            </div>
            <CoreAppStatusBadge
              v-if="webguiRestrictionsCount > 0"
              status="warning"
              variant="subtle"
              size="sm"
              :label="`${webguiRestrictionsCount} ${$t('auth.restricted')}`"
              class="shrink-0"
              aria-hidden="true"
            />
            <CoreAppStatusBadge
              v-else
              status="success"
              variant="subtle"
              size="sm"
              :label="$t('opsiConfig.serverFeatures.allEnabled')"
              class="shrink-0"
              aria-hidden="true"
            />
          </div>
          <div v-if="userConfigData" class="grid grid-cols-4 sm:grid-cols-7 gap-1.5" aria-hidden="true">
            <CoreAppRestrictionBadge
              v-for="feat in webguiFeatures"
              :key="feat.key"
              :icon="feat.icon"
              :label="feat.shortLabel"
              :restricted="feat.restricted"
              :tooltip-text="
                feat.restricted
                  ? $t(`opsiConfig.serverFeatures.${feat.i18nKey}.disabled`)
                  : $t(`opsiConfig.serverFeatures.${feat.i18nKey}.enabled`)
              "
            />
          </div>
        </div>
      </div>

      <div class="shrink-0">
        <div
          class="group opsi-card opsi-card-hover cursor-pointer transition-all duration-200"
          role="button"
          tabindex="0"
          :aria-label="$t('diag.systemInfo')"
          @click="navigateTo('/admin/diagnostics/system')"
          @keydown.enter="navigateTo('/admin/diagnostics/system')"
          @keydown.space.prevent="navigateTo('/admin/diagnostics/system')"
        >
          <div class="flex items-center gap-2 mb-2">
            <CoreAppIcon :name="icons.server" class="w-5 h-5" />
            <CoreAppHeading size="xs">{{ $t('diag.systemInfo') }}</CoreAppHeading>
            <CoreAppIcon
              :name="icons.chevronRight"
              class="ml-auto w-3 h-3 text-(--color-text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div v-if="diagnosticData" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5 text-sm">
            <template v-for="item in systemInfoItems" :key="item.label">
              <div class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                <span class="text-(--color-text-muted) text-sm">{{ item.label }}</span>
                <template v-if="item.badge">
                  <CoreAppStatusBadge :status="item.badge.color" :label="item.badge.text" />
                </template>
                <span v-else class="font-medium truncate ml-2 text-sm">{{ item.value }}</span>
              </div>
            </template>
          </div>
          <CoreAppLoadingSpinner v-else size="sm" />
        </div>
      </div>

      <div class="grid grid-cols-2 @5xl:grid-cols-4 gap-2 lg:gap-3 shrink-0">
        <DashboardStatCard
          :icon="icons.server"
          :value="depotCount"
          :loading="loading && depotCount === null"
          :label="$t('dashboard.totalServers')"
          @click="navigateTo('/servers')"
        />

        <div
          class="group opsi-card opsi-card-hover cursor-pointer transition-all duration-200"
          role="button"
          tabindex="0"
          @click="navigateTo('/clients')"
          @keydown.enter="navigateTo('/clients')"
          @keydown.space.prevent="navigateTo('/clients')"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5">
              <CoreAppIcon :name="icons.client" class="w-5 h-5" />
              <CoreAppTooltipTable v-if="depotClientTooltipRows.length > 0" :rows="depotClientTooltipRows">
                <CoreAppButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  :icon="icons.info"
                  :aria-label="String($t('common.info'))"
                  class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                  @click.stop
                />
              </CoreAppTooltipTable>
            </div>
            <CoreAppIcon
              :name="icons.chevronRight"
              class="w-3 h-3 text-(--color-text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div class="min-h-8 mb-0.5 flex items-center">
            <CoreAppLoadingSpinner v-if="loading && clientCount === null" size="sm" />
            <p v-else class="text-2xl font-bold">{{ clientCount ?? '-' }}</p>
          </div>
          <p class="text-sm mb-2">{{ $t('dashboard.totalClients') }}</p>
          <div v-if="sharedClientNumbers" class="space-y-1.5 pt-1.5 border-t border-(--color-border)/30">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1.5">
                <CoreAppIcon :name="icons.checkCircle" class="w-4 h-4 shrink-0 text-(--color-success)" />
                <span class="font-medium">{{ sharedClientNumbers?.all ?? '-' }}</span>
                {{ $t('clients.active') }}
                <CoreAppTooltipTable :rows="activeClientsTooltipRows">
                  <CoreAppButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :icon="icons.info"
                    :aria-label="String($t('clients.active'))"
                    class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                    @click.stop
                  />
                </CoreAppTooltipTable>
              </span>
              <span class="flex items-center gap-1.5">
                <CoreAppIcon :name="icons.xCircle" class="w-4 h-4 shrink-0 text-(--color-error)" />
                <span class="font-medium">{{ sharedClientNumbers?.inactive ?? '-' }}</span>
                {{ $t('clients.inactive') }}
                <CoreAppTooltipTable :rows="inactiveClientsTooltipRows">
                  <CoreAppButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :icon="icons.info"
                    :aria-label="String($t('clients.inactive'))"
                    class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                    @click.stop
                  />
                </CoreAppTooltipTable>
              </span>
            </div>
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1.5">
                <CoreAppIcon :name="icons.windows" class="w-4 h-4 shrink-0 text-(--color-os-windows)" />
                <span class="font-medium">{{ sharedClientNumbers?.windows ?? '-' }}</span>
              </span>
              <span class="flex items-center gap-1.5">
                <CoreAppIcon :name="icons.linux" class="w-4 h-4 shrink-0 text-(--color-os-linux)" />
                <span class="font-medium">{{ sharedClientNumbers?.linux ?? '-' }}</span>
              </span>
              <span class="flex items-center gap-1.5">
                <CoreAppIcon :name="icons.apple" class="w-4 h-4 shrink-0 text-(--color-os-macos)" />
                <span class="font-medium">{{ sharedClientNumbers?.macos ?? '-' }}</span>
              </span>
            </div>
          </div>
        </div>

        <div
          class="group opsi-card opsi-card-hover cursor-pointer transition-all duration-200"
          role="button"
          tabindex="0"
          @click="navigateTo('/products')"
          @keydown.enter="navigateTo('/products')"
          @keydown.space.prevent="navigateTo('/products')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <CoreAppIcon :name="icons.product" class="w-5 h-5" />
              <CoreAppTooltipTable v-if="depotProductTooltipRows.length > 0" :rows="depotProductTooltipRows">
                <CoreAppButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  :icon="icons.info"
                  :aria-label="String($t('common.info'))"
                  class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                  @click.stop
                />
              </CoreAppTooltipTable>
            </div>
            <CoreAppIcon
              :name="icons.chevronRight"
              class="w-3 h-3 text-(--color-text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div class="min-h-8 mb-1 flex items-center">
            <CoreAppLoadingSpinner v-if="loading && totalProductCount === null" size="sm" />
            <p v-else class="text-2xl font-bold">{{ totalProductCount ?? '-' }}</p>
          </div>
          <p>{{ $t('dashboard.totalProducts') }}</p>
          <div class="mt-2 pt-2 border-t border-(--color-border)/30 flex gap-2">
            <span>
              <span class="font-medium text-(--color-text)">{{ localbootProductCount }}</span>
              {{ $t('products.localboot') }}
            </span>
            <span class="ml-4">
              <span class="font-medium text-(--color-text)">{{ netbootProductCount }}</span>
              {{ $t('products.netboot') }}
            </span>
          </div>
        </div>

        <div
          class="group opsi-card opsi-card-hover cursor-pointer transition-all duration-200"
          role="button"
          tabindex="0"
          @click="navigateTo('/admin/diagnostics/modules')"
          @keydown.enter="navigateTo('/admin/diagnostics/modules')"
          @keydown.space.prevent="navigateTo('/admin/diagnostics/modules')"
        >
          <div class="flex items-center justify-between mb-2">
            <CoreAppImage
              src="~/assets/images/opsi-modules.svg"
              dark-src="~/assets/images/opsi-modules-light.svg"
              alt="opsi modules"
              image-class="w-5 h-5"
            />
            <CoreAppIcon
              :name="icons.chevronRight"
              class="w-3 h-3 text-(--color-text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div class="min-h-8 mb-1 flex items-center">
            <CoreAppLoadingSpinner v-if="loading && modulesAvailableCount === null" size="sm" />
            <p v-else class="text-2xl font-bold">{{ modulesAvailableCount ?? '-' }}</p>
          </div>
          <p class="text-sm">{{ $t('mods.title') }}</p>
        </div>
      </div>

      <div class="group opsi-card shrink-0 min-h-[104px] flex flex-col">
        <div class="flex items-center gap-2 mb-1.5">
          <CoreAppIcon :name="icons.warning" class="w-5 h-5" />
          <CoreAppHeading size="xs">{{ $t('actions.failedClients') }}</CoreAppHeading>
          <CoreAppButton
            size="xs"
            variant="ghost"
            color="neutral"
            :title="$t('actions.failedClientsHelp')"
            :icon="icons.info"
            :aria-label="String($t('common.info'))"
            class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            @click.stop
          />

          <CoreAppStatusBadge
            v-if="failedClients && Object.keys(failedClients).length > 0"
            status="error"
            size="sm"
            :value="Object.keys(failedClients).length"
          />
        </div>
        <div
          v-if="failedClients && Object.keys(failedClients).length > 0"
          class="space-y-0.5 max-h-48 overflow-y-auto"
          tabindex="0"
          role="region"
          :aria-label="String($t('actions.failedClients'))"
        >
          <div
            v-for="(products, clientId) in failedClients"
            :key="clientId"
            class="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm"
          >
            <span class="truncate">{{ clientId }}</span>
            <div class="flex gap-1">
              <CoreAppStatusBadge
                v-for="p in Array.isArray(products) ? products : [products]"
                :key="p"
                status="error"
                :label="p"
                size="xs"
              />
            </div>
          </div>
        </div>
        <div v-else class="flex items-center gap-2 py-1">
          <CoreAppIcon :name="icons.checkCircle" class="w-4 h-4 text-(--color-success-soft-text)" />
          <p>{{ $t('actions.noFailed') }}</p>
        </div>
      </div>
    </div>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/stores/userStore'

  const icons = useIcons()
  const { t: $t } = useI18n()
  const userStore = useUserStore()
  const router = useRouter()
  const { getDepotClientCounts, getClientIds } = useApiHelpers()

  // Navigate via the router for the card click handlers below.
  function navigateTo(path: string) {
    return router.push(path)
  }
  const {
    diagnosticsData: sharedDiagData,
    healthCounts: sharedHealthCounts,
    modules: sharedModules,
    licenseClientNumbers: sharedClientNumbers,
    userConfigData: sharedUserConfig,
    refreshAll: refreshCachedData,
    fetchDiagnostics: fetchDiagnosticsIfNeeded,
    fetchUserConfig: fetchUserConfigIfNeeded,
    fetchDisabledFeatures: fetchDisabledFeaturesIfNeeded,
  } = useCachedData()

  const loading = ref(false)
  const depotClientCounts = ref<Array<{ depotId: string; clientCount: number }>>([])

  const diagnosticData = computed(() => sharedDiagData.value)
  const userConfigData = computed(() => sharedUserConfig.value?.configuration ?? null)
  const healthCounts = sharedHealthCounts

  const webguiFeatures = computed(() => {
    const terminalDisabled = userStore.disabledFeatures.includes('messagebus_terminal') || userStore.disabledFeatures.includes('terminal')
    return [
      {
        key: 'readOnly',
        i18nKey: 'readOnly',
        restricted: userConfigData.value?.read_only ?? false,
        icon: icons.eye,
        shortLabel: 'Read Only',
      },
      {
        key: 'serverWrite',
        i18nKey: 'serverWrite',
        restricted: !(userConfigData.value?.server_write_access ?? true),
        icon: icons.serverStack,
        shortLabel: 'Server Write',
      },
      {
        key: 'depotAccess',
        i18nKey: 'depotAccess',
        restricted: userConfigData.value?.depot_access ?? false,
        icon: icons.server,
        shortLabel: 'Depot Access',
      },
      {
        key: 'clientCreation',
        i18nKey: 'clientCreation',
        restricted: !(userConfigData.value?.client_creation ?? true),
        icon: icons.add,
        shortLabel: 'Client Create',
      },
      {
        key: 'hostGroupAccess',
        i18nKey: 'hostGroupAccess',
        restricted: userConfigData.value?.host_group_access ?? false,
        icon: icons.client,
        shortLabel: 'Host Groups',
      },
      {
        key: 'productGroupAccess',
        i18nKey: 'productGroupAccess',
        restricted: userConfigData.value?.product_group_access ?? false,
        icon: icons.product,
        shortLabel: 'Product Groups',
      },
      {
        key: 'terminal',
        i18nKey: 'terminal',
        restricted: terminalDisabled,
        icon: 'heroicons:command-line',
        shortLabel: 'Terminal',
      },
    ]
  })

  const webguiRestrictionsCount = computed(() => webguiFeatures.value.filter((f) => f.restricted).length)

  const serverHostname = computed(() => {
    if (!diagnosticData.value) return null
    const depots = diagnosticData.value.depots as Record<string, unknown> | undefined
    return depots?.ids ? (depots.ids as string[])[0] : null
  })

  const depotCount = computed(() => {
    if (!diagnosticData.value) return null
    const depots = diagnosticData.value.depots as Record<string, unknown> | undefined
    return depots?.ids ? (depots.ids as string[]).length : null
  })

  const clientCount = computed(() => {
    if (!diagnosticData.value) return null
    const clients = diagnosticData.value.clients as Record<string, unknown> | undefined
    return (clients?.client_count as number) ?? null
  })

  const depotClientTooltipRows = computed(() =>
    depotClientCounts.value.map((entry) => ({
      key: entry.depotId,
      value: String(entry.clientCount),
    })),
  )

  const sysHostname = computed(() => {
    if (!diagnosticData.value) return null
    const env = diagnosticData.value.environment as Record<string, string> | undefined
    return env?.HOSTNAME || env?.OPSI_HOSTNAME || null
  })

  const sysIsDocker = computed(() => {
    if (!diagnosticData.value) return null
    const system = diagnosticData.value.system as Record<string, unknown> | undefined
    if (!system || system.docker === undefined) return null
    return system.docker as boolean
  })

  const sysPythonVersion = computed(() => {
    if (!diagnosticData.value) return null
    const pyInfo = diagnosticData.value.python_info as Record<string, unknown> | undefined
    if (!pyInfo?.version) return null
    const full = pyInfo.version as string
    return full.split(' ')[0] || full
  })

  const sysProcessorModel = computed(() => {
    if (!diagnosticData.value) return null
    const processor = diagnosticData.value.processor as Record<string, unknown> | undefined
    if (!processor?.model) return null
    const model = processor.model as string
    return model
      .replace(/\(R\)/g, '')
      .replace(/\(TM\)/g, '')
      .replace(/CPU\s+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  })

  const sysLoadAvg = computed(() => {
    if (!diagnosticData.value) return null
    const processor = diagnosticData.value.processor as Record<string, unknown> | undefined
    if (!processor?.load_avg) return null
    const load = processor.load_avg as number[]
    return load.map((v) => v.toFixed(2)).join(' / ')
  })

  interface SystemInfoItem {
    label: string
    value: string | null
    badge?: { text: string; color: 'info' | 'neutral' | 'success' | 'warning' | 'error' }
  }

  const systemInfoItems = computed<SystemInfoItem[]>(() => {
    if (!diagnosticData.value) return []
    const items: SystemInfoItem[] = []
    const d = diagnosticData.value

    if (d.opsiconfd_version) items.push({ label: 'opsiconfd', value: String(d.opsiconfd_version) })

    const osRelease = d.os_release as Record<string, unknown> | undefined
    if (osRelease?.PRETTY_NAME) items.push({ label: 'os', value: String(osRelease.PRETTY_NAME) })

    const processor = d.processor as Record<string, unknown> | undefined
    if (processor)
      items.push({
        label: 'cpu',
        value: `${processor.cpu_count} cores · ${sysProcessorModel.value}`,
      })

    const memory = d.memory as Record<string, unknown> | undefined
    if (memory) items.push({ label: 'memory', value: `${memory.total_human} (${memory.used_percent}%)` })

    if (sysHostname.value) items.push({ label: 'hostname', value: sysHostname.value })

    if (sysIsDocker.value !== null)
      items.push({
        label: 'docker',
        value: null,
        badge: {
          text: sysIsDocker.value ? 'Yes' : 'No',
          color: sysIsDocker.value ? 'info' : 'neutral',
        },
      })

    if (sysPythonVersion.value) items.push({ label: 'python', value: sysPythonVersion.value })

    if (sysLoadAvg.value) items.push({ label: 'load', value: sysLoadAvg.value })

    return items
  })

  const productCounts = computed(() => {
    if (!diagnosticData.value) return { total: 0, localboot: 0, netboot: 0 }
    const products = diagnosticData.value.products as Record<string, Record<string, { type: string }>> | undefined
    if (!products) return { total: 0, localboot: 0, netboot: 0 }
    const allIds = new Set<string>()
    const localbootIds = new Set<string>()
    const netbootIds = new Set<string>()
    for (const depot of Object.values(products)) {
      for (const [productId, p] of Object.entries(depot)) {
        allIds.add(productId)
        if (p.type === 'LocalbootProduct') localbootIds.add(productId)
        else if (p.type === 'NetbootProduct') netbootIds.add(productId)
      }
    }
    return { total: allIds.size, localboot: localbootIds.size, netboot: netbootIds.size }
  })

  const totalProductCount = computed(() => productCounts.value.total || null)
  const localbootProductCount = computed(() => productCounts.value.localboot || '-')
  const netbootProductCount = computed(() => productCounts.value.netboot || '-')

  const depotProductCounts = computed(() => {
    if (!diagnosticData.value) return []
    const products = diagnosticData.value.products as Record<string, Record<string, unknown>> | undefined
    if (!products) return []
    return Object.entries(products).map(([depotId, depotProducts]) => ({
      depotId,
      count: Object.keys(depotProducts).length,
    }))
  })

  const depotProductTooltipRows = computed(() => {
    return depotProductCounts.value.map((d) => ({
      key: d.depotId,
      value: String(d.count),
    }))
  })

  const activeClientsTooltipRows = computed(() => [
    { key: String($t('common.description')), value: String($t('clients.activeHelp')) },
    { key: 'RPC', value: String($t('clients.activeSource')) },
    { key: String($t('common.info')), value: String($t('clients.activeBreakdownHelp')) },
  ])

  const inactiveClientsTooltipRows = computed(() => [
    { key: String($t('common.description')), value: String($t('clients.inactiveHelp')) },
    { key: 'RPC', value: String($t('clients.activeSource')) },
  ])

  const modulesAvailableCount = computed(() => sharedModules.value.length || null)

  const failedClients = computed(() => {
    if (!diagnosticData.value) return null
    const healthChecks = diagnosticData.value.health_check as Array<Record<string, unknown>> | undefined
    if (!healthChecks) return null
    const failedCheck = healthChecks.find((c) => (c.check as Record<string, unknown>)?.id === 'opsi_failed_clients')
    if (!failedCheck?.details) return null
    return (failedCheck.details as Record<string, unknown>).failed_actions as Record<string, string[]> | undefined
  })

  async function refreshAll() {
    loading.value = true
    try {
      await refreshCachedData()
      await loadDepotClientCounts()
    } finally {
      loading.value = false
    }
  }

  async function loadDepotClientCounts() {
    const depots = (diagnosticData.value?.depots as Record<string, unknown> | undefined)?.ids as string[] | undefined
    if (!depots || depots.length === 0) {
      depotClientCounts.value = []
      return
    }

    const { data, error } = await getDepotClientCounts(depots)
    let rows = Array.isArray(data) ? data : []

    if ((error || rows.length === 0) && depots.length > 0) {
      const fallback = await getDepotClientCounts()
      rows = Array.isArray(fallback.data) ? fallback.data : []
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      const fallbackCounts = await Promise.all(
        depots.map(async (depotId) => {
          const { data } = await getClientIds([depotId])
          return {
            depotId,
            clientCount: Array.isArray(data) ? data.length : 0,
          }
        }),
      )
      depotClientCounts.value = fallbackCounts.sort((a, b) => a.depotId.localeCompare(b.depotId))
      return
    }

    const requestedDepots = new Set(depots)

    depotClientCounts.value = rows
      .map((row) => {
        const depotId = String(
          (row as { depotId?: string; depotid?: string }).depotId || (row as { depotId?: string; depotid?: string }).depotid || '',
        )
        const clientCountRaw =
          (row as { clientCount?: number | string; clientcount?: number | string }).clientCount ??
          (row as { clientCount?: number | string; clientcount?: number | string }).clientcount ??
          0
        return {
          depotId,
          clientCount: Number(clientCountRaw) || 0,
        }
      })
      .filter((row) => row.depotId && requestedDepots.has(row.depotId))
      .sort((a, b) => a.depotId.localeCompare(b.depotId))
  }

  async function initDashboard() {
    loading.value = true
    try {
      await Promise.all([fetchDiagnosticsIfNeeded(), fetchUserConfigIfNeeded(), fetchDisabledFeaturesIfNeeded()])
      await loadDepotClientCounts()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    initDashboard()
  })
</script>
