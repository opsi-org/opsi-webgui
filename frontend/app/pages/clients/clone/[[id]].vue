<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsPageLayout :showSearch="false" :showRefresh="false">
        <template #actions>
            <UButton variant="outline" color="neutral" @click="navigateTo('/clients')" :disabled="loading">
                {{ $t('button.cancel') }}
            </UButton>
            <UButton color="primary" :loading="loading" @click="handleSubmit">
                {{ t('button.clone') }}
            </UButton>
        </template>

        <div class="h-full overflow-auto p-4">

            <!-- Error Alert -->
            <div v-if="error"
                class="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {{ error }}
            </div>

            <!-- Success Alert -->
            <div v-if="success"
                class="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm">
                {{ $t('clientClonedSuccessfully') }}
            </div>

            <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Left column -->
                <div class="space-y-4">
                    <UFormGroup :label="$t('sourceClient')">
                        <UInput :model-value="sourceClientId" disabled />
                    </UFormGroup>

                    <UFormGroup :label="$t('newClientId')" required :error="formErrors.newId">
                        <UInput v-model="form.newId" placeholder="newclient.domain.local" :disabled="loading" />
                        <template #hint>
                            <span class="text-xs text-gray-500">{{ $t('clientIdHint') }}</span>
                        </template>
                    </UFormGroup>

                    <UFormGroup :label="$t('description')">
                        <UInput v-model="form.description" :placeholder="String($t('description'))"
                            :disabled="loading" />
                    </UFormGroup>
                </div>

                <!-- Right column -->
                <div class="space-y-4">
                    <UFormGroup :label="$t('ipAddress')">
                        <UInput v-model="form.ipAddress" placeholder="192.168.1.101" :disabled="loading" />
                    </UFormGroup>

                    <UFormGroup :label="$t('macAddress')">
                        <UInput v-model="form.macAddress" placeholder="00:11:22:33:44:66" :disabled="loading" />
                        <template #hint>
                            <span class="text-xs text-gray-500">{{ $t('macAddressHint') }}</span>
                        </template>
                    </UFormGroup>

                    <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-700 dark:text-blue-300">
                        <p class="font-medium mb-1">{{ t('cloneOptions') }}:</p>
                        <ul class="list-disc list-inside space-y-1 text-xs">
                            <li>{{ $t('cloneProductConfigs') }}</li>
                            <li>{{ $t('cloneClientConfigs') }}</li>
                            <li>{{ $t('cloneGroupMemberships') }}</li>
                        </ul>
                    </div>
                </div>
            </form>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { apiPost } = useApiHelpers()

const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}
const route = useRoute()

const sourceClientId = computed(() => route.params.id as string || '')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const form = reactive({
    newId: '',
    description: '',
    ipAddress: '',
    macAddress: '',
})

const formErrors = reactive({
    newId: '',
})

// Validate form
function validateForm(): boolean {
    formErrors.newId = ''
    let valid = true

    if (!form.newId.trim()) {
        formErrors.newId = String($t('newClientIdRequired'))
        valid = false
    } else if (!form.newId.includes('.')) {
        formErrors.newId = String($t('clientIdMustBeFqdn'))
        valid = false
    }

    return valid
}

const handleSubmit = async () => {
    if (!validateForm()) return

    loading.value = true
    error.value = null
    success.value = false

    try {
        // Clone client via API
        const res = await apiPost<{ success: boolean }>('/opsidata/clients/clone', {
            sourceClientId: sourceClientId.value,
            newClientId: form.newId,
            description: form.description || undefined,
            ipAddress: form.ipAddress || undefined,
            macAddress: form.macAddress || undefined,
        })

        if (res.error) {
            error.value = res.error.message || String($t('failedToCloneClient'))
        } else {
            success.value = true
            // Reset form
            form.newId = ''
            form.description = ''
            form.ipAddress = ''
            form.macAddress = ''
            // Navigate to clients list after short delay
            setTimeout(() => navigateTo('/clients'), 1500)
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : String($t('failedToCloneClient'))
    } finally {
        loading.value = false
    }
}
</script>
