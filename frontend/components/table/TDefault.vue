<template>
  <div>
    <LazyTableTDefaultMobile
      v-if="isMobileWrapper"
      v-model:columns="columns"
      v-model:data="dataModel"
      v-model:tabledata="tableData"
      v-bind="propsMobile"
      @fetch="(v: any) => $emit('fetch', v)"
      @tabledata-changed="(v: any) => $emit('tabledata-changed', v)"
      @selection-changed="(v: any) => $emit('selection-changed', v)"
      @selection-clear="(v: any) => $emit('selection-clear', v)"
      @update-input-filter="(v: any) => $emit('update-input-filter', v)"
      @sort-changed="(v: any) => $emit('sort-changed', v)"
    >
      <template #header-title>
        <slot name="header-title" />
      </template>
      <template #header-pre-visibility>
        <slot name="header-pre-visibility" />
      </template>
      <template #header-pre-filter>
        <slot name="header-pre-filter" />
      </template>
      <template #header-post-filter>
        <slot name="header-post-filter" />
      </template>
    </LazyTableTDefaultMobile>
    <TableTDefaultDesktopPVlist
      v-else-if="!isMobileWrapper"
      v-model:columns="columns"
      v-model:data="dataModel"
      v-model:tabledata="tableData"
      v-bind="propsDesktop"
      @fetch="(v: any) => $emit('fetch', v)"
      @tabledata-changed="(v: any) => $emit('tabledata-changed', v)"
      @selection-changed="(v: any) => $emit('selection-changed', v)"
      @selection-clear="(v: any) => $emit('selection-clear', v)"
      @update-input-filter="(v: any) => $emit('update-input-filter', v)"
      @sort-changed="(v: any) => $emit('sort-changed', v)"
    >
    <template #header-title>
      <slot name="header-title" />
    </template>
    <template #header-pre-visibility>
      <slot name="header-pre-visibility" />
    </template>
    <template #header-pre-filter>
      <slot name="header-pre-filter" />
    </template>
    <template #header-post-filter>
      <slot name="header-post-filter" />
    </template>

      <!-- v-bind="(({ isMobile, ...rest }) => rest)($attrs)" -->
    </TableTDefaultDesktopPVlist>
  </div>
</template>


<script setup lang="ts">
import type { ITableHeaderRow } from '~/types/ttableV3';
import type { ITableData } from '~/types/ttable';
const columns = defineModel<ITableHeaderRow>('columns', { required:true})
const dataModel = defineModel<Array<any>>('data', { required:true})
const tableData = defineModel<ITableData>('tabledata', { required:true})
const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  // data: { type: Array<any>, required:true},
  // tableData: { type: Object as PropType<ITableData>, required:true },
  totalItems: { type: Number, required:true },
  id: { type: String, default: 'servers' },
  rowId: { type: String, default: 'depotId'},
  sortBy: { type: String, default: 'selection'},
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}},
  isLoading: { type: Boolean, default: false, required:false },
})
const isMobileWrapper = ref<boolean>(props.isMobile)
watch(()=>useMQ().isMobile, ()=>{
  isMobileWrapper.value = useMQ().isMobile.value
}, {deep: true})
const propsMobile = computed (()=>{
  // add keys which are not used by child
  return {
    ...(({ isMobile, ...rest }) => rest)(props)
  }
})
const propsDesktop = computed (()=>{
  // add keys which are not used by child
  return {
    ...(({ isMobile, ...rest }) => rest)(props)
  }
})

const $emit = defineEmits(['fetch', 'selection-changed', 'selection-clear', 'tabledata-changed', 'sort-changed', 'update-input-filter'])
</script>

