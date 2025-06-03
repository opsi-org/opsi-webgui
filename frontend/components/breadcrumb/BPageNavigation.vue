<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-breadcrumb
    id="globalBreadcrumb"
    data-testid="page-nav-breadcrumb"
    class="breadcrumb mb-4"
    :separator-icon="ArrowRight"
  >
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
  const pathSegments = computed(() => route.path.split('/').filter((segment: string) => segment))
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
