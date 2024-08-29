<template>
  <el-breadcrumb class="mb-2">
    <el-breadcrumb-item v-for="(item, index) in pathSegments" :key="index" :to="{ path: '/' + pathSegments.slice(0, index + 1).join('/') }">
      {{ item }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
  const route = useRoute()
  const pathSegments = computed(() => route.path.split('/').filter((segment: string) => segment))
</script>
