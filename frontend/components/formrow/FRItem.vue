<template>
  <el-form-item>
    <template #label>
      <el-tooltip
        class="box-item"
        effect="dark"
        :show-after="1000"
        placement="top-start"
      >
        <el-text class="truncate">{{ transformId(props.item[props.idKey]) }}</el-text>
        <template #content>
          <b>{{props.item[props.idKey]}} <br /></b>
          {{props.item.description}}
        </template>
      </el-tooltip>
    </template>
  <!-- <el-text>{{ props.item[props.idKey] }}</el-text> -->
    <template #default>
      <el-checkbox v-if="props.item[props.boolTypeKey] === boolTypeValue" v-model="itemValue" :label="itemValue"/>
      <el-select
        v-else
        v-model="itemValue"
        :multiple="props.item.multiValue"
        :allow-create="props.item.editable"
        :filterable="true"
        default-first-option
        collapse-tags
        collapse-tags-tooltip
        :no-data-text="$t('treeselect.nooption')"
        :no-match-text="$t('treeselect.noResultTextEditable')"
        placeholder=""
        class="w-full"
        :tag-type="undefined"
        >
        <!-- suffix-icon="el-icon-arrow-down" -->
        <!-- style="width: 240px" -->
        <el-tooltip
          v-for="pVal in props.item.possibleValues"
          class="box-item"
          effect="dark"
          :content="pVal"
          :show-after="1000"
          placement="top-start"
          >
            <el-option
            class="max-w-96"
            :key="pVal"
            :label="pVal"
            :value="pVal"
            >
          </el-option>
        </el-tooltip>
        <template #header v-if="props.item.editable">
          <el-text> {{ $t('treeselect.searchOrAdd') }} </el-text>
        </template>
        <template #prefix v-if="props.item.editable">
          <!-- <el-text> + </el-text> -->
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="'Press <Enter> or click on item to add and select'"
            placement="top-start"
          >
            <IconIIcon :icon="icons.add" />
          </el-tooltip>
        </template>
      <!-- <template #empty> {{ $t('treeselect.nooption') }} </template> -->
      </el-select>
    </template>
  <!-- <pre>
    {{ props.item }}
  </pre> -->
  </el-form-item>
</template>

<script setup lang="ts">
import { useIcons } from '~/composables/mixins/useIcons'
const icons = useIcons()
const $emit = defineEmits(['change'])
const props = defineProps({
  item: { type: Object, required: true },
  idKey: { type: String, default: 'configId' },
  boolTypeKey: { type: String, default: 'type' },
  boolTypeValue: { type: String, default: 'BoolConfig' },
  replaceInId: { type: String, default: undefined },
})
const itemValue = ref(props.item.value)
// const possibleValues = ref(props.item.possibleValues)
watch(()=>props.item.value, ()=>{
  itemValue.value = props.item.value
})

watch(()=>itemValue.value, ()=>{
  $emit('change', itemValue.value)
  // tmp.value = itemValue.value
})

const transformId = (id: string) => {
  if (props.replaceInId)
    return id.replace(props.replaceInId, '')
  return id
}
</script>

<style scoped>
:deep(.el-input__prefix) {
  color: #000;
  right: 0;
  position: absolute;
  margin-right: 20px;
}
:deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>