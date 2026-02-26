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
    <div class="space-y-4">
        <!-- Header with Tabs and Filter -->
        <CommonPageHeader :title="$t('diagnostics') || 'Diagnostics'" v-model="filter" show-search
            :search-placeholder="$t('filter') || 'Filter...'" show-refresh :loading="loading" @refresh="refresh(true)">
            <template #tabs>
                <CommonTabsNav v-model="activeTab" :tabs="tabs" />
            </template>
            <template #actions>
                <UButton :icon="icons.copy" variant="outline" color="neutral" size="sm" @click="downloadDiagnostics">{{
                    $t('download') }}</UButton>
            </template>
        </CommonPageHeader>

        <!-- Summary Stats (clickable to filter) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button @click="filterByStatus('ok')" :class="[
                'p-4 rounded-lg border transition-all text-center',
                statusFilter === 'ok' ? 'ring-2 ring-green-500 border-green-500' : 'border-[var(--color-border)] hover:border-green-400',
                'bg-green-50 dark:bg-green-900/20'
            ]">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.ok }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ $t('passed') || 'Passed' }}</div>
            </button>
            <button @click="filterByStatus('warning')" :class="[
                'p-4 rounded-lg border transition-all text-center',
                statusFilter === 'warning' ? 'ring-2 ring-yellow-500 border-yellow-500' : 'border-[var(--color-border)] hover:border-yellow-400',
                'bg-yellow-50 dark:bg-yellow-900/20'
            ]">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.warning }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ $t('warnings') || 'Warnings' }}</div>
            </button>
            <button @click="filterByStatus('error')" :class="[
                'p-4 rounded-lg border transition-all text-center',
                statusFilter === 'error' ? 'ring-2 ring-red-500 border-red-500' : 'border-[var(--color-border)] hover:border-red-400',
                'bg-red-50 dark:bg-red-900/20'
            ]">
                <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.error }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ $t('errors') || 'Errors' }}</div>
            </button>
            <button @click="activeTab = 'modules'; statusFilter = ''" :class="[
                'p-4 rounded-lg border transition-all text-center',
                activeTab === 'modules' && !statusFilter ? 'ring-2 ring-[var(--color-opsi-blue)] border-[var(--color-opsi-blue)]' : 'border-[var(--color-border)] hover:border-[var(--color-opsi-blue)]',
                'bg-primary-50 dark:bg-primary-900/20'
            ]">
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ modules.length }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ $t('modules') || 'Modules' }}</div>
            </button>
        </div>

        <!-- Active Filter Indicator -->
        <div v-if="statusFilter" class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ $t('filteringBy') || 'Filtering by' }}:</span>
            <CommonStatusBadge :status="getStatusType(statusFilter)" :label="statusFilter" />
            <UButton variant="ghost" color="neutral" size="xs" :icon="icons.close" @click="statusFilter = ''" />
        </div>

        <!-- Tab Content: Health Check -->
        <div v-if="activeTab === 'healthcheck'">
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-medium">{{ $t('healthCheck') || 'Health Check' }}</span>
                        <span class="text-xs text-gray-500">{{ filteredHealthData.length }} {{ $t('checks') || 'checks'
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
                            <CommonStatusBadge :status="getStatusType(item.status)" :label="item.status"
                                class="shrink-0" />
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-sm" :title="item.description">{{ item.name }}</div>
                                <div v-if="item.message"
                                    class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-all">{{
                                    item.message }}</div>
                            </div>
                        </div>
                        <div v-if="item.children && item.children.length > 0 && expanded[item.key]"
                            class="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div v-for="child in item.children" :key="child.key"
                                class="flex items-start gap-3 p-3 pl-10 border-b last:border-b-0 dark:border-gray-700">
                                <CommonStatusBadge :status="getStatusType(child.status)" :label="child.status"
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
                        <span class="font-medium">{{ $t('availableModules') || 'Available Modules' }}</span>
                        <span class="text-xs text-gray-500">{{ filteredModules.length }} {{ $t('active') || 'active'
                            }}</span>
                    </div>
                </template>
                <div v-if="loading" class="py-8 text-center">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
                </div>
                <div v-else-if="filteredModules.length === 0" class="py-8 text-center text-gray-500">
                    {{ filter ? $t('noResultsFound') : $t('noModulesFound') || 'No modules found' }}
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
        <div v-if="activeTab === 'system'">
            <!-- System Information -->
            <UCard class="mb-4">
                <template #header>
                    <span class="font-medium">{{ $t('systemInfo') || 'System Information' }}</span>
                </template>
                <div v-if="loading" class="py-8 text-center">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
                </div>
                <div v-else-if="Object.keys(filteredSystemInfo).length === 0" class="py-8 text-center text-gray-500">
                    {{ filter ? $t('noResultsFound') : $t('noDataAvailable') }}
                </div>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="(value, key) in filteredSystemInfo" :key="key"
                        class="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">{{ formatKey(String(key)) }}
                        </div>
                        <div class="font-medium text-sm break-all">{{ formatValue(value) }}</div>
                    </div>
                </div>
            </UCard>

            <!-- Additional Diagnostics Data -->
            <UCard v-if="Object.keys(filteredDiagnosticsData).length > 0">
                <template #header>
                    <span class="font-medium">{{ $t('additionalData') || 'Additional Data' }}</span>
                </template>
                <div class="divide-y divide-[var(--color-border)]">
                    <div v-for="(values, category) in filteredDiagnosticsData" :key="category">
                        <template
                            v-if="typeof values === 'object' && values !== null && Object.keys(values as object).length > 0">
                            <div class="py-4">
                                <div class="font-medium text-sm mb-3 text-primary-600 dark:text-primary-400">{{ category
                                    }}</div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div v-for="(v, k) in (values as Record<string, unknown>)" :key="k"
                                        class="flex justify-between gap-2 text-sm p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
                                        <span class="text-gray-500 truncate">{{ k }}</span>
                                        <span class="font-medium truncate" :title="String(v)">{{ formatValue(v)
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
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

const loading = ref(false)
const filter = ref('')
const statusFilter = ref('')
const activeTab = ref('healthcheck')
const healthCheckData = ref<HealthCheckResult[]>([])
const diagnosticsData = ref<Record<string, unknown>>({})
const modules = ref<string[]>([])
const expanded = ref<Record<string, boolean>>({})

const tabs = [
    { label: String($t('healthCheck') || 'Health Check'), value: 'healthcheck' },
    { label: String($t('modules') || 'Modules'), value: 'modules' },
    { label: String($t('systemInfo') || 'System'), value: 'system' },
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
function formatKey(key: string): string { return key.replace(/_/g, ' ') }
function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
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

onMounted(() => refresh())
</script>
