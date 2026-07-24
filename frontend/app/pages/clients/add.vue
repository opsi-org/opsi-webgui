<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
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
  useHead({ title: () => `${$t('clients.create.title')} - opsi-WebGUI` })

  function handleSaved() {
    setTimeout(() => navigateTo('/clients'), 1500)
  }
</script>
