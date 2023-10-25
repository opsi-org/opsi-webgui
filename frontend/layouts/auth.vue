
<template>
  <el-container class="h-screen" :class="'webgui-theme-'+settings.theme">
    <el-header/> <!-- do not remove header -->
    <el-main>
      <slot />
    </el-main>
    <BarBAuthFooter v-once/>
  </el-container>
  <!-- <div class="common-layout">
  </div> -->
</template>

<script setup lang="ts">
const settings = useSettingsStore()
</script>

<style scoped>
</style>