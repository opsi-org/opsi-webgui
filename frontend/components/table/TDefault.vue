<template>
    <TableTDefaultMobile
      v-if="isMobileWrapper"
      v-bind="propsMobile"
      @selection-changed="(v: any) => $emit('selection-changed', v)" />
    <TableTDefaultDesktop
      v-else
      v-bind="propsDesktop"
      @selection-changed="(v: any) => $emit('selection-changed', v)"
      @selection-clear="(v: any) => $emit('selection-clear', v)"
    />
</template>


<script setup lang="ts">
import type { ITableHeaderRow } from '~/types/ttableV3';
const props = defineProps({
  columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  data: { type: Array<any>, required:true},
  tableData: { type: Object },
  id: { type: String, default: 'depots' },
  rowId: { type: String, default: 'depotId'},
  sortBy: { type: String, default: 'selection'},
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}}
})
const isMobileWrapper = ref<boolean>(props.isMobile)
const propsMobile = computed (()=>{
  // add keys which are not used by child
  return (({ isMobile, ...rest }) => rest)(props);
})
const propsDesktop = computed (()=>{
  // add keys which are not used by child
  return (({ isMobile, ...rest }) => rest)(props);
})
const $emit = defineEmits(['selection-changed', 'selection-clear'])
</script>

<style scoped>
</style>