<template>
  <el-button @click="clearSelection"> {{$t('table.selection.clear')}}</el-button>
  <el-checkbox-group v-model="selectedDepots" @change="handleDepotSelection">
    <div v-for="item in depotIDList" :key="item">
      <el-checkbox size="small" :label="item" />
    </div>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { useDepot } from '~/composables/mixins/useGet';
const storeSelection = storeSelections()
const depotIDList = ref<Array<any>>([])
let selectedDepots= ref<Array<any>>([])

watch(()=>storeSelection.selectionDepots, async ()=>{
  selectedDepots.value = storeSelection.selectionDepots
})

onMounted(async ()=> {
  await fetch()
})
async function fetch() {
  depotIDList.value = await useDepot().getDepotIdList()
  selectedDepots.value = storeSelection.selectionDepots
}

const clearSelection = () => {
  storeSelection.clearSelectionDepots()
}

const handleDepotSelection = () => {
  console.log('selectedDepots', selectedDepots.value)
  storeSelection.setSelectionDepots(selectedDepots.value)
}
</script>
