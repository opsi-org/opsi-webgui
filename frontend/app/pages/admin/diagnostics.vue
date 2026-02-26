<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{{ t('healthCheck') }}</h1>
            <UButton :icon="icons.refresh" variant="outline" color="neutral" size="sm" :loading="loading"
                @click="refresh">
                {{ t('runCheck') }}
            </UButton>
        </div>

        <!-- Tabs Navigation -->
        <CommonTabsNav :tabs="tabs" v-model="activeTab" />

        <!-- Diagnostics Tab Content -->
        <div v-if="activeTab === 'diagnostics'" class="space-y-4">
            <!-- System Information -->
            <UCard>
                <template #header>
                    <span class="font-medium">{{ t('systemInformation') }}</span>
                </template>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="info in systemInfo" :key="info.label"
                        class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span class="text-sm text-gray-500">{{ info.label }}</span>
                        <span class="text-sm font-medium">{{ info.value }}</span>
                    </div>
                </div>
            </UCard>

            <!-- Service Status -->
            <UCard>
                <template #header>
                    <span class="font-medium">{{ t('serviceStatus') }}</span>
                </template>
                <div class="space-y-3">
                    <div v-for="service in services" :key="service.name"
                        class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div class="flex items-center gap-3">
                            <div
                                :class="['w-2.5 h-2.5 rounded-full', service.running ? 'bg-green-500' : 'bg-red-500']" />
                            <span class="font-medium text-sm">{{ service.name }}</span>
                        </div>
                        <span :class="['text-xs px-2 py-1 rounded',
                            service.running
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300']">
                            {{ service.running ? t('running') : t('stopped') }}
                        </span>
                    </div>
                </div>
            </UCard>

            <!-- Resource Usage -->
            <UCard>
                <template #header>
                    <span class="font-medium">{{ t('resourceUsage') }}</span>
                </template>
                <div class="space-y-4">
                    <div v-for="resource in resources" :key="resource.name">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-400">{{ resource.name }}</span>
                            <span class="font-medium">{{ resource.used }} / {{ resource.total }}</span>
                        </div>
                        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div :class="['h-full rounded-full', resource.percent > 90 ? 'bg-red-500' : resource.percent > 70 ? 'bg-yellow-500' : 'bg-green-500']"
                                :style="{ width: resource.percent + '%' }" />
                        </div>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Healthcheck Tab Content -->
        <div v-if="activeTab === 'healthcheck'" class="space-y-4">
            <!-- Summary cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <UCard v-for="stat in stats" :key="stat.label" class="text-center">
                    <div :class="['text-3xl font-bold', stat.color]">{{ stat.value }}</div>
                    <div class="text-sm text-gray-500 mt-1">{{ stat.label }}</div>
                </UCard>
            </div>

            <!-- Check results -->
            <UCard>
                <template #header>
                    <span class="font-medium">{{ t('checkResults') }}</span>
                </template>
                <div class="space-y-3">
                    <div v-for="check in checks" :key="check.id" class="flex items-start gap-3 p-3 rounded border"
                        :class="check.status === 'ok' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
                            check.status === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                                'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'">
                        <UIcon
                            :name="check.status === 'ok' ? icons.check : check.status === 'warning' ? icons.warning : icons.error"
                            :class="['w-5 h-5 shrink-0', check.status === 'ok' ? 'text-green-500' : check.status === 'warning' ? 'text-yellow-500' : 'text-red-500']" />
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-sm">{{ check.name }}</div>
                            <div class="text-xs text-gray-500 mt-0.5">{{ check.message }}</div>
                        </div>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface HealthCheckItem {
    check_id: string
    check_name: string
    check_status: 'ok' | 'warning' | 'error'
    check_description: string
    message: string
    upgrade_issue: string | null
    partial_results: Array<{ message: string; check_status: string }>
}

const icons = useIcons()
const { t: $t } = useI18n()
const { getHealthcheck, getDiagnosticData, getServerInfo } = useApiHelpers()

// Helper to format translation keys
const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('diagnostics')

const tabs = [
    { value: 'diagnostics', label: t('diagnostics') },
    { value: 'healthcheck', label: t('healthCheck') },
]

// Diagnostics Data
const systemInfo = ref<Array<{ label: string; value: string }>>([])
const diagnosticData = ref<Record<string, unknown>>({})

const services = ref([
    { name: 'opsiconfd', running: true },
    { name: 'Redis', running: true },
    { name: 'MySQL/MariaDB', running: true },
    { name: 'Grafana', running: true },
])

const resources = ref([
    { name: 'CPU', used: '0%', total: '100%', percent: 0 },
    { name: 'Memory', used: '0 GB', total: '0 GB', percent: 0 },
    { name: 'Disk', used: '0 GB', total: '0 GB', percent: 0 },
])

// Healthcheck Data
const healthChecks = ref<HealthCheckItem[]>([])

const stats = computed(() => [
    { label: 'OK', value: healthChecks.value.filter(c => c.check_status === 'ok').length, color: 'text-green-500' },
    { label: 'Warnings', value: healthChecks.value.filter(c => c.check_status === 'warning').length, color: 'text-yellow-500' },
    { label: 'Errors', value: healthChecks.value.filter(c => c.check_status === 'error').length, color: 'text-red-500' },
])

const checks = computed(() => healthChecks.value.map(h => ({
    id: h.check_id,
    name: h.check_name,
    status: h.check_status,
    message: h.message || h.check_description || ''
})))

const fetchDiagnostics = async () => {
    try {
        const [serverRes, diagRes] = await Promise.all([
            getServerInfo(),
            getDiagnosticData()
        ])

        if (serverRes.data) {
            const server = serverRes.data as Record<string, unknown>
            systemInfo.value = [
                { label: 'OPSI Config Server', value: String(server.hostname || server.computerName || '-') },
                { label: 'OPSI Version', value: String(server.opsiVersion || '-') },
                { label: 'Operating System', value: String(server.os || '-') },
                { label: 'Python Version', value: String(server.pythonVersion || '-') },
                { label: 'Server Time', value: new Date().toLocaleString() },
            ]
        }

        if (diagRes.data) {
            diagnosticData.value = diagRes.data
            // Parse resource usage if available
            if (diagRes.data.system) {
                const sys = diagRes.data.system as Record<string, unknown>
                if (sys.memory) {
                    const mem = sys.memory as { used: number; total: number; percent: number }
                    resources.value[1] = {
                        name: 'Memory',
                        used: `${(mem.used / 1024 / 1024 / 1024).toFixed(1)} GB`,
                        total: `${(mem.total / 1024 / 1024 / 1024).toFixed(1)} GB`,
                        percent: mem.percent || 0
                    }
                }
            }
        }
    } catch (err) {
        console.error('Failed to fetch diagnostics:', err)
    }
}

const fetchHealthcheck = async () => {
    try {
        const result = await getHealthcheck()
        if (result.data && Array.isArray(result.data)) {
            healthChecks.value = result.data
        }
    } catch (err) {
        console.error('Failed to fetch healthcheck:', err)
    }
}

const refresh = async () => {
    loading.value = true
    error.value = null
    try {
        await Promise.all([
            fetchDiagnostics(),
            fetchHealthcheck()
        ])
    } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : 'Failed to refresh data'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    refresh()
})
</script>
