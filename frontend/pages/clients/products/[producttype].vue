<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <LayoutLSplitView
      :is-mobile="isMobile"
      :page0-condition="path[1] === 'products'"
      :page1-condition="path[3] === 'config'"
      :width="width"
      classeachcol="m-0 p-0"
    >
      <template #default>
        <el-button
          class="float-right"
          @click="
            () => {
              splitviewVisibilityClienttable = true
              router.push('/clients/')
            }
          "
        >
          <IconIIcon :icon="icons.x" />
        </el-button>
        <ViewVProducts
          v-if="path[1] === 'products'"
          :product-type="path[2]"
          :is-child="true"
          v-bind="route.query"
        />
      </template>
      <template #page1>
        <NuxtPage />
      </template>
    </LayoutLSplitView>
  </div>
</template>
<script setup lang="ts">
  const route = useRoute()
  const router = useRouter()
  const icons = useIcons()

  const { splitviewVisibilityClienttable } = storeToRefs(storeInternalSettings())

  const path = computed(() => route.path.split('/').filter((p: string) => p !== ''))

  const width = computed(() => {
    // const routeLength = filteredPath.value.length || 1
    // return (100/routeLength)  + '%'
    return '50%'
  })

  const isMobile = computed(() => {
    return useMQ().isMobile.value
  })
</script>
