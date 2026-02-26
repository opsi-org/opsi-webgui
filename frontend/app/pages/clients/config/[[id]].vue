<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <CommonDetailPanel :showPanel="!!selectedConfig" @close="selectedConfig = null">
        <template #main>
            <div class="space-y-4">
                <!-- Header with Tabs -->
                <CommonPageHeader :title="String($t('configuration'))" v-model="search" show-search
                    :search-placeholder="String($t('filter'))" show-refresh :loading="loading" @refresh="refresh">
                    <template #tabs>
                        <CommonTabsNav v-model="activeTab" :tabs="configTabs" />
                    </template>
                    <template #filters>
                        <UiHostSelector v-model="manualClientId"
                            :placeholder="String($t('selectClient') || 'Select client...')" :allow-all="false" />
                    </template>
                </CommonPageHeader>

                <div v-if="selectedClientId" class="text-sm text-[var(--color-text-muted)]">
                    {{ $t('clientId') }}: <span class="font-medium text-[var(--color-text)]">{{ selectedClientId
                    }}</span>
                </div>

                <!-- Table -->
                <CommonDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                    @select="(row) => selectedConfig = row as any">
                    <template #type-data="{ row }">
                        <CommonStatusBadge status="neutral" :label="String((row as any).type)" />
                    </template>
                    <template #value-data="{ row }">
                        <span class="font-mono text-xs">{{ (row as any).value }}</span>
                    </template>
                </CommonDataTable>
            </div>
        </template>

        <template #title>{{ selectedConfig?.id }}</template>
        <template #panel>
            <div v-if="selectedConfig" class="space-y-4">
                <UFormGroup :label="$t('configId') || 'Config ID'">
                    <UInput :model-value="selectedConfig.id" disabled />
                </UFormGroup>
                <UFormGroup :label="$t('type')">
                    <UInput :model-value="selectedConfig.type" disabled />
                </UFormGroup>
                <UFormGroup :label="$t('value')">
                    <UInput v-model="selectedConfig.value" />
                </UFormGroup>
                <div class="flex gap-2 pt-4">
                    <UButton color="primary" size="sm">{{ $t('save') }}</UButton>
                    <UButton variant="outline" color="neutral" size="sm" @click="selectedConfig = null">{{ $t('cancel')
                    }}</UButton>
                </div>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { $t } = useNuxtApp()

const route = useRoute()

// Configuration tabs
const activeTab = ref('attributes')
const configTabs = [
    { label: String($t('attributes')), value: 'attributes' },
    { label: String($t('parameters')), value: 'parameters' },
]

// Route param takes precedence, but can also be selected manually
const routeClientId = computed(() => route.params.id as string || null)
const manualClientId = ref<string | null>(null)
const selectedClientId = computed(() => routeClientId.value || manualClientId.value)

const search = ref('')
const loading = ref(false)
const selectedConfig = ref<typeof configs.value[0] | null>(null)

const columns = [
    { key: 'id', label: String($t('configId') || 'Config ID') },
    { key: 'type', label: String($t('type')), class: 'hidden md:table-cell' },
    { key: 'value', label: String($t('value')) },
]

const configs = ref([
    { id: 'clientconfig.depot.id', type: 'UnicodeConfig', value: 'depot1.domain.local' },
    { id: 'clientconfig.configserver.url', type: 'UnicodeConfig', value: 'https://server.domain.local:4447' },
    { id: 'software-on-demand.active', type: 'BoolConfig', value: 'true' },
    { id: 'opsiclientd.event_gui_startup.active', type: 'BoolConfig', value: 'true' },
])

const filtered = computed(() => {
    if (!search.value) return configs.value
    const q = search.value.toLowerCase()
    return configs.value.filter(c => c.id.toLowerCase().includes(q))
})

const refresh = async () => { loading.value = true; await new Promise(r => setTimeout(r, 500)); loading.value = false }
</script>
