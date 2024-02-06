<template>
  <div>
  <TableTDefaultMobile
    v-if="isMobileWrapper"
    v-model="columns"
    v-bind="propsMobile"
    @selection-changed="(v: any) => $emit('selection-changed', v)"
    @update-input-filter="(v: any) => $emit('update-input-filter', v)"
  >
  </TableTDefaultMobile>
  <TableTDefaultDesktop
  v-else
  v-model="columns"
    v-bind="propsDesktop"
    @selection-changed="(v: any) => $emit('selection-changed', v)"
    @selection-clear="(v: any) => $emit('selection-clear', v)"
    @update-input-filter="(v: any) => $emit('update-input-filter', v)"
  >
  </TableTDefaultDesktop>
</div>
</template>


<script setup lang="ts">
import type { ITableHeaderRow } from '~/types/ttableV3';
import type { ITableData } from '~/types/ttable';
const columns = defineModel<ITableHeaderRow>()
const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  data: { type: Array<any>, required:true},
  tableData: { type: Object as PropType<ITableData>, required:true },
  totalItems: { type: Number, required:true },
  id: { type: String, default: 'servers' },
  rowId: { type: String, default: 'depotId'},
  sortBy: { type: String, default: 'selection'},
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}}
})
const isMobileWrapper = ref<boolean>(props.isMobile)
watch(()=>useMQ().isMobile, (val)=>{
  isMobileWrapper.value = useMQ().isMobile.value
}, {deep: true})
const propsMobile = computed (()=>{
  // add keys which are not used by child
  return (({ isMobile, ...rest }) => rest)(props);
})
const propsDesktop = computed (()=>{
  // add keys which are not used by child
  return (({ isMobile, ...rest }) => rest)(props);
})
const $emit = defineEmits(['selection-changed', 'selection-clear', 'update-input-filter'])
</script>

<style scoped>
</style>