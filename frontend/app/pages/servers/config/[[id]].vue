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
                <CommonPageHeader :title="String($t('serverConfiguration') || 'Server Configuration')" v-model="search"
                    show-search :search-placeholder="String($t('filter'))" show-refresh :loading="loading"
                    @refresh="refresh">
                    <template #tabs>
                        <CommonTabsNav v-model="activeTab" :tabs="configTabs" />
                    </template>
                </CommonPageHeader>

                <div v-if="serverId" class="text-sm text-[var(--color-text-muted)]">
                    {{ $t('serverId') || 'Server ID' }}: <span class="font-medium text-[var(--color-text)]">{{ serverId
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
const { t: $t } = useI18n()

const route = useRoute()

// Configuration tabs
const activeTab = ref('attributes')
const configTabs = [
    { label: String($t('attributes')), value: 'attributes' },
    { label: String($t('parameters')), value: 'parameters' },
]

const serverId = computed(() => route.params.id as string || null)
const search = ref('')
const loading = ref(false)
const selectedConfig = ref<typeof configs.value[0] | null>(null)

const columns = [
    { key: 'id', label: String($t('configId') || 'Config ID') },
    { key: 'type', label: String($t('type')), class: 'hidden md:table-cell' },
    { key: 'value', label: String($t('value')) },
]

const configs = ref([
    { id: 'depot.url', type: 'UnicodeConfig', value: 'https://depot1.domain.local:4447' },
    { id: 'depot.webdav.url', type: 'UnicodeConfig', value: 'https://depot1.domain.local:4447/depot' },
    { id: 'repository.url', type: 'UnicodeConfig', value: 'https://depot1.domain.local:4447/repository' },
])

const filtered = computed(() => {
    if (!search.value) return configs.value
    const q = search.value.toLowerCase()
    return configs.value.filter(c => c.id.toLowerCase().includes(q))
})

const refresh = async () => { loading.value = true; await new Promise(r => setTimeout(r, 500)); loading.value = false }
</script>
