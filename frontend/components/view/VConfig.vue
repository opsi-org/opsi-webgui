
<template>

  <SelectSServers :id="currentId" @change="setId" />
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="currentId ? $t('title.hostparam') : $t('title.hostparam.defaults')"
      name="config"
      active :disabled="!(type == 'clients' || type == 'depots')"
    >
        Config of {{ currentId }}
      </el-tab-pane>
    <el-tab-pane :label="$t('title.hostattr')" name="attr">
      <FormFHostAttributes :id="currentId" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const activeName = ref('attr')
const currentId = ref<string|undefined>('')
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'depots' }
})
watch(()=>props.id, ()=>{
  currentId.value = props.id
})
function setId(id:string) {
  currentId.value = id
}
</script>


