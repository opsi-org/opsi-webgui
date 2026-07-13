<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  AdminDiagnosticsView - Health check, system diagnostics, modules info with filterable tabs.
-->
<template>
    <LayoutsPageLayout v-model="filter" show-filter :search-placeholder="$t('common.filter')" show-refresh
        :loading="loading" @refresh="refresh(true)">
        <template #tabs>
            <CoreAppTabsNav v-model="activeTab" :tabs="tabs" />
        </template>
        <template #actions>
            <CoreAppButton :icon="icons.download" variant="outline" color="primary" size="sm"
                @click="downloadDiagnostics">
                {{
                    $t('common.download') }}</CoreAppButton>
        </template>

        <template #stats>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <CoreAppButton @click="filterByStatus('ok')" variant="ghost" color="neutral" :class="[
                    'p-4! rounded-lg border transition-all text-center cursor-pointer hover:shadow-md h-auto! flex-col!',
                    statusFilter === 'ok' ? 'ring-2 ring-offset-2 ring-offset-(--color-surface) ring-(--color-success) border-(--color-success)' : 'border-(--color-border) hover:border-(--color-success)',
                    'bg-(--color-success-soft-bg)'
                ]">
                    <div class="text-2xl font-bold text-(--color-success-soft-text)">{{ stats.ok }}</div>
                    <div class="text-xs text-(--color-text) mt-1">{{ $t('diag.passed') }}</div>
                </CoreAppButton>
                <CoreAppButton @click="filterByStatus('warning')" variant="ghost" color="neutral" :class="[
                    'p-4! rounded-lg border transition-all text-center cursor-pointer hover:shadow-md h-auto! flex-col!',
                    statusFilter === 'warning' ? 'ring-2 ring-offset-2 ring-offset-(--color-surface) ring-(--color-warning) border-(--color-warning)' : 'border-(--color-border) hover:border-(--color-warning)',
                    'bg-(--color-warning-soft-bg)'
                ]">
                    <div class="text-2xl font-bold text-(--color-warning-soft-text)">{{ stats.warning }}</div>
                    <div class="text-xs text-(--color-text) mt-1">{{ $t('common.warnings') }}</div>
                </CoreAppButton>
                <CoreAppButton @click="filterByStatus('error')" variant="ghost" color="neutral" :class="[
                    'p-4! rounded-lg border transition-all text-center cursor-pointer hover:shadow-md h-auto! flex-col!',
                    statusFilter === 'error' ? 'ring-2 ring-offset-2 ring-offset-(--color-surface) ring-(--color-error) border-(--color-error)' : 'border-(--color-border) hover:border-(--color-error)',
                    'bg-(--color-error-soft-bg)'
                ]">
                    <div class="text-2xl font-bold text-(--color-error-soft-text)">{{ stats.error }}</div>
                    <div class="text-xs text-(--color-text) mt-1">{{ $t('common.errors') }}</div>
                </CoreAppButton>
                <CoreAppButton @click="activeTab = 'modules'; statusFilter = ''" variant="ghost" color="neutral" :class="[
                    'p-4! rounded-lg border transition-all text-center cursor-pointer hover:shadow-md h-auto! flex-col!',
                    activeTab === 'modules' && !statusFilter ? 'ring-2 ring-offset-2 ring-offset-(--color-surface) ring-(--color-primary) border-(--color-primary)' : 'border-(--color-border) hover:border-(--color-primary)',
                    'bg-(--color-primary-soft-bg)'
                ]">
                    <div class="text-2xl font-bold text-(--color-primary-soft-text)">{{ modules.length }}</div>
                    <div class="text-xs text-(--color-text) mt-1">{{ $t('mods.title') }}</div>
                </CoreAppButton>
            </div>

            <div v-if="statusFilter" class="flex items-center gap-2 mt-3">
                <span class="text-sm text-(--color-text-muted)">{{ $t('common.filterBy') }}:</span>
                <CoreAppStatusBadge :status="getStatusType(statusFilter)" :label="statusFilter" />
                <CoreAppButton variant="ghost" color="neutral" size="xs" :icon="icons.x" @click="statusFilter = ''" />
            </div>
        </template>

        <div class="flex flex-col h-full min-h-0">
            <AdminHealthCheck v-if="activeTab === 'healthcheck'" :filteredHealthData="filteredHealthData"
                :loading="loading" :stats="stats" :statusFilter="statusFilter" :icons="icons" :expanded="expanded"
                @toggleExpand="toggleExpand" @filterByStatus="filterByStatus"
                @clearStatusFilter="() => statusFilter = ''" :getStatusType="getStatusType" />
            <AdminModules v-if="activeTab === 'modules'" :filteredModules="filteredModules" :loading="loading"
                :icons="icons" :modules="modules" :filter="filter" :formatModuleName="formatModuleName"
                :modulesDetailed="sharedModulesDetailed" :obsoleteModules="sharedObsoleteModules"
                :freeModules="sharedFreeModules" />
            <AdminSystemInfo v-if="activeTab === 'system'" :filteredSystemInfo="filteredSystemInfo"
                :filteredDiagnosticsData="filteredDiagnosticsData" :loading="loading" :icons="icons" :filter="filter"
                :formatKey="formatKey" :formatValue="formatValue" @copyToClipboard="copyToClipboard" />
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
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

const props = defineProps<{
    initialTab?: string
}>()

const emit = defineEmits<{
    (e: 'update:tab', value: string): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const {
    diagnosticsData: sharedDiagData,
    fetchDiagnostics: fetchSharedDiag,
    healthCounts: sharedHealthCounts,
    modules: sharedModules,
    modulesDetailed: sharedModulesDetailed,
    obsoleteModules: sharedObsoleteModules,
    freeModules: sharedFreeModules,
} = useCachedData()

const loading = ref(false)
const filter = ref('')
const statusFilter = ref('')

const validTabs = ['healthcheck', 'modules', 'system'] as const
type TabValue = typeof validTabs[number]

const activeTab = ref<TabValue>(
    validTabs.includes(props.initialTab as TabValue) ? (props.initialTab as TabValue) : 'healthcheck'
)

watch(activeTab, (val) => emit('update:tab', val))

const healthCheckData = ref<HealthCheckResult[]>([])
const diagnosticsData = ref<Record<string, unknown>>({})
const modules = ref<string[]>([])
const expanded = ref<Record<string, boolean>>({})

const tabs = [
    { label: String($t('diag.health')), value: 'healthcheck' },
    { label: String($t('mods.title')), value: 'modules' },
    { label: String($t('diag.systemInfo')), value: 'system' },
]

const stats = sharedHealthCounts

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

function formatModuleName(name: string): string {
    const key = `module.${name}`
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

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

async function fetchDiagnostics(force = false) {
    loading.value = true
    await fetchSharedDiag(force)
    if (sharedDiagData.value) {
        diagnosticsData.value = sharedDiagData.value
        const typedData = sharedDiagData.value
        if (Array.isArray(typedData.health_check)) healthCheckData.value = typedData.health_check as HealthCheckResult[]
        if (sharedModules.value.length > 0) {
            modules.value = sharedModules.value
        } else if (Array.isArray(typedData.modules)) {
            modules.value = typedData.modules as string[]
        } else if (Array.isArray(typedData.available_modules)) {
            modules.value = typedData.available_modules as string[]
        }
    }
    loading.value = false
}

async function refresh(force = false) {
    await fetchDiagnostics(force)
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
    refresh()
})
</script>
