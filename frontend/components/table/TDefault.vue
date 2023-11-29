<template>
  <DropdownDDTableColumnVisibility :table-id="id" v-model:headers="props.columns" :sort-by="sortBy" :multi="true" :incontextmenu="true" />

  <div class="h-screen w-screen">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          :columns="Object.values(props.columns)"
          :data="props.data"
          :width="width"
          :height="height"
          fixed
          />
      </template>
    </el-auto-resizer>
  </div>
</template>


<script lang="ts" setup>
import type { ITableHeaderRow } from '~/types/ttableV3'

const props = defineProps({
  columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  data: { type: Array<any>, required:true},
  id: { type: String, default: 'depots' },
  sortBy: { type: String, default: 'selection'}
})

</script>