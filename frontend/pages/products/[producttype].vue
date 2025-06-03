<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <NuxtPage v-if="path[2] === 'config'" />
  </div>
</template>
<script setup lang="ts">
  const route = useRoute()
  const path = computed(() => route.path.split('/').filter((p: string) => p !== ''))
</script>
