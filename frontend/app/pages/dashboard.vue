<template>
    <LayoutsPageLayout :show-search="false" :show-refresh="true" :loading="loading" @refresh="refreshAll">
        <div class="h-full flex flex-col min-h-0 overflow-y-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 shrink-0">
                <!-- <div class="flex flex-col gap-3"> -->
                <DashboardInfoCard :icon="icons.serverStack" :label="$t('configServer')"
                    :value="serverInfo?.hostname" />
                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-3 cursor-pointer"
                    @click="navigateTo('/admin/diagnostics/healthcheck')">
                    <div class="flex items-center gap-2 mb-2">
                        <UIcon :name="icons.diagnostics" class="w-4 h-4" />
                        <span class="text-sm font-semibold">{{ $t('healthCheck') }}</span>
                        <UIcon :name="icons.arrowRight" class="ml-auto w-3 h-3 text-[--color-text-muted]" />
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
                <!-- </div> -->

                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-3 lg:col-span-2">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-opsi-blue/10">
                            <UIcon :name="icons.user" class="w-4 h-4" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[10px] text-[--color-text-muted] uppercase tracking-wide">{{
                                $t('currentUser') }}</p>
                            <p class="font-semibold text-sm truncate">{{ userConfigResponse?.user || userStore.username
                                || '-' }}</p>
                        </div>
                        <UBadge v-if="userConfigData?.read_only" color="warning" variant="subtle" size="xs"
                            class="shrink-0">
                            {{ $t('readOnlyMode') }}
                        </UBadge>
                    </div>
                    <div v-if="userConfigData" class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[10px] mt-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted]">{{ $t('readOnly') }}</span>
                            <UBadge :color="userConfigData.read_only ? 'warning' : 'success'" variant="subtle"
                                size="xs">
                                {{ userConfigData.read_only ? $t('yes') : $t('no') }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted]">{{ $t('serverWriteAccess') }}</span>
                            <UBadge :color="userConfigData.server_write_access ? 'success' : 'neutral'" variant="subtle"
                                size="xs">
                                {{ userConfigData.server_write_access ? $t('yes') : $t('no') }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted]">{{ $t('depotAccess') }}</span>
                            <UBadge :color="userConfigData.depot_access ? 'success' : 'neutral'" variant="subtle"
                                size="xs">
                                {{ userConfigData.depot_access ? $t('yes') : $t('no') }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted]">{{ $t('clientCreation') }}</span>
                            <UBadge :color="userConfigData.client_creation ? 'success' : 'neutral'" variant="subtle"
                                size="xs">
                                {{ userConfigData.client_creation ? $t('yes') : $t('no') }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted]">{{ $t('hostGroupAccess') }}</span>
                            <UBadge :color="userConfigData.host_group_access ? 'success' : 'neutral'" variant="subtle"
                                size="xs">
                                {{ userConfigData.host_group_access ? $t('yes') : $t('no') }}
                            </UBadge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[--color-text-muted]">{{ $t('productGroupAccess') }}</span>
                            <UBadge :color="userConfigData.product_group_access ? 'success' : 'neutral'"
                                variant="subtle" size="xs">
                                {{ userConfigData.product_group_access ? $t('yes') : $t('no') }}
                            </UBadge>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 shrink-0">
                <DashboardStatCard :icon="icons.server" :value="stats.totalServers" :label="$t('totalServers')"
                    @click="navigateTo('/servers')" />
                <DashboardStatCard :icon="icons.client" :value="stats.totalClients" :label="$t('totalClients')"
                    :subtitle="selectedServerLabel" @click="navigateTo('/clients')" />

                <DashboardStatCard :icon="icons.product" :value="stats.totalProducts" :label="$t('totalProducts')"
                    @click="navigateTo('/products')">
                    <span class="text-[--color-text-muted]">
                        <span class="font-medium text-[--color-text]">{{ stats.localbootProducts ?? '-' }}</span>
                        {{ $t('localbootProducts') }}
                    </span>
                    <span class="text-[--color-text-muted]">
                        <span class="font-medium text-[--color-text]">{{ stats.netbootProducts ?? '-' }}</span>
                        {{ $t('netbootProducts') }}
                    </span>
                </DashboardStatCard>

                <DashboardStatCard :icon="icons.license" :value="stats.totalModules" :label="$t('modules')"
                    @click="navigateTo('/admin/diagnostics/modules')">
                    <span class="text-emerald-600 dark:text-emerald-400">
                        <span class="font-medium">{{ stats.activeModules ?? '-' }}</span> {{ $t('active') }}
                    </span>
                    <span class="text-red-500">
                        <span class="font-medium">{{ stats.expiredModules ?? '-' }}</span> {{ $t('expired') }}
                    </span>
                </DashboardStatCard>
            </div>

            <div class="grid grid-cols-1 gap-3 mb-3 flex-1 min-h-0">
                <div
                    class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-3 flex flex-col min-h-0">
                    <div class="flex items-center justify-between mb-2 shrink-0">
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.clientReachable" class="w-4 h-4 text-emerald-500" />
                            <h3 class="text-sm font-semibold">{{ $t('clients') }} — {{ $t('lastSeen') }} &amp; {{
                                $t('reachable') }}</h3>
                        </div>
                        <div class="flex items-center gap-2">
                            <USelect v-model="selectedServerForClients" :items="serverOptions" size="xs" class="w-40" />
                            <UButton v-if="!loadingReachable" variant="ghost" color="neutral" size="xs"
                                @click="checkAllReachable" :title="$t('checkReachability')">
                                <UIcon :name="icons.refresh" class="w-3.5 h-3.5" />
                            </UButton>
                            <UIcon v-else :name="icons.loading" class="w-3.5 h-3.5 animate-spin" />
                        </div>
                    </div>

                    <div v-if="lastSeenStats || reachableClients.length > 0 || unreachableCount > 0"
                        class="flex flex-col min-h-0 flex-1">
                        <div class="shrink-0 space-y-2 mb-2">
                            <div v-if="lastSeenStats" class="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                    <p class="text-[10px] text-[--color-text-muted]">{{ $t('last24Hours') }}</p>
                                    <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{
                                        lastSeenStats.last24h }}</p>
                                </div>
                                <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <p class="text-[10px] text-[--color-text-muted]">{{ $t('last7Days') }}</p>
                                    <p class="text-xl font-bold text-blue-600 dark:text-blue-400">{{
                                        lastSeenStats.last7d }}</p>
                                </div>
                                <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                    <p class="text-[10px] text-[--color-text-muted]">{{ $t('last30Days') }}</p>
                                    <p class="text-xl font-bold text-amber-600 dark:text-amber-400">{{
                                        lastSeenStats.last30d }}</p>
                                </div>
                                <div class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <p class="text-[10px] text-[--color-text-muted]">{{ $t('olderOrNever') }}</p>
                                    <p class="text-xl font-bold text-[--color-text-muted]">{{ lastSeenStats.older }}</p>
                                </div>
                            </div>
                            <div v-if="reachableClients.length > 0 || unreachableCount > 0"
                                class="flex items-center gap-4 text-sm">
                                <span class="text-emerald-600 dark:text-emerald-400">
                                    <span class="font-bold text-xl">{{ reachableClients.length }}</span>
                                    <span class="ml-1 text-xs">{{ $t('reachable') }}</span>
                                </span>
                                <span class="text-[--color-text-muted]">
                                    <span class="font-bold text-xl">{{ unreachableCount }}</span>
                                    <span class="ml-1 text-xs">{{ $t('unreachable') }}</span>
                                </span>
                            </div>
                        </div>

                        <div class="flex-1 min-h-0 overflow-y-auto space-y-0.5">
                            <div v-for="client in filteredClientsForServer" :key="client.clientId"
                                class="flex items-center justify-between p-1.5 rounded text-[10px]" :class="reachabilityMap[client.clientId] === true
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                    : reachabilityMap[client.clientId] === false
                                        ? 'bg-gray-50 dark:bg-gray-800/50'
                                        : 'bg-gray-50 dark:bg-gray-800/50'">
                                <span class="font-mono truncate">{{ client.clientId }}</span>
                                <div class="flex items-center gap-2 shrink-0">
                                    <span class="text-[--color-text-muted]">{{ formatLastSeen(client.lastSeen) }}</span>
                                    <UIcon v-if="reachabilityMap[client.clientId] === true" :name="icons.checkCircle"
                                        class="w-3.5 h-3.5 text-emerald-500" />
                                    <UIcon v-else-if="reachabilityMap[client.clientId] === false" :name="icons.close"
                                        class="w-3.5 h-3.5 text-red-400" />
                                </div>
                            </div>
                            <div v-if="filteredClientsForServer.length === 0"
                                class="text-xs text-[--color-text-muted] text-center py-2">
                                {{ $t('noClients') }}
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-xs text-[--color-text-muted] py-4 text-center">
                        {{ loading ? $t('loading') : $t('noDataAvailable') }}
                    </div>
                </div>
            </div>

            <div v-if="Object.keys(blockedClientsMap).length > 0 || Object.keys(lockedProductsMap).length > 0"
                class="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
                <div v-if="Object.keys(blockedClientsMap).length > 0"
                    class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-3">
                    <div class="flex items-center gap-2 mb-2">
                        <UIcon :name="icons.blocked" class="w-4 h-4 text-red-500" />
                        <h3 class="text-sm font-semibold">{{ $t('blockedClients') }}</h3>
                        <UBadge color="error" variant="subtle" size="xs">{{ Object.keys(blockedClientsMap).length }}
                        </UBadge>
                    </div>
                    <div class="space-y-0.5 max-h-24 overflow-y-auto">
                        <div v-for="(reason, clientId) in blockedClientsMap" :key="clientId"
                            class="flex items-center justify-between p-1 rounded bg-red-50 dark:bg-red-900/20 text-[10px]">
                            <span class="font-mono truncate">{{ clientId }}</span>
                            <span class="text-[--color-text-muted] ml-2 shrink-0">{{ reason }}</span>
                        </div>
                    </div>
                </div>
                <div v-if="Object.keys(lockedProductsMap).length > 0"
                    class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-3">
                    <div class="flex items-center gap-2 mb-2">
                        <UIcon :name="icons.locked" class="w-4 h-4 text-amber-500" />
                        <h3 class="text-sm font-semibold">{{ $t('lockedProducts') }}</h3>
                        <UBadge color="warning" variant="subtle" size="xs">{{ Object.keys(lockedProductsMap).length }}
                        </UBadge>
                    </div>
                    <div class="space-y-0.5 max-h-24 overflow-y-auto">
                        <div v-for="(reason, productId) in lockedProductsMap" :key="productId"
                            class="flex items-center justify-between p-1 rounded bg-amber-50 dark:bg-amber-900/20 text-[10px]">
                            <span class="font-mono truncate">{{ productId }}</span>
                            <span class="text-[--color-text-muted] ml-2 shrink-0">{{ reason }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'
import { useUserStore } from '~/stores/userStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const selectionStore = useSelectionStore()
const userStore = useUserStore()
const { getServerInfo, getClients, getServers, getProductCount, getBlockedClients, getLockedProducts, checkClientReachable, getModulesContent, getUserConfiguration } = useApiHelpers()

const loading = ref(false)
const loadingReachable = ref(false)

const serverInfo = ref<{ hostname: string } | null>(null)

const stats = reactive({
    totalClients: null as number | null,
    totalServers: null as number | null,
    totalProducts: null as number | null,
    localbootProducts: null as number | null,
    netbootProducts: null as number | null,
    totalModules: null as number | null,
    activeModules: null as number | null,
    expiredModules: null as number | null,
})

const blockedClientsMap = ref<Record<string, string>>({})
const lockedProductsMap = ref<Record<string, string>>({})
const allClients = ref<Array<{ clientId: string; lastSeen: string; depotId: string }>>([])
const allServers = ref<Array<{ depotId: string }>>([])
const reachableClients = ref<string[]>([])
const unreachableCount = ref(0)
const reachabilityMap = ref<Record<string, boolean>>({})
const selectedServerForClients = ref('all')

const userConfigResponse = ref<{ user: string } | null>(null)
const userConfigData = ref<{
    read_only: boolean
    server_write_access: boolean
    depot_access: boolean
    host_group_access: boolean
    product_group_access: boolean
    client_creation: boolean
} | null>(null)
const healthCounts = ref<{ ok: number; warning: number; error: number } | null>(null)

const selectedServerLabel = computed(() => {
    const servers = selectionStore.selectedServers
    if (servers.length === 0 || servers.length === allServers.value.length) return ''
    return servers.length === 1 ? servers[0] : `${servers.length} ${$t('servers')}`
})

const serverOptions = computed(() => [
    { value: 'all', label: String($t('allServers')) },
    ...allServers.value.map(d => ({ value: d.depotId, label: d.depotId }))
])

function formatLastSeen(lastSeen: string): string {
    if (!lastSeen || lastSeen === 'None' || lastSeen === 'null') return String($t('unknown'))
    try {
        const date = new Date(lastSeen.replace(' ', 'T'))
        if (isNaN(date.getTime())) return lastSeen || String($t('unknown'))
        return date.toLocaleString()
    } catch {
        return lastSeen || String($t('unknown'))
    }
}

const lastSeenStats = computed(() => {
    if (!allClients.value.length) return null
    const now = new Date()
    const day = 24 * 60 * 60 * 1000
    const filteredClients = selectedServerForClients.value === 'all'
        ? allClients.value
        : allClients.value.filter(c => c.depotId === selectedServerForClients.value)
    let last24h = 0, last7d = 0, last30d = 0, older = 0
    for (const client of filteredClients) {
        if (!client.lastSeen || client.lastSeen === 'None' || client.lastSeen === 'null') { older++; continue }
        const lastSeen = new Date(client.lastSeen.replace(' ', 'T'))
        if (isNaN(lastSeen.getTime())) { older++; continue }
        const diff = now.getTime() - lastSeen.getTime()
        if (diff <= day) last24h++
        else if (diff <= 7 * day) last7d++
        else if (diff <= 30 * day) last30d++
        else older++
    }
    return { last24h, last7d, last30d, older }
})

const filteredClientsForServer = computed(() =>
    selectedServerForClients.value === 'all'
        ? allClients.value
        : allClients.value.filter(c => c.depotId === selectedServerForClients.value)
)

async function fetchServerInfo() {
    const { data } = await getServerInfo()
    if (data) {
        const rawData = data as unknown
        const serverId = typeof rawData === 'string' ? rawData : (rawData as Record<string, unknown>)?.result as string
        if (serverId) serverInfo.value = { hostname: serverId }
    }
}

async function fetchStats() {
    const selectedDepots = selectionStore.selectedServers
    const depotParams = selectedDepots.length > 0 ? { selectedDepots: `[${selectedDepots.join(',')}]` } : {}

    // Fetch clients, servers, and modules first
    const [clientsRes, depotsRes, modulesRes] = await Promise.all([
        getClients(depotParams),
        getServers(),
        getModulesContent(),
    ])
    if (clientsRes.data) {
        const rawClients = clientsRes.data as Array<Record<string, unknown>>
        allClients.value = rawClients.map(c => ({
            clientId: String(c.clientId || c.hostId || ''),
            lastSeen: String(c.lastSeen || c.last_seen || ''),
            depotId: String(c.depotId || c.depot_id || ''),
        }))
        stats.totalClients = clientsRes.total ?? allClients.value.length
    }
    if (depotsRes.data) {
        allServers.value = depotsRes.data as Array<{ depotId: string }>
        stats.totalServers = depotsRes.total ?? depotsRes.data.length
    }

    // Use selected depots or all known depots for product count
    const depotList = selectedDepots.length > 0
        ? selectedDepots
        : allServers.value.map(s => s.depotId)
    if (depotList.length > 0) {
        const [localbootCountRes, netbootCountRes] = await Promise.all([
            getProductCount('LocalbootProduct', depotList),
            getProductCount('NetbootProduct', depotList),
        ])
        const localCount = typeof localbootCountRes.data === 'number' ? localbootCountRes.data : 0
        const netCount = typeof netbootCountRes.data === 'number' ? netbootCountRes.data : 0
        stats.localbootProducts = localCount
        stats.netbootProducts = netCount
        stats.totalProducts = localCount + netCount
    }
    if (modulesRes.data) {
        const rawResult = modulesRes.data as Record<string, unknown>
        const modules = (rawResult.result || rawResult) as Array<Record<string, unknown>> | string[]
        if (Array.isArray(modules)) {
            stats.totalModules = modules.length
            // Count active vs expired based on module state
            let active = 0
            let expired = 0
            for (const mod of modules) {
                if (typeof mod === 'object' && mod !== null) {
                    const state = (mod.state || mod.status || '') as string
                    if (state === 'expired' || state === 'disabled') expired++
                    else active++
                } else {
                    active++ // Simple string modules are active
                }
            }
            stats.activeModules = active
            stats.expiredModules = expired
        }
    }
}

async function fetchBlockedClients() {
    const { data } = await getBlockedClients()
    if (data) blockedClientsMap.value = data as Record<string, string>
}

async function fetchLockedProducts() {
    const { data } = await getLockedProducts()
    if (data) lockedProductsMap.value = data as Record<string, string>
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
            if (data.configuration.health?.counts) {
                healthCounts.value = {
                    ok: data.configuration.health.counts.ok ?? 0,
                    warning: data.configuration.health.counts.warning ?? 0,
                    error: data.configuration.health.counts.error ?? 0,
                }
            }
        }
    }
}

async function checkAllReachable() {
    const clientPool = filteredClientsForServer.value
    if (!clientPool.length) return
    loadingReachable.value = true
    try {
        const clientIds = clientPool.map(c => c.clientId).slice(0, 100)
        const result = await checkClientReachable(clientIds)
        if (result.data) {
            const reachableData = result.data as Record<string, boolean>
            reachabilityMap.value = { ...reachabilityMap.value, ...reachableData }
            reachableClients.value = Object.entries(reachableData)
                .filter(([, isReachable]) => isReachable)
                .map(([clientId]) => clientId)
            unreachableCount.value = Object.keys(reachableData).length - reachableClients.value.length
        }
    } finally {
        loadingReachable.value = false
    }
}

async function refreshAll() {
    loading.value = true
    try {
        await Promise.all([
            fetchServerInfo(),
            fetchStats(),
            fetchBlockedClients(),
            fetchLockedProducts(),
            fetchUserConfig(),
        ])
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    refreshAll()
})

watch(selectedServerForClients, () => {
    reachableClients.value = []
    unreachableCount.value = 0
    reachabilityMap.value = {}
})
</script>
