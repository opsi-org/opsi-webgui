<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsQuickActionsDropdown - Bulk action dropdown for selected products.
-->
<template>
  <CoreAppTooltip v-if="hasSelections && compact" :text="$t('products.quick')">
    <CoreAppButton
      variant="soft"
      color="primary"
      size="sm"
      :aria-label="String($t('products.quick'))"
      @click="dialogOpen = true"
      data-testid="product-quick-actions-trigger"
    >
      <CoreAppIcon :name="icons.product" class="w-4 h-4" />
    </CoreAppButton>
  </CoreAppTooltip>
  <CoreAppButton
    v-else-if="hasSelections"
    color="primary"
    size="sm"
    @click="dialogOpen = true"
    :aria-label="String($t('products.quick'))"
    data-testid="product-quick-actions-trigger"
  >
    <CoreAppIcon :name="icons.product" class="w-4 h-4" />
    <span class="hidden sm:inline">{{ $t('products.quick') }}</span>
  </CoreAppButton>
  <CoreAppTooltip v-else-if="compact" :text="$t('products.quickHelp')">
    <CoreAppButton variant="ghost" color="neutral" size="sm" class="opacity-70" :aria-label="String($t('products.quickHelp'))" disabled>
      <CoreAppIcon :name="icons.product" class="w-4 h-4" />
    </CoreAppButton>
  </CoreAppTooltip>
  <CoreAppButton
    v-else
    variant="ghost"
    color="neutral"
    size="sm"
    class="opacity-70"
    disabled
    :aria-label="String($t('products.quickHelp'))"
  >
    <CoreAppIcon :name="icons.product" class="w-4 h-4" />
    <span class="hidden sm:inline">{{ $t('products.quick') }}</span>
  </CoreAppButton>

  <CoreAppModal
    v-model:open="dialogOpen"
    :dismissible="true"
    :ui="{ content: 'w-[92vw] max-w-[48rem] h-auto max-h-[80vh]' }"
    data-testid="product-quick-actions-dialog"
  >
    <template #content>
      <CoreAppCard class="h-full min-w-0" :ui="{ root: 'h-full flex flex-col', body: 'flex-1 min-h-0 overflow-hidden p-2.5' }">
        <template #header>
          <div class="flex items-center justify-between">
            <CoreAppHeading :icon="icons.product" :text="$t('products.quick')" />
            <CoreAppButton
              variant="ghost"
              color="neutral"
              size="xs"
              :icon="icons.x"
              :aria-label="String($t('common.close'))"
              @click="dialogOpen = false"
            />
          </div>
        </template>

        <div v-if="loadingOptions" class="flex justify-center py-8">
          <CoreAppLoadingSpinner size="md" />
        </div>

        <div v-else class="flex flex-col gap-2 h-full min-h-0">
          <CoreAppAlertInline
            v-if="errorMessage"
            color="error"
            :description="errorMessage"
            variant="subtle"
            closable
            @close="errorMessage = null"
          />

          <div class="shrink-0 max-h-[44%] min-h-0 divide-y divide-(--color-border) overflow-auto pr-1">
            <div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
              <span class="text-sm font-medium text-(--color-text-muted) md:w-1/3 shrink-0">
                {{ $t('products.conditions') }}
              </span>
              <div class="flex-1 space-y-2">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <span class="text-xs text-(--color-text-muted) block mb-1">
                      {{ $t('products.status') }}
                    </span>
                    <CoreAppSelect
                      v-model="filters.installationStatus"
                      :items="installationStatusOptions"
                      size="xs"
                      class="w-full"
                      :aria-label="String($t('products.status'))"
                      data-testid="product-quick-actions-installation-status"
                      @update:model-value="fetchPreview"
                    />
                  </div>
                  <div>
                    <span class="text-xs text-(--color-text-muted) block mb-1">
                      {{ $t('actions.result') }}
                    </span>
                    <CoreAppSelect
                      v-model="filters.actionResult"
                      :items="actionResultOptions"
                      size="xs"
                      class="w-full"
                      :aria-label="String($t('actions.result'))"
                      data-testid="product-quick-actions-action-result"
                      @update:model-value="fetchPreview"
                    />
                  </div>
                </div>
                <span class="flex items-center gap-2 cursor-pointer">
                  <CoreAppCheckbox
                    v-model="filters.outdatedOnly"
                    :aria-label="String($t('products.outdated.onClient'))"
                    data-testid="product-quick-actions-outdated-only"
                    @update:model-value="fetchPreview"
                  />
                  <span class="text-xs">{{ $t('products.outdated.onClient') }}</span>
                </span>
              </div>
            </div>

            <div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
              <span class="text-sm font-medium text-(--color-text-muted) md:w-1/3 shrink-0">
                {{ $t('actions.request') }}
              </span>
              <div class="flex-1">
                <CoreAppSelect
                  v-model="actionRequest"
                  :items="actionRequestOptions"
                  size="sm"
                  class="w-full"
                  :aria-label="String($t('actions.request'))"
                  data-testid="product-quick-actions-action-request"
                  @update:model-value="fetchPreview"
                />
              </div>
            </div>

            <div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
              <span class="text-sm font-medium text-(--color-text-muted) md:w-1/3 shrink-0">
                {{ $t('fields.scope') }}
              </span>
              <div class="flex-1">
                <CoreAppSelect
                  v-model="scope"
                  :items="scopeOptions"
                  size="sm"
                  class="w-full"
                  :aria-label="String($t('fields.scope'))"
                  data-testid="product-quick-actions-scope"
                  @update:model-value="fetchPreview"
                />
                <p class="mt-1 text-xs text-(--color-text-muted)">{{ scopeHelpText }}</p>
              </div>
            </div>
          </div>

          <div class="flex-1 min-h-0 flex flex-col">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-(--color-text-muted)">
                {{ $t('common.preview') }}
              </span>
              <div class="flex items-center gap-2">
                <CoreAppButton
                  size="xs"
                  variant="outline"
                  color="primary"
                  :icon="icons.refresh"
                  :aria-label="String($t('common.refresh'))"
                  :loading="loadingPreview"
                  data-testid="product-quick-actions-preview-refresh"
                  @click="fetchPreview"
                />
                <CoreAppStatusBadge status="neutral" variant="soft" size="xs" :label="String(previewCount)" />
              </div>
            </div>

            <div class="border border-(--color-border) rounded-lg bg-(--color-surface) flex-1 min-h-0">
              <div v-if="loadingPreview" class="flex justify-center items-center h-full min-h-0">
                <CoreAppLoadingSpinner size="sm" />
              </div>
              <CoreAppTable
                v-else-if="previewData && Object.keys(previewData).length > 0"
                data-testid="product-quick-actions-preview-table"
                :columns="previewColumns"
                max-height="100%"
                wrapper-class="h-full min-h-0"
                :sort-key="previewSortKey"
                :sort-dir="previewSortDir"
                @sort="togglePreviewSort"
              >
                <tr
                  v-for="row in sortedPreviewRows"
                  :key="`${row.clientId}-${row.product.productId}`"
                  class="hover:bg-(--color-surface-hover)"
                >
                  <td class="px-1.5 py-1 text-sm truncate max-w-40" :title="row.clientId">
                    {{ row.clientId }}
                  </td>
                  <td class="px-1.5 py-1 text-sm truncate max-w-32" :title="row.product.productId">
                    {{ row.product.productId }}
                  </td>
                  <td class="px-1.5 py-1 text-sm text-(--color-text-muted) whitespace-nowrap">
                    {{
                      row.product.productVersion && row.product.packageVersion
                        ? `${row.product.productVersion}-${row.product.packageVersion}`
                        : '-'
                    }}
                  </td>
                  <td class="px-1.5 py-1 text-sm whitespace-nowrap">
                    <CoreAppStatusBadge
                      :status="getActionRequestStatus(row.product.actionRequest || actionRequest)"
                      :label="formatActionRequestLabel(row.product.actionRequest || actionRequest)"
                      size="xs"
                    />
                  </td>
                </tr>
              </CoreAppTable>
              <div
                v-else-if="previewData !== null"
                class="flex justify-center items-center text-xs text-(--color-text-muted) h-full min-h-0"
              >
                {{ $t('products.noMatch') }}
              </div>
              <div v-else class="flex justify-center items-center text-xs text-(--color-text-muted) h-full min-h-0">--</div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="space-y-3">
            <CoreAppAlertInline
              v-if="applyResult && applyResult.type === 'success'"
              color="success"
              :title="$t('common.success')"
              :description="applyResult.message"
              variant="subtle"
              closable
              @close="applyResult = null"
            />
            <CoreAppAlertInline
              v-if="applyResult && applyResult.type === 'error'"
              color="error"
              :title="$t('common.error')"
              :description="applyResult.message"
              variant="subtle"
              closable
              @close="applyResult = null"
            />
            <div class="flex justify-end gap-2">
              <CoreAppButton variant="outline" color="primary" size="sm" @click="resetForm">{{ $t('common.reset') }} </CoreAppButton>
              <CoreAppButton
                v-if="applyResult?.type === 'success'"
                variant="outline"
                color="primary"
                size="sm"
                @click="dialogOpen = false"
                >{{ $t('common.close') }}</CoreAppButton
              >
              <CoreAppButton
                v-else
                color="primary"
                size="sm"
                :disabled="isReadOnly || previewData == null || applying"
                :loading="applying"
                @click="applyActions"
              >
                {{ $t('common.apply') }}
              </CoreAppButton>
            </div>
          </div>
        </template>
      </CoreAppCard>
    </template>
  </CoreAppModal>
</template>

<script setup lang="ts">
  import { getActionRequestStatus } from '~/utils/actionRequest'
  import { useSelectionStore } from '~/stores/selectionStore'
  import type { ProductRow } from '~/types'

  interface Props {
    products?: ProductRow[]
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    products: () => [],
    compact: false,
  })

  const emit = defineEmits<{
    applied: []
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { getInstallationStatuses, getActionResults, bulkProductAction } = useApiHelpers()
  const selectionStore = useSelectionStore()
  const { isReadOnly } = useUserPermissions()

  const NOT_APPLIED = String($t('products.notApplied'))

  function formatActionRequestLabel(value?: string | null): string {
    const normalized = (value || 'none').toLowerCase()
    if (normalized === 'none') return `— ${String($t('common.none')).toLowerCase()} —`
    return normalized
  }

  const previewColumns = computed(() => [
    { key: 'clientId', label: String($t('clients.id')), sortable: true },
    { key: 'productId', label: String($t('products.id')), sortable: true },
    { key: 'version', label: String($t('common.version')), sortable: true },
    { key: 'actionRequest', label: String($t('actions.request')), sortable: true },
  ])

  const dialogOpen = ref(false)
  const loadingOptions = ref(false)
  const loadingPreview = ref(false)
  const applying = ref(false)
  const errorMessage = ref<string | null>(null)

  const hasSelections = computed(() => selectionStore.selectedClients.length > 0 || selectionStore.selectedServers.length > 0)

  const filters = ref({
    installationStatus: NOT_APPLIED,
    actionResult: NOT_APPLIED,
    outdatedOnly: false,
  })
  const actionRequest = ref(NOT_APPLIED)
  const scope = ref('clients')

  const installationStatusOptions = ref([
    { value: NOT_APPLIED, label: NOT_APPLIED },
    { value: 'installed', label: String($t('products.statusInstalled')) },
    { value: 'not_installed', label: String($t('products.statusNotInstalled')) },
    { value: 'unknown', label: String($t('products.statusUnknown')) },
  ])

  const actionResultOptions = ref([
    { value: NOT_APPLIED, label: NOT_APPLIED },
    { value: 'failed', label: String($t('actions.live.failed')) },
    { value: 'successful', label: String($t('actions.success')) },
    { value: 'none', label: String($t('common.none')) },
  ])

  const actionRequestOptions = [
    { value: NOT_APPLIED, label: NOT_APPLIED },
    { value: 'none', label: formatActionRequestLabel('none') },
    { value: 'setup', label: formatActionRequestLabel('setup') },
    { value: 'uninstall', label: formatActionRequestLabel('uninstall') },
    { value: 'update', label: formatActionRequestLabel('update') },
    { value: 'always', label: formatActionRequestLabel('always') },
    { value: 'once', label: formatActionRequestLabel('once') },
    { value: 'custom', label: formatActionRequestLabel('custom') },
  ]

  const scopeOptions = [
    { value: 'both', label: String($t('notifications.target.both')) },
    { value: 'servers', label: String($t('notifications.target.servers')) },
    { value: 'clients', label: String($t('notifications.target.clients')) },
  ]

  const scopeHelpText = computed(() => {
    if (scope.value === 'clients') {
      return String($t('notifications.target.clients'))
    }
    if (scope.value === 'servers') {
      return String($t('products.quickScopeHelp'))
    }
    return `${String($t('notifications.target.both'))}: ${String($t('products.quickScopeHelp'))}`
  })

  interface PreviewProduct {
    productId: string
    productType?: string
    productVersion?: string
    packageVersion?: string
    actionRequest?: string
    installationStatus?: string
  }

  const previewData = ref<Record<string, PreviewProduct[]> | null>(null)
  const previewSortKey = ref<string>('clientId')
  const previewSortDir = ref<'asc' | 'desc'>('asc')
  const previewRequestId = ref(0)

  const PREVIEW_TIMEOUT_MS = 15000
  const PREVIEW_RENDER_LIMIT = 1500

  const previewCount = computed(() => {
    if (!previewData.value) return 0
    return Object.values(previewData.value).reduce((sum, arr) => sum + arr.length, 0)
  })

  const sortedPreviewRows = computed(() => {
    if (!previewData.value) return []
    const rows: Array<{ clientId: string; product: PreviewProduct }> = []
    for (const [clientId, products] of Object.entries(previewData.value)) {
      for (const product of products) {
        rows.push({ clientId, product })
      }
    }
    const dir = previewSortDir.value === 'asc' ? 1 : -1
    const valueOf = (r: { clientId: string; product: PreviewProduct }): string => {
      switch (previewSortKey.value) {
        case 'productId':
          return r.product.productId
        case 'version':
          return `${r.product.productVersion ?? ''}-${r.product.packageVersion ?? ''}`
        case 'actionRequest':
          return r.product.actionRequest || actionRequest.value
        case 'installationStatus':
          return r.product.installationStatus || ''
        case 'clientId':
        default:
          return r.clientId
      }
    }
    rows.sort((a, b) => {
      const cmp = valueOf(a).localeCompare(valueOf(b))
      if (cmp !== 0) return cmp * dir
      // stable secondary sort for a predictable order
      const sec = a.clientId.localeCompare(b.clientId) || a.product.productId.localeCompare(b.product.productId)
      return sec
    })
    return rows.slice(0, PREVIEW_RENDER_LIMIT)
  })

  function togglePreviewSort(key: string) {
    if (previewSortKey.value === key) {
      previewSortDir.value = previewSortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      previewSortKey.value = key
      previewSortDir.value = 'asc'
    }
  }

  watch(dialogOpen, async (open) => {
    if (open) {
      resetForm()
      await fetchOptions()
    }
  })

  async function fetchOptions() {
    loadingOptions.value = true
    try {
      const [statusResult, resultResult] = await Promise.all([getInstallationStatuses(), getActionResults()])
      if (statusResult.data) {
        installationStatusOptions.value = [
          { value: NOT_APPLIED, label: NOT_APPLIED },
          ...(statusResult.data as string[]).map((s: string) => ({ value: s, label: s })),
        ]
      }
      if (resultResult.data) {
        actionResultOptions.value = [
          { value: NOT_APPLIED, label: NOT_APPLIED },
          ...(resultResult.data as string[]).map((s: string) => ({ value: s, label: s })),
        ]
      }
    } catch (e) {
      errorMessage.value = e instanceof Error ? e.message : String(e)
    } finally {
      loadingOptions.value = false
    }
  }

  function buildParams(demoMode: boolean): Record<string, unknown> | null {
    const includeClients = scope.value === 'both' || scope.value === 'clients'
    const includeServers = scope.value === 'both' || scope.value === 'servers'

    const instStatus = filters.value.installationStatus === NOT_APPLIED ? null : filters.value.installationStatus
    const actResult = filters.value.actionResult === NOT_APPLIED ? null : filters.value.actionResult
    const action = actionRequest.value === NOT_APPLIED ? '' : actionRequest.value

    if (!filters.value.outdatedOnly && instStatus === null && actResult === null && action === '') {
      previewData.value = null
      return null
    }

    if (action === '' && !demoMode) {
      errorMessage.value = String($t('notify.chooseAction'))
      return null
    }

    const selectedClients = includeClients && selectionStore.selectedClients.length > 0 ? selectionStore.selectedClients : null
    const selectedDepots = includeServers && selectionStore.selectedServers.length > 0 ? selectionStore.selectedServers : null

    if (includeServers && !selectedDepots) {
      errorMessage.value = String($t('servers.noSelection'))
      previewData.value = null
      return null
    }

    return {
      action,
      demoMode,
      outdated: filters.value.outdatedOnly,
      installation_status: instStatus,
      action_result: actResult,
      selectedClients,
      selectedDepots,
    }
  }

  async function callBulkProductActionWithTimeout(params: Record<string, unknown>) {
    const timeoutError = new Error('Preview request timed out. Please narrow the scope or add stricter conditions.')
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(timeoutError), PREVIEW_TIMEOUT_MS)
    })
    return (await Promise.race([bulkProductAction(params as Parameters<typeof bulkProductAction>[0]), timeoutPromise])) as Awaited<
      ReturnType<typeof bulkProductAction>
    >
  }

  async function fetchPreview() {
    const params = buildParams(true)
    if (!params) return
    const requestId = ++previewRequestId.value
    loadingPreview.value = true
    errorMessage.value = null
    try {
      const result = await callBulkProductActionWithTimeout(params)
      if (requestId !== previewRequestId.value) return
      if (result.error) throw result.error
      previewData.value = (result.data || {}) as Record<string, PreviewProduct[]>
    } catch (e) {
      if (requestId !== previewRequestId.value) return
      errorMessage.value = e instanceof Error ? e.message : String(e)
      previewData.value = null
    } finally {
      if (requestId === previewRequestId.value) {
        loadingPreview.value = false
      }
    }
  }

  const applyResult = ref<{ type: 'success' | 'error'; message: string } | null>(null)

  async function applyActions() {
    const params = buildParams(false)
    if (!params) return
    applying.value = true
    errorMessage.value = null
    applyResult.value = null
    try {
      const result = await bulkProductAction(params as Parameters<typeof bulkProductAction>[0])
      if (result.error) throw result.error
      applyResult.value = { type: 'success', message: String($t('notify.action.executed')) }
      emit('applied')
    } catch (e) {
      applyResult.value = { type: 'error', message: e instanceof Error ? e.message : String(e) }
    } finally {
      applying.value = false
    }
  }

  function resetForm() {
    filters.value = {
      installationStatus: NOT_APPLIED,
      actionResult: NOT_APPLIED,
      outdatedOnly: false,
    }
    actionRequest.value = NOT_APPLIED
    scope.value = 'clients'
    previewData.value = null
    errorMessage.value = null
    applyResult.value = null
  }
</script>
