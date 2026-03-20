<template>
    <LayoutsPageLayout :show-search="false" :show-refresh="true" :loading="loading" @refresh="refreshAll">
        <div class="space-y-6">
            <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none  p-4">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-lg bg-opsi-blue/10 flex items-center justify-center">
                        <UIcon :name="icons.serverStack" class="w-5 h-5 text-opsi-blue" />
                    </div>
                    <div>
                        <p class="text-xs text-[--color-text-muted] uppercase tracking-wide">{{ $t('configServer') }}
                        </p>
                        <p class="font-semibold text-lg" :title="serverInfo?.hostname">{{ serverInfo?.hostname || '-' }}
                        </p>
                    </div>
                </div>

            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4 cursor-pointer hover:shadow-md dark:hover:border-opsi-blue/50 transition-all"
                    @click="navigateTo('/servers')">
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center">
                            <UIcon :name="icons.serverStack" class="w-5 h-5" />
                        </div>
                        <UIcon :name="icons.arrowRight" class="w-4 h-4 text-[--color-text-muted]" />
                    </div>
                    <p class="text-3xl font-bold">{{ stats.totalServers ?? '-' }}</p>
                    <p class="text-sm text-[--color-text-muted]">{{ $t('totalServers') }}</p>
                </div>

                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none  p-4 cursor-pointer hover:shadow-md dark:hover:border-opsi-blue/50 transition-all"
                    @click="navigateTo('/clients')">
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-10 h-10 rounded-lg  flex items-center justify-center">
                            <UIcon :name="icons.client" class="w-5 h-5" />
                        </div>
                        <UIcon :name="icons.arrowRight" class="w-4 h-4 text-[--color-text-muted]" />
                    </div>
                    <p class="text-3xl font-bold">{{ stats.totalClients ?? '-' }}</p>
                    <p class="text-sm text-[--color-text-muted]">{{ $t('totalClients') }}</p>
                </div>

                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4 cursor-pointer hover:shadow-md dark:hover:border-opsi-blue/50 transition-all"
                    @click="navigateTo('/products')">
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-10 h-10 rounded-lg  flex items-center justify-center">
                            <UIcon :name="icons.product" class="w-5 h-5 " />
                        </div>
                        <UIcon :name="icons.arrowRight" class="w-4 h-4 text-[--color-text-muted]" />
                    </div>
                    <div class="flex items-baseline gap-2">
                        <p class="text-3xl font-bold">{{ stats.totalProducts ?? '-' }}</p>
                        <p class="text-sm text-[--color-text-muted]">{{ $t('totalProducts') }}</p>
                    </div>
                    <div class="mt-2 flex gap-4 text-xs">
                        <span class="text-[--color-text-muted]">
                            <span class="font-medium text-[--color-text]">{{ stats.localbootProducts ?? '-' }}</span>
                            Localboot
                        </span>
                        <span class="text-[--color-text-muted]">
                            <span class="font-medium text-[--color-text]">{{ stats.netbootProducts ?? '-' }}</span>
                            Netboot
                        </span>
                    </div>
                </div>

                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none  p-4 cursor-pointer hover:shadow-md dark:hover:border-opsi-blue/50 transition-all"
                    @click="navigateTo('/admin/modules')">
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center">
                            <UIcon :name="icons.license" class="w-5 h-5 " />
                        </div>
                        <UIcon :name="icons.arrowRight" class="w-4 h-4 text-[--color-text-muted]" />
                    </div>
                    <p class="text-3xl font-bold">{{ stats.totalModules ?? '-' }}</p>
                    <p class="text-sm text-[--color-text-muted]">{{ $t('modules') }}</p>
                    <div class="mt-2 flex gap-4 text-xs">
                        <span class="text-emerald-600 dark:text-emerald-400">
                            <span class="font-medium">{{ stats.activeModules ?? '-' }}</span> {{ $t('active') }}
                        </span>
                        <span class="text-red-500">
                            <span class="font-medium">{{ stats.expiredModules ?? '-' }}</span> {{ $t('expired') }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none  p-4">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.clientReachable" class="w-5 h-5 text-emerald-500" />
                            <h3 class="font-semibold">{{ $t('reachable') }} {{ $t('clients') }}</h3>
                        </div>
                        <UButton v-if="!loadingReachable" variant="ghost" color="neutral" size="xs"
                            @click="checkAllReachable">
                            <UIcon :name="icons.refresh" class="w-4 h-4" />
                        </UButton>
                        <UIcon v-else :name="icons.loading" class="w-4 h-4 animate-spin" />
                    </div>
                    <div v-if="reachableClients.length > 0 || unreachableCount > 0" class="space-y-3">
                        <div class="flex items-center gap-4 text-sm">
                            <span class="text-emerald-600 dark:text-emerald-400">
                                <span class="font-bold text-2xl">{{ reachableClients.length }}</span>
                                <span class="ml-1">{{ $t('reachable') }}</span>
                            </span>
                            <span class="text-[--color-text-muted]">
                                <span class="font-bold text-2xl">{{ unreachableCount }}</span>
                                <span class="ml-1">Unreachable</span>
                            </span>
                        </div>
                        <div v-if="reachableClients.length > 0" class="max-h-40 overflow-y-auto space-y-1">
                            <div v-for="client in reachableClients.slice(0, 20)" :key="client"
                                class="flex items-center justify-between p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 text-sm">
                                <span class="font-mono text-xs truncate">{{ client }}</span>
                                <UIcon :name="icons.checkCircle" class="w-4 h-4 text-emerald-500 shrink-0" />
                            </div>
                            <p v-if="reachableClients.length > 20"
                                class="text-xs text-[--color-text-muted] text-center pt-2">
                                {{ $t('countMore', { count: reachableClients.length - 20 }) }}
                            </p>
                        </div>
                    </div>
                    <div v-else class="text-sm text-[--color-text-muted] py-4 text-center">
                        {{ loadingReachable ? $t('loading') : 'Click refresh to check client reachability' }}
                    </div>
                </div>

                <div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-4">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <UIcon :name="icons.calendar" class="w-5 h-5 text-blue-500" />
                            <h3 class="font-semibold">{{ $t('clients') }} {{ $t('lastSeen') }}</h3>
                        </div>
                        <USelect v-model="selectedServerForLastSeen" :items="serverOptions" size="xs" class="w-48" />
                    </div>
                    <div v-if="lastSeenStats" class="space-y-2">
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                <p class="text-xs text-[--color-text-muted]">Last 24 hours</p>
                                <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{
                                    lastSeenStats.last24h }}</p>
                            </div>
                            <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <p class="text-xs text-[--color-text-muted]">Last 7 days</p>
                                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ lastSeenStats.last7d
                                    }}</p>
                            </div>
                            <div class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                <p class="text-xs text-[--color-text-muted]">Last 30 days</p>
                                <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{
                                    lastSeenStats.last30d }}</p>
                            </div>
                            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <p class="text-xs text-[--color-text-muted]">Older / Never</p>
                                <p class="text-2xl font-bold text-[--color-text-muted]">{{ lastSeenStats.older }}</p>
                            </div>
                        </div>
                        <div class="mt-4">
                            <h4 class="text-xs font-semibold text-[--color-text-muted] mb-2">
                                {{ $t('clients') }} ({{ selectedServerForLastSeen === 'all' ? $t('allServers') :
                                    selectedServerForLastSeen }})
                            </h4>
                            <div v-if="filteredClientsForServer.length > 0" class="max-h-40 overflow-y-auto space-y-1">
                                <div v-for="client in filteredClientsForServer.slice(0, 20)" :key="client.clientId"
                                    class="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50 text-xs">
                                    <span class="font-mono truncate">{{ client.clientId }}</span>
                                    <span class="text-[--color-text-muted]">{{ client.lastSeen ? new
                                        Date(client.lastSeen).toLocaleString() : 'Never' }}</span>
                                </div>
                                <p v-if="filteredClientsForServer.length > 20"
                                    class="text-xs text-[--color-text-muted] text-center pt-2">
                                    {{ $t('countMore', { count: filteredClientsForServer.length - 20 }) }}
                                </p>
                            </div>
                            <div v-else class="text-xs text-[--color-text-muted] text-center py-2">
                                {{ $t('noClients') }}
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-sm text-[--color-text-muted] py-4 text-center">
                        {{ loading ? $t('loading') : $t('noDataAvailable') }}
                    </div>
                </div>
            </div>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { getServerInfo, getHealthcheck, getClients, getServers, getProducts, getBlockedClients, getLockedProducts, checkClientReachable, getModulesContent } = useApiHelpers()

const loading = ref(false)
const loadingHealth = ref(false)
const loadingReachable = ref(false)

const serverInfo = ref<{
    opsiVersion: string
    hostname: string
    pythonVersion: string
    uptime: number
    os: string
    computerName: string
    ip: string
} | null>(null)

const healthChecks = ref<Array<{
    check_id: string
    check_name: string
    check_status: 'ok' | 'warning' | 'error'
    check_description: string
    message: string
}>>([])

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
const selectedServerForLastSeen = ref('all')

const serverOptions = computed(() => [
    { value: 'all', label: $t('allServers') },
    ...allServers.value.map(d => ({ value: d.depotId, label: d.depotId }))
])

const lastSeenStats = computed(() => {
    if (!allClients.value.length) return null

    const now = new Date()
    const day = 24 * 60 * 60 * 1000

    const filteredClients = selectedServerForLastSeen.value === 'all'
        ? allClients.value
        : allClients.value.filter(c => c.depotId === selectedServerForLastSeen.value)

    let last24h = 0, last7d = 0, last30d = 0, older = 0

    for (const client of filteredClients) {
        if (!client.lastSeen) {
            older++
            continue
        }
        const lastSeen = new Date(client.lastSeen)
        const diff = now.getTime() - lastSeen.getTime()

        if (diff <= day) last24h++
        else if (diff <= 7 * day) last7d++
        else if (diff <= 30 * day) last30d++
        else older++
    }

    return { last24h, last7d, last30d, older }
})


const filteredClientsForServer = computed(() =>
    selectedServerForLastSeen.value === 'all'
        ? allClients.value
        : allClients.value.filter(c => c.depotId === selectedServerForLastSeen.value)
)
async function fetchServerInfo() {
    const { data } = await getServerInfo()
    if (data) {
        serverInfo.value = data as typeof serverInfo.value
    }
}

async function fetchHealthChecks() {
    loadingHealth.value = true
    try {
        const { data } = await getHealthcheck()
        if (data) {
            healthChecks.value = data
        }
    } finally {
        loadingHealth.value = false
    }
}

async function fetchStats() {
    const [clientsRes, depotsRes, productsRes, modulesRes] = await Promise.all([
        getClients(),
        getServers(),
        getProducts(),
        getModulesContent(),
    ])

    if (clientsRes.data) {
        allClients.value = clientsRes.data as Array<{ clientId: string; lastSeen: string; depotId: string }>
        stats.totalClients = clientsRes.data.length
    }

    if (depotsRes.data) {
        allServers.value = depotsRes.data as Array<{ depotId: string }>
        stats.totalServers = depotsRes.data.length
    }

    if (productsRes.data) {
        const products = productsRes.data as Array<{ type: string }>
        stats.totalProducts = products.length
        stats.localbootProducts = products.filter(p => p.type === 'LocalbootProduct').length
        stats.netbootProducts = products.filter(p => p.type === 'NetbootProduct').length
    }

    if (modulesRes.data) {
        const modules = (modulesRes.data as { result: string[] }).result || []
        stats.totalModules = modules.length
        stats.activeModules = modules.length
        stats.expiredModules = 0
    }
}

async function fetchBlockedClients() {
    const { data } = await getBlockedClients()
    if (data) {
        blockedClientsMap.value = data as Record<string, string>
    }
}

async function fetchLockedProducts() {
    const { data } = await getLockedProducts()
    if (data) {
        lockedProductsMap.value = data as Record<string, string>
    }
}

async function checkAllReachable() {
    if (!allClients.value.length) return

    loadingReachable.value = true
    try {
        const clientIds = allClients.value.map(c => c.clientId).slice(0, 100)
        const result = await checkClientReachable(clientIds)
        if (result.data) {
            const reachableData = result.data as Record<string, boolean>
            reachableClients.value = Object.entries(reachableData)
                .filter(([, isReachable]) => isReachable)
                .map(([clientId]) => clientId)
            unreachableCount.value = Object.keys(reachableData).length - reachableClients.value.length
        }
    } catch (e) {
        console.error('Failed to check reachability:', e)
    } finally {
        loadingReachable.value = false
    }
}

async function refreshAll() {
    loading.value = true
    try {
        await Promise.all([
            fetchServerInfo(),
            fetchHealthChecks(),
            fetchStats(),
            fetchBlockedClients(),
            fetchLockedProducts(),
        ])
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    refreshAll()
})
</script>
