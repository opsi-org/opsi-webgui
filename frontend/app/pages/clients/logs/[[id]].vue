<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <CommonDetailPanel :showPanel="!!selectedLog" @close="selectedLog = null">
        <template #main>
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{{ t('logs') }}</h1>
                        <p v-if="clientId" class="text-sm text-gray-500">{{ clientId }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <UInput v-model="search" :placeholder="String($t('filter'))" :icon="icons.search" size="sm"
                            class="w-full sm:w-48" />
                        <UButton :icon="icons.refresh" variant="outline" color="neutral" size="sm" :loading="loading"
                            @click="refresh" />
                    </div>
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
                                        {{ t('timestamp') }}</th>
                                    <th
                                        class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                                        {{ t('size') }}</th>
                                    <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {{ t('actions') }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-if="loading">
                                    <td colspan="4" class="py-8 text-center">
                                        <UIcon :name="icons.loading" class="w-6 h-6 animate-spin" />
                                    </td>
                                </tr>
                                <tr v-else-if="!filtered.length">
                                    <td colspan="4" class="py-8 text-center text-gray-500">{{
                                        $t('message.noItemsSelected') }}</td>
                                </tr>
                                <tr v-for="l in filtered" :key="l.type" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td class="px-3 md:px-4 py-3 font-medium">{{ l.type }}</td>
                                    <td class="px-3 md:px-4 py-3 text-gray-500 hidden sm:table-cell">{{ l.timestamp }}
                                    </td>
                                    <td class="px-3 md:px-4 py-3 text-gray-500 hidden md:table-cell">{{ l.size }}</td>
                                    <td class="px-3 md:px-4 py-3">
                                        <UButton :icon="icons.eye" variant="ghost" size="xs" @click="selectedLog = l" />
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
                <div class="text-sm text-gray-500">{{ selectedLog.timestamp }}</div>
                <pre
                    class="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto max-h-96 font-mono">{{ selectedLog.content }}</pre>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { $t } = useNuxtApp()

const t = (key: string) => {
  const translated = $t(key)
  if (translated && translated !== key) return String(translated)
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}
const route = useRoute()

const clientId = computed(() => route.params.id as string || null)
const search = ref('')
const loading = ref(false)
const selectedLog = ref<typeof logs.value[0] | null>(null)

const logs = ref([
    { type: 'instlog', timestamp: '2025-02-25 14:30:00', size: '24 KB', content: '[1] [Feb 25 14:30:00] opsi-script 4.12.4.1\n[1] [Feb 25 14:30:00] Start of script execution...\n[2] [Feb 25 14:30:01] Installing product hwaudit...\n[5] [Feb 25 14:30:15] Installation completed successfully.' },
    { type: 'bootimage', timestamp: '2025-02-24 09:15:00', size: '12 KB', content: 'Boot image log content...' },
    { type: 'clientconnect', timestamp: '2025-02-25 08:00:00', size: '8 KB', content: 'Client connection log...' },
    { type: 'opsiclientd', timestamp: '2025-02-25 14:00:00', size: '156 KB', content: 'Opsiclientd service log...' },
])

const filtered = computed(() => {
    if (!search.value) return logs.value
    const q = search.value.toLowerCase()
    return logs.value.filter(l => l.type.toLowerCase().includes(q))
})

const refresh = async () => { loading.value = true; await new Promise(r => setTimeout(r, 500)); loading.value = false }
</script>
