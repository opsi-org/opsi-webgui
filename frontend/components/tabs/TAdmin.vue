<template>
  <el-tabs lazy>
    <el-tab-pane :label="$t('form.general')">
      <FormFAdminGeneral />
    </el-tab-pane>
    <el-tab-pane :label="$t('label.maintenance')">
      <FormFAdminMaintenance />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const $t = useI18n().t
</script>
