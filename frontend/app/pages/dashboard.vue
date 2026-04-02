<template>
    <LayoutsPageLayout :show-search="false" :show-refresh="true" :loading="loading" @refresh="refreshAll">
        <div class="h-full flex flex-col min-h-0 overflow-y-auto gap-4">
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 shrink-0">
                <DashboardInfoCard :icon="icons.serverStack" :label="$t('configServer')" :value="serverHostname" />
                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4 cursor-pointer hover:shadow-md transition-all"
                    @click="navigateTo('/admin/diagnostics/healthcheck')">
                    <div class="flex items-center gap-2 mb-4">
                        <UIcon :name="icons.health" class="w-5 h-5" />
                        <span class="text-sm font-semibold">{{ $t('healthCheck') }}</span>
                        <UIcon :name="icons.chevronRight" class="ml-auto w-3 h-3 text-[--color-text-muted]" />
                    </div>
                    <div v-if="healthCounts" class="flex items-center gap-2">
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

                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4 lg:col-span-2">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-opsi-blue/10">
                            <UIcon :name="icons.user" class="w-5 h-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-[--color-text-muted] uppercase tracking-wide">{{
                                $t('currentUser') }}</p>
                            <p class="font-semibold truncate">{{ userConfigResponse?.user || userStore.username
                                || '-' }}</p>
                        </div>
                        <UBadge v-if="userConfigData?.read_only" color="warning" variant="subtle" size="sm"
                            class="shrink-0">
                            {{ $t('readOnlyMode') }}
                        </UBadge>
                    </div>
                    <div v-if="userConfigData" class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs mt-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted] font-mono">read_only</span>
                            <UBadge :color="userConfigData.read_only ? 'warning' : 'success'" variant="subtle"
                                size="sm">
                                {{ userConfigData.read_only }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted] font-mono">server_write_access</span>
                            <UBadge :color="userConfigData.server_write_access ? 'success' : 'neutral'" variant="subtle"
                                size="sm">
                                {{ userConfigData.server_write_access }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted] font-mono">depot_access</span>
                            <UBadge :color="userConfigData.depot_access ? 'success' : 'neutral'" variant="subtle"
                                size="sm">
                                {{ userConfigData.depot_access }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted] font-mono">client_creation</span>
                            <UBadge :color="userConfigData.client_creation ? 'success' : 'neutral'" variant="subtle"
                                size="sm">
                                {{ userConfigData.client_creation }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted] font-mono">host_group_access</span>
                            <UBadge :color="userConfigData.host_group_access ? 'success' : 'neutral'" variant="subtle"
                                size="sm">
                                {{ userConfigData.host_group_access }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted] font-mono">product_group_access</span>
                            <UBadge :color="userConfigData.product_group_access ? 'success' : 'neutral'"
                                variant="subtle" size="sm">
                                {{ userConfigData.product_group_access }}
                            </UBadge>
                        </div>
                    </div>
                </div>
            </div>



            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <UIcon :name="icons.server" class="w-5 h-5" />
                        <h3 class="text-sm font-semibold">{{ $t('systemInfo') }}</h3>
                    </div>
                    <div v-if="diagnosticData" class="space-y-1.5 text-sm">
                        <div class="flex justify-between">
                            <span class="text-[--color-text-muted] font-mono">opsiconfd_version</span>
                            <span class="font-medium truncate ml-2">{{ diagnosticData.opsiconfd_version }}</span>
                        </div>
                        <div v-if="diagnosticData.system" class="flex justify-between">
                            <span class="text-[--color-text-muted] font-mono">system.product_name</span>
                            <span class="font-medium truncate ml-2">{{ (diagnosticData.system as Record<string, unknown>
                            ).product_name }}</span>
                        </div>
                        <div v-if="diagnosticData.os_release" class="flex justify-between">
                            <span class="text-[--color-text-muted] font-mono">os_release</span>
                            <span class="font-medium truncate ml-2">{{ (diagnosticData.os_release as Record<string,
                                unknown>).PRETTY_NAME }}</span>
                        </div>
                        <div v-if="diagnosticData.memory" class="flex justify-between">
                            <span class="text-[--color-text-muted] font-mono">memory</span>
                            <span class="font-medium">{{ (diagnosticData.memory as Record<string, unknown>).total_human
                            }} ({{ (diagnosticData.memory as Record<string, unknown>).used_percent }}%
                                        used)</span>
                        </div>
                        <div v-if="diagnosticData.processor" class="flex justify-between">
                            <span class="text-[--color-text-muted] font-mono">cpu</span>
                            <span class="font-medium truncate ml-2">{{ (diagnosticData.processor as Record<string,
                                unknown>).cpu_count }} cores</span>
                        </div>
                    </div>
                    <p v-else class="text-xs text-[--color-text-muted]">{{ $t('loading') }}</p>
                </div>
                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <UIcon :name="icons.client" class="w-5 h-5" />
                        <h3 class="text-sm font-semibold">{{ $t('clients') }}</h3>
                    </div>
                    <div v-if="licenseClientNumbers" class="space-y-1.5 text-sm">
                        <div class="flex justify-between items-center">
                            <span class="text-[--color-text-muted] font-mono">{{ $t('active') }}</span>
                            <UBadge color="success" variant="subtle">{{ licenseClientNumbers.all }}
                            </UBadge>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[--color-text-muted] font-mono">Windows</span>
                            <UBadge color="primary" variant="subtle">{{ licenseClientNumbers.windows }}
                            </UBadge>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[--color-text-muted] font-mono">Linux</span>
                            <UBadge color="primary" variant="subtle">{{ licenseClientNumbers.linux }}</UBadge>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[--color-text-muted] font-mono">macOS</span>
                            <UBadge color="primary" variant="subtle">{{ licenseClientNumbers.macos }}</UBadge>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[--color-text-muted] font-mono">{{ $t('inactive') }}</span>
                            <UBadge color="error" variant="subtle">{{ licenseClientNumbers.inactive }}
                            </UBadge>
                        </div>
                    </div>
                    <p v-else class="text-xs text-[--color-text-muted]">{{ $t('loading') }}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <DashboardStatCard :icon="icons.server" :value="depotCount" :label="$t('totalServers')"
                    @click="navigateTo('/servers')" />
                <DashboardStatCard :icon="icons.client" :value="clientCount" :label="$t('totalClients')"
                    @click="navigateTo('/clients')">
                </DashboardStatCard>

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

                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4 cursor-pointer hover:shadow-md transition-all"
                    @click="navigateTo('/admin/diagnostics/modules')">
                    <div class="flex items-center justify-between mb-2">
                        <img :src="opsiLogoSrc" alt="opsi" class="w-5 h-5" />
                        <UIcon :name="icons.chevronRight" class="w-3 h-3 text-[--color-text-muted]" />
                    </div>
                    <p class="text-2xl font-bold mb-2">{{ modulesAvailableCount ?? '-' }}</p>
                    <p class="text-[--color-text-muted]">{{ $t('opsiModules') }}</p>
                    <div v-if="obsoleteModulesCount > 0" class="mt-2 gap-3 text-sm">
                        <UTooltip :text="obsoleteModulesTooltip">
                            <span class=" text-amber-600 dark:text-amber-400 cursor-help">{{
                                obsoleteModulesCount }}</span>
                            <span class="text-[--color-text-muted] ml-1 text-xs"> {{ $t('obsolete') }}</span>
                        </UTooltip>
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4">
                <div class="flex items-center gap-2 mb-2">
                    <UIcon :name="icons.warning" class="w-5 h-5 text-red-500" />
                    <h3 class="text-sm font-semibold">{{ $t('failedClients') }}</h3>
                </div>
                <div v-if="failedClients && Object.keys(failedClients).length > 0"
                    class="space-y-0.5 max-h-40 overflow-y-auto">
                    <div v-for="(products, clientId) in failedClients" :key="clientId"
                        class="flex items-center justify-between p-1.5 rounded bg-red-50 dark:bg-red-900/20 text-sm">
                        <span class="font-mono truncate">{{ clientId }}</span>
                        <span class="text-[--color-text-muted] ml-2 shrink-0">{{ Array.isArray(products) ?
                            products.join(', ') : products }}</span>
                    </div>
                </div>
                <p v-else class="text-xs text-[--color-text-muted]">{{ $t('noFailedClients') }}</p>
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
const { data: sharedDiagData, healthCounts: sharedHealthCounts, fetchDiagnostics: fetchSharedDiag, refresh: refreshDiag } = useDiagnosticsData()

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

const modulesAvailableCount = computed(() => {
    if (!diagnosticData.value) return null
    const licenses = diagnosticData.value.licenses as Record<string, unknown> | undefined
    if (!licenses?.modules) return null
    const modules = licenses.modules as Record<string, { available: boolean }>
    return Object.values(modules).filter(m => m.available).length
})

const obsoleteModules = computed(() => {
    if (!diagnosticData.value) return []
    const licenses = diagnosticData.value.licenses as Record<string, unknown> | undefined
    return (licenses?.obsolete_modules as string[]) || []
})

const obsoleteModulesCount = computed(() => obsoleteModules.value.length)

const obsoleteModulesTooltip = computed(() => {
    if (obsoleteModules.value.length === 0) return ''
    return `${$t('obsoleteModules')}: ${obsoleteModules.value.join(', ')}`
})

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

const licenseClientNumbers = computed(() => {
    if (!diagnosticData.value) return null
    const licenses = diagnosticData.value.licenses as Record<string, unknown> | undefined
    if (!licenses?.client_numbers) return null
    return licenses.client_numbers as { macos: number; linux: number; windows: number; inactive: number; all: number }
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
