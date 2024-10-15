<template>
  <LayoutLSplitView
    :is-mobile="isMobile"
    :page0-condition="routeNameSettings?.page0Condition"
    :page1-condition="routeNameSettings?.page1Condition"
    :width="routeNameSettings?.width"
    classeachcol=""
    >
    <!-- :classeachcol="isMobile ? 'm-1': 'm-1 h-full'" -->
    <template #default>
      <ViewVProducts
        v-if="path[0] === 'products'"
        :product-type="(route.params.producttype as string)"
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
import { usePageHelper } from '~/composables/mixins/usePageHelper';

const route = useRoute()
const mq = useMQ()
const {path, productSettings } = usePageHelper()
const routeNameSettings =  computed(()=> {
  const s = productSettings[route.name as string || '']
  if (s === undefined )
    throw new Error('route name not found: ' + (route.name as string))
  return s
})

const isMobile = computed(()=> {
  return mq.isMobile.value
})
</script>
