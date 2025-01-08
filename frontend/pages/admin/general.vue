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
