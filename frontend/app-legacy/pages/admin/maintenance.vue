<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TabsTAdmin :type="type" />
</template>
<script setup lang="ts">
  const route = useRoute()
  const type = computed(() => {
    return route.path
      .split('/')
      .filter((p: string) => p !== '')
      .pop() as string
  })
</script>
