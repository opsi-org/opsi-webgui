
<template>

  <SelectSServers :id="props.id" />
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="props.id ? $t('title.hostparam') : $t('title.hostparam.defaults')"
      name="config"
      active :disabled="!(type == 'clients' || type == 'depots')"
    >
        Config
      </el-tab-pane>
    <el-tab-pane :label="$t('title.hostattr')" name="attr">
      <FormFHostAttributes :id="props.id" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const activeName = ref('attr')
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'depots' }
})
</script>


