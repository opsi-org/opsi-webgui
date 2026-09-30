<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  ClientAddPage - Route page for adding a new client.
-->
<template>
  <LayoutsPageLayout :show-refresh="false">
    <ClientsAddForm @saved="handleSaved" />
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'default' })

  const { t: $t } = useI18n()
  useHead({ title: () => `${$t('clients.create.title')} - OPSI-WebGUI` })

  function handleSaved() {
    setTimeout(() => navigateTo('/clients'), 1500)
  }
</script>
