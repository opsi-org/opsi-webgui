<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsRowActionsDropdown - Per-row action dropdown for individual client operations.
-->
<template>
  <div class="flex items-center gap-1">
    <CoreAppTooltip v-if="showAllActions || defaultAction === 'config'" :text="String($t('config.title'))" :delay="{ open: 0 }">
      <CoreAppButton
        :icon="icons.config"
        variant="ghost"
        size="xs"
        class="h-7 w-7 p-1"
        :color="activeAction === 'config' ? 'primary' : 'neutral'"
        :class="activeAction === 'config' ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
        :aria-label="String($t('config.title'))"
        data-testid="client-row-action-config"
        @click="emit('open-config')"
      />
    </CoreAppTooltip>

    <CoreAppTooltip v-if="showAllActions || defaultAction === 'logs'" :text="String($t('logs.title'))" :delay="{ open: 0 }">
      <CoreAppButton
        :icon="icons.log"
        variant="ghost"
        size="xs"
        class="h-7 w-7 p-1"
        :color="activeAction === 'logs' ? 'primary' : 'neutral'"
        :class="activeAction === 'logs' ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
        :aria-label="String($t('logs.title'))"
        data-testid="client-row-action-logs"
        @click="emit('open-logs')"
      />
    </CoreAppTooltip>

    <CoreAppTooltip v-if="showAllActions || defaultAction === 'inventory'" :text="String($t('inventory.title'))" :delay="{ open: 0 }">
      <CoreAppButton
        :icon="icons.inventory"
        variant="ghost"
        size="xs"
        class="h-7 w-7 p-1"
        :color="activeAction === 'inventory' ? 'primary' : 'neutral'"
        :class="activeAction === 'inventory' ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
        :aria-label="String($t('inventory.title'))"
        data-testid="client-row-action-inventory"
        @click="emit('open-inventory')"
      />
    </CoreAppTooltip>

    <CoreAppTooltip v-if="showAllActions || defaultAction === 'clone'" :text="String($t('clients.clone.title'))" :delay="{ open: 0 }">
      <CoreAppButton
        :icon="icons.clone"
        variant="ghost"
        size="xs"
        class="h-7 w-7 p-1"
        :color="activeAction === 'clone' ? 'primary' : 'neutral'"
        :class="activeAction === 'clone' ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
        :aria-label="String($t('clients.clone.title'))"
        @click="emit('open-clone')"
        :disabled="isReadOnly || !canCreateClients"
        data-testid="client-row-action-clone"
      />
    </CoreAppTooltip>

    <ClientsQuickActionsDropdown class="ml-0.5" :client-ids="[clientId]" inline show-rename @action-complete="handleActionComplete" />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    clientId: string
    defaultAction?: 'config' | 'logs' | 'inventory' | 'clone'
    showAllActions?: boolean
    /** Which panel is currently open for this row (highlights the matching button). */
    activeAction?: 'config' | 'logs' | 'inventory' | 'clone' | null
  }>()

  const defaultAction = computed(() => props.defaultAction || 'config')
  const showAllActions = computed(() => props.showAllActions ?? false)

  const emit = defineEmits<{
    (e: 'open-config'): void
    (e: 'open-logs'): void
    (e: 'open-inventory'): void
    (e: 'open-clone'): void
    (e: 'action-complete', action: string, success: boolean): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { isReadOnly, canCreateClients } = useUserPermissions()

  function handleActionComplete(action: string, success: boolean) {
    emit('action-complete', action, success)
  }
</script>
