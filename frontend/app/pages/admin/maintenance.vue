<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Admin Maintenance Page - System maintenance, clients, products, backup/restore
-->
<template>
    <div class="space-y-6">
        <UAlert v-if="error" color="error" variant="soft" :close-button="{ icon: 'i-heroicons-x-mark' }"
            @close="error = ''">
            <template #title>{{ error }}</template>
        </UAlert>

        <!-- Blocked Clients & Locked Products Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Blocked Clients -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-medium">{{ $t('blockedClients') }}</span>
                        <CommonStatusBadge v-if="blockedClientsCount > 0" status="warning"
                            :label="String(blockedClientsCount)" />
                    </div>
                </template>
                <div v-if="loadingClients" class="py-6 text-center">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
                </div>
                <div v-else-if="blockedClientsCount === 0" class="py-6 text-center">
                    <UIcon :name="icons.check" class="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p class="text-gray-500 dark:text-gray-400">{{ $t('message.noBlockedClients') }}</p>
                </div>
                <div v-else class="space-y-4">
                    <div class="flex gap-2">
                        <USelect v-model="selectedBlockedClient" :options="blockedClientOptions"
                            :placeholder="$t('selectClient')" class="flex-1" size="sm" />
                        <UButton :icon="icons.check" color="primary" size="sm" :disabled="!selectedBlockedClient"
                            :loading="unblockingClient" @click="unblockSelectedClient">{{ $t('unblock') }}</UButton>
                    </div>
                    <UButton block variant="outline" color="warning" size="sm" :loading="unblockingClient"
                        @click="unblockAll('clients')">{{ $t('unblockAll') }}</UButton>
                </div>
            </UCard>

            <!-- Locked Products -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-medium">{{ $t('lockedProducts') }}</span>
                        <CommonStatusBadge v-if="lockedProductsCount > 0" status="warning"
                            :label="String(lockedProductsCount)" />
                    </div>
                </template>
                <div v-if="loadingProducts" class="py-6 text-center">
                    <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
                </div>
                <div v-else-if="lockedProductsCount === 0" class="py-6 text-center">
                    <UIcon :name="icons.check" class="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p class="text-gray-500 dark:text-gray-400">{{ $t('message.noLockedProducts') }}</p>
                </div>
                <div v-else class="space-y-4">
                    <div class="flex gap-2">
                        <USelect v-model="selectedLockedProduct" :options="lockedProductOptions"
                            :placeholder="$t('selectProduct')" class="flex-1" size="sm" />
                        <UButton :icon="icons.check" color="primary" size="sm" :disabled="!selectedLockedProduct"
                            :loading="unlockingProduct" @click="unlockSelectedProduct">{{ $t('unlock') }}</UButton>
                    </div>
                    <UButton block variant="outline" color="warning" size="sm" :loading="unlockingProduct"
                        @click="unblockAll('products')">{{ $t('unlockAll') }}</UButton>
                </div>
            </UCard>
        </div>

        <!-- Application State -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <span class="font-medium">{{ $t('applicationState') }}</span>
                    <CommonStatusBadge :status="currentAppState === 'normal' ? 'success' : 'warning'"
                        :label="currentAppState" />
                </div>
            </template>
            <div v-if="loadingAppState" class="py-6 text-center">
                <UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
            </div>
            <div v-else class="space-y-4">
                <div class="flex flex-wrap gap-3">
                    <button v-for="state in ['normal', 'maintenance']" :key="state" @click="newAppState.type = state"
                        :class="[
                            'flex-1 min-w-32 px-4 py-3 rounded-lg border-2 transition-all text-center',
                            newAppState.type === state
                                ? state === 'normal' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                : 'border-(--color-border) hover:border-gray-400'
                        ]">
                        <div class="font-medium"
                            :class="newAppState.type === state ? (state === 'normal' ? 'text-primary-600 dark:text-primary-400' : 'text-yellow-600 dark:text-yellow-400') : ''">
                            {{ $t(state) }}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">{{ state === 'normal' ? $t('serverIsOperational') :
                            $t('blockClientConnections') }}</div>
                    </button>
                </div>

                <div v-if="newAppState.type === 'maintenance'"
                    class="p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10">
                    <div class="space-y-4">
                        <UFormField :label="$t('addressExceptions')" :help="$t('allowTheseAddressesDuringMaintenance')">
                            <div class="flex gap-2">
                                <UInput v-model="addressExceptionInput" :placeholder="$t('enterNetworkAddress')"
                                    size="sm" class="flex-1" @keydown.enter.prevent="addAddressException" />
                                <UButton color="primary" size="sm" :icon="icons.add" @click="addAddressException">{{
                                    $t('add')
                                }}</UButton>
                            </div>
                            <div v-if="newAppState.address_exceptions.length > 0" class="flex flex-wrap gap-2 mt-3">
                                <span v-for="(addr, idx) in newAppState.address_exceptions" :key="idx"
                                    class="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-(--color-border) rounded-full">
                                    {{ addr }}
                                    <button type="button" @click="removeAddressException(idx)"
                                        class="text-gray-400 hover:text-red-500 transition-colors">
                                        <UIcon :name="icons.close" class="w-3 h-3" />
                                    </button>
                                </span>
                            </div>
                        </UFormField>

                        <UFormField :label="$t('retryAfterInSeconds')" :help="$t('clientsShouldRetryAfter')">
                            <UInput v-model.number="newAppState.retry_after" type="number" size="sm" min="0"
                                class="w-40" />
                        </UFormField>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <UButton variant="outline" color="neutral" size="sm" @click="resetAppState">{{ $t('reset') }}
                    </UButton>
                    <UButton color="primary" size="sm" :loading="savingAppState" :disabled="!newAppState.type"
                        @click="saveAppState">{{ $t('apply') }}</UButton>
                </div>
            </div>
        </UCard>

        <!-- Backup & Restore Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Create Backup -->
            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <UIcon :name="icons.copy" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span class="font-medium">{{ $t('createBackup') }}</span>
                    </div>
                </template>
                <div class="space-y-5">
                    <!-- Backup Options -->
                    <div>
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ $t('includeInBackup')
                        }}</div>
                        <div class="space-y-3">
                            <label
                                class="flex items-start gap-3 p-3 rounded-lg border border-(--color-border) hover:bg-(--color-surface-hover) cursor-pointer transition-colors">
                                <UCheckbox v-model="backupOptions.config_files" class="mt-0.5" />
                                <div>
                                    <div class="font-medium text-sm">{{ $t('config_files') }}</div>
                                    <div class="text-xs text-gray-500">{{ $t('configFilesDescription') }}</div>
                                </div>
                            </label>
                            <label
                                class="flex items-start gap-3 p-3 rounded-lg border border-(--color-border) hover:bg-(--color-surface-hover) cursor-pointer transition-colors">
                                <UCheckbox v-model="backupOptions.redis_data" class="mt-0.5" />
                                <div>
                                    <div class="font-medium text-sm">{{ $t('redisData') }}</div>
                                    <div class="text-xs text-gray-500">{{ $t('redisDataDescription') }}</div>
                                </div>
                            </label>
                            <label
                                class="flex items-start gap-3 p-3 rounded-lg border border-(--color-border) hover:bg-(--color-surface-hover) cursor-pointer transition-colors">
                                <UCheckbox v-model="backupOptions.maintenance_mode" class="mt-0.5" />
                                <div>
                                    <div class="font-medium text-sm">{{ $t('maintenance_mode') }}</div>
                                    <div class="text-xs text-gray-500">{{ $t('maintenanceModeDescription') }}</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Password (optional) -->
                    <UFormField :label="$t('password')" :help="$t('optionalEncryption')">
                        <UInput v-model="backupOptions.password" type="password" :placeholder="$t('enterPassword')"
                            size="sm" />
                    </UFormField>

                    <UButton block color="primary" :icon="icons.copy" :loading="creatingBackup" @click="createBackup">{{
                        $t('createBackup') }}</UButton>
                </div>
            </UCard>

            <!-- Restore Backup -->
            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <UIcon :name="icons.refresh" class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span class="font-medium">{{ $t('restoreBackup') }}</span>
                    </div>
                </template>
                <div class="space-y-5">
                    <!-- File Upload -->
                    <UFormField :label="$t('backupFile')" required>
                        <div class="relative">
                            <input ref="fileInputRef" type="file" accept=".tar.gz,.tgz"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                @change="handleFileSelect" />
                            <div
                                class="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-(--color-border) hover:border-primary-400 transition-colors">
                                <div
                                    class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <UIcon :name="icons.upload" class="w-5 h-5 text-gray-400" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div v-if="restoreOptions.file_id" class="font-medium text-sm truncate">{{
                                        restoreOptions.file_id }}</div>
                                    <div v-else class="text-gray-500 text-sm">{{ $t('clickToSelectFile') }}</div>
                                </div>
                            </div>
                        </div>
                    </UFormField>

                    <!-- Restore Options -->
                    <div>
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ $t('restoreOptions')
                        }}</div>
                        <div class="space-y-3">
                            <label
                                class="flex items-start gap-3 p-3 rounded-lg border border-(--color-border) hover:bg-(--color-surface-hover) cursor-pointer transition-colors">
                                <UCheckbox v-model="restoreOptions.config_files" class="mt-0.5" />
                                <div>
                                    <div class="font-medium text-sm">{{ $t('config_files') }}</div>
                                    <div class="text-xs text-gray-500">{{ $t('restoreConfigFiles') }}</div>
                                </div>
                            </label>
                            <label
                                class="flex items-start gap-3 p-3 rounded-lg border border-(--color-border) hover:bg-(--color-surface-hover) cursor-pointer transition-colors">
                                <UCheckbox v-model="restoreOptions.redis_data" class="mt-0.5" />
                                <div>
                                    <div class="font-medium text-sm">{{ $t('redisData') }}</div>
                                    <div class="text-xs text-gray-500">{{ $t('restoreRedisData') }}</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Server ID Option -->
                    <UFormField :label="$t('serverIdHandling')" :help="$t('serverIdHelp')">
                        <div class="space-y-2">
                            <div class="flex flex-wrap gap-2">
                                <button v-for="opt in serverIdOptions" :key="opt.value"
                                    @click="serverIdOption = opt.value" :class="[
                                        'px-3 py-2 rounded-lg border text-sm transition-all',
                                        serverIdOption === opt.value
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                            : 'border-(--color-border) hover:border-gray-400'
                                    ]">
                                    {{ opt.label }}
                                </button>
                            </div>
                            <UInput v-if="serverIdOption === 'new'" v-model="restoreOptions.server_id"
                                :placeholder="$t('enterNewID')" size="sm" class="mt-2" />
                        </div>
                    </UFormField>

                    <!-- Password -->
                    <UFormField :label="$t('backupPassword')" :help="$t('enterIfEncrypted')">
                        <UInput v-model="restoreOptions.password" type="password" :placeholder="$t('enterPassword')"
                            size="sm" />
                    </UFormField>

                    <UButton block color="warning" :icon="icons.refresh" :loading="restoringBackup"
                        :disabled="!restoreOptions.file_id" @click="restoreBackup">{{ $t('restoreBackup') }}</UButton>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const api = useApiHelpers()

const error = ref('')
const loadingClients = ref(false)
const loadingProducts = ref(false)
const blockedClients = ref<Record<string, string>>({})
const selectedBlockedClient = ref('')
const unblockingClient = ref(false)
const lockedProducts = ref<Record<string, string>>({})
const selectedLockedProduct = ref('')
const unlockingProduct = ref(false)
const loadingAppState = ref(false)
const savingAppState = ref(false)
const currentAppState = ref('normal')
const newAppState = ref({ type: '', address_exceptions: [] as string[], retry_after: 0 })
const addressExceptionInput = ref('')
const creatingBackup = ref(false)
const backupOptions = ref({ config_files: true, redis_data: false, maintenance_mode: false, password: '' })
const restoringBackup = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const serverIdOption = ref('backup')
const restoreOptions = ref({ file_id: '', config_files: false, redis_data: false, server_id: 'backup', password: '' })

const blockedClientsCount = computed(() => Object.keys(blockedClients.value).length)
const lockedProductsCount = computed(() => Object.keys(lockedProducts.value).length)
const blockedClientOptions = computed(() => Object.entries(blockedClients.value).map(([id, reason]) => ({ label: id + ' (' + reason + ')', value: id })))
const lockedProductOptions = computed(() => Object.entries(lockedProducts.value).map(([id, reason]) => ({ label: id + ' (' + reason + ')', value: id })))

const serverIdOptions = computed(() => [
    { label: String($t('useFromBackup')), value: 'backup' },
    { label: String($t('useLocalId')), value: 'local' },
    { label: String($t('useNewId')), value: 'new' },
])

watch(serverIdOption, (val) => { if (val !== 'new') restoreOptions.value.server_id = val })

async function fetchBlockedClients() {
    loadingClients.value = true
    const { data, error: err } = await api.getBlockedClients()
    if (!err && data) blockedClients.value = data as Record<string, string>
    loadingClients.value = false
}

async function fetchLockedProducts() {
    loadingProducts.value = true
    const { data, error: err } = await api.getLockedProducts()
    if (!err && data) lockedProducts.value = data as Record<string, string>
    loadingProducts.value = false
}

async function fetchAppState() {
    loadingAppState.value = true
    const { data, error: err } = await api.getAppState()
    if (!err && data) {
        currentAppState.value = data.type
        newAppState.value = { type: data.type, address_exceptions: data.address_exceptions || [], retry_after: data.retry_after || 0 }
    }
    loadingAppState.value = false
}

async function unblockSelectedClient() {
    if (!selectedBlockedClient.value) return
    unblockingClient.value = true
    await api.unblockClient(selectedBlockedClient.value)
    await fetchBlockedClients()
    selectedBlockedClient.value = ''
    unblockingClient.value = false
}

async function unlockSelectedProduct() {
    if (!selectedLockedProduct.value) return
    unlockingProduct.value = true
    await api.unlockProduct(selectedLockedProduct.value)
    await fetchLockedProducts()
    selectedLockedProduct.value = ''
    unlockingProduct.value = false
}

async function unblockAll(type: 'clients' | 'products') {
    if (type === 'clients') {
        unblockingClient.value = true
        await api.unblockAllClients()
        await fetchBlockedClients()
        unblockingClient.value = false
    } else {
        unlockingProduct.value = true
        await api.unlockAllProducts()
        await fetchLockedProducts()
        unlockingProduct.value = false
    }
}

async function saveAppState() {
    savingAppState.value = true
    const { data, error: err } = await api.setAppState(newAppState.value)
    if (!err && data) currentAppState.value = data.type
    savingAppState.value = false
}

function resetAppState() {
    newAppState.value = { type: currentAppState.value, address_exceptions: [], retry_after: 0 }
}

function addAddressException() {
    const addr = addressExceptionInput.value.trim()
    if (addr && !newAppState.value.address_exceptions.includes(addr)) {
        newAppState.value.address_exceptions.push(addr)
    }
    addressExceptionInput.value = ''
}

function removeAddressException(idx: number) {
    newAppState.value.address_exceptions.splice(idx, 1)
}

async function createBackup() {
    creatingBackup.value = true
    const { data, error: err } = await api.createBackup(backupOptions.value)
    if (!err && data) {
        const a = document.createElement('a')
        a.href = '/file-transfer/' + data + '?delete=true'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
    creatingBackup.value = false
}

function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files && input.files.length > 0 && input.files[0]) {
        restoreOptions.value.file_id = input.files[0].name
    }
}

async function restoreBackup() {
    restoringBackup.value = true
    await api.restoreBackup(restoreOptions.value)
    restoringBackup.value = false
}

onMounted(() => {
    fetchBlockedClients()
    fetchLockedProducts()
    fetchAppState()
})
</script>
