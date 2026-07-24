<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  AdminHealthCheck - Health check results with expandable tree view and status indicators.
-->
<template>
  <CoreAppCard fill scrollable>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-heading uppercase tracking-wide m-0">{{ $t('diag.health') }}</h2>
        <span class="text-xs text-(--color-text-muted)"
          >{{ filteredHealthData.length }} {{ $t('diag.checks') }}</span
        >
      </div>
    </template>
    <div v-if="loading" class="py-8">
      <CoreAppLoadingSpinner />
    </div>
    <div v-else class="space-y-1">
      <div v-for="item in filteredHealthData" :key="item.key" class="rounded-lg overflow-hidden">
        <div
          class="flex items-start gap-2 p-2 cursor-pointer transition-colors hover:bg-(--color-surface-hover) rounded-md"
          role="button"
          tabindex="0"
          @click="$emit('toggleExpand', item.key)"
          @keydown.enter="$emit('toggleExpand', item.key)"
          @keydown.space.prevent="$emit('toggleExpand', item.key)"
        >
          <CoreAppIcon
            v-if="item.children && item.children.length > 0"
            :name="expanded[item.key] ? icons.chevronDown : icons.chevronRight"
            class="w-3.5 h-3.5 mt-0.5 shrink-0 text-(--color-text-muted)"
          />
          <div v-else class="w-4" />
          <CoreAppStatusBadge
            :status="getStatusType(item.status)"
            :label="item.status"
            class="shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm leading-4" :title="item.description">{{ item.name }}</div>
            <div v-if="item.message" class="text-(--color-text-muted) break-all">
              {{ item.message }}
            </div>
          </div>
        </div>
        <div
          v-if="item.children && item.children.length > 0 && expanded[item.key]"
          class="border-l border-(--color-border)"
        >
          <div
            v-for="child in item.children"
            :key="child.key"
            class="flex items-start gap-2 py-1.5 px-2 pl-8 hover:bg-(--color-surface-hover) transition-colors rounded-md"
          >
            <CoreAppStatusBadge
              :status="getStatusType(child.status)"
              :label="child.status"
              class="shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm">{{ child.name }}</div>
              <div v-if="child.message" class="text-(--color-text-muted) break-all">
                {{ child.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="filteredHealthData.length === 0"
        class="text-center py-8 text-(--color-text-muted)"
      >
        {{ $t('common.noResults') }}
      </div>
    </div>
  </CoreAppCard>
</template>

<script setup lang="ts">
  const { t: $t } = useI18n()
  defineProps([
    'filteredHealthData',
    'loading',
    'stats',
    'statusFilter',
    'icons',
    'expanded',
    'getStatusType',
  ])
  defineEmits(['toggleExpand', 'filterByStatus', 'clearStatusFilter'])
</script>
