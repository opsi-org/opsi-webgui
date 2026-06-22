<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  Admin Terminal Page - Route wrapper for AdminTerminalView component.
-->
<template>
  <AdminTerminalView />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
useHead({ title: () => `${$t('terminal.title')} - opsi-WebGUI` })
</script>
