<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Client Add New page - form for adding a new client.
-->
<template>
    <LayoutsPageLayout show-refresh @refresh="resetForm">
        <template #actions>
            <UTooltip :text="$t('addClient')">
                <UButton color="success" :loading="loading" v-if="canCreate" @click="handleSubmit">
                    <UIcon :name="icons.add" />
                </UButton>
            </UTooltip>
        </template>

        <div class="space-y-4">
            <UAlert v-if="success" color="success" :title="String($t('success'))"
                :close-button="{ icon: 'i-heroicons-x-mark' }" @close="success = false">
                <template #description>{{ $t('clientCreatedSuccessfully') }}</template>
            </UAlert>
            <UAlert v-if="error" color="error" :title="String($t('error'))" :description="error"
                :close-button="{ icon: 'i-heroicons-x-mark' }" @close="error = null" />

            <div class="space-y-6 bg-(--color-background) dark:bg-(--color-background-dark)">
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-sm font-semibold uppercase tracking-wide text-muted">{{ $t('newClient') }}</p>
                    </div>
                    <div class="mb-6">
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('clientId') }} <span class="text-error">*</span>
                            </span>
                            <div class="flex-1 flex flex-col items-start gap-1 min-w-0">
                                <div class="flex items-center gap-2 w-full">
                                    <UInput v-model="clientName" :disabled="loading" size="sm" placeholder="clientname"
                                        class="flex-1" />
                                    <UInput v-model="domain" :disabled="loading" size="sm" placeholder=".domain.local"
                                        class="flex-1" />
                                </div>
                                <div v-if="formErrors.clientId" class="text-xs text-error">
                                    {{ formErrors.clientId }}
                                </div>
                            </div>
                        </div>
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('description') }}
                            </span>
                            <div class="flex-1">
                                <UInput v-model="form.description" :disabled="loading" size="sm"
                                    placeholder="Client description" class="flex-1" />
                            </div>
                        </div>
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('inventoryNumber') }}
                            </span>
                            <div class="flex-1">
                                <UInput v-model="form.inventoryNumber" :disabled="loading" size="sm"
                                    placeholder="Inventory number" class="flex-1" />
                            </div>
                        </div>
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('ipAddress') }}
                            </span>
                            <div class="flex-1">
                                <UInput v-model="form.ipAddress" :disabled="loading" size="sm" placeholder="192.168.1.x"
                                    class="flex-1" />
                            </div>
                        </div>
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('macAddress') }}
                            </span>
                            <div class="flex-1">
                                <UInput v-model="form.macAddress" :disabled="loading" size="sm"
                                    placeholder="00:11:22:33:44:55" class="flex-1" />
                            </div>
                        </div>
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('notes') }}
                            </span>
                            <div class="flex-1">
                                <UTextarea v-model="form.notes" :disabled="loading" size="sm" :rows="3"
                                    placeholder="Additional notes" class="flex-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-sm font-semibold uppercase tracking-wide text-muted">{{ $t('assignments') }}</p>
                    </div>
                    <div class="mb-6">
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('depot') }} <span class="text-error">*</span>
                            </span>
                            <div class="flex-1 flex flex-col items-start gap-1 min-w-0">
                                <USelect v-model="form.depotId" :items="depotOptions" :loading="loadingDepots"
                                    :disabled="loading" size="sm" class="w-full" />
                                <div v-if="formErrors.depotId" class="text-xs text-error">
                                    {{ formErrors.depotId }}
                                </div>
                            </div>
                        </div>
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('groups') }}
                            </span>
                            <div class="flex-1 flex items-center gap-2 min-w-0">
                                <USelectMenu v-model="form.groups" :items="groupOptions" multiple :disabled="loading"
                                    size="sm" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-sm font-semibold uppercase tracking-wide text-muted">{{ $t('initialSetup') }}</p>
                    </div>
                    <div class="mb-6">
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('netbootProducts') }}
                            </span>
                            <div class="flex-1 flex items-center gap-2 min-w-0">
                                <USelectMenu v-model="form.netbootProducts" :items="netbootProductOptions" multiple
                                    :disabled="loading" size="sm" class="w-full" />
                            </div>
                        </div>
                        <div
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('enableAgentSetup') }}
                            </span>
                            <div class="flex-1 flex items-center gap-2 min-w-0">
                                <UCheckbox v-model="form.agentSetup" :disabled="loading" />
                            </div>
                        </div>
                        <div v-if="form.agentSetup"
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('agentType') }}
                            </span>
                            <div class="flex-1 flex items-center gap-2 min-w-0">
                                <URadioGroup v-model="form.agentType"
                                    :items="[{ label: 'Windows', value: 'windows' }, { label: 'Linux', value: 'linux' }, { label: 'Mac', value: 'mac' }]"
                                    :disabled="loading" />
                            </div>
                        </div>
                        <div v-if="form.agentSetup"
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('agentUsername') }}
                            </span>
                            <div class="flex-1 flex items-center gap-2 min-w-0">
                                <UInput v-model="form.agentUsername" :disabled="loading" size="sm"
                                    placeholder="Username" class="w-full" />
                            </div>
                        </div>
                        <div v-if="form.agentSetup"
                            class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
                                {{ $t('agentPassword') }}
                            </span>
                            <div class="flex-1 flex items-center gap-2 min-w-0">
                                <UInput v-model="form.agentPassword" :disabled="loading" size="sm" type="password"
                                    placeholder="Password" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
const { createClient, deployClientAgent, getDepots, addClientToGroups, setClientProductActions, getClientIds, getDepotsProducts, getHostGroupIds } = useApiHelpers()
const stateStore = useStateStore()
const icons = useIcons()

const loading = ref(false)
const loadingDepots = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const clientName = ref('')
const domain = ref('')
const clientIds = ref<string[]>([])

const form = reactive({
    description: '',
    inventoryNumber: '',
    depotId: '',
    ipAddress: '',
    macAddress: '',
    notes: '',
    agentSetup: false,
    agentType: 'windows' as 'windows' | 'linux' | 'mac',
    agentUsername: '',
    agentPassword: '',
    netbootProducts: [] as Array<{ label: string; value: string }>,
    groups: [] as Array<{ label: string; value: string }>,
})

const formErrors = reactive({
    clientId: '',
    depotId: '',
})

const depots = ref<Array<{ depotId: string; description: string }>>([])
const netbootProductOptions = ref<Array<{ label: string; value: string }>>([])
const groupOptions = ref<Array<{ label: string; value: string }>>([])

const depotOptions = computed(() => depots.value.map(d => ({
    label: d.description ? `${d.depotId} - ${d.description}` : d.depotId,
    value: d.depotId
})))

const canCreate = computed(() => {
    return clientName.value.length > 0 &&
        !Number.isInteger(parseInt(clientName.value.charAt(0))) &&
        !clientIds.value.includes(clientName.value + domain.value) &&
        form.depotId &&
        !loading.value
})

function getDefaultDomainFromDepot(depotId: string): string {
    const idx = depotId.indexOf('.')
    return idx > 0 ? depotId.substring(idx) : '.local'
}

onMounted(async () => {
    await fetchDepots()
    if (form.depotId) {
        domain.value = getDefaultDomainFromDepot(form.depotId)
    }
    await Promise.all([
        fetchClientIds(),
        fetchNetbootProducts(),
        fetchGroups()
    ])
})

async function fetchDepots() {
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
    } catch (e) {
        console.error('Failed to fetch depots:', e)
    } finally {
        loadingDepots.value = false
    }
}

async function fetchClientIds() {
    try {
        const depotList = form.depotId ? [form.depotId] : (stateStore.depots || [])
        const result = await getClientIds(depotList)
        clientIds.value = result.data || []
    } catch (e) {
        console.error('Failed to fetch client IDs:', e)
    }
}

async function fetchNetbootProducts() {
    try {
        const depot = form.depotId || (stateStore.depots[0])
        if (depot) {
            const res = await getDepotsProducts([depot])
            if (res.data && Array.isArray(res.data)) {
                netbootProductOptions.value = res.data.map((item: any) => ({
                    label: item.productId,
                    value: item.productId
                }))
            }
        }
    } catch (e) {
        console.error('Failed to fetch netboot products:', e)
    }
}

async function fetchGroups() {
    try {
        const res = await getHostGroupIds()
        if (res.data && Array.isArray(res.data)) {
            groupOptions.value = res.data.map((groupId: string) => ({
                label: groupId,
                value: groupId
            }))
        }
    } catch (e) {
        console.error('Failed to fetch groups:', e)
    }
}

watch(() => form.depotId, async (newDepot) => {
    if (newDepot) {
        domain.value = getDefaultDomainFromDepot(newDepot)
        await fetchNetbootProducts()
        await fetchClientIds()
    }
})

watch([clientName, domain], () => {
    formErrors.clientId = ''
    if (!clientName.value) return

    if (Number.isInteger(parseInt(clientName.value.charAt(0)))) {
        formErrors.clientId = $t('message.formvalid.clientNameCannotStartWithNumber')
        return
    }

    const fqdn = clientName.value + domain.value
    if (clientIds.value.includes(fqdn)) {
        formErrors.clientId = $t('message.formvalid.clientExists')
    }
})

function validateForm(): boolean {
    formErrors.clientId = ''
    formErrors.depotId = ''
    let valid = true

    if (!clientName.value.trim()) {
        formErrors.clientId = String($t('clientIdRequired'))
        valid = false
    } else if (Number.isInteger(parseInt(clientName.value.charAt(0)))) {
        formErrors.clientId = String($t('message.formvalid.clientNameCannotStartWithNumber'))
        valid = false
    } else if (clientIds.value.includes(clientName.value + domain.value)) {
        formErrors.clientId = String($t('message.formvalid.clientExists'))
        valid = false
    }

    if (!form.depotId) {
        formErrors.depotId = String($t('depotRequired'))
        valid = false
    }

    if (form.agentSetup && (!form.agentUsername || !form.agentPassword)) {
        error.value = String($t('agentCredentialsRequired'))
        valid = false
    }

    return valid
}
async function handleSubmit() {
    error.value = null
    success.value = false

    if (!validateForm()) {
        return
    }

    loading.value = true
    try {
        const hostId = clientName.value + domain.value

        const clientObj = {
            hostId,
            description: form.description.trim() || undefined,
            inventoryNumber: form.inventoryNumber.trim() || undefined,
            hardwareAddress: form.macAddress.trim() || null,
            ipAddress: form.ipAddress.trim() || null,
            notes: form.notes.trim() || null,
        }

        const res = await createClient({
            client: clientObj,
            depot: form.depotId
        })
        if (res.error) throw res.error

        if (form.groups.length > 0) {
            const groupIds = form.groups.map(g => g.value)
            await addClientToGroups(hostId, groupIds)
        }

        if (form.agentSetup && form.agentUsername && form.agentPassword) {
            await deployClientAgent({
                clients: [hostId],
                username: form.agentUsername,
                password: form.agentPassword,
                type: form.agentType
            })
        }

        if (form.netbootProducts.length > 0) {
            const productIds = form.netbootProducts.map(p => p.value)
            await setClientProductActions({
                clientIds: [hostId],
                productIds,
                actionRequest: 'setup'
            })
        }

        success.value = true
        clientIds.value.push(hostId)
        setTimeout(() => navigateTo('/clients'), 1500)

    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : String($t('errorCreatingClient'))
    } finally {
        loading.value = false
    }
}

function resetForm() {
    clientName.value = ''
    form.depotId = depots.value[0]?.depotId || ''
    domain.value = form.depotId ? getDefaultDomainFromDepot(form.depotId) : '.local'
    form.description = ''
    form.inventoryNumber = ''
    form.ipAddress = ''
    form.macAddress = ''
    form.notes = ''
    form.agentSetup = false
    form.agentType = 'windows'
    form.agentUsername = ''
    form.agentPassword = ''
    form.netbootProducts = []
    form.groups = []
    formErrors.clientId = ''
    formErrors.depotId = ''
    error.value = null
    success.value = false
}
</script>