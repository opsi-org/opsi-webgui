<template>
  <div>
    <TableTTableMobile
      v-if="isMobile"
      ref="table"
      v-bind="props"
      :table-column="tableColumn"
      :fetch="fetch"
      @selection-changed="$emit('selectionChanged', $event)"
      @clear-selection="$emit('clearSelection')"
    />
    <TableTTableDesktop
      v-else
      ref="table"
      v-bind="props"
      :table-column="tableColumn"
      :fetch="fetch"
      @selection-changed="$emit('selectionChanged', $event)"
      @clear-selection="$emit('clearSelection')"
    >
      <template #header> <slot name="header" /> </template>
      <template #toolbar-right> <slot name="toolbar-right" /> </template>
    </TableTTableDesktop>
  </div>
</template>

<script setup lang="tsx">
import type TTableDesktop from './TTableDesktop.vue';
import type TTableMobile from './TTableMobile.vue';


const props = defineProps({
  isMobile: { type: Boolean, default: false, required: false },
  rowId: { type: String, required: true },
  tableColumn: { type: Array<any>, required: true },
  fetch: { type: Function, required: true },
  bodyHeight: { type: String, default: '80vh', required: false },
  sortBy: { type: String, default: undefined, required: false },
  actionClone: { type: String, default: undefined, required: false },
  actionLog: { type: String, default: undefined, required: false },
  actionConfig: { type: String, default: undefined, required: false },
  hasClientActions: { type: Boolean, default: false, required: false },
})

const $emit = defineEmits(['selectionChanged', 'clearSelection'])
const table = ref<typeof TTableDesktop| typeof TTableMobile>()

defineExpose({ refetch: table.value?.refetch, fetchedData: table.value?.fetchedData })


const isMobileWrapper = ref<boolean>(props.isMobile)
watch(()=>useMQ().isMobile, ()=>{
  isMobileWrapper.value = useMQ().isMobile.value
}, {deep: true})

</script>
