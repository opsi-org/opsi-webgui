<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  Admin Diagnostics Page - Route wrapper for AdminDiagnosticsView component.
-->
<template>
  <AdminDiagnosticsView
    :initial-tab="String(route.params.tab || 'healthcheck')"
    :initial-status="String(route.query.status || '')"
    @update:tab="handleTabChange"
  />
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'default' })

  const { t: $t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  useHead({ title: () => `${$t('diag.title')} - OPSI-WebGUI` })

  function handleTabChange(tab: string, status?: string) {
    const query = status ? { status } : {}
    router.push({ path: `/admin/diagnostics/${tab}`, query })
  }

  onMounted(() => {
    if (!route.params.tab) {
      router.replace('/admin/diagnostics/healthcheck')
    }
  })
</script>
