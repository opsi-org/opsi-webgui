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
