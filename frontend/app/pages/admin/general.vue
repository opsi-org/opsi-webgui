<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div class="space-y-4">
    <h1 class="text-xl md:text-2xl font-bold text-[var(--color-text)]">{{ $t('system') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <span class="font-medium">{{ $t('serverInformation') || 'Server Information' }}</span>
        </template>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('hostname') || 'Hostname' }}</span>
            <span class="font-medium">configserver.domain.local</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('version') }}</span>
            <span class="font-medium">4.3.0.1</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('uptime') || 'Uptime' }}</span>
            <span class="font-medium">14d 6h 32m</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('pythonVersion') || 'Python' }}</span>
            <span class="font-medium">3.11.6</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <span class="font-medium">{{ $t('statistics') || 'Statistics' }}</span>
        </template>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('clientsTotal') || 'Clients' }}</span>
            <span class="font-medium">42</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('depots') }}</span>
            <span class="font-medium">3</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('products') }}</span>
            <span class="font-medium">156</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-muted)]">{{ $t('groups') }}</span>
            <span class="font-medium">12</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <span class="font-medium">{{ $t('maintenance') }}</span>
        </template>
        <div class="space-y-3">
          <UButton block variant="outline" color="neutral" :icon="icons.refresh">
            {{ $t('reloadConfig') || 'Reload Config' }}
          </UButton>
          <UButton block variant="outline" :icon="icons.delete" color="error">
            {{ $t('clearCache') || 'Clear Cache' }}
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <span class="font-medium">{{ $t('backup') }}</span>
        </template>
        <div class="space-y-3">
          <div class="text-sm text-[var(--color-text-muted)]">
            {{ $t('lastBackup') || 'Last Backup' }}: 2025-02-24 03:00
          </div>
          <UButton block color="primary" :icon="icons.copy">
            {{ $t('createBackup') }}
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { $t } = useNuxtApp()
</script>
