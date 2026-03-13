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

        <div class="h-full overflow-auto">
            <UAlert v-if="error" color="error" :title="String($t('error'))" :description="error" class="mb-4"
                :close-button="{ icon: 'i-heroicons-x-mark' }" @close="error = null" />

            <UAlert v-if="success" color="success" :title="String($t('success'))" class="mb-4">
                <template #description>{{ $t('clientCreatedSuccessfully') }}</template>
            </UAlert>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Basics Section -->
                <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">{{ $t('basics') }}</p>
                    <div
                        class="rounded-lg border border-(--color-border) dark:border-(--color-border) bg-white dark:bg-(--color-surface) shadow-sm dark:shadow-none">
                        <!-- Client ID -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">
                                {{ $t('clientId') }} <span class="text-error">*</span>
                            </label>
                            <div class="flex flex-col gap-1">
                                <UInput v-model="form.id" :disabled="loading" size="sm"
                                    :placeholder="$t('e.g. nb-00001.acme.corp')" />
                                <span v-if="formErrors.id" class="text-xs text-error">{{ formErrors.id }}</span>
                            </div>
                        </div>
                        <!-- Description -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('description') }}</label>
                            <UInput v-model="form.description" :disabled="loading" size="sm" />
                        </div>
                        <!-- Depot -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">
                                {{ $t('depot') }} <span class="text-error">*</span>
                            </label>
                            <div class="flex flex-col gap-1">
                                <USelect v-model="form.depotId" :items="depotOptions" :loading="loadingDepots"
                                    :disabled="loading" size="sm" class="w-full" />
                                <span v-if="formErrors.depotId" class="text-xs text-error">{{ formErrors.depotId
                                    }}</span>
                            </div>
                        </div>
                        <!-- IP Address -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('ipAddress') }}</label>
                            <UInput v-model="form.ipAddress" :disabled="loading" size="sm"
                                placeholder="192.168.1.100" />
                        </div>
                        <!-- MAC Address -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('macAddress') }}</label>
                            <UInput v-model="form.macAddress" :disabled="loading" size="sm"
                                placeholder="00:11:22:33:44:55" />
                        </div>
                        <!-- Notes -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-start gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0 pt-1.5">{{ $t('notes') }}</label>
                            <UTextarea v-model="form.notes" :disabled="loading" :rows="3" size="sm" />
                        </div>
                    </div>
                </div>

                <!-- Initial Setup Section -->
                <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">{{ $t('initialSetup')
                        }}</p>
                    <div
                        class="rounded-lg border border-(--color-border) dark:border-(--color-border) bg-white dark:bg-(--color-surface) shadow-sm dark:shadow-none">
                        <!-- Agent Setup -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('enableAgentSetup')
                                }}</label>
                            <UToggle v-model="form.agentSetup" :disabled="loading" />
                        </div>
                        <!-- Agent Type -->
                        <div class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors"
                            :class="{ 'opacity-50': !form.agentSetup }">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('agentType') }}</label>
                            <URadioGroup v-model="form.agentType"
                                :items="[{ label: 'Windows', value: 'windows' }, { label: 'Linux', value: 'linux' }, { label: 'Mac', value: 'mac' }]"
                                :disabled="!form.agentSetup || loading" />
                        </div>
                        <!-- Agent Username -->
                        <div class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors"
                            :class="{ 'opacity-50': !form.agentSetup }">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('agentUsername') }}</label>
                            <UInput v-model="form.agentUsername" :disabled="!form.agentSetup || loading" size="sm" />
                        </div>
                        <!-- Agent Password -->
                        <div class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors"
                            :class="{ 'opacity-50': !form.agentSetup }">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('agentPassword') }}</label>
                            <SharedPasswordInput v-model="form.agentPassword" :disabled="!form.agentSetup || loading"
                                size="sm" />
                        </div>
                        <!-- Netboot Products -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 border-t border-(--color-border) hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('netbootProducts') }}</label>
                            <USelectMenu v-model="form.netbootProducts" :items="netbootProductOptions" multiple
                                :disabled="loading" size="sm" class="w-full" />
                        </div>
                    </div>
                </div>

                <!-- Assignments Section -->
                <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">{{ $t('assignments') }}
                    </p>
                    <div
                        class="rounded-lg border border-(--color-border) dark:border-(--color-border) bg-white dark:bg-(--color-surface) shadow-sm dark:shadow-none">
                        <!-- Groups -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-x-6 gap-y-1.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-(--color-surface-hover) transition-colors">
                            <label class="text-sm font-medium text-default shrink-0">{{ $t('groups') }}</label>
                            <USelectMenu v-model="form.groups" :items="groupOptions" multiple :disabled="loading"
                                size="sm" class="w-full" />
                        </div>
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
