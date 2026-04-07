<template>
    <LayoutsPageLayout :show-search="false" :show-refresh="true" :loading="loading" @refresh="refreshAll">
        <div class="h-full flex flex-col min-h-0 overflow-y-auto gap-3 lg:gap-4 lg:justify-between">
            <!-- Row 1: Config Server, Health Check, User Config -->
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 shrink-0">
                <DashboardInfoCard :icon="icons.serverStack" :label="$t('configServer')" :value="serverHostname" />
                <div class="group bg-white dark:bg-[--color-surface] rounded-2xl shadow-sm dark:shadow-none p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                    @click="navigateTo('/admin/diagnostics/healthcheck')">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                            <UIcon :name="icons.health" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span class="text-sm font-semibold">{{ $t('healthCheck') }}</span>
                        <UIcon :name="icons.chevronRight" class="ml-auto w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div v-if="healthCounts" class="flex items-center gap-2 flex-wrap">
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
                    <p v-else class="text-xs text-[--color-text-muted]">{{ $t('loading') }}</p>
                </div>

                <!-- User Configuration Card -->
                <div class="bg-white dark:bg-[--color-surface] rounded-2xl shadow-sm dark:shadow-none p-4 lg:col-span-2">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-opsi-blue/20 to-opsi-blue/5">
                            <UIcon :name="icons.user" class="w-4.5 h-4.5 text-opsi-blue" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold truncate text-sm">{{ userConfigResponse?.user || userStore.username || '-' }}</p>
                            <p class="text-[10px] text-[--color-text-muted] uppercase tracking-widest font-medium">{{ $t('currentUser') }}</p>
                        </div>
                        <UBadge v-if="userConfigData?.read_only" color="warning" variant="subtle" size="sm" class="shrink-0">
                            {{ $t('readOnlyMode') }}
                        </UBadge>
                    </div>
                    <div v-if="userConfigData" class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        <UTooltip :text="`read_only — ${$t('readOnlyTooltip')}`">
                            <div class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="userConfigData.read_only ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'">
                                    <UIcon :name="userConfigData.read_only ? icons.lock : icons.check" class="w-3 h-3" :class="userConfigData.read_only ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'" />
                                </div>
                                <span class="text-[10px] text-[--color-text-muted] font-medium leading-tight text-center">RO</span>
                            </div>
                        </UTooltip>
                        <UTooltip :text="`server_write — ${$t('serverWriteAccessTooltip')}`">
                            <div class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="userConfigData.server_write_access ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-white/10'">
                                    <UIcon :name="userConfigData.server_write_access ? icons.check : icons.x" class="w-3 h-3" :class="userConfigData.server_write_access ? 'text-emerald-600 dark:text-emerald-400' : 'text-[--color-text-muted]'" />
                                </div>
                                <span class="text-[10px] text-[--color-text-muted] font-medium leading-tight text-center">Server</span>
                            </div>
                        </UTooltip>
                        <UTooltip :text="`depot_access — ${$t('depotAccessTooltip')}`">
                            <div class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="userConfigData.depot_access ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-white/10'">
                                    <UIcon :name="userConfigData.depot_access ? icons.check : icons.x" class="w-3 h-3" :class="userConfigData.depot_access ? 'text-emerald-600 dark:text-emerald-400' : 'text-[--color-text-muted]'" />
                                </div>
                                <span class="text-[10px] text-[--color-text-muted] font-medium leading-tight text-center">Depot</span>
                            </div>
                        </UTooltip>
                        <UTooltip :text="`client_creation — ${$t('clientCreationTooltip')}`">
                            <div class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="userConfigData.client_creation ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-white/10'">
                                    <UIcon :name="userConfigData.client_creation ? icons.check : icons.x" class="w-3 h-3" :class="userConfigData.client_creation ? 'text-emerald-600 dark:text-emerald-400' : 'text-[--color-text-muted]'" />
                                </div>
                                <span class="text-[10px] text-[--color-text-muted] font-medium leading-tight text-center">Create</span>
                            </div>
                        </UTooltip>
                        <UTooltip :text="`host_groups — ${$t('hostGroupAccessTooltip')}`">
                            <div class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="userConfigData.host_group_access ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-white/10'">
                                    <UIcon :name="userConfigData.host_group_access ? icons.check : icons.x" class="w-3 h-3" :class="userConfigData.host_group_access ? 'text-emerald-600 dark:text-emerald-400' : 'text-[--color-text-muted]'" />
                                </div>
                                <span class="text-[10px] text-[--color-text-muted] font-medium leading-tight text-center">Groups</span>
                            </div>
                        </UTooltip>
                        <UTooltip :text="`product_groups — ${$t('productGroupAccessTooltip')}`">
                            <div class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="userConfigData.product_group_access ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-white/10'">
                                    <UIcon :name="userConfigData.product_group_access ? icons.check : icons.x" class="w-3 h-3" :class="userConfigData.product_group_access ? 'text-emerald-600 dark:text-emerald-400' : 'text-[--color-text-muted]'" />
                                </div>
                                <span class="text-[10px] text-[--color-text-muted] font-medium leading-tight text-center">Prod.G</span>
                            </div>
                        </UTooltip>
                    </div>
                </div>
            </div>

            <!-- Row 2: System Info & Clients -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 shrink-0">
                <div class="bg-white dark:bg-[--color-surface] rounded-2xl shadow-sm dark:shadow-none p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-violet-100 dark:bg-violet-900/30">
                            <UIcon :name="icons.server" class="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 class="text-sm font-semibold">{{ $t('systemInfo') }}</h3>
                    </div>
                    <div v-if="diagnosticData" class="space-y-0.5 text-sm">
                        <div class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <span class="text-[--color-text-muted] font-mono text-xs">opsiconfd_version</span>
                            <span class="font-medium truncate ml-2 text-xs">{{ diagnosticData.opsiconfd_version }}</span>
                        </div>
                        <div v-if="diagnosticData.system" class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <span class="text-[--color-text-muted] font-mono text-xs">system</span>
                            <span class="font-medium truncate ml-2 text-xs">{{ (diagnosticData.system as Record<string, unknown>).product_name }}</span>
                        </div>
                        <div v-if="diagnosticData.os_release" class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <span class="text-[--color-text-muted] font-mono text-xs">os_release</span>
                            <span class="font-medium truncate ml-2 text-xs">{{ (diagnosticData.os_release as Record<string, unknown>).PRETTY_NAME }}</span>
                        </div>
                        <div v-if="diagnosticData.memory" class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <span class="text-[--color-text-muted] font-mono text-xs">memory</span>
                            <span class="font-medium text-xs">{{ (diagnosticData.memory as Record<string, unknown>).total_human }} ({{ (diagnosticData.memory as Record<string, unknown>).used_percent }}% used)</span>
                        </div>
                        <div v-if="diagnosticData.processor" class="flex justify-between items-center rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <span class="text-[--color-text-muted] font-mono text-xs">cpu</span>
                            <span class="font-medium truncate ml-2 text-xs">{{ (diagnosticData.processor as Record<string, unknown>).cpu_count }} cores</span>
                        </div>
                    </div>
                    <p v-else class="text-xs text-[--color-text-muted]">{{ $t('loading') }}</p>
                </div>
                <!-- Clients card with icon layout -->
                <div class="bg-white dark:bg-[--color-surface] rounded-2xl shadow-sm dark:shadow-none p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-sky-100 dark:bg-sky-900/30">
                            <UIcon :name="icons.client" class="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h3 class="text-sm font-semibold">{{ $t('clients') }}</h3>
                    </div>
                    <div v-if="sharedClientNumbers" class="flex items-center justify-around gap-2 py-1">
                        <UTooltip :text="$t('activeClients')">
                            <div class="flex flex-col items-center gap-1 cursor-default">
                                <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <UIcon :name="icons.checkCircle" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span class="text-sm font-bold">{{ sharedClientNumbers.all }}</span>
                            </div>
                        </UTooltip>
                        <UTooltip text="Windows">
                            <div class="flex flex-col items-center gap-1 cursor-default">
                                <div class="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                    <UIcon :name="icons.windows" class="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                </div>
                                <span class="text-sm font-bold">{{ sharedClientNumbers.windows }}</span>
                            </div>
                        </UTooltip>
                        <UTooltip text="Linux">
                            <div class="flex flex-col items-center gap-1 cursor-default">
                                <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                    <UIcon :name="icons.linux" class="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span class="text-sm font-bold">{{ sharedClientNumbers.linux }}</span>
                            </div>
                        </UTooltip>
                        <UTooltip text="macOS">
                            <div class="flex flex-col items-center gap-1 cursor-default">
                                <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                    <UIcon :name="icons.apple" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <span class="text-sm font-bold">{{ sharedClientNumbers.macos }}</span>
                            </div>
                        </UTooltip>
                        <UTooltip :text="$t('inactiveClients')">
                            <div class="flex flex-col items-center gap-1 cursor-default">
                                <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <UIcon :name="icons.shutdown" class="w-4 h-4 text-red-500 dark:text-red-400" />
                                </div>
                                <span class="text-sm font-bold">{{ sharedClientNumbers.inactive }}</span>
                            </div>
                        </UTooltip>
                    </div>
                    <p v-else class="text-xs text-[--color-text-muted]">{{ $t('loading') }}</p>
                </div>
            </div>

            <!-- Row 3: Stat Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 shrink-0">
                <DashboardStatCard :icon="icons.server" :value="depotCount" :label="$t('totalServers')"
                    @click="navigateTo('/servers')" />
                <DashboardStatCard :icon="icons.client" :value="clientCount" :label="$t('totalClients')"
                    @click="navigateTo('/clients')" />

                <DashboardStatCard :icon="icons.product" :value="totalProductCount" :label="$t('totalProducts')"
                    @click="navigateTo('/products')">
                    <span class="text-[--color-text-muted]">
                        <span class="font-medium text-[--color-text]">{{ localbootProductCount }}</span>
                        {{ $t('localbootProducts') }}
                    </span>
                    <span class="text-[--color-text-muted]">
                        <span class="font-medium text-[--color-text]">{{ netbootProductCount }}</span>
                        {{ $t('netbootProducts') }}
                    </span>
                </DashboardStatCard>

                <!-- Modules Card -->
                <div class="group bg-white dark:bg-[--color-surface] rounded-2xl shadow-sm dark:shadow-none p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                    @click="navigateTo('/admin/diagnostics/modules')">
                    <div class="flex items-center justify-between mb-2">
                        <img :src="opsiLogoSrc" alt="opsi" class="w-5 h-5" />
                        <UIcon :name="icons.chevronRight" class="w-3 h-3 text-[--color-text-muted] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p class="text-2xl font-bold mb-1">{{ modulesAvailableCount ?? '-' }}</p>
                    <p class="text-[--color-text-muted] text-sm">{{ $t('opsiModules') }}</p>
                    <div v-if="obsoleteModulesCount > 0" class="mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-1.5 mb-1">
                            <UIcon :name="icons.warning" class="w-3.5 h-3.5 text-amber-500" />
                            <span class="text-xs font-medium text-amber-600 dark:text-amber-400">{{ obsoleteModulesCount }} {{ $t('obsolete') }}</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                            <span v-for="mod in sharedObsoleteModules.slice(0, 3)" :key="mod"
                                class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-mono">
                                {{ mod }}
                            </span>
                            <span v-if="sharedObsoleteModules.length > 3"
                                class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-[--color-text-muted]">
                                +{{ sharedObsoleteModules.length - 3 }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Row 4: Failed Clients -->
            <div class="bg-white dark:bg-[--color-surface] rounded-2xl shadow-sm dark:shadow-none p-4 shrink-0">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                        <UIcon :name="icons.warning" class="w-4 h-4 text-red-500" />
                    </div>
                    <h3 class="text-sm font-semibold">{{ $t('failedClients') }}</h3>
                    <UBadge v-if="failedClients && Object.keys(failedClients).length > 0" color="error" variant="subtle" size="sm">
                        {{ Object.keys(failedClients).length }}
                    </UBadge>
                </div>
                <div v-if="failedClients && Object.keys(failedClients).length > 0"
                    class="space-y-1 max-h-32 overflow-y-auto">
                    <div v-for="(products, clientId) in failedClients" :key="clientId"
                        class="flex items-center justify-between p-1.5 rounded-lg bg-red-50 dark:bg-red-900/15 text-sm">
                        <span class="font-mono truncate text-xs">{{ clientId }}</span>
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
const { getDiagnosticData, getUserConfiguration } = useApiHelpers()
const {
    data: sharedDiagData,
    healthCounts: sharedHealthCounts,
    fetchDiagnostics: fetchSharedDiag,
    refresh: refreshDiag,
    modules: sharedModules,
    modulesDetailed: sharedModulesDetailed,
    obsoleteModules: sharedObsoleteModules,
    licenseClientNumbers: sharedClientNumbers,
} = useDiagnosticsData()

const loading = ref(false)

const diagnosticData = computed(() => sharedDiagData.value)

const userConfigResponse = ref<{ user: string } | null>(null)
const userConfigData = ref<{
    read_only: boolean
    server_write_access: boolean
    depot_access: boolean
    host_group_access: boolean
    product_group_access: boolean
    client_creation: boolean
} | null>(null)
const healthCounts = sharedHealthCounts

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

async function fetchDiagnosticData() {
    await fetchSharedDiag()
}

async function fetchUserConfig() {
    const { data } = await getUserConfiguration()
    if (data) {
        userConfigResponse.value = { user: data.user }
        if (data.configuration) {
            userConfigData.value = {
                read_only: data.configuration.read_only ?? false,
                server_write_access: data.configuration.server_write_access ?? false,
                depot_access: data.configuration.depot_access ?? false,
                host_group_access: data.configuration.host_group_access ?? false,
                product_group_access: data.configuration.product_group_access ?? false,
                client_creation: data.configuration.client_creation ?? true,
            }
            // Store user configuration globally for access controls
            userStore.setUserConfiguration(data.configuration)
        }
    }
}

async function refreshAll() {
    loading.value = true
    try {
        await Promise.all([
            refreshDiag(),
            fetchUserConfig(),
        ])
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    refreshAll()
})
</script>
