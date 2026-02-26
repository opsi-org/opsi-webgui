<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <CommonDetailPanel :showPanel="!!selectedServer" @close="selectedServer = null">
        <template #main>
            <div class="space-y-4">
                <!-- Header -->
                <CommonPageHeader :title="String($t('servers'))" v-model="search" show-search
                    :search-placeholder="String($t('filter'))" show-refresh :loading="loading" @refresh="refresh" />

                <!-- Table -->
                <CommonDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                    @select="(row) => selectedServer = row as any">
                    <template #type-data="{ row }">
                        <CommonStatusBadge :status="(row as any).type === 'configserver' ? 'info' : 'neutral'"
                            :label="String((row as any).type === 'configserver' ? $t('configserver') : $t('depot'))" />
                    </template>
                    <template #actions-data="{ row }">
                        <UButton :icon="icons.config" variant="ghost" color="neutral" size="xs"
                            @click.stop="navigateTo(`/servers/config/${(row as any).id}`)" />
                    </template>
                </CommonDataTable>
            </div>
        </template>

        <template #title>{{ selectedServer?.id }}</template>
        <template #panel>
            <div v-if="selectedServer" class="space-y-4">
                <div class="space-y-2">
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('serverId') || 'Server ID'
                            }}:</span> <span class="ml-2 font-medium">{{ selectedServer.id }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('description') }}:</span> <span
                            class="ml-2">{{ selectedServer.description || '-' }}</span></div>
                    <div>
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('type') }}:</span>
                        <CommonStatusBadge class="ml-2"
                            :status="selectedServer.type === 'configserver' ? 'info' : 'neutral'"
                            :label="String(selectedServer.type === 'configserver' ? $t('configserver') : $t('depot'))" />
                    </div>
                </div>
                <div class="flex gap-2 pt-4 border-t border-[var(--color-border)]">
                    <UButton size="sm" :icon="icons.config" color="primary"
                        @click="navigateTo(`/servers/config/${selectedServer.id}`)">
                        {{ $t('configuration') }}</UButton>
                </div>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { $t } = useNuxtApp()

const search = ref('')
const loading = ref(false)
const selectedServer = ref<typeof servers.value[0] | null>(null)

const columns = [
    { key: 'id', label: String($t('serverId') || 'Server ID') },
    { key: 'description', label: String($t('description')), class: 'hidden md:table-cell' },
    { key: 'type', label: String($t('type')), class: 'hidden sm:table-cell' },
    { key: 'actions', label: String($t('actions')) },
]

const servers = ref([
    { id: 'configserver.domain.local', description: 'Main Config Server', type: 'configserver' },
    { id: 'depot1.domain.local', description: 'Primary Depot', type: 'depotserver' },
    { id: 'depot2.domain.local', description: 'Secondary Depot', type: 'depotserver' },
])

const filtered = computed(() => {
    if (!search.value) return servers.value
    const q = search.value.toLowerCase()
    return servers.value.filter(s => s.id.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q))
})

const refresh = async () => { loading.value = true; await new Promise(r => setTimeout(r, 500)); loading.value = false }
</script>
