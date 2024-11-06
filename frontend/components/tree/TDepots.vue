<template>
  <el-button @click="clearSelection" size="small"> {{$t('table.selection.clear')}} </el-button>
  <el-checkbox-group v-model="selectedDepots" @change="handleDepotSelection">
    <div v-for="(item) in depotIDList" :key="item"> <el-checkbox size="small" :label="item" :value="item" /></div>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { useDepot } from '~/composables/mixins/useGet';
import type { T_DepotIds } from '~/types/APItypes';
const $t = useI18n().t

const storeSelection = storeSelections()
const depotIDList = ref<T_DepotIds>([])
const selectedDepots= ref<T_DepotIds>([])

watch(()=>storeSelection.selectionDepots, async ()=>{
  syncSelection()
})

onMounted(async ()=> {
  await fetch()
  syncSelection()
})

async function fetch() {
  depotIDList.value = await useDepot($t).getDepotIdList()
}

const syncSelection = () => {
  selectedDepots.value = storeSelection.selectionDepots
}

const clearSelection = () => {
  storeSelection.clearSelectionDepots()
}

const handleDepotSelection = () => {
  storeSelection.setSelectionDepots(selectedDepots.value)
}
</script>
