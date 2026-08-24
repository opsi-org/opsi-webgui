<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsActionRequestDropdown - Dropdown for selecting product action requests.
-->
<template>
  <div v-if="mode === 'header'" class="flex items-center gap-1 w-full" @click.stop>
    <CoreAppPopover v-if="hasClientsSelected && hasProductsSelected" class="flex-1 min-w-0">
      <CoreAppButton size="xs" variant="soft" color="primary" block class="justify-between gap-1 w-full px-1.5!">
        <span class="truncate">{{ $t('actions.request') }}</span>
        <CoreAppIcon :name="icons.chevronDown" class="w-3 h-3 shrink-0" />
      </CoreAppButton>
      <template #content>
        <div class="p-2 w-44">
          <p class="text-xs text-(--color-text-muted) mb-2">{{ $t('quick.setFor') }}</p>
          <div class="space-y-1">
            <CoreAppButton
              v-for="action in bulkActionOptions"
              :key="action"
              size="xs"
              variant="soft"
              :color="getRequestStatus(action)"
              block
              class="justify-start"
              @click="emit('apply', action)"
            >
              {{ getRequestSelectLabel(action) }}
            </CoreAppButton>
          </div>
        </div>
      </template>
    </CoreAppPopover>
    <span v-else class="flex-1 min-w-0 truncate text-left text-xs font-medium">{{ $t('actions.request') }}</span>
    <CoreAppIcon
      v-if="sortColumn === 'actionRequest'"
      :name="sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
      class="w-2.5 h-2.5 shrink-0"
    />
    <CoreAppIcon v-else :name="icons.sort" class="w-2.5 h-2.5 opacity-30 shrink-0" />
  </div>

  <div v-else class="flex items-center gap-1">
    <CoreAppTooltipTable v-if="isMixed && disabled" :rows="mixedTooltipRows">
      <CoreAppBadge color="warning" variant="subtle" size="xs" class="gap-1 cursor-help">
        <CoreAppIcon :name="icons.unequal" class="w-3 h-3" />
      </CoreAppBadge>
    </CoreAppTooltipTable>
    <template v-else-if="!disabled">
      <CoreAppSelect
        v-model="selectedRequest"
        :items="requestItems"
        size="xs"
        class="min-w-24"
        :class="requestColorClass"
        :aria-label="String($t('actions.request'))"
        @update:model-value="handleChange"
      />
      <CoreAppTooltipTable v-if="isMixed" :rows="mixedTooltipRows">
        <CoreAppBadge color="warning" variant="subtle" size="xs" class="gap-1 cursor-help shrink-0">
          <CoreAppIcon :name="icons.unequal" class="w-3 h-3" />
        </CoreAppBadge>
      </CoreAppTooltipTable>
    </template>
    <CoreAppStatusBadge v-else :status="currentRequestStatus" :label="currentLabel" size="xs" variant="soft" />
    <span
      v-if="hasChanged || hasPendingChange"
      class="w-1.5 h-1.5 rounded-full bg-(--color-warning) shrink-0"
      :title="$t('unsaved.changes')"
    />
  </div>
</template>

<script setup lang="ts">
  interface Props {
    mode?: 'row' | 'header'
    productId?: string
    currentRequest?: string
    availableActions?: string[]
    disabled?: boolean
    requestDetails?: string[]
    selectedClients?: string[] | null
    pendingRequest?: string
    hasClientsSelected?: boolean
    hasProductsSelected?: boolean
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'row',
    disabled: false,
    availableActions: () => [],
    hasClientsSelected: false,
    hasProductsSelected: false,
  })

  const emit = defineEmits<{
    change: [request: string]
    apply: [actionRequest: string]
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()

  const bulkActionOptions = ['none', 'setup', 'uninstall', 'update', 'always', 'once', 'custom']

  function normalizeRequest(value?: string | null): string {
    const normalized = (value || 'none').toLowerCase()
    return normalized || 'none'
  }

  function getRequestStatus(value?: string | null): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    switch (normalizeRequest(value)) {
      case 'setup':
        return 'warning'
      case 'uninstall':
        return 'error'
      case 'update':
        return 'info'
      case 'always':
        return 'success'
      case 'once':
        return 'info'
      case 'custom':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  function getRequestLabel(value?: string | null): string {
    switch (normalizeRequest(value)) {
      case 'none':
        return '—'
      default:
        return normalizeRequest(value)
    }
  }

  function getRequestSelectLabel(value?: string | null): string {
    switch (normalizeRequest(value)) {
      case 'none':
        return `— ${String($t('common.none')).toLowerCase()} —`
      default:
        return normalizeRequest(value)
    }
  }

  const isMixed = computed(() => {
    if (!props.requestDetails || props.requestDetails.length <= 1) return false
    const unique = [...new Set(props.requestDetails.map((r) => r?.toLowerCase() || 'none'))]
    return unique.length > 1
  })

  const hasPendingChange = computed(() => {
    if (!props.pendingRequest) return false
    const orig = props.currentRequest || 'none'
    return props.pendingRequest !== orig
  })

  const mixedTooltipRows = computed(() => {
    if (!props.requestDetails) return []
    const clients = props.selectedClients || []
    if (clients.length > 0 && clients.length === props.requestDetails.length) {
      return [
        { key: `── ${String($t('clients.title'))} ──`, value: '' },
        ...clients.map((c, i) => ({
          key: c,
          value: '',
          badge: getRequestLabel(props.requestDetails![i]),
          badgeColor: getRequestStatus(props.requestDetails![i]),
        })),
      ]
    }
    const counts: Record<string, number> = {}
    props.requestDetails.forEach((r) => {
      const key = r?.toLowerCase() || 'none'
      counts[key] = (counts[key] || 0) + 1
    })
    return [
      { key: `── ${String($t('actions.request'))} ──`, value: '' },
      ...Object.entries(counts).map(([k, v]) => ({
        key: getRequestSelectLabel(k),
        value: String(v),
        badge: getRequestLabel(k),
        badgeColor: getRequestStatus(k),
      })),
    ]
  })

  const defaultActions = ['none', 'setup', 'uninstall', 'update', 'always', 'once', 'custom']

  const requestItems = computed(() => {
    const actions = props.availableActions.length > 0 ? ['none', ...props.availableActions] : defaultActions
    return [...new Set(actions)].map((a) => ({
      label: getRequestSelectLabel(a),
      value: a,
    }))
  })

  const originalRequest = ref(props.currentRequest || 'none')
  const selectedRequest = ref(props.currentRequest || 'none')

  const hasChanged = computed(() => selectedRequest.value !== originalRequest.value)

  const currentLabel = computed(() => {
    const option = requestItems.value.find((o) => o.value === selectedRequest.value)
    return option?.label || getRequestSelectLabel(selectedRequest.value)
  })

  const currentRequestStatus = computed(() => getRequestStatus(selectedRequest.value))

  const requestColorClass = computed(() => {
    switch (currentRequestStatus.value) {
      case 'warning':
        return 'bg-(--color-warning-soft-bg)! border-(--color-warning-soft-text)/40! text-(--color-warning-soft-text)!'
      case 'error':
        return 'bg-(--color-error-soft-bg)! border-(--color-error-soft-text)/40! text-(--color-error-soft-text)!'
      case 'info':
        return 'bg-(--color-info-soft-bg)! border-(--color-info-soft-text)/40! text-(--color-info-soft-text)!'
      case 'success':
        return 'bg-(--color-success-soft-bg)! border-(--color-success-soft-text)/40! text-(--color-success-soft-text)!'
      default:
        return ''
    }
  })

  function handleChange(value: string) {
    emit('change', value)
  }

  function resetToOriginal() {
    selectedRequest.value = originalRequest.value
  }

  watch(
    () => props.currentRequest,
    (newVal) => {
      originalRequest.value = newVal || 'none'
      selectedRequest.value = newVal || 'none'
    },
  )

  watch(
    () => props.pendingRequest,
    (newVal) => {
      if (newVal !== undefined) {
        selectedRequest.value = newVal
      } else {
        selectedRequest.value = originalRequest.value
      }
    },
  )

  defineExpose({ hasChanged, resetToOriginal })
</script>
