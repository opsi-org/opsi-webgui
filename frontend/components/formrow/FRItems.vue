<template>
<el-form
  label-width="50%"
  label-position="left"
  class="bg-transparent mr-3 ml-3"
  label-suffix=""
>
    <!-- :key="index" -->
    <FormrowFRItem
      v-for="(item, index) in props.items.sort((a,b)=>{return a[props.idKey].localeCompare(b[props.idKey])})"
      :item="item"
      :id-key="props.idKey"
      :bool-type-key="props.boolTypeKey"
      :bool-type-value="props.boolTypeValue"
      :replace-in-id="props.replaceInId"
      @change="(v: any) => {change(item, v, index) }"
    />
  </el-form>
</template>

<script setup lang="ts">
const $emit = defineEmits(['change-item', 'transform-id'])
// const $emit = defineEmits({
//   changeItem: ()=>{}, // if we want an event without validation
//   transformId: (id: string) => { return id },
// })
const props = defineProps({
  items: { type: Array<Object>, required: true },
  idKey: { type: String, default: 'configId' },
  boolTypeKey: { type: String, default: 'type' },
  boolTypeValue: { type: String, default: 'BoolConfig' },
  replaceInId: { type: String, default: undefined },
})
function change(item: any, v: any, index: number) {
  $emit('change-item', item, v, index)
}
</script>