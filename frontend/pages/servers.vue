<template>
  <LayoutLSplitView
    :is-mobile="true"
    :page0-condition="(!(route.params.id?.length == 1 && route.params.id[0] == 'config'))"
    :page1-condition="route.params.id?.length > 0"
    :width="width"
  >
    <template #default>
      <ViewVServer />
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
const route = useRoute()
const width = computed(()=> {
  const routeLength = route.params.id?.length || 1
  return (100/routeLength)  + '%'
})
</script>