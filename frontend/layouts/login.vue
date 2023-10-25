
<template>
  <div class="common-layout">
    <el-container class="h-screen">
      <el-header>Header: A different structure for specific pages</el-header>
      <el-main>
        <TestTheme />
        <b-button variant="primary">bbutton hello</b-button>
        <el-button>elbutton with outline (default)</el-button>
        <el-button type="primary">elbutton with type</el-button>

        <h1 class="text-3xl font-bold underline">
          Hello world! with tailwind
        </h1>
        <h1 class="">
          Hello world! withoout tailwind
        </h1>
        <slot />
      </el-main>
      <!-- <el-main class="justify-center"> <slot /> </el-main> -->
      <BarElBAuthFooter v-once class="footer_content" />
    </el-container>
  <!-- <BarBAuthFooter v-once class="footer_content" /> -->
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
</style>