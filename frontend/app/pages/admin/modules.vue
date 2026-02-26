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
            <UButton :icon="icons.refresh" variant="outline" color="neutral" size="sm" :loading="loading"
                @click="refresh" />
        </div>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
            <div class="overflow-x-auto">
                <table class="w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{
                                $t('module') }}</th>
                            <th
                                class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                                {{ t('status') }}</th>
                            <th
                                class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                                {{ t('expires') }}</th>
                            <th
                                class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                                {{ t('clients') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-if="loading">
                            <td colspan="4" class="py-8 text-center">
                                <UIcon :name="icons.loading" class="w-6 h-6 animate-spin" />
                            </td>
                        </tr>
                        <tr v-for="m in modules" :key="m.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td class="px-3 md:px-4 py-3">
                                <div class="font-medium">{{ m.name }}</div>
                                <div class="text-xs text-gray-500">{{ m.id }}</div>
                            </td>
                            <td class="px-3 md:px-4 py-3 hidden sm:table-cell">
                                <span
                                    :class="['px-2 py-1 text-xs rounded-full', m.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
                                    {{ m.active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-3 md:px-4 py-3 text-gray-500 hidden md:table-cell">{{ m.expires || 'Never' }}
                            </td>
                            <td class="px-3 md:px-4 py-3 hidden md:table-cell">
                                <span v-if="m.clientLimit">{{ m.clientCount }} / {{ m.clientLimit }}</span>
                                <span v-else>Unlimited</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <span class="font-medium">{{ t('licenseInfo') }}</span>
            </template>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">{{ t('licensedTo') }}</span>
                    <span class="font-medium">Example Company GmbH</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">{{ t('licenseType') }}</span>
                    <span class="font-medium">Enterprise</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">{{ t('validUntil') }}</span>
                    <span class="font-medium">2026-12-31</span>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()

// Helper to format translation keys
const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const loading = ref(false)

const modules = ref([
    { id: 'directory-connector', name: 'Directory Connector', active: true, expires: '2026-12-31', clientLimit: 100, clientCount: 42 },
    { id: 'linux-agent', name: 'Linux Agent', active: true, expires: '2026-12-31', clientLimit: 50, clientCount: 8 },
    { id: 'macos-agent', name: 'macOS Agent', active: true, expires: '2026-12-31', clientLimit: 20, clientCount: 4 },
    { id: 'scalability', name: 'Scalability', active: true, expires: null, clientLimit: null, clientCount: null },
    { id: 'wan-extension', name: 'WAN Extension', active: false, expires: null, clientLimit: null, clientCount: null },
    { id: 'uefi-support', name: 'UEFI Support', active: true, expires: '2026-12-31', clientLimit: null, clientCount: null },
])

const refresh = async () => { loading.value = true; await new Promise(r => setTimeout(r, 500)); loading.value = false }
</script>
