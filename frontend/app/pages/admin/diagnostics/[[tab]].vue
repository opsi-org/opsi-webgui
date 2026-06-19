<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  Admin Diagnostics Page - Route wrapper for AdminDiagnosticsView component.
-->
<template>
    <AdminDiagnosticsView :initial-tab="String(route.params.tab || 'healthcheck')" @update:tab="handleTabChange" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

useHead({ title: () => `${t('diagnostics')} - opsi-WebGUI` })

function handleTabChange(tab: string) {
    router.push(`/admin/diagnostics/${tab}`)
}

onMounted(() => {
    if (!route.params.tab) {
        router.replace('/admin/diagnostics/healthcheck')
    }
})
</script>
