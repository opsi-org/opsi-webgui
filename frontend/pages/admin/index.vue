<template>
  <TabsTAdmin :type="pagetype" />
</template>
<script setup lang="ts">
  const route = useRoute()
  // const router = useRouter()
  // // const id = computed<string>(()=>route.params.id as string)
  const pagetype = computed<string>(() => route.params.pagetype as string)
</script>
