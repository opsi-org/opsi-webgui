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
    <pre>{{ Object.values(props.properties.properties) }}</pre>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['change-property'])
const props = defineProps({
  properties: { type: Object as PropType<any>, required: true },
})

function changeItem(item: any, v: any, visibleVal: any) {
  emit('change-property', item, v, visibleVal)
}
</script>