<template>
  <!-- <b-input-group class="componentwrapper ">
    <b-dropdown size="sm" no-caret class="border-0" variant="outline-primary">
      <template #button-content>
        <IconIIcon :icon="icon.filter" />
      </template>
      <b-dropdown-item active>
        {{ $t('table.fields.id') }}
      </b-dropdown-item>
    </b-dropdown>
    <b-form-input
      ref="IFilter"
      id="filter"
      data-testid="IFilter"
      v-model="data.filterQuery"
      v-bind="props"
      size="sm"
      class="filter border-0 w-full"
      :aria-label="$t('table.filter', {el: additionalTitle})"
      :placeholder="$t('table.filter', {el: additionalTitle})"
    />
    <b-button
      v-if="data.filterQuery && data.filterQuery.length > 0"
      variant="outline-primary"
      :title="$t('button.clearFilter')"
      class="transparent border-0 w-5 p-0"
      :class="data.filterQuery?.length === 0 ? '' : 'hidden d-none'"
      size="sm"
      @click="clearFilter"
    >
      <IconIIcon  :icon="icon.x" />
    </b-button>
  </b-input-group> -->
  <el-form class="max-w-md">
  <el-input
      v-model="filterQueryValue"
      :placeholder="data.filterQuery"
    >
      <template #prepend>
        <el-select-v2
          v-model="filterValue"
          :options="props.filterableColumns.map((v,i) => ({ value: v.key, label: v.title }))"
          class="w-full h-full"
          type="primary"
          :multiple="true"
          :max-collapse-tags="0"
          collapse-tags
          popper-class="w-250"
        >
          <template #prefix>
            <IconIIcon type="danger" :icon="icon.filter" />
          </template>
          <!-- <el-option v-for="col,i in props.filterableColumns" :label="col.key" :value="col.key" /> -->

          <template #default="{ item }">
              <span class="w-fit">{{ item.label }}</span>
              <!-- <span style="color: var(--el-text-color-secondary); font-size: 13px">
                {{ item.value }}
              </span> -->
            </template>
        </el-select-v2>
      </template>
      <template #append>
        <el-button @click="clearFilter" type="danger">
          <IconIIcon  :icon="icon.x" />
        </el-button>
      </template>
    </el-input>
  </el-form>
</template>

<script setup lang="ts">
import type { ITableData, ITableInfo } from '~/types/ttable'
import { useIcons } from '@/composables/mixins/useIcons'
import type { ITableHeaderRow } from '~/types/ttableV3';
// import { Component, Prop, Ref } from 'nuxt-property-decorator'
// import { BFormInput } from 'bootstrap-vue'
// import { Icons } from '../../mixins/icons'
const icon = useIcons()

// @Component({ mixins: [Icons] })
// export default class IFilter extends BFormInput {
//   icon: any
//   @Ref('IFilter') readonly IFilter!: HTMLInputElement
const IFilter = ref<HTMLInputElement>()
const filterValue = ref<Array<string>>([])
const filterQueryValue = ref<string>('')
//   @Prop({}) dataChanging!: string
//   @Prop({}) data!: ITableData|ITableInfo
//   @Prop({ default: '' }) additionalTitle!: string
const props = defineProps({
  // dataChanging: { type: String },
  // data: { type: ITableData|ITableInfo},
  // data: { type: Object as PropType<ITableData|ITableInfo>, required: true},
  data: { type: Object as PropType<ITableData>, required: true},
  filterableColumns: { type: Object as PropType<Array<ITableHeaderRow>>, required: true},
  additionalTitle: { type: String, default: ''},
})
const emits = defineEmits(['update'])
onMounted(()=>{
  if (IFilter.value) {
    IFilter.value.focus()
  }
  if (props.data.filterColumns){
    filterValue.value = props.data.filterColumns
  }
  console.log('filterquery', props.data.filterQuery)
  if (props.data.filterQuery !== undefined){
    console.log('filterquery set', props.data.filterQuery)
    filterQueryValue.value = props.data.filterQuery
  }
})
watch(filterValue, ()=>{
  emits('update', {cols: filterValue, vals: filterQueryValue.value})
})
watch(filterQueryValue, ()=>{
  emits('update', {cols: filterValue, vals: filterQueryValue.value})
})

const filterableColumns = computed(()=> {
  if (props.filterableColumns)
    return props.filterableColumns
  return []
})
function clearFilter () {
  props.data.filterQuery = ''
}
// }
</script>

<style scoped>
.filterclear{
  width: 20px;
}
:deep(.el-select-v2__wrapper) {
  height: 100% !important;
}
:deep(.el-input) {
  border: 1px solid var(--el-text-color-regular) !important;
  border-radius: 5px;
}
:deep(.el-input-group__prepend) {
  padding: 0 !important;
  border: 0px !important;
}
:deep(.el-select-v2__selection),
:deep(.el-select-v2__placeholder),
:deep(.el-select-v2__suffix) {
  display: none !important;
}
:deep(.el-input-group__append),
:deep(.el-input-group__prepend) {
  /* color: var(--el-color-text); */
  /* color: var(--el-button-text-color); */
  color: var(--el-text-color-regular);
  /* color: var(--el-color-white); */
  background-color: transparent;
}
:deep(.l-vl__window) {
  width: 150px !important;
}
:deep(.el-input-group__append),
:deep(.el-select-v2__wrapper) {
  padding-left: 5px;
  padding-right: 5px;
  min-width: 25px;
}
:deep(.el-input-group__append:hover),
:deep(.el-input-group__prepend:hover) {
  /* color: var(--el-color-blank); */
  color: var(--el-text-color-regular);
  /* background-color: var(--el-color-primary); */
  /* background-color: var(--el-border-color-hover); */
}
</style>
