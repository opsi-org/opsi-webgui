<template>
<el-form
  label-width="50%"
  label-position="left"
  class="bg-transparent mr-3 ml-3"
  label-suffix=""
>
    <!-- :key="index" -->
    <FormrowFRItem
      v-if="props.idKey === 'configId'"
      v-for="(item, index) in props.items.sort((a,b)=>{return a[props.idKey].localeCompare(b[props.idKey])})"
      :item="item"
      :id-key="props.idKey"
      :bool-type-key="props.boolTypeKey"
      :bool-type-value="props.boolTypeValue"
      :all-values-key="props.allValuesKey"
      :replace-in-id="props.replaceInId"
      @change="(v: any) => {change(item, v, index) }"
    />
    <!-- v-else-if="props.idKey === 'propertyId' && Object.values(props.items)?.[0]" -->
    <FormrowFRItemProperty
      v-else
      v-for="(item, index) in props.items.sort((a,b)=>{return a[props.idKey].localeCompare(b[props.idKey])})"
      :item="item"
      :id-key="props.idKey"
      :bool-type-key="props.boolTypeKey"
      :bool-type-value="props.boolTypeValue"
      :all-values-key="props.allValuesKey"
      :replace-in-id="props.replaceInId"
      @change="(v: any, vVal: any) => {change(item, v, vVal) }"
    />
  </el-form>
</template>

<script setup lang="ts">
import type { FormrowFRItemProperty } from '#build/components';
import type { T_ClientAttr, T_HostParameterEntry, T_ServerAttr } from '~/types/APItypes';

const $emit = defineEmits(['change-item', 'transform-id'])
// const $emit = defineEmits({
//   changeItem: ()=>{}, // if we want an event without validation
//   transformId: (id: string) => { return id },
// })
const props = defineProps({
  items: { type: Array<T_HostParameterEntry>, required: true },
  idKey: { type: String, default: 'configId' },
  boolTypeKey: { type: String, default: 'type' },
  boolTypeValue: { type: String, default: 'BoolConfig' },
  allValuesKey: { type: String, default: 'possibleValues' },
  replaceInId: { type: String, default: undefined },
})
function change(item: any, v: any, index: number) {
  $emit('change-item', item, v, index)
}
</script>