<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
Client Clone component - form for cloning a client.
-->
<template>
    <div class="space-y-4">
        <UAlert v-if="success" color="success" :title="String($t('success'))">
            <template #description>{{ $t('clientClonedSuccessfully') }}</template>
        </UAlert>

        <UAlert v-if="error" color="error" :title="String($t('error'))" :description="error"
            :close-button="{ icon: 'i-heroicons-x-mark' }" @close="error = null" />

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Source Client Section -->
            <div>
                <p class="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">{{ $t('source') }}</p>
                <div class="rounded-lg border border-[--color-border]">
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 bg-[--color-surface]">
                        <label class="text-sm font-medium text-muted shrink-0">{{ $t('sourceClient') }}</label>
                        <span class="text-sm font-mono text-[--color-text]">{{ sourceId }}</span>
                    </div>
                </div>
            </div>

            <!-- New Client Section -->
            <div>
                <p class="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">{{ $t('newClient') }}</p>
                <div
                    class="rounded-lg border border-[--color-border] bg-white dark:bg-[--color-surface] shadow-sm dark:shadow-none">
                    <!-- New Client ID -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0">
                            {{ $t('clientId') }} <span class="text-error">*</span>
                        </label>
                        <div class="flex flex-col gap-1">
                            <UInput v-model="form.newId" :disabled="loading" size="sm"
                                :placeholder="$t('e.g. newclient.domain.local')" />
                            <span v-if="formErrors.newId" class="text-xs text-error">{{ formErrors.newId }}</span>
                        </div>
                    </div>
                    <!-- Description -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 border-t border-[--color-border] hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0">{{ $t('description') }}</label>
                        <UInput v-model="form.description" :disabled="loading" size="sm"
                            :placeholder="$t('optionalDescription')" />
                    </div>
                    <!-- IP Address -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 border-t border-[--color-border] hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0">{{ $t('ipAddress') }}</label>
                        <UInput v-model="form.ipAddress" :disabled="loading" size="sm" placeholder="192.168.1.x" />
                    </div>
                    <!-- MAC Address -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 border-t border-[--color-border] hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0">{{ $t('macAddress') }}</label>
                        <UInput v-model="form.macAddress" :disabled="loading" size="sm"
                            placeholder="00:11:22:33:44:55" />
                    </div>
                    <!-- Notes -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-x-4 gap-y-1 px-3 py-2 border-t border-[--color-border] hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0 pt-1">{{ $t('notes') }}</label>
                        <UTextarea v-model="form.notes" :disabled="loading" :rows="2" size="sm" />
                    </div>
                </div>
            </div>

            <!-- Clone Options Section -->
            <div>
                <p class="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">{{ $t('cloneOptions') }}
                </p>
                <div
                    class="rounded-lg border border-[--color-border] bg-white dark:bg-[--color-surface] shadow-sm dark:shadow-none">
                    <!-- Copy Product States -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0">{{ $t('copyProductStates') }}</label>
                        <UToggle v-model="form.copyProductStates" :disabled="loading" />
                    </div>
                    <!-- Copy Config States -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 border-t border-[--color-border] hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0">{{ $t('copyConfigStates') }}</label>
                        <UToggle v-model="form.copyConfigStates" :disabled="loading" />
                    </div>
                    <!-- Copy Group Memberships -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-x-4 gap-y-1 px-3 py-2 border-t border-[--color-border] hover:bg-gray-50 dark:hover:bg-[--color-surface-hover] transition-colors">
                        <label class="text-sm font-medium text-default shrink-0">{{ $t('copyGroups') }}</label>
                        <UToggle v-model="form.copyGroups" :disabled="loading" />
                    </div>
                </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-end gap-2 pt-2">
                <UButton type="submit" color="primary" size="sm" :loading="loading">
                    <UIcon :name="icons.clone" class="w-4 h-4 mr-1" />
                    {{ $t('cloneClient') }}
                </UButton>
            </div>
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

const icons = useIcons()
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
    notes: '',
    copyProductStates: true,
    copyConfigStates: true,
    copyGroups: true,
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
            newClientId: form.newId.trim(),
            description: form.description.trim() || undefined,
            ipAddress: form.ipAddress.trim() || undefined,
            macAddress: form.macAddress.trim() || undefined,
            notes: form.notes.trim() || undefined,
            copyProductStates: form.copyProductStates,
            copyConfigStates: form.copyConfigStates,
            copyGroups: form.copyGroups,
        })
        success.value = true
        // Reset form
        form.newId = ''
        form.description = ''
        form.ipAddress = ''
        form.macAddress = ''
        form.notes = ''
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
    form.notes = ''
})
</script>
