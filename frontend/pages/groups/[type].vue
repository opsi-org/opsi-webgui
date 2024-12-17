<template>
  <TabsTGroupActions :type="type" />
</template>

<script setup lang="ts">
  const route = useRoute()
  const type = ref(route.params.type as string)
</script>
