
<template>
  <SelectSHosts v-if="props.isChild === false" :id="currentId" :type="type" @change="setId" />
  <el-text v-else> <h3>{{ currentId }}</h3></el-text>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="currentId ? $t('title.hostparam') : $t('title.hostparam.defaults')"
      name="config"
      active :disabled="!(type == 'clients' || type == 'depots')"
    >
        <!-- <el-text>Config of {{ type }} {{ currentId }}</el-text> -->
        <FormFHostParameter v-if="activeName==='config'" :id="currentId" :type="type"/>
      </el-tab-pane>
    <el-tab-pane :label="$t('title.hostattr')" name="attr">
      <el-scrollbar >
        <FormFHostAttributes :id="currentId" :type="type"/>
      </el-scrollbar>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const activeName = ref('attr')
const currentId = ref<string|undefined>('')
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'depots' },
  isChild: { type: Boolean, default: false }
})
watch(()=>props.id, ()=>{
  currentId.value = props.id
})
function setId(id:string) {
  currentId.value = id
}
</script>


