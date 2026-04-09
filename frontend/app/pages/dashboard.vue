<template>
    <LayoutsPageLayout :show-search="false" :show-refresh="true" :loading="loading" @refresh="refreshAll">
        <div class="h-full flex flex-col min-h-0 overflow-y-auto gap-2 lg:gap-3">
            <!-- Row 1: Config Server, Health Check, User Config & Restrictions -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 shrink-0">
                <DashboardInfoCard :icon="icons.serverStack" :label="$t('configServer')" :value="serverHostname" />
                <div class="group bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200"
                    @click="navigateTo('/admin/diagnostics/healthcheck')">
                    <div class="flex items-center gap-2 mb-3 mt-2">
                        <UIcon :name="icons.health" class="w-5 h-5 text-[--color-text-muted]" />
                        <h3 class="text-xs m-0">{{ $t('healthCheck') }}</h3>
                        <UIcon :name="icons.chevronRight"
                            class="ml-auto w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div v-if="healthCounts" class="flex items-center gap-2 flex-wrap mt-4">
                        <UBadge v-if="healthCounts.error > 0" color="error">
                            {{ healthCounts.error }} {{ $t('errors') }}
                        </UBadge>
                        <UBadge v-if="healthCounts.warning > 0" color="warning">
                            {{ healthCounts.warning }} {{ $t('warnings') }}
                        </UBadge>
                        <UBadge v-if="healthCounts.ok > 0" color="success">
                            {{ healthCounts.ok }} {{ $t('ok') }}
                        </UBadge>
                    </div>
                    <SharedLoadingSpinner v-else size="sm" />
                </div>

                <!-- Merged User Config + Restrictions Card -->
                <div
                    class="bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 md:col-span-2">
                    <div class="flex items-center gap-3 mb-3">
                        <UIcon :name="icons.user" class="w-4.5 h-4.5" />
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold truncate text-sm">{{ sharedUserConfig?.user || userStore.username
                                || '-' }}</p>
                            <p class="font-heading text-xs text-[--color-text-muted] tracking-widest m-0">{{
                                $t('currentUser') }}</p>
                        </div>
                        <UBadge v-if="webguiRestrictionsCount > 0" color="warning" variant="subtle" size="sm"
                            class="shrink-0">
                            {{ webguiRestrictionsCount }} {{ $t('restricted') }}
                        </UBadge>
                        <UBadge v-else color="success" variant="subtle" size="sm" class="shrink-0">
                            {{ $t('opsiConfig.serverFeatures.allEnabled') }}
                        </UBadge>
                    </div>
                    <div v-if="userConfigData" class="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                        <SharedRestrictionBadge v-for="feat in webguiFeatures" :key="feat.key" :icon="feat.icon"
                            :label="feat.shortLabel" :restricted="feat.restricted"
                            :tooltip-text="feat.restricted ? $t(`opsiConfig.serverFeatures.${feat.i18nKey}.disabled`) : $t(`opsiConfig.serverFeatures.${feat.i18nKey}.enabled`)" />
                    </div>
                </div>
            </div>

            <!-- Row 2: System Info -->
            <div class="shrink-0">
                <div class="group bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200"
                    @click="navigateTo('/admin/diagnostics/system')">
                    <div class="flex items-center gap-2 mb-2">
                        <UIcon :name="icons.server" class="w-5 h-5 text-[--color-text-muted]" />
                        <h3 class="text-xs m-0">{{ $t('systemInfo') }}</h3>
                        <UIcon :name="icons.chevronRight"
                            class="ml-auto w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div v-if="diagnosticData" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5 text-sm">
                        <div
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">opsiconfd</span>
                            <span class="font-medium truncate ml-2 text-sm">{{ diagnosticData.opsiconfd_version
                                }}</span>
                        </div>
                        <div v-if="diagnosticData.os_release"
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">os</span>
                            <span class="font-medium truncate ml-2 text-sm">
                                {{ (diagnosticData.os_release as Record<string, unknown>).PRETTY_NAME }}</span>
                        </div>
                        <div v-if="diagnosticData.processor"
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">cpu</span>
                            <span class="font-medium truncate ml-2 text-sm">
                                {{ (diagnosticData.processor as Record<string, unknown>).cpu_count }} cores · {{
                                    sysProcessorModel }}</span>
                        </div>
                        <div v-if="diagnosticData.memory"
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">memory</span>
                            <span class="font-medium text-sm">{{ (diagnosticData.memory as Record<string, unknown>
                            ).total_human }} ({{ (diagnosticData.memory as Record<string, unknown>).used_percent
                                        }}%)</span>
                        </div>
                        <div v-if="sysHostname"
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">hostname</span>
                            <span class="font-medium truncate ml-2 text-sm">{{ sysHostname }}</span>
                        </div>
                        <div v-if="sysIsDocker !== null"
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">docker</span>
                            <UBadge :color="sysIsDocker ? 'info' : 'neutral'" variant="subtle" size="xs">{{ sysIsDocker
                                ? 'Yes' : 'No' }}</UBadge>
                        </div>
                        <div v-if="sysPythonVersion"
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">python</span>
                            <span class="font-medium truncate ml-2 text-sm">{{ sysPythonVersion }}</span>
                        </div>
                        <div v-if="sysLoadAvg"
                            class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-(--color-surface-hover) transition-colors">
                            <span class="text-[--color-text-muted] text-sm">load</span>
                            <span class="font-medium truncate ml-2 text-sm">{{ sysLoadAvg }}</span>
                        </div>
                    </div>
                    <SharedLoadingSpinner v-else size="sm" />
                </div>
            </div>

            <!-- Row 3: Stat Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 shrink-0">
                <DashboardStatCard :icon="icons.server" :value="depotCount" :label="$t('totalServers')"
                    @click="navigateTo('/servers')" />

                <!-- Clients stat card with OS + active/inactive breakdown -->
                <div class="group bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200"
                    @click="navigateTo('/clients')">
                    <div class="flex items-center justify-between mb-1">
                        <UIcon :name="icons.client" class="w-5 h-5 text-[--color-text-muted]" />
                        <UIcon :name="icons.chevronRight"
                            class="w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p class="text-2xl font-bold mb-0.5">{{ clientCount ?? '-' }}</p>
                    <p class="text-[--color-text-muted] text-sm mb-2">{{ $t('totalClients') }}</p>
                    <div v-if="sharedClientNumbers" class="space-y-1 pt-1.5 border-t border-(--color-border)/30">
                        <div class="flex items-center gap-4 text-xs text-[--color-text-muted]">
                            <span class="flex items-center gap-1"><span
                                    class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>{{
                                        sharedClientNumbers.all }} {{ $t('active') }}</span>
                            <span class="flex items-center gap-1"><span
                                    class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>{{
                                        sharedClientNumbers.inactive }} {{ $t('inactive') }}</span>
                        </div>
                        <div class="flex items-center gap-1 text-xs mt-4">
                            <UIcon :name="icons.windows" class="w-4 h-4 text-sky-500" />
                            <span class="font-medium">{{ sharedClientNumbers.windows }}</span>
                            <UIcon :name="icons.linux" class="w-4 h-4 text-orange-500 ml-4" />
                            <span class="font-medium">{{ sharedClientNumbers.linux }}</span>
                            <UIcon :name="icons.apple" class="w-4 h-4 text-(--color-text-muted) ml-4" />
                            <span class="font-medium">{{ sharedClientNumbers.macos }}</span>
                        </div>
                    </div>
                </div>

                <!-- Products stat card with total + type breakdown -->
                <div class="group bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200"
                    @click="navigateTo('/products')">
                    <div class="flex items-center justify-between mb-2">
                        <UIcon :name="icons.product" class="w-5 h-5 text-[--color-text-muted]" />
                        <UIcon :name="icons.chevronRight"
                            class="w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p class="text-2xl font-bold mb-1">{{ totalProductCount ?? '-' }}</p>
                    <p class="text-[--color-text-muted] text-sm">{{ $t('totalProducts') }}</p>
                    <div class="mt-2 pt-2 border-t border-(--color-border)/30 flex gap-2 text-xs">
                        <span class="text-[--color-text-muted]">
                            <span class="font-medium text-[--color-text]">{{ localbootProductCount }}</span>
                            {{ $t('localboot') }}
                        </span>
                        <span class="text-[--color-text-muted] ml-4">
                            <span class="font-medium text-[--color-text]">{{ netbootProductCount }}</span>
                            {{ $t('netboot') }}
                        </span>
                    </div>
                </div>

                <!-- Modules Card -->
                <div class="group bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200"
                    @click="navigateTo('/admin/diagnostics/modules')">
                    <div class="flex items-center justify-between mb-2">
                        <img :src="opsiLogoSrc" alt="opsi" class="w-5 h-5" />
                        <UIcon :name="icons.chevronRight"
                            class="w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p class="text-2xl font-bold mb-1">{{ modulesAvailableCount ?? '-' }}</p>
                    <p class="text-[--color-text-muted] text-sm">{{ $t('opsiModules') }}</p>
                    <div v-if="obsoleteModulesCount > 0" class="mt-2 pt-2 border-t border-(--color-border)/30">
                        <div class="flex items-center gap-1.5 mb-1">
                            <UIcon :name="icons.warning" class="w-3.5 h-3.5 text-amber-500" />
                            <span class="text-xs font-medium text-amber-600 dark:text-amber-400">{{ obsoleteModulesCount
                                }} {{ $t('obsolete') }}</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                            <span v-for="mod in sharedObsoleteModules.slice(0, 3)" :key="mod"
                                class="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                {{ mod }}
                            </span>
                            <UTooltip v-if="sharedObsoleteModules.length > 3"
                                :text="sharedObsoleteModules.slice(3).join(', ')">
                                <span
                                    class="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-[--color-text-muted] cursor-help">
                                    +{{ sharedObsoleteModules.length - 3 }}
                                </span>
                            </UTooltip>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Row 4: Failed Clients -->
            <div
                class="bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 shrink-0">
                <div class="flex items-center gap-2 mb-2">
                    <UIcon :name="icons.warning" class="w-5 h-5 text-[--color-text-muted]" />
                    <h3 class="text-xs m-0">{{ $t('failedClients') }}</h3>
                    <UBadge v-if="failedClients && Object.keys(failedClients).length > 0" color="error" variant="subtle"
                        size="sm">
                        {{ Object.keys(failedClients).length }}
                    </UBadge>
                </div>
                <div v-if="failedClients && Object.keys(failedClients).length > 0"
                    class="space-y-1 max-h-32 overflow-y-auto">
                    <div v-for="(products, clientId) in failedClients" :key="clientId"
                        class="flex items-center justify-between p-1.5 rounded-lg bg-red-50 dark:bg-red-900/15 text-sm">
                        <span class="truncate text-xs">{{ clientId }}</span>
                        <span class="text-[--color-text-muted] ml-2 shrink-0 text-xs">{{ Array.isArray(products) ?
                            products.join(', ') : products }}</span>
                    </div>
                </div>
                <div v-else class="flex items-center gap-2 py-1">
                    <UIcon :name="icons.checkCircle" class="w-4 h-4 text-emerald-500" />
                    <p class="text-xs text-[--color-text-muted]">{{ $t('noFailedClients') }}</p>
                </div>
            </div>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import opsiLogoLight from '~/assets/images/opsi_logo_bee_light.svg'
import opsiLogoDark from '~/assets/images/opsi_logo_bee_dark.svg'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const userStore = useUserStore()
const colorMode = useColorMode()
const {
    diagnosticsData: sharedDiagData,
    healthCounts: sharedHealthCounts,
    modules: sharedModules,
    modulesDetailed: sharedModulesDetailed,
    obsoleteModules: sharedObsoleteModules,
    licenseClientNumbers: sharedClientNumbers,
    userConfigData: sharedUserConfig,
    refreshAll: refreshCachedData,
    fetchDiagnostics: fetchDiagnosticsIfNeeded,
    fetchUserConfig: fetchUserConfigIfNeeded,
    fetchDisabledFeatures: fetchDisabledFeaturesIfNeeded,
} = useCachedData()

const loading = ref(false)

const diagnosticData = computed(() => sharedDiagData.value)

const userConfigData = computed(() => sharedUserConfig.value?.configuration ?? null)
const healthCounts = sharedHealthCounts

// Features/restrictions actually enforced in opsi-webgui (not opsiconfd admin page features)
// Each entry maps to a real server config or disabled-features token
const webguiFeatures = computed(() => {
    const username = sharedUserConfig.value?.user || userStore.username || '{user}'
    const terminalDisabled = userStore.disabledFeatures.includes('messagebus_terminal') || userStore.disabledFeatures.includes('terminal')
    return [
        {
            key: 'readOnly',
            i18nKey: 'readOnly',
            configId: `user.{${username}}.privilege.host.all.registered_readonly`,
            restricted: userConfigData.value?.read_only ?? false,
            icon: icons.eye,
            shortLabel: 'Read Only',
        },
        {
            key: 'serverWrite',
            i18nKey: 'serverWrite',
            configId: `user.{${username}}.privilege.host.opsiserver.write`,
            restricted: !(userConfigData.value?.server_write_access ?? true),
            icon: icons.serverStack,
            shortLabel: 'Server Write',
        },
        {
            key: 'depotAccess',
            i18nKey: 'depotAccess',
            configId: `user.{${username}}.privilege.host.depotaccess.configured`,
            restricted: userConfigData.value?.depot_access ?? false,
            icon: icons.server,
            shortLabel: 'Depot Access',
        },
        {
            key: 'clientCreation',
            i18nKey: 'clientCreation',
            configId: `user.{${username}}.privilege.host.createclient`,
            restricted: !(userConfigData.value?.client_creation ?? true),
            icon: icons.add,
            shortLabel: 'Client Create',
        },
        {
            key: 'hostGroupAccess',
            i18nKey: 'hostGroupAccess',
            configId: `user.{${username}}.privilege.host.groupaccess.configured`,
            restricted: userConfigData.value?.host_group_access ?? false,
            icon: icons.client,
            shortLabel: 'Host Groups',
        },
        {
            key: 'productGroupAccess',
            i18nKey: 'productGroupAccess',
            configId: `user.{${username}}.privilege.product.groupaccess.configured`,
            restricted: userConfigData.value?.product_group_access ?? false,
            icon: icons.product,
            shortLabel: 'Product Groups',
        },
        {
            key: 'terminal',
            i18nKey: 'terminal',
            configId: 'messagebus_terminal',
            restricted: terminalDisabled,
            icon: 'i-heroicons-command-line',
            shortLabel: 'Terminal',
        },
    ]
})

const webguiRestrictionsCount = computed(() =>
    webguiFeatures.value.filter(f => f.restricted).length
)

const opsiLogoSrc = computed(() => colorMode.preference === 'dark' ? opsiLogoDark : opsiLogoLight)

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
    return clients?.client_count as number ?? null
})

const activeClientCount = computed(() => {
    if (!diagnosticData.value) return null
    const clients = diagnosticData.value.clients as Record<string, unknown> | undefined
    return clients?.active_client_count as number ?? null
})

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
    // Extract just the version number (e.g. "3.14.0" from "3.14.0 (main, ...)")
    return full.split(' ')[0] || full
})

const sysProcessorModel = computed(() => {
    if (!diagnosticData.value) return null
    const processor = diagnosticData.value.processor as Record<string, unknown> | undefined
    if (!processor?.model) return null
    const model = processor.model as string
    // Shorten long model names
    return model.replace(/\(R\)/g, '').replace(/\(TM\)/g, '').replace(/CPU\s+/g, '').replace(/\s+/g, ' ').trim()
})

const sysLoadAvg = computed(() => {
    if (!diagnosticData.value) return null
    const processor = diagnosticData.value.processor as Record<string, unknown> | undefined
    if (!processor?.load_avg) return null
    const load = processor.load_avg as number[]
    return load.map(v => v.toFixed(2)).join(' / ')
})

const totalProductCount = computed(() => {
    if (!diagnosticData.value) return null
    const products = diagnosticData.value.products as Record<string, Record<string, unknown>> | undefined
    if (!products) return null
    let count = 0
    for (const depot of Object.values(products)) {
        count += Object.keys(depot).length
    }
    // Use first depot's count as unique products count
    const firstDepot = Object.values(products)[0]
    return firstDepot ? Object.keys(firstDepot).length : count
})

const localbootProductCount = computed(() => {
    if (!diagnosticData.value) return '-'
    const products = diagnosticData.value.products as Record<string, Record<string, { type: string }>> | undefined
    if (!products) return '-'
    const firstDepot = Object.values(products)[0]
    if (!firstDepot) return '-'
    return Object.values(firstDepot).filter(p => p.type === 'LocalbootProduct').length
})

const netbootProductCount = computed(() => {
    if (!diagnosticData.value) return '-'
    const products = diagnosticData.value.products as Record<string, Record<string, { type: string }>> | undefined
    if (!products) return '-'
    const firstDepot = Object.values(products)[0]
    if (!firstDepot) return '-'
    return Object.values(firstDepot).filter(p => p.type === 'NetbootProduct').length
})

const modulesAvailableCount = computed(() => sharedModules.value.length || null)

const obsoleteModulesCount = computed(() => sharedObsoleteModules.value.length)

const outdatedClientCount = computed(() => {
    if (!diagnosticData.value) return null
    const healthChecks = diagnosticData.value.health_check as Array<Record<string, unknown>> | undefined
    if (!healthChecks) return null
    const activeCheck = healthChecks.find(c => (c.check as Record<string, unknown>)?.id === 'opsi_active_clients')
    if (!activeCheck?.details) return null
    const outdated = (activeCheck.details as Record<string, unknown>).outdated_clients as string[] | undefined
    return outdated?.length ?? null
})

const outdatedClientsTooltip = computed(() => {
    if (!diagnosticData.value) return ''
    const healthChecks = diagnosticData.value.health_check as Array<Record<string, unknown>> | undefined
    if (!healthChecks) return ''
    const activeCheck = healthChecks.find(c => (c.check as Record<string, unknown>)?.id === 'opsi_active_clients')
    if (!activeCheck?.details) return ''
    const outdated = (activeCheck.details as Record<string, unknown>).outdated_clients as string[] | undefined
    if (!outdated || outdated.length === 0) return ''
    const shown = outdated.slice(0, 10)
    const suffix = outdated.length > 10 ? ` ... (+${outdated.length - 10})` : ''
    return `${$t('outdatedClients')}: ${shown.join(', ')}${suffix}`
})

const failedClients = computed(() => {
    if (!diagnosticData.value) return null
    const healthChecks = diagnosticData.value.health_check as Array<Record<string, unknown>> | undefined
    if (!healthChecks) return null
    const failedCheck = healthChecks.find(c => (c.check as Record<string, unknown>)?.id === 'opsi_failed_clients')
    if (!failedCheck?.details) return null
    return (failedCheck.details as Record<string, unknown>).failed_actions as Record<string, string[]> | undefined
})

async function refreshAll() {
    loading.value = true
    try {
        await refreshCachedData()
    } finally {
        loading.value = false
    }
}

/** On mount, use cached data if available; only fetch what's missing. */
async function initDashboard() {
    loading.value = true
    try {
        await Promise.all([
            fetchDiagnosticsIfNeeded(),
            fetchUserConfigIfNeeded(),
            fetchDisabledFeaturesIfNeeded(),
        ])
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    initDashboard()
})
</script>
