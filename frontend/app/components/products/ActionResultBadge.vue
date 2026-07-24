<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsActionResultBadge - Badge showing product action result status.
-->
<template>
  <div class="flex justify-center">
    <CoreAppTooltipTable v-if="isMixed" :rows="mixedTooltipRows">
      <CoreAppTooltip v-if="iconOnly" :text="String($t('common.mixed'))">
        <CoreAppStatusBadge status="warning" :icon="icons.unequal" size="xs" />
      </CoreAppTooltip>
      <CoreAppStatusBadge
        v-else
        status="warning"
        :icon="icons.unequal"
        :label="$t('common.mixed')"
      />
    </CoreAppTooltipTable>

    <template v-else-if="normalizedResult === 'successful'">
      <CoreAppTooltip v-if="iconOnly" :text="String($t('common.success'))">
        <CoreAppStatusBadge status="success" :icon="icons.checkCircle" size="xs" />
      </CoreAppTooltip>
      <CoreAppStatusBadge
        v-else
        status="success"
        :icon="icons.checkCircle"
        :label="$t('common.success')"
      />
    </template>

    <template v-else-if="normalizedResult === 'failed'">
      <CoreAppTooltip v-if="iconOnly" :text="String($t('common.failed'))">
        <CoreAppStatusBadge status="error" :icon="icons.xCircle" size="xs" />
      </CoreAppTooltip>
      <CoreAppStatusBadge
        v-else
        status="error"
        :icon="icons.xCircle"
        :label="$t('common.failed')"
      />
    </template>

    <span
      v-else-if="normalizedResult === 'none' || !normalizedResult"
      class="text-(--color-text-muted) text-xs"
      >-</span
    >

    <CoreAppTooltip v-else-if="iconOnly" :text="String(result)">
      <CoreAppStatusBadge status="info" :icon="icons.productActionResult" size="xs" />
    </CoreAppTooltip>

    <CoreAppStatusBadge v-else :label="result" />
  </div>
</template>

<script setup lang="ts">
  interface Props {
    result?: string
    resultDetails?: string[]
    selectedClients?: string[] | null
    iconOnly?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    iconOnly: false,
  })

  const iconOnly = computed(() => props.iconOnly)

  const icons = useIcons()
  const { t: $t } = useI18n()

  const normalizedResult = computed(() => props.result?.toLowerCase())

  const isMixed = computed(() => {
    if (normalizedResult.value === 'mixed') return true
    if (!props.resultDetails || props.resultDetails.length <= 1) return false
    const uniqueResults = [...new Set(props.resultDetails.map((r) => (r || 'none').toLowerCase()))]
    return uniqueResults.length > 1
  })

  const mixedTooltipRows = computed(() => {
    if (!props.resultDetails) return []
    const clients = props.selectedClients || []
    if (clients.length > 0 && clients.length === props.resultDetails.length) {
      return clients.map((c, i) => {
        const result = (props.resultDetails![i] || 'none').toLowerCase()
        return {
          key: c,
          value: props.resultDetails![i] || 'none',
          badge: result === 'none' ? undefined : result,
          badgeColor:
            result === 'successful' ? 'success' : result === 'failed' ? 'error' : undefined,
        }
      })
    }
    const counts: Record<string, number> = {}
    props.resultDetails.forEach((r) => {
      const key = r?.toLowerCase() || 'none'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts).map(([k, v]) => ({
      key: k,
      value: String(v),
      badge: k === 'none' ? undefined : k,
      badgeColor: k === 'successful' ? 'success' : k === 'failed' ? 'error' : undefined,
    }))
  })
</script>
