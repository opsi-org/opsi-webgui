
<template>
  <div class="common-layout">
    <el-container>
      <el-header>Header: A different structure for specific pages</el-header>
      <el-main class="maxheight"> <slot /> </el-main>
      <!-- <el-main class="justify-center"> <slot /> </el-main> -->
      <BarElBAuthFooter v-once class="footer_content" />
    </el-container>
  <!-- <BarBAuthFooter v-once class="footer_content" /> -->
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.maxheight {
  height: calc(100vh - 250px);
  /* min-height: 700px;
  height: 100%; */
}
</style>