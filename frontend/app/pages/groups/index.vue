<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  Groups Page - Route wrapper for GroupsMainView component.
-->
<template>
  <GroupsMainView />
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'default' })

  const { t: $t } = useI18n()
  useHead({ title: () => `${$t('groups.title')} - OPSI-WebGUI` })
</script>
