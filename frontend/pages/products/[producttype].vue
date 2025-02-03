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
    <!-- <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="path[2] === 'config'"
    :page1-condition="false"
    :width="width"
    :classeachcol="isMobile ? 'm-0 p-0': 'm-1 h-full'"
  >
  <template #default>
      <NuxtPage />
    </template>
    <template #page1>
    </template>
  </LayoutLSplitView> -->
  </div>
</template>
<script setup lang="ts">
  const route = useRoute()
  const path = computed(() =>
    route.path.split('/').filter((p: string) => p !== ''),
  )

  // const width = computed(()=> {
  //   return '50%'
  // })

  // const isMobile = computed(()=> {
  //   return useMQ().isMobile.value
  // })
</script>
