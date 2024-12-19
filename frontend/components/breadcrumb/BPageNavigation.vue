<template>
  <el-breadcrumb class="breadcrumb mb-4" :separator-icon="ArrowRight">
    <el-breadcrumb-item
      v-for="(item, index) in pathSegments"
      :key="index"
      :to="{ path: '/' + pathSegments.slice(0, index + 1).join('/') }"
    >
      <span class="breadcrumb-item">{{ item }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
  import { ArrowRight } from '@element-plus/icons-vue'
  const route = useRoute()
  const pathSegments = computed(() =>
    route.path.split('/').filter((segment: string) => segment),
  )
</script>
<style scoped>
  .breadcrumb {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    color: #3f5aa6 !important;
    text-decoration: none;
  }

  .breadcrumb-item:hover {
    text-decoration: underline;
  }

  .separator-icon::before {
    content: '';
    display: inline-block;
    margin: 0 8px;
    width: 12px;
    height: 12px;
    background: url('path/to/your/arrowright-icon.svg') no-repeat center center;
    background-size: contain;
  }
</style>
