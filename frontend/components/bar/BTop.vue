<template>
 <el-menu
    mode="horizontal"
  >
    <el-menu-item index="0">
      <!-- <img src="../../assets/images/opsi.png" alt="OPSI Logo"> -->
      <IconIOpsiLogo class="max-h-full h-full"/>
    </el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="1">
      <ButtonBTNLogout />
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
// const mq = useMQ()
</script>

<style scoped>
</style>
