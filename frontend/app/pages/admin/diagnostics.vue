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
                <div v-for="check in checks" :key="check.id" class="flex items-start gap-3 p-3 rounded border" :class="check.status === 'ok' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
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
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { $t } = useNuxtApp()

// Helper to format translation keys
const t = (key: string) => {
  const translated = $t(key)
  if (translated && translated !== key) return String(translated)
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const loading = ref(false)

const stats = computed(() => [
    { label: 'OK', value: checks.value.filter(c => c.status === 'ok').length, color: 'text-green-500' },
    { label: 'Warnings', value: checks.value.filter(c => c.status === 'warning').length, color: 'text-yellow-500' },
    { label: 'Errors', value: checks.value.filter(c => c.status === 'error').length, color: 'text-red-500' },
])

const checks = ref([
    { id: 'redis', name: 'Redis Connection', status: 'ok', message: 'Redis server is running and responsive' },
    { id: 'mysql', name: 'MySQL Connection', status: 'ok', message: 'Database connection is healthy' },
    { id: 'disk', name: 'Disk Space', status: 'warning', message: 'Disk usage is at 85%' },
    { id: 'memory', name: 'Memory Usage', status: 'ok', message: 'Memory usage is within normal limits' },
    { id: 'ssl', name: 'SSL Certificate', status: 'ok', message: 'Certificate valid until 2026-02-25' },
    { id: 'license', name: 'License Status', status: 'ok', message: 'License is active and valid' },
])

const refresh = async () => {
    loading.value = true
    await new Promise(r => setTimeout(r, 1000))
    loading.value = false
}
</script>
