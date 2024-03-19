<template>
  <el-tabs lazy>
    <el-tab-pane :label="$t('form.general')">
      <FormFAdminGeneral :adminTasks="adminTasks.general" />
    </el-tab-pane>
    <el-tab-pane :label="$t('label.maintenance')">
      <FormFAdminMaintenance />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const adminTasks = reactive({
  general: {
    clients: ['unblock', 'unblockAll'],
    products: ['unlock', 'unlockAll']
  }
})
</script>
