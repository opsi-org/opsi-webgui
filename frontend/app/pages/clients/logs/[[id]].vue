<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsDetailPanel :showPanel="!!selectedLog" @close="closeLogPanel">
        <template #main>
            <div class="space-y-4">
                <LayoutsPageHeader v-model="search" show-search :search-placeholder="String($t('filter'))" show-refresh
                    :loading="loading" @refresh="fetchLogs">
                    <template #filters>
                        <UiHostSelector v-model="manualClientId" :placeholder="String($t('selectClient'))"
                            :allow-all="false" />
                    </template>
                </LayoutsPageHeader>

                <div v-if="selectedClientId" class="text-sm text-[var(--color-text-muted)]">
                    {{ $t('clientId') }}: <span class="font-medium text-[var(--color-text)]">{{ selectedClientId
                    }}</span>
                </div>

                <!-- Error State -->
                <div v-if="error"
                    class="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    {{ error }}
                </div>

                <UCard :ui="{ body: 'p-0 sm:p-0' }">
                    <div class="overflow-x-auto">
                        <table class="w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {{ t('logType') }}</th>
                                    <th
                                        class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                                        {{ t('description') }}</th>
                                    <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {{ t('actions') }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-if="loading">
                                    <td colspan="3" class="py-8 text-center">
                                        <UIcon :name="icons.loading" class="w-6 h-6 animate-spin" />
                                    </td>
                                </tr>
                                <tr v-else-if="!selectedClientId">
                                    <td colspan="3" class="py-8 text-center text-gray-500">{{
                                        $t('selectClientToViewLogs') }}</td>
                                </tr>
                                <tr v-else-if="!filtered.length">
                                    <td colspan="3" class="py-8 text-center text-gray-500">{{
                                        $t('noLogsFound') }}</td>
                                </tr>
                                <tr v-for="l in filtered" :key="l.type" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td class="px-3 md:px-4 py-3 font-medium">{{ l.type }}</td>
                                    <td class="px-3 md:px-4 py-3 text-gray-500 hidden sm:table-cell">{{ l.description }}
                                    </td>
                                    <td class="px-3 md:px-4 py-3">
                                        <UButton :icon="icons.eye" variant="ghost" size="xs" :loading="l.loading"
                                            @click="loadLogContent(l)" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </UCard>
            </div>
        </template>

        <template #title>{{ selectedLog?.type }}</template>
        <template #panel>
            <div v-if="selectedLog" class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">{{ selectedLog.description }}</span>
                    <UButton :icon="icons.refresh" variant="ghost" size="xs" :loading="selectedLog.loading"
                        @click="loadLogContent(selectedLog)" />
                </div>
                <div v-if="selectedLog.loading" class="py-8 text-center">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin" />
                </div>
                <pre v-else
                    class="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto max-h-[60vh] font-mono whitespace-pre-wrap">{{ selectedLog.content || 'No content available' }}</pre>
            </div>
        </template>
    </LayoutsDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface LogEntry {
    type: string
    description: string
    content: string
    loading: boolean
}

const icons = useIcons()
const { t: $t } = useI18n()
const { apiGet } = useApiHelpers()
const stateStore = useStateStore()

const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}
const route = useRoute()

// Available log types for opsi clients
const LOG_TYPES: Array<{ type: string; description: string }> = [
    { type: 'instlog', description: 'Installation log (opsi-script)' },
    { type: 'clientconnect', description: 'Client connection log' },
    { type: 'userlogin', description: 'User login events' },
    { type: 'bootimage', description: 'Boot image log' },
    { type: 'opsiconfd', description: 'opsiconfd service log' },
    { type: 'opsiclientd', description: 'opsiclientd service log' },
]

const clientIdFromRoute = computed(() => route.params.id as string || null)
const manualClientId = ref<string>('')
const selectedClientId = computed(() => manualClientId.value || clientIdFromRoute.value || (stateStore.clients.length > 0 ? stateStore.clients[0] : null))

const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const selectedLog = ref<LogEntry | null>(null)

const logs = ref<LogEntry[]>(LOG_TYPES.map(lt => ({
    type: lt.type,
    description: lt.description,
    content: '',
    loading: false
})))

const filtered = computed(() => {
    if (!search.value) return logs.value
    const q = search.value.toLowerCase()
    return logs.value.filter(l => l.type.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
})

// Load specific log content
async function loadLogContent(log: LogEntry) {
    if (!selectedClientId.value) return

    log.loading = true
    selectedLog.value = log
    error.value = null

    try {
        const res = await apiGet<{ content: string; marker: number }>('/opsidata/log', {
            selectedClient: selectedClientId.value,
            selectedLogType: log.type
        })
        if (res.data) {
            log.content = res.data.content || 'No log content available'
        } else if (res.error) {
            log.content = `Error loading log: ${res.error.message}`
        }
    } catch (e: unknown) {
        log.content = e instanceof Error ? `Error: ${e.message}` : 'Failed to load log content'
    } finally {
        log.loading = false
    }
}

// Close log panel
function closeLogPanel() {
    selectedLog.value = null
}

// Refresh/fetch logs
const fetchLogs = async () => {
    loading.value = true
    error.value = null
    // Reset log content
    logs.value.forEach(l => l.content = '')
    await new Promise(r => setTimeout(r, 300))
    loading.value = false
}

// Watch for client changes
watch(selectedClientId, () => {
    // Clear selected log when client changes
    selectedLog.value = null
    logs.value.forEach(l => l.content = '')
})
</script>
