
<template>
  <div :class="'webgui-theme-'+color">
    <BarBTop />
    Some default structure shared across all pages. Current theme: {{ settings.theme }}
    <el-row>
      <el-col :span="3">
        <BarBSide />
      </el-col>
      <el-col :span="21">
        <slot />
      </el-col>
    </el-row>
    after slot
  </div>
</template>

<script setup>
const settings = storeSettings()
const color = useColorMode();
</script>

<style>
</style>