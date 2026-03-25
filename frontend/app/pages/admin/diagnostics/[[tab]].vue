Admin Diagnostics Page - Health check, system diagnostics, and modules
<template>
    <LayoutsPageLayout v-model="filter" show-search :search-placeholder="$t('filter')" show-refresh :loading="loading"
        @refresh="refresh(true)">
        <template #tabs>
            <SharedTabsNav v-model="activeTab" :tabs="tabs" />
        </template>
        <template #actions>
            <UButton :icon="icons.copy" variant="soft" color="neutral" size="sm" @click="downloadDiagnostics">{{
                $t('download') }}</UButton>
        </template>

        <template #stats>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button @click="filterByStatus('ok')" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    statusFilter === 'ok' ? 'ring-2 ring-green-500 border-green-500' : 'border-(--color-border) hover:border-green-400',
                    'bg-green-50 dark:bg-green-900/20'
                ]">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.ok }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('passed') }}</div>
                </button>
                <button @click="filterByStatus('warning')" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    statusFilter === 'warning' ? 'ring-2 ring-yellow-500 border-yellow-500' : 'border-(--color-border) hover:border-yellow-400',
                    'bg-yellow-50 dark:bg-yellow-900/20'
                ]">
                    <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.warning }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('warnings') }}</div>
                </button>
                <button @click="filterByStatus('error')" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    statusFilter === 'error' ? 'ring-2 ring-red-500 border-red-500' : 'border-(--color-border) hover:border-red-400',
                    'bg-red-50 dark:bg-red-900/20'
                ]">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.error }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('errors') }}</div>
                </button>
                <button @click="activeTab = 'modules'; statusFilter = ''" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    activeTab === 'modules' && !statusFilter ? 'ring-2 ring-(--color-opsi-blue) border-(--color-opsi-blue)' : 'border-(--color-border) hover:border-(--color-opsi-blue)',
                    'bg-primary-50 dark:bg-primary-900/20'
                ]">
                    <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ modules.length }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('modules') }}</div>
                </button>
            </div>

            <div v-if="statusFilter" class="flex items-center gap-2 mt-3">
                <span class="text-sm text-gray-500">{{ $t('filteringBy') }}:</span>
                <SharedStatusBadge :status="getStatusType(statusFilter)" :label="statusFilter" />
                <UButton variant="ghost" color="neutral" size="xs" :icon="icons.close" @click="statusFilter = ''" />
            </div>
        </template>

        <div class="space-y-4">
            <AdminHealthCheck v-if="activeTab === 'healthcheck'" :filteredHealthData="filteredHealthData"
                :loading="loading" :stats="stats" :statusFilter="statusFilter" :icons="icons" :expanded="expanded"
                @toggleExpand="toggleExpand" @filterByStatus="filterByStatus"
                @clearStatusFilter="() => statusFilter = ''" :getStatusType="getStatusType" />
            <AdminModules v-if="activeTab === 'modules'" :filteredModules="filteredModules" :loading="loading"
                :icons="icons" :modules="modules" :filter="filter" :formatModuleName="formatModuleName" />
            <AdminSystemInfo v-if="activeTab === 'system'" :filteredSystemInfo="filteredSystemInfo"
                :filteredDiagnosticsData="filteredDiagnosticsData" :loading="loading" :icons="icons" :filter="filter"
                :formatKey="formatKey" :formatValue="formatValue" @copyToClipboard="copyToClipboard" />
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface HealthCheckResult {
    check_id?: string
    check_name?: string
    check_status?: string
    check?: { id: string; name: string; status: string; description?: string }
    message?: string
    partial_results?: HealthCheckResult[]
}

interface TreeNode {
    key: string
    name: string
    status: string
    description: string
    message: string
    children?: TreeNode[]
}

const icons = useIcons()
const { t: $t } = useI18n()
const api = useApiHelpers()
const route = useRoute()
const router = useRouter()
const { data: sharedDiagData, fetchDiagnostics: fetchSharedDiag, refresh: refreshSharedDiag } = useDiagnosticsData()

const loading = ref(false)
const filter = ref('')
const statusFilter = ref('')

const validTabs = ['healthcheck', 'modules', 'system'] as const
type TabValue = typeof validTabs[number]

const activeTab = computed({
    get: () => {
        const tab = route.params.tab as string
        return validTabs.includes(tab as TabValue) ? (tab as TabValue) : 'healthcheck'
    },
    set: (value: TabValue) => {
        router.push(`/admin/diagnostics/${value}`)
    }
})

const healthCheckData = ref<HealthCheckResult[]>([])
const diagnosticsData = ref<Record<string, unknown>>({})
const modules = ref<string[]>([])
const expanded = ref<Record<string, boolean>>({})

const tabs = [
    { label: String($t('healthCheck')), value: 'healthcheck' },
    { label: String($t('modules')), value: 'modules' },
    { label: String($t('systemInfo')), value: 'system' },
]

const stats = computed(() => {
    const result = { ok: 0, warning: 0, error: 0 }
    function countStatus(items: HealthCheckResult[]) {
        for (const item of items) {
            const status = item.check_status || item.check?.status
            if (status === 'ok') result.ok++
            else if (status === 'warning') result.warning++
            else if (status === 'error') result.error++
            if (item.partial_results) countStatus(item.partial_results)
        }
    }
    countStatus(healthCheckData.value)
    return result
})

function filterByStatus(status: string) {
    if (statusFilter.value === status) {
        statusFilter.value = ''
    } else {
        statusFilter.value = status
        activeTab.value = 'healthcheck'
    }
}

function transformHealthData(items: HealthCheckResult[]): TreeNode[] {
    return (items || []).map((item) => {
        const node: TreeNode = {
            key: item.check?.id || item.check_id || Math.random().toString(),
            name: item.check?.name || item.check_name || '',
            status: item.check?.status || item.check_status || 'unknown',
            description: item.check?.description || '',
            message: item.message || '',
        }
        if (item.partial_results && item.partial_results.length > 0) node.children = transformHealthData(item.partial_results)
        return node
    })
}

const transformedHealthData = computed(() => transformHealthData(healthCheckData.value))

const filteredHealthData = computed(() => {
    let data = transformedHealthData.value

    if (statusFilter.value) {
        function matchesStatus(node: TreeNode): boolean {
            if (node.status.toLowerCase() === statusFilter.value.toLowerCase()) return true
            if (node.children?.some(matchesStatus)) return true
            return false
        }
        data = data.filter(matchesStatus)
    }

    if (filter.value) {
        const f = filter.value.toLowerCase()
        function matches(node: TreeNode): boolean {
            return node.name.toLowerCase().includes(f) || node.message.toLowerCase().includes(f) || node.status.toLowerCase().includes(f) || (node.children?.some(matches) ?? false)
        }
        data = data.filter(matches)
    }

    return data
})

const filteredModules = computed(() => {
    if (!filter.value) return modules.value
    const f = filter.value.toLowerCase()
    return modules.value.filter(m => m.toLowerCase().includes(f) || formatModuleName(m).toLowerCase().includes(f))
})

const systemInfo = computed(() => {
    const info: Record<string, unknown> = {}
    const skipKeys = ['health_check', 'modules', 'available_modules']
    for (const [key, value] of Object.entries(diagnosticsData.value)) {
        if (skipKeys.includes(key)) continue
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') info[key] = value
    }
    return info
})

const filteredSystemInfo = computed(() => {
    if (!filter.value) return systemInfo.value
    const f = filter.value.toLowerCase()
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(systemInfo.value)) {
        if (key.toLowerCase().includes(f) || String(value).toLowerCase().includes(f)) result[key] = value
    }
    return result
})

const additionalDiagnosticsData = computed(() => {
    const data: Record<string, unknown> = {}
    const skipKeys = ['health_check', 'modules', 'available_modules']
    for (const [key, value] of Object.entries(diagnosticsData.value)) {
        if (skipKeys.includes(key)) continue
        if (typeof value === 'object' && value !== null) data[key] = value
    }
    return data
})

const filteredDiagnosticsData = computed(() => {
    if (!filter.value) return additionalDiagnosticsData.value
    const f = filter.value.toLowerCase()
    const result: Record<string, unknown> = {}
    for (const [key, values] of Object.entries(additionalDiagnosticsData.value)) {
        if (key.toLowerCase().includes(f)) { result[key] = values; continue }
        if (typeof values === 'object' && values !== null) {
            const filtered: Record<string, unknown> = {}
            for (const [k, v] of Object.entries(values as Record<string, unknown>)) {
                if (k.toLowerCase().includes(f) || String(v).toLowerCase().includes(f)) filtered[k] = v
            }
            if (Object.keys(filtered).length > 0) result[key] = filtered
        }
    }
    return result
})

function formatModuleName(name: string): string { return name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }
function formatKey(key: string): string { return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text)
    } catch {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
    }
}

function toggleExpand(key: string) { expanded.value[key] = !expanded.value[key] }

function getStatusType(status: string): 'success' | 'warning' | 'error' | 'info' {
    switch (status.toLowerCase()) {
        case 'ok': return 'success'
        case 'warning': return 'warning'
        case 'error': return 'error'
        default: return 'info'
    }
}

async function fetchDiagnostics() {
    loading.value = true
    await refreshSharedDiag()
    if (sharedDiagData.value) {
        diagnosticsData.value = sharedDiagData.value
        const typedData = sharedDiagData.value
        if (Array.isArray(typedData.health_check)) healthCheckData.value = typedData.health_check as HealthCheckResult[]
        if (Array.isArray(typedData.modules)) modules.value = typedData.modules as string[]
        else if (Array.isArray(typedData.available_modules)) modules.value = typedData.available_modules as string[]
    }
    loading.value = false
}

async function fetchModules() {
    const { data, error } = await api.getModulesContent()
    if (!error && data && data.result) modules.value = data.result.sort()
}

async function refresh(force = false) {
    await fetchDiagnostics()
    if (force || modules.value.length === 0) await fetchModules()
}

function downloadDiagnostics() {
    const json = JSON.stringify(diagnosticsData.value, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `opsi-diagnostics-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
}

watch(transformedHealthData, (data) => {
    data.forEach((item) => { if (item.status === 'error' || item.status === 'warning') expanded.value[item.key] = true })
}, { immediate: true })

onMounted(() => {
    if (!route.params.tab) {
        router.replace('/admin/diagnostics/healthcheck')
    }
    refresh()
})
</script>
