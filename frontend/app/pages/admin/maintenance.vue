<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  Admin Maintenance Page - Route wrapper for AdminMaintenanceView component.
-->
<template>
  <div class="h-full min-h-0 flex flex-col">
    <AdminMaintenanceView class="flex-1 min-h-0" />
  </div>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'default' })

  const { t: $t } = useI18n()
  useHead({ title: () => `${$t('admin.maintenance')} - OPSI-WebGUI` })
</script>
