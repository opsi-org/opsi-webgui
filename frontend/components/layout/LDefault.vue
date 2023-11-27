<template>
  <div :class="'webgui-theme-'+color" >
    <el-container class="h-screen w-screen">
      <el-header class="min-w-screen max-h-10 p-0"><BarBTop class="max-h-full max-w-full"/></el-header>

      <el-container class="h-screen max-h-screen overflow-hidden">
        <el-aside class="max-w-fit">
          <el-scrollbar>
            <BarBSide/>
          </el-scrollbar>
        </el-aside>

        <el-main>
          <el-scrollbar>
            <slot />
          </el-scrollbar>
        </el-main>

        <el-aside width="200px"><BarBQuickPanel /></el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
const color = useColorMode();
</script>


<style scoped>
.el-header {
  position: relative;
}
.el-aside {
  min-height: 100%;
  height: 100%;
  max-height: 100%;
}
.el-main {
  padding: 0;
}
</style>