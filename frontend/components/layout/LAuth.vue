<template>
  <el-container class="h-screen"
  >
  <!-- :class="'webgui-theme-'+settings.colortheme" -->
    <el-header/> <!-- do not remove header -->
    <el-main>
      <slot />
    </el-main>
    <BarBAuthFooter v-once/>
  </el-container>
</template>

<script setup lang="ts">
const settings = storeSettings()
onMounted(()=>{
  settings.initColormode()
})
</script>