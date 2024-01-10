
<template>
  <SelectSHosts v-if="props.isChild === false" :id="currentId" :type="type" @change="setId" />
  <el-text v-else> <h3>Id: {{ currentId }}</h3></el-text>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="currentId ? $t('title.hostparam') : $t('title.hostparam.defaults')"
      name="config"
      active :disabled="!(type == 'clients' || type == 'depots')"
    >
        <!-- <el-text>Config of {{ type }} {{ currentId }}</el-text> -->
        <FormFHostParameter v-if="activeName==='config'" :id="currentId" :type="type" :is-child="props.isChild"/>
      </el-tab-pane>
    <el-tab-pane :label="$t('title.hostattr')" name="attr" :disabled="isIdEmpty">
      <el-scrollbar >
        <FormFHostAttributes :id="currentId" :type="type" :is-child="props.isChild"/>
      </el-scrollbar>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const tableSettings = storeTablesettings()
const { configLastSelected } = storeToRefs(tableSettings)

const currentId = ref<string|undefined>('')
const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'depots' },
  isChild: { type: Boolean, default: false }
})
console.log('props.id0', props.id)
currentId.value = props.id
const activeName = ref(props.isChild ? configLastSelected.value[props.type] || 'attr' : 'config')

watch(()=>props.id, ()=>{
  console.log('props.id1', props.id)
  currentId.value = props.id
  if (isIdEmpty.value && activeName.value !== 'config') {
    activeName.value = 'config'
  }
})
watch(()=> activeName.value, (val)=>{
  if (props.isChild){
    // store last selected tab if used as child
    tableSettings.setConfigLastSelected(props.type, activeName.value)
  }
})

const isIdEmpty = computed(()=> {
  return currentId.value === ''
})
function setId(id:string) {
  currentId.value = id
}
</script>


