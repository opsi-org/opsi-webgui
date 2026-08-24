<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientConfigurationPage - Route page for client host configuration tabs.
-->
<template>
  <div class="h-full min-h-0 flex flex-col">
    <HostsConfigTabs
      class="flex-1 min-h-0"
      :host-id="selectedClientId"
      host-type="client"
      :tab="activeTab"
      show-host-selector
      :host-selector-placeholder="String($t('clients.select'))"
      :readonly="isReadOnly"
      @update:host-id="updateSelectedClientId"
      @update:tab="updateActiveTab"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
  import { useSelectionStore } from '~/stores/selectionStore'

  definePageMeta({
    layout: 'default',
    key: (route) => {
      const id = route.params.id
      const normalizedId = Array.isArray(id) ? id[0] || '' : id || ''
      return `clients-configuration-${normalizedId}`
    },
  })

  const { isReadOnly } = useUserPermissions()
  const selectionStore = useSelectionStore()

  const VALID_TABS = ['parameters', 'attributes'] as const
  const TAB_ALIASES: Record<string, string> = { parameter: 'parameters', attribute: 'attributes' }

  const { t: $t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  const routeTab = computed((): string => {
    const t = route.params.tab
    const val = (Array.isArray(t) ? t[0] : (t as string)) || ''
    const normalized = TAB_ALIASES[val] || val
    return VALID_TABS.includes(normalized as (typeof VALID_TABS)[number]) ? normalized : 'parameters'
  })

  const routeClientId = computed((): string => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) || ''
  })

  const manualClientId = ref<string>('')
  const selectedClientId = computed(() => manualClientId.value || selectionStore.selectedClients.at(-1) || '')

  const activeTab = computed({
    get: () => routeTab.value,
    set(v: string) {
      updateActiveTab(v)
    },
  })

  function updateActiveTab(v: string) {
    const id = selectedClientId.value
    const path = id ? `/clients/configuration/${v}/${id}` : `/clients/configuration/${v}`
    if (route.fullPath !== path) router.replace(path)
  }

  function updateSelectedClientId(id: string | null) {
    manualClientId.value = id || ''
    if (id === routeClientId.value) return
    const tab = activeTab.value
    router.replace(id ? `/clients/configuration/${tab}/${id}` : `/clients/configuration/${tab}`)
  }

  function handleSaved() {}

  watch(
    routeClientId,
    (id) => {
      manualClientId.value = id
    },
    { immediate: true },
  )

  useHead({
    title: () => (selectedClientId.value ? `${selectedClientId.value} - ${activeTab.value}` : 'Client Configuration'),
  })
</script>
