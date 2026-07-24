<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  AdminMaintenanceView - System maintenance: blocked clients, locked products, app state, backup/restore.
-->
<template>
  <div class="h-full overflow-y-auto bg-(--color-surface) opsi-compact-page opsi-dense-form">
    <div class="sticky top-0 z-10 bg-(--color-surface)" v-if="pageMessage">
      <CoreAppAlertInline
        v-if="pageMessage.type === 'success'"
        color="success"
        :title="$t('common.success')"
        :description="pageMessage.message"
        variant="subtle"
        closable
        compact
        @close="pageMessage = null"
      />
      <CoreAppAlertInline
        v-if="pageMessage.type === 'error'"
        color="error"
        :title="$t('common.error')"
        :description="pageMessage.message"
        variant="subtle"
        closable
        compact
        @close="pageMessage = null"
      />
    </div>
    <div class="space-y-3 min-h-full p-0">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CoreAppCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-heading uppercase tracking-wide">{{
                $t('clients.blocked')
              }}</span>
              <CoreAppStatusBadge
                v-if="blockedClientsCount > 0"
                status="warning"
                :label="String(blockedClientsCount)"
              />
            </div>
          </template>
          <div v-if="loadingClients" class="py-6 text-center">
            <CoreAppLoadingSpinner size="md" />
          </div>
          <div v-else-if="blockedClientsCount === 0" class="py-6 text-center">
            <CoreAppIcon
              :name="icons.checkCircle"
              class="w-10 h-10 text-(--color-success-soft-text) mx-auto mb-2"
            />
            <p class="text-(--color-text-muted)">{{ $t('clients.blockedNone') }}</p>
          </div>
          <div v-else class="space-y-4">
            <CoreAppAlertInline
              v-if="clientCardMessage && clientCardMessage.type === 'success'"
              color="success"
              :title="$t('common.success')"
              :description="clientCardMessage.message"
              variant="subtle"
              closable
              compact
              @close="clientCardMessage = null"
            />
            <CoreAppAlertInline
              v-if="clientCardMessage && clientCardMessage.type === 'error'"
              color="error"
              :title="$t('common.error')"
              :description="clientCardMessage.message"
              variant="subtle"
              closable
              compact
              @close="clientCardMessage = null"
            />
            <div
              class="max-h-48 overflow-y-auto border border-(--color-border) rounded-lg divide-y divide-(--color-border)"
            >
              <div
                v-for="client in blockedClientEntries"
                :key="client.clientId"
                class="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-(--color-surface-hover)"
              >
                <div class="min-w-0">
                  <div class="truncate">{{ client.clientId }}</div>
                  <div
                    v-if="client.contexts.length > 0"
                    class="truncate text-xs text-(--color-text-muted)"
                  >
                    {{ client.contexts.join(', ') }}
                  </div>
                </div>
                <CoreAppButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  :loading="unblockingClient"
                  :disabled="isReadOnly"
                  @click="unblockSingleClient(client.clientId)"
                >
                  {{ $t('clients.unblock') }}
                </CoreAppButton>
              </div>
            </div>
            <CoreAppButton
              block
              variant="outline"
              color="warning"
              size="sm"
              :loading="unblockingClient"
              :disabled="isReadOnly"
              @click="unblockAll('clients')"
              >{{ $t('clients.unblockAll') }}
            </CoreAppButton>
          </div>
        </CoreAppCard>

        <CoreAppCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-heading uppercase tracking-wide">{{
                $t('products.locked')
              }}</span>
              <CoreAppStatusBadge
                v-if="lockedProductsCount > 0"
                status="warning"
                :label="String(lockedProductsCount)"
              />
            </div>
          </template>
          <div v-if="loadingProducts" class="py-6 text-center">
            <CoreAppLoadingSpinner size="md" />
          </div>
          <div v-else-if="lockedProductsCount === 0" class="py-6 text-center">
            <CoreAppIcon
              :name="icons.checkCircle"
              class="w-10 h-10 text-(--color-success-soft-text) mx-auto mb-2"
            />
            <p class="text-(--color-text-muted)">{{ $t('products.lockedNone') }}</p>
          </div>
          <div v-else class="space-y-4">
            <CoreAppAlertInline
              v-if="productCardMessage && productCardMessage.type === 'success'"
              color="success"
              :title="$t('common.success')"
              :description="productCardMessage.message"
              variant="subtle"
              closable
              compact
              @close="productCardMessage = null"
            />
            <CoreAppAlertInline
              v-if="productCardMessage && productCardMessage.type === 'error'"
              color="error"
              :title="$t('common.error')"
              :description="productCardMessage.message"
              variant="subtle"
              closable
              compact
              @close="productCardMessage = null"
            />
            <div
              class="max-h-48 overflow-y-auto border border-(--color-border) rounded-lg divide-y divide-(--color-border)"
            >
              <div
                v-for="product in lockedProductEntries"
                :key="product.productId"
                class="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-(--color-surface-hover)"
              >
                <div class="min-w-0">
                  <div class="truncate">{{ product.productId }}</div>
                  <div
                    v-if="product.locations.length > 0"
                    class="truncate text-xs text-(--color-text-muted)"
                  >
                    {{ product.locations.join(', ') }}
                  </div>
                  <div
                    v-else-if="product.reason"
                    class="truncate text-xs text-(--color-text-muted)"
                  >
                    {{ product.reason }}
                  </div>
                </div>
                <CoreAppButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  :loading="unlockingProduct"
                  :disabled="isReadOnly"
                  @click="unlockSingleProduct(product.productId)"
                >
                  {{ $t('products.unlock') }}
                </CoreAppButton>
              </div>
            </div>
            <CoreAppButton
              block
              variant="outline"
              color="warning"
              size="sm"
              :loading="unlockingProduct"
              :disabled="isReadOnly"
              @click="unblockAll('products')"
              >{{ $t('products.unlockAll') }}
            </CoreAppButton>
          </div>
        </CoreAppCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <CoreAppCard fill>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-heading uppercase tracking-wide">{{
                $t('admin.appState')
              }}</span>
              <CoreAppStatusBadge
                :status="currentAppState === 'normal' ? 'success' : 'warning'"
                :label="currentAppState"
                size="lg"
              />
            </div>
          </template>
          <div v-if="loadingAppState" class="py-6 text-center flex-1">
            <CoreAppLoadingSpinner size="md" />
          </div>
          <div v-else class="space-y-4 h-full flex flex-col">
            <div class="flex flex-wrap gap-2">
              <CoreAppButton
                v-for="state in ['normal', 'maintenance']"
                :key="state"
                @click="newAppState.type = state"
                variant="ghost"
                color="neutral"
                :class="[
                  'flex-1 min-w-28 px-4! py-2! rounded-lg border-2 transition-all text-center h-auto!',
                  newAppState.type === state
                    ? state === 'normal'
                      ? 'border-(--color-primary) bg-(--color-primary-soft-bg)'
                      : 'border-(--color-warning)/50 bg-(--color-warning-soft-bg)'
                    : 'border-(--color-border) hover:border-(--color-text-muted)',
                ]"
              >
                <div
                  class="font-medium"
                  :class="
                    newAppState.type === state
                      ? state === 'normal'
                        ? 'text-(--color-primary-soft-text)'
                        : 'text-(--color-warning-soft-text)'
                      : ''
                  "
                >
                  {{ $t(state) }}
                </div>
              </CoreAppButton>
            </div>
            <div v-if="newAppState.type === 'maintenance'">
              <div class="text-sm font-medium text-(--color-text) mb-2">
                {{ $t('backup.optional') }}
              </div>
              <div class="space-y-3 border border-(--color-warning)/50 rounded-lg p-2">
                <CoreAppFormField :label="$t('fields.addressExceptions')">
                  <div class="flex gap-2">
                    <CoreAppInput
                      v-model="addressExceptionInput"
                      :placeholder="$t('depot.networkAddress')"
                      size="sm"
                      class="flex-1"
                      @keydown.enter.prevent="addAddressException"
                    />
                    <CoreAppButton
                      color="primary"
                      size="sm"
                      :icon="icons.add"
                      @click="addAddressException"
                      >{{ $t('common.add') }}</CoreAppButton
                    >
                  </div>
                  <div
                    v-if="newAppState.address_exceptions.length > 0"
                    class="flex flex-wrap gap-2 mt-2"
                  >
                    <span
                      v-for="(addr, idx) in newAppState.address_exceptions"
                      :key="idx"
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-(--color-surface-elevated) border border-(--color-border) rounded-full"
                    >
                      {{ addr }}
                      <CoreAppButton
                        @click="removeAddressException(idx)"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        class="text-(--color-text-muted) hover:text-(--color-error-soft-text)"
                      >
                        <CoreAppIcon :name="icons.x" class="w-3 h-3" />
                      </CoreAppButton>
                    </span>
                  </div>
                </CoreAppFormField>
                <CoreAppFormField :label="$t('fields.retryAfter')">
                  <CoreAppInput
                    v-model.number="newAppState.retry_after"
                    type="number"
                    size="sm"
                    min="0"
                    class="w-full"
                  />
                </CoreAppFormField>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2 mt-auto">
              <CoreAppButton variant="outline" color="primary" size="sm" @click="resetAppState"
                >{{ $t('common.reset') }}
              </CoreAppButton>
              <CoreAppButton
                color="primary"
                size="sm"
                :loading="savingAppState"
                :disabled="isReadOnly || !hasServerWriteAccess || !newAppState.type"
                @click="saveAppState"
              >
                {{ $t('common.apply') }}</CoreAppButton
              >
            </div>
          </div>
        </CoreAppCard>
        <CoreAppCard fill>
          <template #header>
            <div class="flex items-center gap-2">
              <span class="text-sm font-heading uppercase tracking-wide">{{
                $t('backup.create')
              }}</span>
            </div>
          </template>
          <div class="space-y-4 h-full flex flex-col">
            <div
              class="flex items-start gap-3 rounded-lg hover:bg-(--color-surface-hover) transition-colors p-1"
            >
              <CoreAppCheckbox
                id="backup-maintenance-mode"
                v-model="backupOptions.maintenance_mode"
                class="mt-0.5"
                :aria-label="String($t('admin.maintenanceMode'))"
              />
              <span class="font-medium text-sm">{{ $t('admin.maintenanceMode') }}</span>
            </div>
            <div class="text-sm font-medium text-(--color-text) mb-3">
              {{ $t('backup.include') }}
            </div>
            <div class="space-y-3 border border-(--color-border) rounded-lg p-2">
              <div
                class="flex items-start gap-3 rounded-lg hover:bg-(--color-surface-hover) transition-colors p-1"
              >
                <CoreAppCheckbox
                  id="backup-config-files"
                  v-model="backupOptions.config_files"
                  class="mt-0.5"
                  :aria-label="String($t('backup.configFiles'))"
                />
                <span class="font-medium text-sm">{{ $t('backup.configFiles') }}</span>
              </div>
              <div
                class="flex items-start gap-3 rounded-lg hover:bg-(--color-surface-hover) transition-colors p-1"
              >
                <CoreAppCheckbox
                  id="backup-redis-data"
                  v-model="backupOptions.redis_data"
                  class="mt-0.5"
                  :aria-label="String($t('redis.data'))"
                />
                <span class="font-medium text-sm">{{ $t('redis.data') }}</span>
              </div>
            </div>
            <CoreAppFormField :label="$t('auth.password') + ' (' + $t('common.optional') + ')'">
              <CoreAppInput
                v-model="backupOptions.password"
                type="password"
                :placeholder="$t('backup.encrypt')"
                :aria-label="String($t('backup.encrypt'))"
                size="sm"
                class="w-full"
              />
            </CoreAppFormField>
            <CoreAppButton
              block
              color="primary"
              :icon="icons.copy"
              :loading="creatingBackup"
              class="mt-auto"
              :disabled="isReadOnly"
              @click="createBackup"
              >{{ $t('backup.create') }}
            </CoreAppButton>
          </div>
        </CoreAppCard>

        <CoreAppCard fill>
          <template #header>
            <div class="flex items-center gap-2">
              <span class="text-sm font-heading uppercase tracking-wide">{{
                $t('backup.restore')
              }}</span>
            </div>
          </template>
          <div class="space-y-4 h-full flex flex-col">
            <CoreAppFormField :label="$t('backup.file')" required>
              <div class="relative">
                <input
                  ref="fileInputRef"
                  type="file"
                  :aria-label="String($t('backup.file'))"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  @change="handleFileSelect"
                />
                <div
                  class="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-(--color-border) hover:border-(--color-primary) transition-colors"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-(--color-surface) flex items-center justify-center"
                  >
                    <CoreAppIcon :name="icons.upload" class="w-5 h-5 text-(--color-text-muted)" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div v-if="selectedFileName" class="font-medium text-sm truncate">
                      {{ selectedFileName }}
                    </div>
                    <div v-else class="text-(--color-text-muted) text-sm">
                      {{ $t('backup.fileClick') }}
                    </div>
                  </div>
                </div>
              </div>
            </CoreAppFormField>
            <div>
              <div class="text-sm font-medium text-(--color-text) mb-3">
                {{ $t('backup.restoreOptions') }}
              </div>
              <div class="space-y-3 border border-(--color-border) rounded-lg p-2">
                <div
                  class="flex items-start gap-3 rounded-lg hover:bg-(--color-surface-hover) transition-colors p-1"
                >
                  <CoreAppCheckbox
                    id="restore-config-files"
                    v-model="restoreOptions.config_files"
                    class="mt-0.5"
                    :aria-label="String($t('backup.configFiles'))"
                  />
                  <span class="font-medium text-sm">{{ $t('backup.configFiles') }}</span>
                </div>
                <div
                  class="flex items-start gap-3 rounded-lg hover:bg-(--color-surface-hover) transition-colors p-1"
                >
                  <CoreAppCheckbox
                    id="restore-redis-data"
                    v-model="restoreOptions.redis_data"
                    class="mt-0.5"
                    :aria-label="String($t('redis.data'))"
                  />
                  <span class="font-medium text-sm">{{ $t('redis.data') }}</span>
                </div>
              </div>
            </div>
            <CoreAppFormField :label="$t('backup.serverIdHandling')">
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <CoreAppButton
                    v-for="opt in serverIdOptions"
                    :key="opt.value"
                    @click="serverIdOption = opt.value"
                    size="sm"
                    :color="'primary'"
                    :variant="serverIdOption === opt.value ? 'solid' : 'outline'"
                  >
                    {{ opt.label }}
                  </CoreAppButton>
                </div>
                <CoreAppInput
                  v-if="serverIdOption === 'new'"
                  v-model="restoreOptions.server_id"
                  :placeholder="$t('fields.newId')"
                  size="sm"
                  class="mt-2 w-full"
                />
              </div>
            </CoreAppFormField>
            <CoreAppFormField :label="$t('backup.password') + ' (' + $t('common.optional') + ')'">
              <CoreAppInput
                v-model="restoreOptions.password"
                type="password"
                :placeholder="$t('backup.decrypt')"
                :aria-label="String($t('backup.decrypt'))"
                size="sm"
                class="w-full"
              />
            </CoreAppFormField>
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-3">
              <div class="flex justify-between text-xs text-(--color-text-muted) mb-1">
                <span>{{ $t('backup.uploading') }}...</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <div class="w-full bg-(--color-surface-hover) rounded-full h-1.5">
                <div
                  class="bg-(--color-primary) h-1.5 rounded-full transition-all"
                  :style="{ width: uploadProgress + '%' }"
                />
              </div>
            </div>
            <CoreAppButton
              block
              color="warning"
              variant="outline"
              :icon="icons.refresh"
              class="mt-auto"
              :loading="restoringBackup || uploadingFile"
              :disabled="isReadOnly || !hasServerWriteAccess || !selectedFile"
              @click="restoreBackup"
              >{{ $t('backup.restore') }}</CoreAppButton
            >
          </div>
        </CoreAppCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const icons = useIcons()
  const { t: $t } = useI18n()
  const api = useApiHelpers()
  const { isReadOnly, hasServerWriteAccess } = useUserPermissions()

  const pageMessage = ref<{ type: 'success' | 'error'; message: string } | null>(null)
  const clientCardMessage = ref<{ type: 'success' | 'error'; message: string } | null>(null)
  const productCardMessage = ref<{ type: 'success' | 'error'; message: string } | null>(null)
  const loadingClients = ref(false)
  const loadingProducts = ref(false)
  const blockedClients = ref<string[]>([])
  const blockedClientContexts = ref<Record<string, string[]>>({})
  const unblockingClient = ref(false)
  const lockedProducts = ref<Record<string, unknown>>({})
  const unlockingProduct = ref(false)
  const loadingAppState = ref(false)
  const savingAppState = ref(false)
  const currentAppState = ref('normal')
  const newAppState = ref({ type: '', address_exceptions: [] as string[], retry_after: 0 })
  const addressExceptionInput = ref('')
  const creatingBackup = ref(false)
  const backupOptions = ref({
    config_files: true,
    redis_data: false,
    maintenance_mode: false,
    password: '',
  })
  const restoringBackup = ref(false)
  const uploadingFile = ref(false)
  const uploadProgress = ref(0)
  const selectedFile = ref<File | null>(null)
  const selectedFileName = ref('')
  const serverIdOption = ref('backup')
  const restoreOptions = ref({
    file_id: '',
    config_files: false,
    redis_data: false,
    server_id: '',
    password: '',
  })

  const blockedClientsCount = computed(() => blockedClients.value.length)
  const lockedProductsCount = computed(() => Object.keys(lockedProducts.value).length)

  type BlockedClientEntry = {
    clientId: string
    contexts: string[]
  }

  type LockedProductEntry = {
    productId: string
    locations: string[]
    reason: string
  }

  function normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter(Boolean)
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (!trimmed) return []

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            return parsed.map((v) => String(v).trim()).filter(Boolean)
          }
        } catch {}
      }

      return [trimmed]
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      const depots = normalizeStringArray(record.depots)
      if (depots.length > 0) return depots
      const servers = normalizeStringArray(record.servers)
      if (servers.length > 0) return servers
    }

    return []
  }

  const blockedClientEntries = computed<BlockedClientEntry[]>(() => {
    return blockedClients.value.map((clientId) => ({
      clientId,
      contexts: blockedClientContexts.value[clientId] || [],
    }))
  })

  const lockedProductEntries = computed<LockedProductEntry[]>(() => {
    return Object.entries(lockedProducts.value).map(([productId, rawReason]) => {
      const locations = normalizeStringArray(rawReason)
      return {
        productId,
        locations,
        reason: locations.length > 0 ? '' : String(rawReason || ''),
      }
    })
  })

  const serverIdOptions = computed(() => [
    { label: String($t('backup.useFrom')), value: 'backup' },
    { label: String($t('backup.useLocalId')), value: 'local' },
    { label: String($t('backup.useNewId')), value: 'new' },
  ])

  watch(serverIdOption, (val) => {
    if (val !== 'new') {
      restoreOptions.value.server_id = ''
    }
  })

  async function fetchBlockedClients() {
    loadingClients.value = true
    try {
      const { data, error: err } = await api.getBlockedClients()
      if (err) throw err
      if (data) {
        if (Array.isArray(data)) {
          blockedClients.value = data as string[]
          blockedClientContexts.value = {}
        } else if (typeof data === 'object' && data !== null) {
          const entries = data as Record<string, unknown>
          blockedClients.value = Object.keys(entries)
          blockedClientContexts.value = Object.fromEntries(
            Object.entries(entries).map(([clientId, value]) => [
              clientId,
              normalizeStringArray(value),
            ])
          )
        } else {
          blockedClients.value = []
          blockedClientContexts.value = {}
        }
      } else {
        blockedClients.value = []
        blockedClientContexts.value = {}
      }
    } catch (e) {
      clientCardMessage.value = {
        type: 'error',
        message: e instanceof Error ? e.message : String(e),
      }
    }
    loadingClients.value = false
  }

  async function fetchLockedProducts() {
    loadingProducts.value = true
    try {
      const { data, error: err } = await api.getLockedProducts()
      if (err) throw err
      if (data && typeof data === 'object') {
        lockedProducts.value = data as Record<string, unknown>
      } else {
        lockedProducts.value = {}
      }
    } catch (e) {
      productCardMessage.value = {
        type: 'error',
        message: e instanceof Error ? e.message : String(e),
      }
    }
    loadingProducts.value = false
  }

  async function fetchAppState() {
    loadingAppState.value = true
    try {
      const { data, error: err } = await api.getAppState()
      if (err) throw err
      if (data) {
        currentAppState.value = data.type
        newAppState.value = {
          type: data.type,
          address_exceptions: data.address_exceptions || [],
          retry_after: data.retry_after || 0,
        }
      }
    } catch (e) {
      pageMessage.value = { type: 'error', message: e instanceof Error ? e.message : String(e) }
    }
    loadingAppState.value = false
  }

  async function unblockSingleClient(clientId: string) {
    unblockingClient.value = true
    clientCardMessage.value = null
    try {
      const { error: err } = await api.unblockClient(clientId)
      if (err) throw err
      clientCardMessage.value = {
        type: 'success',
        message: String($t('clients.unblocked.one', { client: clientId })),
      }
      await fetchBlockedClients()
    } catch (e) {
      clientCardMessage.value = {
        type: 'error',
        message: e instanceof Error ? e.message : String(e),
      }
    }
    unblockingClient.value = false
  }

  async function unlockSingleProduct(productId: string) {
    unlockingProduct.value = true
    productCardMessage.value = null
    try {
      const { error: err } = await api.unlockProduct(productId)
      if (err) throw err
      productCardMessage.value = {
        type: 'success',
        message: String($t('products.unlocked', { product: productId })),
      }
      await fetchLockedProducts()
    } catch (e) {
      productCardMessage.value = {
        type: 'error',
        message: e instanceof Error ? e.message : String(e),
      }
    }
    unlockingProduct.value = false
  }

  async function unblockAll(type: 'clients' | 'products') {
    if (type === 'clients') {
      unblockingClient.value = true
      clientCardMessage.value = null
      try {
        const { error: err } = await api.unblockAllClients()
        if (err) throw err
        clientCardMessage.value = { type: 'success', message: String($t('clients.unblocked.all')) }
        await fetchBlockedClients()
      } catch (e) {
        clientCardMessage.value = {
          type: 'error',
          message: e instanceof Error ? e.message : String(e),
        }
      }
      unblockingClient.value = false
    } else {
      unlockingProduct.value = true
      productCardMessage.value = null
      try {
        const { error: err } = await api.unlockAllProducts()
        if (err) throw err
        productCardMessage.value = {
          type: 'success',
          message: String($t('notify.products.unlocked')),
        }
        await fetchLockedProducts()
      } catch (e) {
        productCardMessage.value = {
          type: 'error',
          message: e instanceof Error ? e.message : String(e),
        }
      }
      unlockingProduct.value = false
    }
  }

  async function saveAppState() {
    savingAppState.value = true
    pageMessage.value = null
    try {
      const { data, error: err } = await api.setAppState(newAppState.value)
      if (err) throw err
      if (data) currentAppState.value = data.type
      pageMessage.value = { type: 'success', message: String($t('notify.state.saved')) }
    } catch (e) {
      pageMessage.value = { type: 'error', message: e instanceof Error ? e.message : String(e) }
    }
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
    pageMessage.value = null
    try {
      const { data, error: err } = await api.createBackup(backupOptions.value)
      if (err) throw err
      if (data) {
        const a = document.createElement('a')
        a.href = '/file-transfer/' + data + '?delete=true'
        a.download = ''
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        pageMessage.value = { type: 'success', message: String($t('backup.created')) }
      }
    } catch (e) {
      pageMessage.value = { type: 'error', message: e instanceof Error ? e.message : String(e) }
    }
    creatingBackup.value = false
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files && input.files.length > 0 && input.files[0]) {
      selectedFile.value = input.files[0]
      selectedFileName.value = input.files[0].name
    }
  }

  async function restoreBackup() {
    if (!selectedFile.value) return
    restoringBackup.value = true
    uploadingFile.value = true
    uploadProgress.value = 0
    pageMessage.value = null

    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      const xhr = new XMLHttpRequest()
      const fileId = await new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            uploadProgress.value = Math.round((e.loaded / e.total) * 100)
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText)
              resolve(res.file_id)
            } catch {
              reject(new Error('Invalid upload response'))
            }
          } else {
            reject(new Error('Upload failed: ' + xhr.statusText))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.open('POST', '/file-transfer/multipart')
        xhr.withCredentials = true
        xhr.send(formData)
      })

      uploadingFile.value = false
      uploadProgress.value = 100

      restoreOptions.value.file_id = fileId
      const { error: restoreErr } = await api.restoreBackup({
        ...restoreOptions.value,
        server_id:
          serverIdOption.value === 'new'
            ? restoreOptions.value.server_id.trim()
            : serverIdOption.value,
      })
      if (restoreErr) throw restoreErr
      pageMessage.value = { type: 'success', message: String($t('backup.restored')) }
    } catch (e) {
      pageMessage.value = { type: 'error', message: (e as Error).message }
    }

    restoringBackup.value = false
    uploadingFile.value = false
    uploadProgress.value = 0
  }

  onMounted(() => {
    fetchBlockedClients()
    fetchLockedProducts()
    fetchAppState()
  })
</script>
