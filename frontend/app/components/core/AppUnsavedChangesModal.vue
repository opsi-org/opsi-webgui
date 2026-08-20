<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppUnsavedChangesModal - Confirmation modal for unsaved changes on navigation.
-->

<template>
  <template v-if="totalChangesCount > 0">
    <div class="inline-flex rounded-md shadow-sm">
      <template v-if="showSaveDiscard">
        <UTooltip :text="$t('common.save')">
          <UButton :size="size" color="success" variant="solid" class="rounded-r-none" :loading="isSaving" @click="handleQuickSave">
            <UIcon :name="icons.check" class="w-3.5 h-3.5" />
          </UButton>
        </UTooltip>
        <UTooltip :text="$t('common.discard')">
          <UButton
            :size="size"
            color="neutral"
            variant="soft"
            class="rounded-none border border-(--color-border)"
            @click="handleQuickDiscard"
          >
            <UIcon :name="icons.delete" class="w-3.5 h-3.5" />
          </UButton>
        </UTooltip>
      </template>
      <UButton
        :size="size"
        color="neutral"
        variant="soft"
        :class="showSaveDiscard ? 'rounded-l-none border border-(--color-border)' : ''"
        @click="open = true"
      >
        {{ $t('unsaved.changes') }}
        <CoreAppStatusBadge status="warning" size="xs" :value="totalChangesCount" class="ml-1" />
      </UButton>
    </div>
  </template>

  <UModal v-model:open="open" :title="$t('unsaved.changes')" :ui="{ content: 'w-[98vw] max-w-[98vw] h-[92vh] max-h-[92vh]' }">
    <template #body>
      <div class="flex flex-col gap-3 h-full min-h-0 overflow-hidden">
        <!-- Result alerts inside modal -->
        <CoreAppAlertInline
          v-if="saveResult && saveResult.type === 'success'"
          color="success"
          :title="$t('common.success')"
          :description="saveResult.message"
          variant="subtle"
          closable
          @close="saveResult = null"
        />
        <CoreAppAlertInline
          v-if="saveResult && saveResult.type === 'error'"
          color="error"
          :title="$t('common.error')"
          :description="saveResult.message"
          variant="subtle"
          closable
          @close="saveResult = null"
        />
        <CoreAppAlertInline
          v-if="saveResult && saveResult.type === 'warning'"
          color="warning"
          :title="$t('common.warning')"
          :description="saveResult.message"
          variant="subtle"
          closable
          @close="saveResult = null"
        />

        <!-- Product changes table -->
        <template v-if="flatChanges.length > 0">
          <div class="flex-1 min-h-0">
            <CoreAppTable :columns="productChangeColumns" max-height="100%" wrapper-class="h-full min-h-0">
              <tr v-for="change in flatChanges" :key="change.key" class="hover:bg-(--color-surface-hover)">
                <td class="px-2 py-1 max-w-32 font-medium">
                  <UTooltip :text="change.productId" :delay-duration="300">
                    <span class="block truncate">{{ change.productId }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 max-w-28 text-(--color-text-muted)">
                  <UTooltip :text="change.label" :delay-duration="300">
                    <span class="block truncate">{{ change.label }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 max-w-24 text-(--color-text-muted)">
                  <UTooltip :text="String(change.oldValue)" :delay-duration="300">
                    <span class="block truncate">{{ change.oldValue }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 max-w-24 font-medium">
                  <UTooltip :text="String(change.newValue)" :delay-duration="300">
                    <span class="block truncate">{{ change.newValue }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 text-center">
                  <UTooltip :text="$t('common.discard')">
                    <UButton size="xs" :icon="icons.x" color="neutral" variant="ghost" @click="change.discard()" />
                  </UTooltip>
                </td>
              </tr>
            </CoreAppTable>
          </div>
        </template>

        <!-- Host parameters table -->
        <template v-if="(configRef?.changedParams?.size ?? 0) > 0">
          <h5 class="font-heading text-xs text-(--color-text-muted) mb-1 m-0">
            {{ $t('config.params') }}
          </h5>
          <div class="flex-1 min-h-0">
            <CoreAppTable :columns="paramChangeColumns" max-height="100%" wrapper-class="h-full min-h-0">
              <tr v-for="[key] in configRef?.changedParams" :key="key" class="hover:bg-(--color-surface-hover)">
                <td class="px-2 py-1 max-w-40 font-medium">
                  <UTooltip :text="key" :delay-duration="300">
                    <span class="block truncate">{{ key }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 max-w-28 text-(--color-text-muted)">
                  <UTooltip :text="fmtVal(configRef?.getOriginalParamValue?.(key))" :delay-duration="300">
                    <span class="block truncate">{{ fmtVal(configRef?.getOriginalParamValue?.(key)) }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 max-w-28 font-medium">
                  <UTooltip :text="fmtVal(configRef?.changedParams?.get(key))" :delay-duration="300">
                    <span class="block truncate">{{ fmtVal(configRef?.changedParams?.get(key)) }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 text-center">
                  <UTooltip :text="$t('common.discard')">
                    <UButton size="xs" :icon="icons.x" color="neutral" variant="ghost" @click="configRef?.discardSingleParam?.(key)" />
                  </UTooltip>
                </td>
              </tr>
            </CoreAppTable>
          </div>
        </template>

        <!-- Host attributes table -->
        <template v-if="(configRef?.changedAttributesList?.length ?? 0) > 0">
          <h5 class="font-heading text-xs text-(--color-text-muted) mb-1 m-0">
            {{ $t('common.attributes') }}
          </h5>
          <div class="flex-1 min-h-0">
            <CoreAppTable :columns="attrChangeColumns" max-height="100%" wrapper-class="h-full min-h-0">
              <tr v-for="item in configRef?.changedAttributesList" :key="item.key" class="hover:bg-(--color-surface-hover)">
                <td class="px-2 py-1 max-w-40 font-medium">
                  <UTooltip :text="item.key" :delay-duration="300">
                    <span class="block truncate">{{ item.key }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 max-w-28 text-(--color-text-muted)">
                  <UTooltip :text="fmtVal(item.oldValue)" :delay-duration="300">
                    <span class="block truncate">{{ fmtVal(item.oldValue) }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 max-w-28 font-medium">
                  <UTooltip :text="fmtVal(item.newValue)" :delay-duration="300">
                    <span class="block truncate">{{ fmtVal(item.newValue) }}</span>
                  </UTooltip>
                </td>
                <td class="px-2 py-1 text-center">
                  <UTooltip :text="$t('common.discard')">
                    <UButton
                      size="xs"
                      :icon="icons.x"
                      color="neutral"
                      variant="ghost"
                      @click="configRef?.discardSingleAttribute?.(item.key)"
                    />
                  </UTooltip>
                </td>
              </tr>
            </CoreAppTable>
          </div>
        </template>

        <div v-if="totalChangesCount === 0 && !saveResult" class="py-6 text-center text-sm text-(--color-text-muted)">
          {{ $t('common.noResults') }}
        </div>
      </div>
    </template>
    <template #footer>
      <div class="w-full space-y-3">
        <!-- Save & Process options (products mode) -->
        <div v-if="showProcessOptions && totalChangesCount > 0" class="border border-(--color-border) rounded-lg overflow-hidden">
          <div class="bg-(--color-surface) px-3 py-1.5 flex items-center gap-2">
            <UIcon :name="icons.onDemand" class="w-4 h-4 text-(--color-text-muted)" />
            <span class="flex items-center gap-2 cursor-pointer">
              <CoreAppCheckbox v-model="processAfterSave" size="sm" />
              <span class="text-sm font-medium">{{ $t('actions.saveAndProcess') }}</span>
            </span>
          </div>
          <template v-if="processAfterSave">
            <div class="px-3 py-2 space-y-2">
              <div class="space-y-1">
                <span class="text-xs font-medium text-(--color-text-muted)">{{ $t('products.title') }}:</span>
                <div class="flex flex-wrap items-center gap-2">
                  <CoreAppRadio v-model="onDemandProductMode" value="all" :label="$t('common.all')" size="xs" />
                  <CoreAppRadio
                    v-if="selectedProductIds.length > 0"
                    v-model="onDemandProductMode"
                    value="selected"
                    :label="`${$t('common.selected')} (${selectedProductIds.length})`"
                    size="xs"
                  />
                </div>
              </div>
              <div class="space-y-1">
                <span class="text-xs font-medium text-(--color-text-muted)">{{ $t('common.visibility') }}:</span>
                <div class="flex flex-wrap items-center gap-2">
                  <CoreAppRadio v-model="onDemandVisibility" value="" :label="$t('clients.default')" size="xs" />
                  <CoreAppRadio v-model="onDemandVisibility" value="visible" :label="$t('common.visible')" size="xs" />
                  <CoreAppRadio v-model="onDemandVisibility" value="hidden" :label="$t('common.hidden')" size="xs" />
                </div>
              </div>
              <div class="space-y-1">
                <span class="text-xs font-medium text-(--color-text-muted)">{{ $t('clients.title') }}:</span>
                <div class="text-xs text-(--color-text-muted)">
                  {{ onDemandClientIds.length }}
                  <span v-if="onDemandClientIds.length > 0" class="ml-1">
                    ({{ onDemandClientIds.slice(0, 3).join(', ') }}{{ onDemandClientIds.length > 3 ? '...' : '' }})
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="flex gap-2 justify-end">
          <template v-if="totalChangesCount > 0">
            <UButton variant="outline" color="primary" @click="handleDiscardAll">{{ $t('common.discardAll') }} </UButton>
            <UButton color="primary" :loading="isSaving" @click="handleSaveAll">
              {{ processAfterSave && showProcessOptions ? $t('actions.saveAndProcess') : $t('common.saveAll') }}
            </UButton>
          </template>
          <UButton v-else variant="ghost" color="neutral" @click="open = false">{{ $t('common.close') }} </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import type { ProductConfigTabsRef, ProductActionRequestChange, EditablePropertyValue, ProductVisibility } from '~/types'
  import type { TableColumn } from '~/components/core/AppTable.vue'

  /**
   * Host config ref interface for host parameters + attributes context.
   */
  export interface HostConfigRef {
    hasAnyChanges?: boolean
    isSaving?: boolean
    changedCount?: number
    changedParams?: Map<string, unknown>
    changedAttributesList?: Array<{
      key: string
      label: string
      oldValue: unknown
      newValue: unknown
    }>
    saveAll?: () => void
    discardAll?: () => void
    discardSingleParam?: (key: string) => void
    discardSingleAttribute?: (key: string) => void
    getOriginalParamValue?: (key: string) => unknown
    fmtVal?: (v: unknown) => string
  }

  interface ChangeItem {
    key: string
    type: 'property' | 'actionRequest'
    label: string
    oldValue: string
    newValue: string
    discard: () => void
  }

  interface ChangeGroup {
    productId: string
    changes: ChangeItem[]
  }

  const props = withDefaults(
    defineProps<{
      /** Host config ref for host parameters/attributes mode */
      configRef?: HostConfigRef | null
      /** Product config ref for product properties/action requests mode */
      productConfigRef?: ProductConfigTabsRef | null
      /** Product ID context for panel property changes */
      configProductId?: string
      /** Selected product IDs for on-demand processing */
      selectedProductIds?: string[]
      /** Which product changes to show: 'all' | 'actionRequests' | 'properties' */
      mode?: 'all' | 'actionRequests' | 'properties'
      /** Button size */
      size?: 'xs' | 'sm'
      /** Show inline save/discard buttons */
      showSaveDiscard?: boolean
      /** Show the process options in footer (for action request mode) */
      showProcessOptions?: boolean
      /** Client IDs for on-demand processing */
      clientIds?: string[]
    }>(),
    {
      configRef: null,
      productConfigRef: null,
      size: 'sm',
      showSaveDiscard: true,
      mode: 'all',
      selectedProductIds: () => [],
      showProcessOptions: false,
      clientIds: () => [],
    },
  )

  const emit = defineEmits<{
    saveAll: [
      processOnDemand: boolean,
      onDemandOptions?: { productIds?: string[]; visibility?: string; clientIds?: string[] },
      onResult?: (result: { type: 'success' | 'error' | 'warning'; message: string }) => void,
    ]
    discardAll: []
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const open = ref(false)

  const productChangeColumns = computed<TableColumn[]>(() => [
    { key: 'productId', label: String($t('products.id')) },
    { key: 'property', label: String($t('products.property')) },
    { key: 'oldValue', label: String($t('common.oldValue')) },
    { key: 'newValue', label: String($t('common.newValue')) },
    { key: 'actions', label: '', width: '2.5rem' },
  ])

  const paramChangeColumns = computed<TableColumn[]>(() => [
    { key: 'parameter', label: String($t('config.param')) },
    { key: 'oldValue', label: String($t('common.oldValue')) },
    { key: 'newValue', label: String($t('common.newValue')) },
    { key: 'actions', label: '', width: '2.5rem' },
  ])

  const attrChangeColumns = computed<TableColumn[]>(() => [
    { key: 'attribute', label: String($t('common.attribute')) },
    { key: 'oldValue', label: String($t('common.oldValue')) },
    { key: 'newValue', label: String($t('common.newValue')) },
    { key: 'actions', label: '', width: '2.5rem' },
  ])
  const processAfterSave = ref(false)
  const onDemandProductMode = ref<'all' | 'selected'>('all')
  const onDemandVisibility = ref<ProductVisibility>('')
  const onDemandClientIds = ref<string[]>([])
  const saveResult = ref<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

  watch(open, (isOpen) => {
    if (isOpen) {
      onDemandClientIds.value = [...props.clientIds]
      onDemandProductMode.value = props.selectedProductIds.length > 0 ? 'selected' : 'all'
      saveResult.value = null
    }
  })

  function fmtVal(v: unknown): string {
    if (props.configRef?.fmtVal) return props.configRef.fmtVal(v)
    if (props.productConfigRef?.fmtVal) return props.productConfigRef.fmtVal(v)
    if (v === null || v === undefined) return '-'
    if (Array.isArray(v)) return v.join(', ')
    return String(v)
  }

  const isSaving = computed(() => props.configRef?.isSaving || props.productConfigRef?.isSaving || false)

  /** Product-grouped changes (properties + action requests) */
  const groupedProductChanges = computed<ChangeGroup[]>(() => {
    if (!props.productConfigRef) return []
    const groups = new Map<string, ChangeItem[]>()

    if (props.mode !== 'actionRequests' && props.productConfigRef.changedProperties) {
      const productId = props.configProductId || String($t('products.properties'))
      for (const [key, newVal] of props.productConfigRef.changedProperties) {
        const items = groups.get(productId) || []
        items.push({
          key: `prop-${key}`,
          type: 'property',
          label: key,
          oldValue: props.productConfigRef.fmtVal?.(props.productConfigRef.getOriginalPropertyValue?.(key)) || '-',
          newValue: props.productConfigRef.fmtVal?.(newVal) || '-',
          discard: () => props.productConfigRef?.discardSingleProperty?.(key),
        })
        groups.set(productId, items)
      }
    }

    if (props.mode !== 'properties' && props.productConfigRef.changedActionRequests) {
      for (const [productId, change] of props.productConfigRef.changedActionRequests) {
        const items = groups.get(productId) || []
        items.push({
          key: `ar-${productId}`,
          type: 'actionRequest',
          label: String($t('actions.request')),
          oldValue: change.oldRequest || 'none',
          newValue: change.actionRequest,
          discard: () => props.productConfigRef?.discardSingleActionRequest?.(productId),
        })
        groups.set(productId, items)
      }
    }

    return Array.from(groups.entries()).map(([productId, changes]) => ({ productId, changes }))
  })

  /** Flat list of all product changes for table display */
  const flatChanges = computed(() => {
    const items: Array<ChangeItem & { productId: string }> = []
    for (const group of groupedProductChanges.value) {
      for (const change of group.changes) {
        items.push({ ...change, productId: group.productId })
      }
    }
    return items
  })

  /** Total count of all changes across all contexts */
  const totalChangesCount = computed(() => {
    let count = 0
    // Product changes
    if (props.productConfigRef) {
      if (props.mode !== 'actionRequests' && props.productConfigRef.changedProperties) {
        count += props.productConfigRef.changedProperties.size
      }
      if (props.mode !== 'properties' && props.productConfigRef.changedActionRequests) {
        count += props.productConfigRef.changedActionRequests.size
      }
    }
    // Host changes
    if (props.configRef) {
      count += props.configRef.changedParams?.size ?? 0
      count += props.configRef.changedAttributesList?.length ?? 0
    }
    return count
  })

  function handleQuickSave() {
    emit('saveAll', false)
  }

  function handleQuickDiscard() {
    emit('discardAll')
  }

  function handleSaveAll() {
    saveResult.value = null
    const options =
      processAfterSave.value && props.showProcessOptions
        ? {
            productIds: onDemandProductMode.value === 'selected' ? props.selectedProductIds : undefined,
            visibility: onDemandVisibility.value || undefined,
            clientIds: onDemandClientIds.value.length > 0 ? onDemandClientIds.value : undefined,
          }
        : undefined
    emit('saveAll', processAfterSave.value && props.showProcessOptions, options, (result) => {
      saveResult.value = result
    })
  }

  function handleDiscardAll() {
    emit('discardAll')
    saveResult.value = { type: 'success', message: String($t('unsaved.discarded')) }
  }
</script>
