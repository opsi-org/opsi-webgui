<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientLogsPage - Route page for viewing client logs with optional client ID.
-->
<template>
  <div class="h-full">
    <ClientsLogsView
      :client-id="selectedClientId"
      show-client-selector
      :client-selector-placeholder="String($t('clients.select'))"
      @update:client-id="updateClientId"
    />
  </div>
</template>

<script setup lang="ts">
  import { useSelectionStore } from '~/stores/selectionStore'

  definePageMeta({ layout: 'default' })

  const { t: $t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const selectionStore = useSelectionStore()

  useHead({ title: () => `${$t('logs.title')} - OPSI-WebGUI` })

  const routeClientId = computed<string>(() => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) || ''
  })

  const manualClientId = ref<string>(routeClientId.value)

  const selectedClientId = computed<string | null>(
    () => routeClientId.value || manualClientId.value || selectionStore.selectedClients.at(-1) || null,
  )

  watch(routeClientId, (id) => {
    if (id !== manualClientId.value) manualClientId.value = id
  })

  function updateClientId(id: string | null) {
    manualClientId.value = id || ''
    const target = id ? `/clients/logs/${id}` : '/clients/logs'
    if (route.path !== target) {
      router.replace({
        path: target,
        query: route.query,
      })
    }
  }
</script>
