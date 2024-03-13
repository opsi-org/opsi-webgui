<template>
  <el-tabs lazy>
    <el-tab-pane :label="$t('form.general')">
      <FormFAdminGeneral :adminTasks="adminTasks.general" />
    </el-tab-pane>
    <el-tab-pane :label="$t('label.maintenance')">
      <FormFAdminMaintenance :adminTasks="adminTasks.maintenance" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const adminTasks = reactive({
  general: {
    clients: ['unblock', 'unblockAll'],
    products: ['unlock', 'unlockAll']
  },
  maintenance: {
    applicationState : ['current', 'setup'],
    createBackup : {
      config_files: true,
      redis_data:false,
      maintenance_mode: false,
      password: ''
    },
    restoreBackup : {
      file_id: '',
      config_files: false,
      redis_data:false,
      server_id: '',
      password: ''
    },
  }
})
</script>
