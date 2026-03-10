<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
Client Clone component - form for cloning a client.
-->
<template>
    <div class="space-y-3">
        <div v-if="success"
            class="text-xs text-green-600 dark:text-green-400 p-2 rounded bg-green-50 dark:bg-green-900/20">
            {{ $t('clientClonedSuccessfully') }}
        </div>
        <div v-if="error" class="text-xs text-red-500 p-2 rounded bg-red-50 dark:bg-red-900/20">
            {{ error }}
        </div>

        <form class="space-y-2" @submit.prevent="handleSubmit">
            <UFormField :label="$t('sourceClient')" size="sm">
                <UInput :model-value="sourceId" disabled size="sm" />
            </UFormField>

            <UFormField :label="$t('newClientId')" required :error="formErrors.newId" size="sm">
                <UInput v-model="form.newId" placeholder="newclient.domain.local" :disabled="loading" size="sm" />
            </UFormField>

            <UFormField :label="$t('description')" size="sm">
                <UInput v-model="form.description" :placeholder="$t('description')" :disabled="loading" size="sm" />
            </UFormField>

            <UFormField :label="$t('ipAddress')" size="sm">
                <UInput v-model="form.ipAddress" placeholder="192.168.1.x" :disabled="loading" size="sm" />
            </UFormField>

            <UFormField :label="$t('macAddress')" size="sm">
                <UInput v-model="form.macAddress" placeholder="00:11:22:33:44:66" :disabled="loading" size="sm" />
            </UFormField>

            <UButton type="submit" color="primary" size="sm" :loading="loading" block>
                {{ $t('clone') }}
            </UButton>
        </form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    sourceId: string
}>()

const emit = defineEmits<{
    success: []
}>()

const { t: $t } = useI18n()
const { apiPost } = useApiHelpers()

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

function validateForm(): boolean {
    formErrors.newId = ''
    if (!form.newId.trim()) {
        formErrors.newId = String($t('newClientIdRequired'))
        return false
    }
    if (!form.newId.includes('.')) {
        formErrors.newId = String($t('clientIdMustBeFqdn'))
        return false
    }
    return true
}

async function handleSubmit() {
    if (!validateForm()) return
    loading.value = true
    error.value = null
    success.value = false
    try {
        await apiPost('/opsidata/clients/clone', {
            sourceClientId: props.sourceId,
            newClientId: form.newId,
            description: form.description || undefined,
            ipAddress: form.ipAddress || undefined,
            macAddress: form.macAddress || undefined,
        })
        success.value = true
        form.newId = ''
        form.description = ''
        form.ipAddress = ''
        form.macAddress = ''
        emit('success')
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : String($t('failedToCloneClient'))
    } finally {
        loading.value = false
    }
}

watch(() => props.sourceId, () => {
    error.value = null
    success.value = false
    form.newId = ''
    form.description = ''
    form.ipAddress = ''
    form.macAddress = ''
})
</script>
