<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="routeNameSettings?.page0Condition"
    :page1-condition="routeNameSettings?.page1Condition"
    :width="routeNameSettings?.width || '100%'"
    classeachcol=""
  >
    <template #default>
      <ViewVProducts
        v-if="path[0] === 'products'"
        :product-type="productType"
        :is-child="false"
        :is-mobile="mq.isMobile.value"
        v-bind="route.query"
      />
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
  import { usePageHelper } from '~/composables/mixins/usePageHelper'

  const route = useRoute()
  const mq = useMQ()
  const { path, productSettings } = usePageHelper()
  const routeNameSettings = computed(() => {
    const s = productSettings[(route.name as string) || '']
    if (s === undefined)
      throw new Error('route name not found: ' + (route.name as string))
    return s
  })

  const productType = computed(() => {
    return route.params.producttype as string
  })
  const isMobile = computed(() => {
    return mq.isMobile.value
  })
</script>
