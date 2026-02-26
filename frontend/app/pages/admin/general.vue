<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h1 class="text-xl md:text-2xl font-bold text-[var(--color-text)]">{{ $t('system') }}</h1>
            <UButton :icon="icons.refresh" variant="ghost" color="neutral" :loading="loading" @click="fetchData">
                {{ $t('refresh') }}
            </UButton>
        </div>

        <!-- Error State -->
        <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {{ error }}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UCard>
                <template #header>
                    <span class="font-medium">{{ $t('serverInformation') || 'Server Information' }}</span>
                </template>
                <div v-if="loading" class="py-4 text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
                </div>
                <div v-else class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('hostname') || 'Hostname' }}</span>
                        <span class="font-medium">{{ serverInfo?.hostname || serverInfo?.computerName || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('version') }}</span>
                        <span class="font-medium">{{ serverInfo?.opsiVersion || '-' }}</span>
                    </div>
                    <div v-if="serverInfo?.ip" class="flex justify-between">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('ipAddress') || 'IP Address'
                            }}</span>
                        <span class="font-medium">{{ serverInfo.ip }}</span>
                    </div>
                    <div v-if="serverInfo?.os" class="flex justify-between">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('operatingSystem') || 'OS' }}</span>
                        <span class="font-medium">{{ serverInfo.os }}</span>
                    </div>
                </div>
            </UCard>

            <UCard>
                <template #header>
                    <span class="font-medium">{{ $t('statistics') || 'Statistics' }}</span>
                </template>
                <div v-if="loading" class="py-4 text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
                </div>
                <div v-else class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('clientsTotal') || 'Clients'
                            }}</span>
                        <span class="font-medium">{{ stats.clients }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('depots') }}</span>
                        <span class="font-medium">{{ stats.depots }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('products') }}</span>
                        <span class="font-medium">{{ stats.products }}</span>
                    </div>
                </div>
            </UCard>

            <UCard>
                <template #header>
                    <span class="font-medium">{{ $t('maintenance') }}</span>
                </template>
                <div class="space-y-3">
                    <UButton block variant="outline" color="neutral" :icon="icons.refresh">
                        {{ $t('reloadConfig') || 'Reload Config' }}
                    </UButton>
                    <UButton block variant="outline" :icon="icons.delete" color="error">
                        {{ $t('clearCache') || 'Clear Cache' }}
                    </UButton>
                </div>
            </UCard>

            <UCard>
                <template #header>
                    <span class="font-medium">{{ $t('backup') }}</span>
                </template>
                <div class="space-y-3">
                    <div class="text-sm text-[var(--color-text-muted)]">
                        {{ $t('backupDescription') || 'Create or restore system backups' }}
                    </div>
                    <UButton block color="primary" :icon="icons.copy">
                        {{ $t('createBackup') }}
                    </UButton>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface ServerInfo {
    opsiVersion?: string
    hostname?: string
    computerName?: string
    pythonVersion?: string
    uptime?: number
    os?: string
    ip?: string
}

const icons = useIcons()
const { t: $t } = useI18n()
const { getServerInfo, getClients, getDepots, getProducts } = useApiHelpers()

const loading = ref(false)
const error = ref<string | null>(null)
const serverInfo = ref<ServerInfo | null>(null)
const stats = ref({
    clients: 0,
    depots: 0,
    products: 0,
})

const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
        // Fetch server info and stats in parallel
        const [serverRes, clientsRes, depotsRes, productsRes] = await Promise.all([
            getServerInfo(),
            getClients({ perPage: 1 }),
            getDepots(),
            getProducts({ type: 'LocalbootProduct', perPage: 1 }),
        ])

        if (serverRes.data) {
            serverInfo.value = serverRes.data as ServerInfo
        }

        // Get counts from responses
        if (clientsRes.data && Array.isArray(clientsRes.data)) {
            stats.value.clients = clientsRes.data.length
        }
        if (depotsRes.data && Array.isArray(depotsRes.data)) {
            stats.value.depots = depotsRes.data.length
        }
        if (productsRes.data && Array.isArray(productsRes.data)) {
            stats.value.products = productsRes.data.length
        }
    } catch (err: unknown) {
        console.error('Failed to fetch admin data:', err)
        error.value = err instanceof Error ? err.message : $t('errorFetchingData')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()
})
</script>
