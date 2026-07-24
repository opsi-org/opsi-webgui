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
    <CoreAppButton
      :icon="icons.config"
      variant="ghost"
      size="xs"
      :color="activeAction === 'config' ? 'primary' : 'neutral'"
      :class="
        activeAction === 'config'
          ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!'
          : ''
      "
      :aria-label="String($t('config.title'))"
      :title="String($t('config.title'))"
      data-testid="client-row-action-config"
      @click="emit('open-config')"
    />

    <CoreAppButton
      :icon="icons.log"
      variant="ghost"
      size="xs"
      :color="activeAction === 'logs' ? 'primary' : 'neutral'"
      :class="
        activeAction === 'logs'
          ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!'
          : ''
      "
      :aria-label="String($t('logs.title'))"
      :title="String($t('logs.title'))"
      data-testid="client-row-action-logs"
      @click="emit('open-logs')"
    />

    <CoreAppButton
      :icon="icons.clone"
      variant="ghost"
      size="xs"
      :color="activeAction === 'clone' ? 'primary' : 'neutral'"
      :class="
        activeAction === 'clone'
          ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!'
          : ''
      "
      :aria-label="String($t('clients.clone.title'))"
      :title="String($t('clients.clone.title'))"
      @click="emit('open-clone')"
      :disabled="isReadOnly || !canCreateClients"
      data-testid="client-row-action-clone"
    />

    <ClientsQuickActionsDropdown
      class="ml-0.5"
      :client-ids="[clientId]"
      inline
      show-rename
      @action-complete="handleActionComplete"
    />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    clientId: string
    /** Which panel is currently open for this row (highlights the matching button). */
    activeAction?: 'config' | 'logs' | 'clone' | null
  }>()

  const emit = defineEmits<{
    (e: 'open-config'): void
    (e: 'open-logs'): void
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
