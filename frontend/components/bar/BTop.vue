<template>
 <el-menu
    class="el-menu-demo"
    mode="horizontal"
  >
    <el-menu-item index="0">
      <img src="../../assets/images/opsi.png" alt="OPSI Logo">
    </el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="1">
      <el-checkbox-button>
        Open Quick Panel
      </el-checkbox-button>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
const mq = useMQ()
</script>

<style scoped>

</style>
