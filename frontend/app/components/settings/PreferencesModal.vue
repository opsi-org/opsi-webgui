<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0
-->
<template>
  <CoreAppModal
    v-model:open="open"
    :title="$t('common.settings')"
    :close="{ 'aria-label': $t('common.close'), 'data-testid': 'settings-close' }"
    :content="{ onCloseAutoFocus: restoreFocus }"
    :ui="{ content: 'w-[calc(100vw-2rem)] max-w-md max-h-[85dvh]', body: 'overflow-y-auto' }"
  >
    <template #body>
      <div class="space-y-5" data-testid="settings-dialog">
        <CoreAppFormField :label="$t('settings.language')" name="language">
          <SettingsLanguageDropdown field />
        </CoreAppFormField>
        <CoreAppFormField :label="$t('settings.appearance')" name="appearance">
          <SettingsThemeToggle field />
        </CoreAppFormField>
        <CoreAppFormField :label="$t('nav.defaultPage')" name="default-page">
          <CoreAppSelectMenu
            :model-value="defaultPage"
            :items="defaultPageOptions"
            :aria-label="$t('nav.defaultPage')"
            :search-input="false"
            data-testid="default-page-select"
            @update:model-value="setDefaultPage"
          />
        </CoreAppFormField>
        <CoreAppCheckbox
          v-model="autoRefreshEnabled"
          :label="$t('settings.autoRefresh')"
          :description="$t('settings.autoRefreshTooltip')"
          data-testid="auto-refresh-checkbox"
        />
      </div>
    </template>
  </CoreAppModal>
</template>

<script setup lang="ts">
  import { useMessageBusStore } from '~/stores/messageBusStore'
  import { getDefaultPageFromCookie } from '~/utils/navigation'

  const open = defineModel<boolean>('open', { default: false })
  const props = defineProps<{ returnFocus?: HTMLElement }>()
  const emit = defineEmits<{ 'default-page-changed': [page: string] }>()
  const { t: $t } = useI18n()
  const messageBusStore = useMessageBusStore()
  const defaultPage = ref('/clients')
  const defaultPageOptions = computed(() => [
    { value: '/dashboard', label: $t('dashboard.title') },
    { value: '/servers', label: $t('servers.title') },
    { value: '/clients', label: $t('clients.title') },
    { value: '/products', label: $t('products.title') },
    { value: '/admin/terminal', label: `${$t('nav.admin')} - ${$t('terminal.title')}` },
    { value: '/admin/diagnostics', label: `${$t('nav.admin')} - ${$t('diag.title')}` },
    { value: '/admin/maintenance', label: `${$t('nav.admin')} - ${$t('admin.maintenance')}` },
  ])
  const autoRefreshEnabled = computed({
    get: () => messageBusStore.autoRefresh,
    set: (value: boolean) => messageBusStore.setAutoRefresh(value),
  })

  watch(open, (value) => {
    if (value) defaultPage.value = getDefaultPageFromCookie()
  })

  function setDefaultPage(value: string) {
    defaultPage.value = value
    document.cookie = `opsi-webgui-default-page=${value}; path=/; max-age=31536000; SameSite=Lax`
    emit('default-page-changed', value)
  }

  function restoreFocus(event: Event) {
    if (props.returnFocus?.isConnected) {
      event.preventDefault()
      props.returnFocus.focus()
    }
  }
</script>
