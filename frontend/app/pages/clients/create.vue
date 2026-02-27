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
                {{ $t('button.save') }}
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
                {{ $t('clientCreatedSuccessfully') }}
            </div>

            <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Left column -->
                <div class="space-y-4">
                    <UFormGroup :label="$t('clientId')" required :error="formErrors.id">
                        <UInput v-model="form.id" placeholder="client.domain.local" :disabled="loading" />
                        <template #hint>
                            <span class="text-xs text-[var(--color-text-muted)]">{{ $t('clientIdHint') }}</span>
                        </template>
                    </UFormGroup>

                    <UFormGroup :label="$t('description')">
                        <UInput v-model="form.description" :placeholder="String($t('description'))"
                            :disabled="loading" />
                    </UFormGroup>

                    <UFormGroup :label="$t('depot')" required :error="formErrors.depotId">
                        <USelect v-model="form.depotId" :options="depotOptions" :placeholder="String($t('selectDepot'))"
                            :loading="loadingDepots" :disabled="loading" />
                    </UFormGroup>
                </div>

                <!-- Right column -->
                <div class="space-y-4">
                    <UFormGroup :label="$t('ipAddress')">
                        <UInput v-model="form.ipAddress" placeholder="192.168.1.100" :disabled="loading" />
                    </UFormGroup>

                    <UFormGroup :label="$t('macAddress')">
                        <UInput v-model="form.macAddress" placeholder="00:11:22:33:44:55" :disabled="loading" />
                        <template #hint>
                            <span class="text-xs text-[var(--color-text-muted)]">{{ $t('macAddressHint') }}</span>
                        </template>
                    </UFormGroup>

                    <UFormGroup :label="$t('notes')">
                        <UTextarea v-model="form.notes" :placeholder="String($t('notes'))" :disabled="loading"
                            rows="4" />
                    </UFormGroup>
                </div>
            </form>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { apiPost, getDepots } = useApiHelpers()
const stateStore = useStateStore()

const t = (key: string) => {
    const translated = $t(key)
    if (translated && translated !== key) return String(translated)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const loading = ref(false)
const loadingDepots = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const depots = ref<Array<{ depotId: string; description: string }>>([])

const form = reactive({
    id: '',
    description: '',
    depotId: '',
    ipAddress: '',
    macAddress: '',
    notes: '',
})

const formErrors = reactive({
    id: '',
    depotId: '',
})

// Depot options for select
const depotOptions = computed(() => depots.value.map(d => ({
    label: d.description ? `${d.depotId} - ${d.description}` : d.depotId,
    value: d.depotId
})))

// Fetch depots on mount
onMounted(async () => {
    loadingDepots.value = true
    try {
        const res = await getDepots()
        if (res.data) {
            depots.value = res.data
            // Set default depot from state store if available
            if (stateStore.depots.length > 0 && stateStore.depots[0]) {
                form.depotId = stateStore.depots[0]
            } else if (depots.value.length > 0 && depots.value[0]) {
                form.depotId = depots.value[0].depotId
            }
        }
    } catch (e) {
        console.error('Failed to fetch depots:', e)
    } finally {
        loadingDepots.value = false
    }
})

// Validate form
function validateForm(): boolean {
    formErrors.id = ''
    formErrors.depotId = ''
    let valid = true

    if (!form.id.trim()) {
        formErrors.id = String($t('clientIdRequired'))
        valid = false
    } else if (!form.id.includes('.')) {
        formErrors.id = String($t('clientIdMustBeFQDN'))
        valid = false
    }

    if (!form.depotId) {
        formErrors.depotId = String($t('depotRequired'))
        valid = false
    }

    return valid
}

const handleSubmit = async () => {
    error.value = null
    success.value = false

    if (!validateForm()) {
        return
    }

    loading.value = true
    try {
        const clientData = {
            clientId: form.id.trim(),
            description: form.description.trim(),
            ipAddress: form.ipAddress.trim() || null,
            hardwareAddress: form.macAddress.trim() || null,
            notes: form.notes.trim() || null,
            depotId: form.depotId,
        }

        const res = await apiPost('/opsidata/clients', clientData)
        if (res.error) {
            throw res.error
        }

        success.value = true
        // Navigate to clients list after short delay
        setTimeout(() => navigateTo('/clients'), 1500)
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : String($t('errorCreatingClient'))
    } finally {
        loading.value = false
    }
}
</script>
