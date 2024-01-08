<template>
  <div>
    <h6>Properties</h6>
    <FormrowFRItems
      :items="Object.values(props.properties.properties)"
      id-key="propertyId"
      boolTypeKey="type"
      boolTypeValue="BoolProductProperty"
      all-values-key="allValues"
      @change-item="changeItem"
      />
      <!-- replaceInId: { type: String, default: undefined }, -->
      <el-text>=============================</el-text> <br />
      <el-text>=============================</el-text> <br />
      <el-text>=============================</el-text> <br />
    <pre>{{ Object.values(props.properties.properties) }}</pre>
  </div>
</template>

<script setup lang="ts">
const $t = useI18n().t

const props = defineProps({
  properties: { type: Object as PropType<any>, required: true },
})

function changeItem(item: any, v: any, index: number) {
  console.log('changeItem', item, v, index)
}
</script>