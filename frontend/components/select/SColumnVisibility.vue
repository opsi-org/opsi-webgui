<template>
  <div>
    <el-select-v2
      v-model="selectedColumnsIds"
      :options="optionsWrapper"
      :max-collapse-tags="0"
      :multiple="true"
      collapse-tags
      class="h-9 min-h-9"
      popper-class="w-250"
      @change="handleItem"
    >
      <template #prefix>
        <el-text>
          <IconIIcon data-testid="ITableColumn" :icon="icons.columns" class="w-4 h-4"/>
        </el-text>
      </template>

      <template #default="{ item }">
        <span class="w-fit">{{ item.label }}</span>
      </template>
    </el-select-v2>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons';
import { useUtilsData } from '~/composables/mixins/useUtilsData';
import type { ITableHeaderCell, ITableHeaderRow } from '~/types/ttableV3';

const icons = useIcons()
const storeTable = storeTablesettings()

const props = defineProps({ tableId: { type: String, required: true } })
const possibleColumnsModel = defineModel<ITableHeaderRow>('possibleColumns', { required:true})
const possibleColumnsList = computed<Array<ITableHeaderCell>>(() => {
  return Object.values(possibleColumnsModel.value)
})

// currently selected items (can include major, but not children)
const selectedColumnsIds = ref(useUtilsData().getVisibleColumnIdsInSelect(possibleColumnsList.value))
watch(()=>possibleColumnsModel, (v) => {
  selectedColumnsIds.value = useUtilsData().getVisibleColumnIdsInSelect(possibleColumnsList.value)
}, { deep: true})

// options for select
const _options = computed<Array<ITableHeaderCell>>(() => {
  return possibleColumnsList.value
    .filter((h:ITableHeaderCell)=>(h._majorKey===undefined || h._isMajor!==undefined) // do not show child columns in select
  )
})

const optionsWrapper = computed<Array<any>>(() => {
  // need another format for el-select-v2
  return _options.value
  .map((v,i) => ({
    value: v.key,
    label: v.title || v.tooltip,
    disabled: Boolean(v.fixed) || Boolean(v._fixed) || Boolean(v.disabled),
    // visible: selectedColumnsIds.value.includes(v.key) // visibility is covered by v-model
  }))
})


function handleItem (selections: Array<string>) {
  // store visibility of columns in store / as cookie
  storeTable.setColumns(props.tableId, selections)
  for (const item of possibleColumnsList.value) {
    const key = item.dataKey || item.key
    const isVisible = selections.includes(key as string)
    const entry = possibleColumnsModel.value[key as string]
    if (!entry.isMajor) {
      possibleColumnsModel.value[key as string].hidden = !isVisible
    } else {
      const children = Object.values(possibleColumnsModel.value).filter((c:ITableHeaderCell) => c._majorKey === key)
      for (const child of children) {
        possibleColumnsModel.value[child.key as string].hidden = !isVisible
      }
    }
  }
}
</script>



<style scoped>
.el-select {
  width: max-content;
}
:deep(.el-vl__window.el-select-dropdown__list) {
  width: 150px !important;
}
:deep(.el-select-v2__wrapper) {
  padding: 5px !important;
}

:deep(.el-select__selection),
:deep(.el-select__placeholder),
:deep(.el-select__suffix),
:deep(.el-select-v2__selection),
:deep(.el-select-v2__placeholder),
:deep(.el-select-v2__suffix) {
  display: none !important;
}
</style>