<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Admin Diagnostics Page - Health check, system diagnostics, and modules
Uses tabbed interface similar to products page
-->
<template>
    <LayoutsPageLayout v-model="filter" show-search :search-placeholder="$t('filter')" show-refresh :loading="loading"
        @refresh="refresh(true)">
        <template #tabs>
            <SharedTabsNav v-model="activeTab" :tabs="tabs" />
        </template>
        <template #actions>
            <UButton :icon="icons.copy" variant="outline" color="neutral" size="sm" @click="downloadDiagnostics">{{
                $t('download') }}</UButton>
        </template>

        <!-- Summary Stats (clickable to filter) -->
        <template #stats>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button @click="filterByStatus('ok')" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    statusFilter === 'ok' ? 'ring-2 ring-green-500 border-green-500' : 'border-[var(--color-border)] hover:border-green-400',
                    'bg-green-50 dark:bg-green-900/20'
                ]">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.ok }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('passed') }}</div>
                </button>
                <button @click="filterByStatus('warning')" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    statusFilter === 'warning' ? 'ring-2 ring-yellow-500 border-yellow-500' : 'border-[var(--color-border)] hover:border-yellow-400',
                    'bg-yellow-50 dark:bg-yellow-900/20'
                ]">
                    <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.warning }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('warnings') }}</div>
                </button>
                <button @click="filterByStatus('error')" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    statusFilter === 'error' ? 'ring-2 ring-red-500 border-red-500' : 'border-[var(--color-border)] hover:border-red-400',
                    'bg-red-50 dark:bg-red-900/20'
                ]">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.error }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('errors') }}</div>
                </button>
                <button @click="activeTab = 'modules'; statusFilter = ''" :class="[
                    'p-4 rounded-lg border transition-all text-center',
                    activeTab === 'modules' && !statusFilter ? 'ring-2 ring-[var(--color-opsi-blue)] border-[var(--color-opsi-blue)]' : 'border-[var(--color-border)] hover:border-[var(--color-opsi-blue)]',
                    'bg-primary-50 dark:bg-primary-900/20'
                ]">
                    <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ modules.length }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ $t('modules') }}</div>
                </button>
            </div>

            <!-- Active Filter Indicator -->
            <div v-if="statusFilter" class="flex items-center gap-2 mt-3">
                <span class="text-sm text-gray-500">{{ $t('filteringBy') }}:</span>
                <SharedStatusBadge :status="getStatusType(statusFilter)" :label="statusFilter" />
                <UButton variant="ghost" color="neutral" size="xs" :icon="icons.close" @click="statusFilter = ''" />
            </div>
        </template>

        <!-- Tab Content (scrollable area) -->
        <div class="space-y-4">
            <!-- Tab Content: Health Check -->
            <div v-if="activeTab === 'healthcheck'">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="font-medium">{{ $t('healthCheck') }}</span>
                            <span class="text-xs text-gray-500">{{ filteredHealthData.length }} {{ $t('checks')
                            }}</span>
                        </div>
                    </template>
                    <div v-if="loading" class="py-8 text-center">
                        <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                    <div v-else class="space-y-2">
                        <div v-for="item in filteredHealthData" :key="item.key"
                            class="border rounded-lg dark:border-gray-700 overflow-hidden">
                            <div class="flex items-start gap-3 p-3 cursor-pointer transition-colors"
                                :class="getStatusBgClass(item.status)" @click="toggleExpand(item.key)">
                                <UIcon v-if="item.children && item.children.length > 0"
                                    :name="expanded[item.key] ? icons.arrowDown : icons.arrowRight"
                                    class="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                                <div v-else class="w-4" />
                                <SharedStatusBadge :status="getStatusType(item.status)" :label="item.status"
                                    class="shrink-0" />
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm" :title="item.description">{{ item.name }}</div>
                                    <div v-if="item.message"
                                        class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-all">
                                        {{
                                            item.message }}</div>
                                </div>
                            </div>
                            <div v-if="item.children && item.children.length > 0 && expanded[item.key]"
                                class="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div v-for="child in item.children" :key="child.key"
                                    class="flex items-start gap-3 p-3 pl-10 border-b last:border-b-0 dark:border-gray-700">
                                    <SharedStatusBadge :status="getStatusType(child.status)" :label="child.status"
                                        class="shrink-0" />
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-sm">{{ child.name }}</div>
                                        <div v-if="child.message"
                                            class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-all">
                                            {{ child.message }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="filteredHealthData.length === 0"
                            class="text-center py-8 text-gray-500 dark:text-gray-400">
                            {{ filter || statusFilter ? $t('noResultsFound') : $t('noDataAvailable') }}
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Tab Content: Modules -->
            <div v-if="activeTab === 'modules'">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="font-medium">{{ $t('availableModules') }}</span>
                            <span class="text-xs text-gray-500">{{ filteredModules.length }} {{ $t('active')
                            }}</span>
                        </div>
                    </template>
                    <div v-if="loading" class="py-8 text-center">
                        <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                    <div v-else-if="filteredModules.length === 0" class="py-8 text-center text-gray-500">
                        {{ filter ? $t('noResultsFound') : $t('noModulesFound') }}
                    </div>
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div v-for="module in filteredModules" :key="module"
                            class="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">
                            <div
                                class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <UIcon :name="icons.check" class="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-sm truncate" :title="module">{{ formatModuleName(module) }}
                                </div>
                                <div class="text-xs text-gray-500 truncate">{{ module }}</div>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Tab Content: System Info -->
            <div v-if="activeTab === 'system'" class="space-y-4">
                <!-- System Overview Cards -->
                <div v-if="loading" class="py-8 text-center">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
                </div>
                <template v-else>
                    <!-- Key Metrics Row -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div v-for="(metric, idx) in keyMetrics" :key="idx"
                            class="p-4 rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50">
                            <div class="flex items-center gap-3">
                                <div :class="[
                                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                    metric.color
                                ]">
                                    <UIcon :name="metric.icon" class="w-5 h-5" />
                                </div>
                                <div class="min-w-0">
                                    <div class="text-xs text-gray-500 uppercase tracking-wide truncate">{{ metric.label
                                    }}
                                    </div>
                                    <div class="font-semibold text-sm truncate" :title="metric.value">{{ metric.value }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Properties -->
                    <UCard v-if="Object.keys(filteredSystemInfo).length > 0">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <UIcon :name="icons.serverStack" class="w-5 h-5 text-primary-500" />
                                <span class="font-medium">{{ $t('systemProperties') }}</span>
                            </div>
                        </template>
                        <div class="divide-y divide-[var(--color-border)]">
                            <div v-for="(value, key) in filteredSystemInfo" :key="key"
                                class="flex items-center justify-between gap-4 py-2.5 group hover:bg-[var(--color-surface-hover)] -mx-4 px-4 transition-colors">
                                <span class="text-sm text-gray-600 dark:text-gray-400 min-w-0">
                                    {{ formatKey(String(key)) }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span class="font-mono text-sm font-medium truncate max-w-[300px]"
                                        :title="String(value)">
                                        {{ formatValue(value) }}
                                    </span>
                                    <UButton variant="ghost" size="xs" :icon="icons.copy"
                                        class="opacity-0 group-hover:opacity-100 transition-opacity"
                                        @click="copyToClipboard(String(value))" />
                                </div>
                            </div>
                        </div>
                    </UCard>

                    <!-- Additional Data Sections -->
                    <template v-for="(values, category) in filteredDiagnosticsData" :key="category">
                        <UCard
                            v-if="typeof values === 'object' && values !== null && Object.keys(values as object).length > 0">
                            <template #header>
                                <div class="flex items-center gap-2">
                                    <UIcon :name="getCategoryIcon(String(category))" class="w-5 h-5 text-primary-500" />
                                    <span class="font-medium capitalize">{{ formatKey(String(category)) }}</span>
                                    <UBadge color="neutral" variant="soft" size="xs">{{ Object.keys(values as
                                        object).length
                                    }}</UBadge>
                                </div>
                            </template>
                            <div class="divide-y divide-[var(--color-border)]">
                                <div v-for="(v, k) in (values as Record<string, unknown>)" :key="k"
                                    class="flex items-center justify-between gap-4 py-2.5 group hover:bg-[var(--color-surface-hover)] -mx-4 px-4 transition-colors">
                                    <span class="text-sm text-gray-600 dark:text-gray-400 min-w-0">{{ k }}</span>
                                    <div class="flex items-center gap-2">
                                        <UBadge v-if="typeof v === 'boolean'" :color="v ? 'success' : 'neutral'"
                                            variant="soft" size="xs">
                                            {{ v ? 'Yes' : 'No' }}
                                        </UBadge>
                                        <span v-else class="font-mono text-sm font-medium truncate max-w-[300px]"
                                            :title="String(v)">
                                            {{ formatValue(v) }}
                                        </span>
                                        <UButton variant="ghost" size="xs" :icon="icons.copy"
                                            class="opacity-0 group-hover:opacity-100 transition-opacity"
                                            @click="copyToClipboard(String(v))" />
                                    </div>
                                </div>
                            </div>
                        </UCard>
                    </template>

                    <div v-if="Object.keys(filteredSystemInfo).length === 0 && Object.keys(filteredDiagnosticsData).length === 0"
                        class="text-center py-8 text-gray-500">
                        {{ filter ? $t('noResultsFound') : $t('noDataAvailable') }}
                    </div>
                </template>
            </div>
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

const loading = ref(false)
const filter = ref('')
const statusFilter = ref('')

// URL-based tab routing using path parameter
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

// Stats computed from health check data
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

// Filter by clicking status cards
function filterByStatus(status: string) {
    if (statusFilter.value === status) {
        statusFilter.value = ''
    } else {
        statusFilter.value = status
        activeTab.value = 'healthcheck'
    }
}

// Transform health data to tree nodes
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

// Filter health data by text filter and status filter
const filteredHealthData = computed(() => {
    let data = transformedHealthData.value

    // Apply status filter first
    if (statusFilter.value) {
        function matchesStatus(node: TreeNode): boolean {
            if (node.status.toLowerCase() === statusFilter.value.toLowerCase()) return true
            if (node.children?.some(matchesStatus)) return true
            return false
        }
        data = data.filter(matchesStatus)
    }

    // Then apply text filter
    if (filter.value) {
        const f = filter.value.toLowerCase()
        function matches(node: TreeNode): boolean {
            return node.name.toLowerCase().includes(f) || node.message.toLowerCase().includes(f) || node.status.toLowerCase().includes(f) || (node.children?.some(matches) ?? false)
        }
        data = data.filter(matches)
    }

    return data
})

// Filter modules
const filteredModules = computed(() => {
    if (!filter.value) return modules.value
    const f = filter.value.toLowerCase()
    return modules.value.filter(m => m.toLowerCase().includes(f) || formatModuleName(m).toLowerCase().includes(f))
})

// System info from diagnostics (top-level strings/numbers)
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

// Additional diagnostics data (objects)
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

// Helpers
function formatModuleName(name: string): string { return name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }
function formatKey(key: string): string { return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}

// Key metrics extracted from system info for prominent display
const keyMetrics = computed(() => {
    const info = systemInfo.value
    const metrics: { label: string; value: string; icon: string; color: string }[] = []

    // opsiconfd version
    if (info.opsiconfd_version) {
        metrics.push({ label: 'Version', value: String(info.opsiconfd_version), icon: 'i-heroicons-code-bracket', color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' })
    }
    // Node name / hostname
    if (info.node_name) {
        metrics.push({ label: 'Node', value: String(info.node_name), icon: icons.serverStack, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' })
    }
    // Python version
    if (info.python_version) {
        metrics.push({ label: 'Python', value: (String(info.python_version).split(' ')[0] || ''), icon: 'i-heroicons-command-line', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' })
    }
    // Run as user
    if (info.run_as_user) {
        metrics.push({ label: 'User', value: String(info.run_as_user), icon: icons.user, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' })
    }
    // Workers
    if (info.workers) {
        metrics.push({ label: 'Workers', value: String(info.workers), icon: 'i-heroicons-cpu-chip', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' })
    }

    return metrics.slice(0, 4) // Max 4 metrics for the row
})

// Get icon for additional data categories
function getCategoryIcon(category: string): string {
    const catLower = category.toLowerCase()
    if (catLower.includes('ssl') || catLower.includes('cert')) return 'i-heroicons-lock-closed'
    if (catLower.includes('redis')) return 'i-heroicons-circle-stack'
    if (catLower.includes('mysql') || catLower.includes('database') || catLower.includes('db')) return 'i-heroicons-server-stack'
    if (catLower.includes('network') || catLower.includes('ip')) return 'i-heroicons-globe-alt'
    if (catLower.includes('memory') || catLower.includes('cpu')) return 'i-heroicons-cpu-chip'
    if (catLower.includes('disk') || catLower.includes('storage')) return 'i-heroicons-circle-stack'
    if (catLower.includes('license')) return 'i-heroicons-document-check'
    if (catLower.includes('config')) return icons.settings
    return 'i-heroicons-document-text'
}

// Copy to clipboard
async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text)
    } catch {
        // Fallback for older browsers
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

function getStatusBgClass(status: string): string {
    switch (status.toLowerCase()) {
        case 'ok': return 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20'
        case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
        case 'error': return 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
        default: return 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
    }
}

// Fetch all data
async function fetchDiagnostics() {
    loading.value = true
    const { data, error } = await api.getDiagnosticData()
    if (!error && data) {
        diagnosticsData.value = data as Record<string, unknown>
        const typedData = data as Record<string, unknown>
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

// Auto-expand errors/warnings on mount
watch(transformedHealthData, (data) => {
    data.forEach((item) => { if (item.status === 'error' || item.status === 'warning') expanded.value[item.key] = true })
}, { immediate: true })

onMounted(() => {
    // Redirect to default tab if none specified
    if (!route.params.tab) {
        router.replace('/admin/diagnostics/healthcheck')
    }
    refresh()
})
</script>
