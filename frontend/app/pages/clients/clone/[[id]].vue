<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="max-w-2xl mx-auto">
        <UCard>
            <template #header>
                <div class="flex items-center gap-3">
                    <UIcon :name="icons.clone" class="w-5 h-5 text-opsi-blue" />
                    <h2 class="text-lg font-semibold">{{ t('clone') }} {{ t('client') }}</h2>
                </div>
            </template>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <UFormGroup :label="$t('sourceClient')">
                    <UInput :model-value="sourceClientId" disabled />
                </UFormGroup>

                <UFormGroup :label="$t('newClientId')" required>
                    <UInput v-model="form.newId" placeholder="newclient.domain.local" />
                </UFormGroup>

                <UFormGroup :label="$t('description')">
                    <UInput v-model="form.description" :placeholder="String($t('description'))" />
                </UFormGroup>

                <UFormGroup :label="$t('ipAddress')">
                    <UInput v-model="form.ipAddress" placeholder="192.168.1.101" />
                </UFormGroup>

                <UFormGroup :label="$t('macAddress')">
                    <UInput v-model="form.macAddress" placeholder="00:11:22:33:44:66" />
                </UFormGroup>

                <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-700 dark:text-blue-300">
                    <p class="font-medium mb-1">{{ t('cloneOptions') }}:</p>
                    <ul class="list-disc list-inside space-y-1 text-xs">
                        <li>Product configurations will be copied</li>
                        <li>Client configurations will be copied</li>
                        <li>Group memberships will be copied</li>
                    </ul>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <UButton type="button" variant="outline" color="neutral" @click="navigateTo('/clients')">{{
                        $t('button.cancel')
                    }}</UButton>
                    <UButton type="submit" color="primary" :loading="loading">{{ t('button.clone') }}</UButton>
                </div>
            </form>
        </UCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()

const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}
const route = useRoute()

const sourceClientId = computed(() => route.params.id as string || 'Select a client')
const loading = ref(false)
const form = reactive({
    newId: '',
    description: '',
    ipAddress: '',
    macAddress: '',
})

const handleSubmit = async () => {
    loading.value = true
    await new Promise(r => setTimeout(r, 500))
    loading.value = false
    await navigateTo('/clients')
}
</script>
