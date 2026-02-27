<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsDetailPanel :showPanel="!!selectedConfig" @close="closeEditPanel">
        <template #main>
            <div class="space-y-4">
                <!-- Header with Tabs -->
                <LayoutsPageHeader v-model="search" show-search :search-placeholder="String($t('filter'))" show-refresh
                    :loading="loading" @refresh="fetchConfigs">
                    <template #tabs>
                        <SharedTabsNav v-model="activeTab" :tabs="configTabs" />
                    </template>
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

                <!-- No Client Selected -->
                <div v-if="!selectedClientId && !loading"
                    class="p-8 text-center text-gray-500 border border-[var(--color-border)] rounded-lg">
                    {{ $t('selectClientToViewConfig') }}
                </div>

                <!-- Scrollable Config Table Container - max 50% viewport height -->
                <div v-else class="max-h-[50vh] overflow-auto border border-[var(--color-border)] rounded-lg">
                    <SharedDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                        @select="(row) => openEditPanel(row as any)">
                        <template #type-data="{ row }">
                            <SharedStatusBadge status="neutral" :label="String((row as any).type)" />
                        </template>
                        <template #value-data="{ row }">
                            <span class="font-mono text-xs truncate max-w-[200px] block">{{ formatValue((row as
                                any).value) }}</span>
                        </template>
                    </SharedDataTable>
                </div>
            </div>
        </template>

        <template #title>{{ selectedConfig?.configId }}</template>
        <template #panel>
            <div v-if="selectedConfig" class="space-y-4">
                <UFormGroup :label="$t('configId')">
                    <UInput :model-value="selectedConfig.configId" disabled />
                </UFormGroup>
                <UFormGroup :label="$t('type')">
                    <UInput :model-value="selectedConfig.type" disabled />
                </UFormGroup>
                <UFormGroup :label="$t('description')" v-if="selectedConfig.description">
                    <div class="text-sm text-gray-500">{{ selectedConfig.description }}</div>
                </UFormGroup>
                <UFormGroup :label="$t('value')">
                    <template v-if="selectedConfig.type === 'BoolConfig'">
                        <USelect v-model="editValue"
                            :options="[{ label: 'true', value: 'true' }, { label: 'false', value: 'false' }]" />
                    </template>
                    <template v-else-if="selectedConfig.possibleValues && selectedConfig.possibleValues.length > 0">
                        <USelect v-model="editValue"
                            :options="selectedConfig.possibleValues.map((v: any) => ({ label: String(v), value: v }))" />
                    </template>
                    <template v-else>
                        <UTextarea v-model="editValue" :rows="3" />
                    </template>
                </UFormGroup>
                <div class="flex gap-2 pt-4">
                    <UButton color="primary" size="sm" :loading="saving" @click="saveConfig">{{ $t('save') }}
                    </UButton>
                    <UButton variant="outline" color="neutral" size="sm" @click="closeEditPanel">{{ $t('cancel')
                    }}</UButton>
                </div>
            </div>
        </template>
    </LayoutsDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface ConfigItem {
    configId: string
    type: string
    value: any
    description?: string
    possibleValues?: any[]
    defaultValues?: any[]
    multiValue?: boolean
    editable?: boolean
    objects?: Record<string, any>
}

const { t: $t } = useI18n()
const { apiGet, apiPost } = useApiHelpers()
const stateStore = useStateStore()

const route = useRoute()

// Configuration tabs
const activeTab = ref('attributes')
const configTabs = [
    { label: String($t('attributes')), value: 'attributes' },
    { label: String($t('parameters')), value: 'parameters' },
]

// Route param takes precedence, but can also be selected manually
const routeClientId = computed(() => route.params.id as string || null)
const manualClientId = ref<string>('')
const selectedClientId = computed(() => manualClientId.value || routeClientId.value || (stateStore.clients.length > 0 ? stateStore.clients[0] : null))

const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)
const selectedConfig = ref<ConfigItem | null>(null)
const editValue = ref('')
const configs = ref<ConfigItem[]>([])

const columns = [
    { key: 'configId', label: String($t('configId')) },
    { key: 'type', label: String($t('type')), class: 'hidden md:table-cell' },
    { key: 'value', label: String($t('value')) },
]

// Format value for display
const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return String(value)
}

// Filtered configs based on search and active tab
const filtered = computed(() => {
    let result = configs.value

    // Filter by tab
    if (activeTab.value === 'attributes') {
        result = result.filter(c => !c.configId.includes('.'))
    } else if (activeTab.value === 'parameters') {
        result = result.filter(c => c.configId.includes('.'))
    }

    // Filter by search
    if (search.value) {
        const q = search.value.toLowerCase()
        result = result.filter(c =>
            c.configId.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q))
        )
    }

    return result
})

// Open edit panel
const openEditPanel = (config: ConfigItem) => {
    selectedConfig.value = config
    editValue.value = formatValue(config.objects?.[selectedClientId.value!] ?? config.value)
}

// Close edit panel
const closeEditPanel = () => {
    selectedConfig.value = null
    editValue.value = ''
}

// Fetch configuration for the selected client using FastAPI endpoint
const fetchConfigs = async () => {
    if (!selectedClientId.value) {
        configs.value = []
        return
    }

    loading.value = true
    error.value = null

    try {
        // Use FastAPI endpoint for client config
        const res = await apiGet<Record<string, ConfigItem[]>>(`/opsidata/config/objects/${selectedClientId.value}`)
        if (res.data) {
            // Flatten the categorized configs into a single array
            const allConfigs: ConfigItem[] = []
            for (const category in res.data) {
                const categoryConfigs = res.data[category]
                if (Array.isArray(categoryConfigs)) {
                    for (const config of categoryConfigs) {
                        // Extract value from objects map
                        const clientValue = config.objects?.[selectedClientId.value!]
                        allConfigs.push({
                            ...config,
                            value: clientValue ?? config.value ?? (config.defaultValues?.[0] ?? '-')
                        })
                    }
                }
            }
            configs.value = allConfigs
        }
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Failed to fetch configuration'
        console.error('Failed to fetch client config:', e)
    } finally {
        loading.value = false
    }
}

// Save configuration using FastAPI endpoint
const saveConfig = async () => {
    if (!selectedConfig.value || !selectedClientId.value) return

    saving.value = true
    error.value = null

    try {
        // Use FastAPI endpoint to save config
        await apiPost('/opsidata/config/objects', {
            objectIds: [selectedClientId.value],
            configs: [{
                configId: selectedConfig.value.configId,
                value: editValue.value
            }]
        })

        // Update local state
        const idx = configs.value.findIndex(c => c.configId === selectedConfig.value!.configId)
        if (idx !== -1 && configs.value[idx]) {
            configs.value[idx]!.value = editValue.value
        }

        closeEditPanel()
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Failed to save configuration'
        console.error('Failed to save config:', e)
    } finally {
        saving.value = false
    }
}

// Watch for client changes
watch(selectedClientId, () => {
    closeEditPanel()
    fetchConfigs()
}, { immediate: true })
</script>
