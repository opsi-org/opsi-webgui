<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  QuickpanelSelectionOverview - Overview of current server, client and product selections.
-->
<template>
  <div class="flex flex-col h-full min-h-0">
    <div v-if="!hasAny" class="text-xs text-(--color-text-muted) py-8 text-center">
      {{ $t('common.noSelection') }}
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-1 shrink-0">
        <span class="text-xs text-(--color-text-muted)">{{ totalCount }} {{ $t('common.total') }}</span>
        <CoreAppButton
          :icon="icons.xCircle"
          size="xs"
          variant="ghost"
          color="neutral"
          :aria-label="$t('common.clearAll')"
          :title="$t('common.clearAll')"
          @click="clearAll"
        />
      </div>

      <div class="flex-1 overflow-y-auto min-h-0 space-y-1">
        <div v-if="selectionStore.selectedServers.length > 0">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5 text-xs font-medium">
              <CoreAppIcon :name="icons.server" class="w-3.5 h-3.5" />
              <h2 class="text-xs">{{ $t('servers.title') }}</h2>
              <span class="text-xs text-(--color-text-muted)">({{ selectionStore.selectedServers.length }})</span>
            </div>
            <CoreAppButton
              :icon="icons.xCircle"
              size="xs"
              variant="ghost"
              color="neutral"
              :aria-label="$t('common.clearAll')"
              :title="$t('common.clearAll')"
              @click="clearServers"
            />
          </div>
          <div class="max-h-30 overflow-y-auto">
            <div
              v-for="server in selectionStore.selectedServers"
              :key="server"
              class="flex items-center justify-between px-2.5 py-0.5 rounded text-xs group hover:bg-(--color-surface-hover) transition-colors"
            >
              <span class="truncate">{{ server }}</span>
              <CoreAppButton
                :icon="icons.xCircle"
                size="xs"
                variant="ghost"
                color="neutral"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                :aria-label="$t('common.remove')"
                @click="removeServer(server)"
              />
            </div>
          </div>
        </div>

        <div v-if="selectionStore.selectedClients.length > 0">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5 text-xs font-medium">
              <CoreAppIcon :name="icons.client" class="w-3.5 h-3.5" />
              <h2 class="text-xs">{{ $t('clients.title') }}</h2>
              <span class="text-xs text-(--color-text-muted)">({{ selectionStore.selectedClients.length }})</span>
            </div>
            <CoreAppButton
              :icon="icons.xCircle"
              size="xs"
              variant="ghost"
              color="neutral"
              :aria-label="$t('common.clearAll')"
              :title="$t('common.clearAll')"
              @click="clearClients"
            />
          </div>
          <div class="max-h-36 overflow-y-auto">
            <div
              v-for="client in selectionStore.selectedClients"
              :key="client"
              class="flex items-center justify-between px-2.5 py-0.5 rounded text-xs group hover:bg-(--color-surface-hover) transition-colors"
            >
              <span class="truncate">{{ client }}</span>
              <CoreAppButton
                :icon="icons.xCircle"
                size="xs"
                variant="ghost"
                color="neutral"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                :aria-label="$t('common.remove')"
                @click="selectionStore.toggleClient(client, 'quickpanel')"
              />
            </div>
          </div>
        </div>

        <div v-if="selectionStore.selectedProducts.length > 0">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5 text-xs font-medium">
              <CoreAppIcon :name="icons.product" class="w-3.5 h-3.5" />
              <h2 class="text-xs">{{ $t('products.title') }}</h2>
              <span class="text-xs text-(--color-text-muted)">({{ selectionStore.selectedProducts.length }})</span>
            </div>
            <CoreAppButton
              :icon="icons.xCircle"
              size="xs"
              variant="ghost"
              color="neutral"
              :aria-label="$t('common.clearAll')"
              :title="$t('common.clearAll')"
              @click="clearProducts"
            />
          </div>
          <div class="max-h-36 overflow-y-auto">
            <div
              v-for="product in selectionStore.selectedProducts"
              :key="product"
              class="flex items-center justify-between px-2.5 py-0.5 rounded text-xs group hover:bg-(--color-surface-hover) transition-colors"
            >
              <span class="truncate">{{ product }}</span>
              <CoreAppButton
                :icon="icons.xCircle"
                size="xs"
                variant="ghost"
                color="neutral"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                :aria-label="$t('common.remove')"
                @click="selectionStore.toggleProduct(product, 'quickpanel')"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useSelectionStore } from '~/stores/selectionStore'

  const icons = useIcons()
  const { t: i18nT } = useI18n()
  const selectionStore = useSelectionStore()

  const $t = (key: string) => {
    const translated = i18nT(key)
    if (translated && translated !== key) return String(translated)
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  }

  const hasAny = computed(() => selectionStore.hasAnySelection)

  const totalCount = computed(
    () => selectionStore.selectedServers.length + selectionStore.selectedClients.length + selectionStore.selectedProducts.length,
  )

  function clearServers() {
    if (selectionStore.configServer) {
      selectionStore.setServers([selectionStore.configServer])
    } else {
      selectionStore.clearServers()
    }
  }

  function removeServer(serverId: string) {
    if (selectionStore.selectedServers.length === 1 && selectionStore.configServer) return
    selectionStore.toggleServer(serverId, 'quickpanel')
  }

  function clearClients() {
    selectionStore.clearClients()
    selectionStore.clearClientGroups()
  }

  function clearProducts() {
    selectionStore.clearProducts()
    selectionStore.clearProductGroups()
  }

  function clearAll() {
    selectionStore.clearAll()
    if (selectionStore.configServer) {
      selectionStore.setServers([selectionStore.configServer])
    }
  }
</script>
