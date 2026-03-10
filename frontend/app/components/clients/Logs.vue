<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Client Logs component - displays various logs for a given client
-->
<template>
    <div class="space-y-3">
        <!-- Log type pills -->
        <div class="flex flex-wrap gap-1">
            <UButton v-for="lt in LOG_TYPES" :key="lt.type" size="xs"
                :color="activeLogType === lt.type ? 'primary' : 'neutral'"
                :variant="activeLogType === lt.type ? 'solid' : 'outline'"
                :loading="loading && activeLogType === lt.type" @click="loadLog(lt.type)">
                {{ lt.type }}
            </UButton>
        </div>

        <!-- Log content -->
        <div v-if="activeLogType">
            <div v-if="loading" class="py-6 text-center">
                <UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-muted" />
            </div>
            <div v-else-if="error" class="text-xs text-red-500 p-2 rounded bg-red-50 dark:bg-red-900/20">
                {{ error }}
            </div>
            <pre v-else
                class="bg-muted/30 border border-default rounded p-2 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-72">{{ logContent || $t('noLogsFound') }}</pre>
        </div>
        <p v-else class="text-xs text-muted">{{ $t('selectLogType') }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    clientId: string
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { apiGet } = useApiHelpers()

const LOG_TYPES = [
    { type: 'instlog', description: 'Installation log' },
    { type: 'clientconnect', description: 'Client connect log' },
    { type: 'userlogin', description: 'User login log' },
    { type: 'bootimage', description: 'Boot image log' },
    { type: 'opsiconfd', description: 'Opsiconfd log' },
    { type: 'opsiclientd', description: 'Opsiclientd log' },
]

const activeLogType = ref<string | null>(null)
const logContent = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)

async function loadLog(type: string) {
    activeLogType.value = type
    loading.value = true
    error.value = null
    logContent.value = ''
    try {
        const data = await apiGet<string>('/opsidata/log', {
            selectedClient: props.clientId,
            selectedLogType: type,
            numberOfLines: 200,
        })
        logContent.value = Array.isArray(data) ? data.join('\n') : String(data ?? '')
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : String(e)
    } finally {
        loading.value = false
    }
}

// Reset on clientId change
watch(() => props.clientId, () => {
    activeLogType.value = null
    logContent.value = ''
    error.value = null
})
</script>
