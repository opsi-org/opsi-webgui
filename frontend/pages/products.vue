<template>
  <LayoutLSplitView
    :is-mobile="true"
    :page0-condition="filteredPath.length >= 1"
    :page1-condition="filteredPath.length > 1"
    :width="width"
  >
    <template #default>
      <ViewVProducts />
    </template>
    <template #page1>
      <NuxtPage />
    </template>
  </LayoutLSplitView>
</template>

<script setup lang="ts">
const route = useRoute()
const width = computed(()=> {
  // const routeLength = filteredPath.value.length || 1
  // return (100/routeLength)  + '%'
  return '50%'
})
const filteredPath = computed(()=> {
  const path = route.params.id as Array<string>
  return path?.filter((p: string)=> ![''].includes(p)) || []
})
</script>
