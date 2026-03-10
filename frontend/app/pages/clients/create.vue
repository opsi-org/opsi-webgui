<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Client Add New page - form for adding a new client.
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
            <div v-if="error"
                class="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {{ error }}
            </div>

            <div v-if="success"
                class="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm">
                {{ $t('clientCreatedSuccessfully') }}
            </div>
            <form @submit.prevent="handleSubmit" class="w-full">
                <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Basics</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <UFormGroup label="Client ID" required :error="formErrors.id"
                            class="flex flex-row items-center gap-4">
                            <UInput v-model="form.id" :disabled="loading" size="md" class="form-input flex-1"
                                icon="i-heroicons-identification" />
                            <template #hint>
                                <span class="text-xs text-muted">Unique identifier for the client (e.g.
                                    nb-00001a.acme.corp)</span>
                            </template>
                        </UFormGroup>
                        <UFormGroup label="Description" class="flex flex-row items-center gap-4">
                            <UInput v-model="form.description" :disabled="loading" size="md" class="form-input flex-1"
                                icon="i-heroicons-document-text" />
                        </UFormGroup>
                        <UFormGroup label="Depot" required :error="formErrors.depotId"
                            class="flex flex-row items-center gap-4">
                            <USelect v-model="form.depotId" :options="depotOptions" :loading="loadingDepots"
                                :disabled="loading" size="md" class="form-input flex-1" icon="i-heroicons-server" />
                        </UFormGroup>
                        <UFormGroup label="IP Address" class="flex flex-row items-center gap-4">
                            <UInput v-model="form.ipAddress" :disabled="loading" size="md" class="form-input flex-1"
                                icon="i-heroicons-globe-alt" />
                        </UFormGroup>
                        <UFormGroup label="MAC Address" class="flex flex-row items-center gap-4">
                            <UInput v-model="form.macAddress" :disabled="loading" size="md" class="form-input flex-1"
                                icon="i-heroicons-chip" />
                            <template #hint>
                                <span class="text-xs text-muted">Format: 00:11:22:33:44:55</span>
                            </template>
                        </UFormGroup>
                        <UFormGroup label="Notes" class="flex flex-row items-center gap-4">
                            <UTextarea v-model="form.notes" :disabled="loading" :rows="4" size="md"
                                class="form-input flex-1" icon="i-heroicons-pencil-square" />
                        </UFormGroup>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mt-8">
                    <h3 class="text-lg font-semibold mb-4">Initial Setup</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <UFormGroup label="Enable Agent Setup" class="flex flex-row items-center gap-4">
                            <UCheckbox v-model="form.agentSetup" :disabled="loading" />
                        </UFormGroup>
                        <UFormGroup label="Agent Type" class="flex flex-row items-center gap-4">
                            <URadioGroup v-model="form.agentType" :options="['windows', 'linux', 'mac']"
                                :disabled="!form.agentSetup || loading" />
                        </UFormGroup>
                        <UFormGroup label="Agent Username" class="flex flex-row items-center gap-4">
                            <UInput v-model="form.agentUsername" :disabled="!form.agentSetup || loading" size="md"
                                class="form-input flex-1" />
                        </UFormGroup>
                        <UFormGroup label="Agent Password" class="flex flex-row items-center gap-4">
                            <UInput v-model="form.agentPassword" :disabled="!form.agentSetup || loading" size="md"
                                class="form-input flex-1" type="password" />
                        </UFormGroup>
                        <UFormGroup label="Netboot Products" class="flex flex-row items-center gap-4">
                            <USelect v-model="form.netbootProducts" :options="netbootProductOptions" multiple
                                :disabled="loading" size="md" class="form-input flex-1" />
                        </UFormGroup>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mt-8">
                    <h3 class="text-lg font-semibold mb-4">Assignments</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <UFormGroup label="Groups" class="flex flex-row items-center gap-4">
                            <USelect v-model="form.groups" :options="groupOptions" multiple :disabled="loading"
                                size="md" class="form-input flex-1" />
                        </UFormGroup>
                    </div>
                </div>
            </form>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
const { apiPost, getDepots } = useApiHelpers()
const stateStore = useStateStore()

const netbootProductOptions = ref<Array<{ label: string; value: string }>>([])
const groupOptions = ref<Array<{ label: string; value: string }>>([])

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
    agentSetup: false,
    agentType: 'windows',
    agentUsername: '',
    agentPassword: '',
    netbootProducts: [],
    groups: [],
})

const formErrors = reactive({
    id: '',
    depotId: '',
})

const depotOptions = computed(() => depots.value.map(d => ({
    label: d.description ? `${d.depotId} - ${d.description}` : d.depotId,
    value: d.depotId
})))

onMounted(async () => {
    loadingDepots.value = true
    try {
        const res = await getDepots()
        if (res.data) {
            depots.value = res.data
            if (stateStore.depots.length > 0 && stateStore.depots[0]) {
                form.depotId = stateStore.depots[0]
            } else if (depots.value.length > 0 && depots.value[0]) {
                form.depotId = depots.value[0].depotId
            }
        }
        const netbootRes = await apiPost('/opsidata/depots/products', { selectedDepots: [form.depotId] })
        if (netbootRes.data && Array.isArray(netbootRes.data)) {
            netbootProductOptions.value = netbootRes.data.map((item: any) => ({ label: item.productId, value: item.productId }))
        }
        const groupRes = await apiPost('/opsidata/hosts/groups/id', {})
        if (groupRes.data && Array.isArray(groupRes.data)) {
            groupOptions.value = groupRes.data.map((item: any) => ({ label: item, value: item }))
        }
    } catch (e) {
        console.error('Failed to fetch depots/products/groups:', e)
    } finally {
        loadingDepots.value = false
    }
})

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
        setTimeout(() => navigateTo('/clients'), 1500)
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : String($t('errorCreatingClient'))
    } finally {
        loading.value = false
    }
}
</script>
