<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  QuickpanelMainView - Quick selection panel for servers and groups.
-->
<template>
  <div class="flex flex-col h-full min-h-0">
    <div class="shrink-0 mb-1.5" data-testid="quickpanel-selection-section">
      <div class="font-heading text-xs tracking-wide text-(--color-text-muted) mb-0.5">
        {{ $t('quick.selection') }}
      </div>
      <CoreAppTabsNav v-model="activeTab" :tabs="selectionTabItems" hide-labels />
    </div>
    <div class="flex-1 min-h-0 overflow-hidden" data-testid="quickpanel-tab-content">
      <div v-show="activeTab === 'overview'" class="h-full overflow-y-auto" data-testid="quickpanel-tab-overview">
        <QuickpanelSelectionOverview />
      </div>

      <div v-show="activeTab === 'servers'" class="h-full overflow-y-auto" data-testid="quickpanel-tab-servers">
        <QuickpanelServerSelectionList :active="activeTab === 'servers'" />
      </div>

      <div v-show="activeTab === 'clients'" class="h-full overflow-y-auto" data-testid="quickpanel-tab-clients">
        <QuickpanelGroupSelectionTree group-type="client" :active="activeTab === 'clients'" />
      </div>

      <div v-show="activeTab === 'products'" class="h-full overflow-y-auto" data-testid="quickpanel-tab-products">
        <QuickpanelGroupSelectionTree group-type="product" :active="activeTab === 'products'" />
      </div>
    </div>

    <div class="mt-auto shrink-0 border-t border-(--color-border) pt-1.5 space-y-2.5">
      <div data-testid="quickpanel-quick-actions-section">
        <div class="font-heading text-xs tracking-wide text-(--color-text-muted) mb-0.5">
          {{ $t('quick.actions') }}
        </div>
        <div class="flex items-center gap-1.5 flex-nowrap">
          <div data-testid="quickpanel-client-actions">
            <ClientsQuickActionsDropdown :client-ids="selectionStore.selectedClients" compact />
          </div>
          <div data-testid="quickpanel-product-actions">
            <ProductsQuickActionsDropdown :products="[]" compact @applied="() => {}" />
          </div>
        </div>
      </div>

      <div class="border-t border-(--color-border) pt-1.5" data-testid="quickpanel-settings-section">
        <div class="font-heading text-xs tracking-wide text-(--color-text-muted) mb-0.5">
          {{ $t('common.settings') }}
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-1.5 py-1 rounded hover:bg-(--color-surface-hover) transition-colors">
            <CoreAppTooltip
              :text="
                (messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected')) + ' - ' + $t('settings.autoRefreshTooltip')
              "
            >
              <div class="flex items-center gap-5 cursor-help pl-0.5">
                <CoreAppMessageBusStatusIcon :connected="messageBusStore.isConnected" class="pl-1.5" />
                <div class="flex flex-col">
                  <span class="text-xs">{{ $t('settings.autoRefresh') }}</span>
                  <span
                    class="text-xs font-medium"
                    :class="messageBusStore.isConnected ? 'text-(--color-success-soft-text)' : 'text-(--color-error-soft-text)'"
                  >
                    {{ messageBusStore.isConnected ? $t('bus.connected') : $t('bus.disconnected') }}
                  </span>
                </div>
              </div>
            </CoreAppTooltip>
            <CoreAppCheckbox v-model="autoRefreshEnabled" :aria-label="$t('settings.autoRefresh')" />
          </div>
          <div class="flex items-center gap-1.5 flex-nowrap">
            <CoreAppSelect
              v-model="defaultPage"
              :items="defaultPageOptions"
              size="xs"
              :aria-label="$t('nav.defaultPage')"
              :title="defaultPageTooltip"
              class="flex-1 w-full"
            />
            <SettingsThemeToggle />
            <SettingsLanguageDropdown direction="up" />
          </div>
        </div>
      </div>

      <div class="border-t border-(--color-border) pt-1.5" data-testid="quickpanel-footer-section">
        <div
          v-if="userStore.readOnly"
          class="mb-2 px-2 py-1.5 rounded bg-(--color-warning-soft-bg) text-(--color-warning-soft-text) text-xs flex items-center gap-1.5 ring-1 ring-inset ring-(--color-warning-soft-ring)"
        >
          <CoreAppIcon :name="icons.warning" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ $t('auth.readOnly') }}</span>
        </div>
        <div class="flex items-center justify-between mb-1.5">
          <p class="text-xs text-(--color-text-muted)">
            {{ $t('users.current') }}: <span class="font-medium">{{ userStore.username }}</span>
          </p>
          <div
            v-if="remainingSeconds > 0"
            data-testid="session-timer"
            class="flex items-center gap-1 text-xs"
            :class="isWarning ? 'text-(--color-warning-soft-text)' : 'text-(--color-text-muted)'"
          >
            <CoreAppIcon :name="icons.clock" class="w-4 h-4" />
            <span>{{ formattedTimeText }}</span>
          </div>
        </div>
        <CoreAppButton
          color="primary"
          variant="outline"
          size="sm"
          class="w-full"
          :loading="loggingOut"
          :disabled="loggingOut"
          @click="handleLogout"
        >
          <CoreAppIcon v-if="!loggingOut" :name="icons.logout" class="w-4 h-4 mr-1" />
          {{ loggingOut ? $t('auth.loggingOut') : $t('auth.logout') }}
        </CoreAppButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useUserStore } from '~/stores/userStore'
  import { useSelectionStore } from '~/stores/selectionStore'
  import { useMessageBusStore } from '~/stores/messageBusStore'
  import { useSessionTimer } from '~/composables/useSessionTimer'

  const icons = useIcons()
  const userStore = useUserStore()
  const selectionStore = useSelectionStore()
  const messageBusStore = useMessageBusStore()
  const { callLogout } = useApiHelpers()

  type TabId = 'overview' | 'servers' | 'clients' | 'products'

  const activeTab = ref<TabId>('overview')

  const selectionTabs = computed(() => [
    {
      id: 'overview' as TabId,
      label: 'overview',
      icon: icons.list,
      count: totalSelectionCount.value,
    },
    {
      id: 'servers' as TabId,
      label: 'servers',
      icon: icons.server,
      count: selectionStore.selectedServers.length,
    },
    {
      id: 'clients' as TabId,
      label: 'clients',
      icon: icons.client,
      count: selectionStore.selectedClients.length,
    },
    {
      id: 'products' as TabId,
      label: 'products',
      icon: icons.product,
      count: selectionStore.selectedProducts.length,
    },
  ])

  const selectionTabItems = computed(() =>
    selectionTabs.value.map((tab) => ({
      label: $t(tab.label),
      value: tab.id,
      icon: tab.icon,
      tooltip: `${$t(tab.label)}${tab.count > 0 ? ` (${tab.count})` : ''}`,
      count: tab.count,
    })),
  )

  const totalSelectionCount = computed(
    () => selectionStore.selectedServers.length + selectionStore.selectedClients.length + selectionStore.selectedProducts.length,
  )

  const autoRefreshEnabled = computed({
    get: () => messageBusStore.autoRefresh,
    set: (val: boolean) => messageBusStore.setAutoRefresh(val),
  })

  const { remainingSeconds, isWarning, formattedTimeText } = useSessionTimer(true)
  const { t: i18nT } = useI18n()
  const loggingOut = ref(false)

  const DEFAULT_PAGE_KEY = 'opsi-webgui-default-page'
  const defaultPageOptions = computed(() => [
    { value: '/dashboard', label: $t('dashboard.title') },
    { value: '/servers', label: $t('servers.title') },
    { value: '/clients', label: $t('clients.title') },
    { value: '/products', label: $t('products.title') },
    { value: '/admin/terminal', label: $t('terminal.title') },
    { value: '/admin/diagnostics', label: $t('diag.title') },
    { value: '/admin/maintenance', label: $t('admin.maintenance') },
  ])

  const defaultPage = ref('/clients')

  const defaultPageTooltip = computed(() => {
    const page = defaultPageOptions.value.find((o) => o.value === defaultPage.value)
    if (!page) return $t('nav.defaultPage')
    if (defaultPage.value.startsWith('/admin/')) {
      return `${$t('nav.defaultPage')}: ${$t('admin.title')} - ${page.label}`
    }
    return `${$t('nav.defaultPage')}: ${page.label}`
  })

  onMounted(() => {
    const stored = getCookie(DEFAULT_PAGE_KEY)
    if (stored && defaultPageOptions.value.some((o) => o.value === stored)) {
      defaultPage.value = stored
    }
  })

  watch(defaultPage, (val) => {
    document.cookie = `${DEFAULT_PAGE_KEY}=${val}; path=/; max-age=31536000; SameSite=Lax`
  })

  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
    return match?.[1] ? decodeURIComponent(match[1]) : null
  }

  const $t = (key: string) => {
    const translated = i18nT(key)
    if (translated && translated !== key) return String(translated)
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  }

  async function handleLogout() {
    loggingOut.value = true
    const currentPath = useRoute().fullPath
    try {
      await callLogout()
    } catch {}
    userStore.logout()
    await navigateTo({ path: '/login', query: { redirect: currentPath } })
    loggingOut.value = false
  }
</script>
