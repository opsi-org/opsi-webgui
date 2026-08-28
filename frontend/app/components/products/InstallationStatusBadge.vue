<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsInstallationStatusBadge - Badge showing product installation status.
-->
<template>
  <div class="flex justify-center">
    <CoreAppTooltipTable v-if="isMixed" :rows="mixedTooltipRows">
      <CoreAppTooltip v-if="iconOnly" :text="String($t('common.mixed'))">
        <CoreAppStatusBadge status="warning" :icon="icons.unequal" size="xs" />
      </CoreAppTooltip>
      <CoreAppStatusBadge v-else status="warning" :icon="icons.unequal" :label="$t('common.mixed')" />
    </CoreAppTooltipTable>

    <template v-else-if="normalizedStatus === 'installed'">
      <CoreAppTooltip v-if="iconOnly" :text="String($t('products.installed'))">
        <CoreAppStatusBadge status="success" :icon="icons.check" size="xs" />
      </CoreAppTooltip>
      <CoreAppStatusBadge v-else status="success" :icon="icons.check" :label="$t('products.installed')" />
    </template>

    <template v-else-if="normalizedStatus === 'unknown'">
      <CoreAppTooltip v-if="iconOnly" :text="String($t('common.unknown'))">
        <CoreAppStatusBadge status="warning" :icon="icons.productInstallationStatusUnknown" size="xs" />
      </CoreAppTooltip>
      <CoreAppStatusBadge v-else status="warning" :icon="icons.productInstallationStatusUnknown" :label="$t('common.unknown')" />
    </template>

    <span
      v-else-if="normalizedStatus === 'not_installed' || normalizedStatus === 'none' || !normalizedStatus"
      class="text-(--color-text-muted) text-xs"
      >-</span
    >

    <CoreAppTooltip v-else-if="iconOnly" :text="String(status)">
      <CoreAppStatusBadge status="info" :icon="icons.productInstallationStatusUnknown" size="xs" />
    </CoreAppTooltip>

    <CoreAppStatusBadge v-else :label="status" />
  </div>
</template>

<script setup lang="ts">
  interface Props {
    productId?: string
    status?: string
    statusDetails?: string[]
    selectedClients?: string[] | null
    iconOnly?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    iconOnly: false,
  })

  const iconOnly = computed(() => props.iconOnly)

  const icons = useIcons()
  const { t: $t } = useI18n()

  const normalizedStatus = computed(() => props.status?.toLowerCase())

  const isMixed = computed(() => {
    if (normalizedStatus.value === 'mixed') return true
    if (!props.statusDetails || props.statusDetails.length <= 1) return false
    const uniqueStatuses = [...new Set(props.statusDetails.map((s) => (s || 'none').toLowerCase()))]
    return uniqueStatuses.length > 1
  })

  const mixedTooltipRows = computed(() => {
    if (!props.statusDetails) return []
    const heading = props.productId ? [{ key: String($t('products.id')), value: props.productId }] : []
    const clients = props.selectedClients || []
    if (clients.length > 0 && clients.length === props.statusDetails.length) {
      return [
        ...heading,
        { key: `── ${String($t('clients.title'))} ──`, value: '' },
        ...clients.map((c, i) => {
          const status = (props.statusDetails![i] || 'none').toLowerCase()
          return {
            key: c,
            value: props.statusDetails![i] || 'none',
            badge: status === 'not_installed' || status === 'none' ? undefined : status,
            badgeColor: status === 'installed' ? 'success' : status === 'unknown' ? 'warning' : undefined,
          }
        }),
      ]
    }
    const counts: Record<string, number> = {}
    props.statusDetails.forEach((s) => {
      const key = s?.toLowerCase() || 'none'
      counts[key] = (counts[key] || 0) + 1
    })
    return [
      ...heading,
      { key: `── ${String($t('products.status'))} ──`, value: '' },
      ...Object.entries(counts).map(([k, v]) => ({
        key: k,
        value: String(v),
        badge: k === 'not_installed' || k === 'none' ? undefined : k,
        badgeColor: k === 'installed' ? 'success' : k === 'unknown' ? 'warning' : undefined,
      })),
    ]
  })
</script>
