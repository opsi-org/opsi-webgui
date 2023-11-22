
<template>
  <div :class="'webgui-theme-'+color" >
    <el-container class="h-screen w-screen">
      <el-header class="min-w-screen max-h-10 p-0"><BarBTop class="max-h-full max-w-full"/></el-header>

      <el-container class=" h-screen max-h-screen overflow-hidden">
        <el-aside width="150px">
        <!-- <el-aside width="150px" class="resize-x"> -->
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
        <!-- <el-aside width="150px" class="resize-x" ><BarBQuickPanel /></el-aside> -->
      </el-container>
    </el-container>
  </div>


  <!-- <div :class="'webgui-theme-'+color">

    Some default structure shared across all pages. Current theme: {{ settings.theme }}
    <el-row>
      <el-col :span="3">
        <BarBSide />
      </el-col>
      <el-col :span="17">
        <slot />
      </el-col>
      <el-col :span="4">
        <BarBQuickPanel />
      </el-col>
    </el-row>
    after slot
  </div> -->
</template>

<script setup>
const settings = storeSettings()
const color = useColorMode();
</script>

<style scoped>
.direction-rtl {
  direction: rtl;
}

.el-header {
  position: relative;
  /* background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary); */
}
.el-aside {
  min-height: 100%;
  height: 100%;
  max-height: 100%;
}
.el-main {
  padding: 0;
}
.toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>