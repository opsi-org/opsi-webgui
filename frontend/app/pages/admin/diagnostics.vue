<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TabsTServerHealth :id="id" />
</template>

<script setup lang="ts">
  import type { T_health } from '~/types/tproptypes'

  const id = computed(() => (useRoute().query.id as T_health) || undefined)
</script>
