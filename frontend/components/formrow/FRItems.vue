<template>
  <el-form
    label-width="50%"
    label-position="left"
    class="bg-transparent mr-3 ml-3"
    label-suffix=""
  >
    <!-- :key="index" -->
    <div v-if="props.idKey === 'configId'">
      <FormrowFRItem
        v-for="(item, index) in sortedItems"
        :key="item.configId"
        :item="item"
        :id-key="props.idKey"
        :bool-type-key="props.boolTypeKey"
        :bool-type-value="props.boolTypeValue"
        :all-values-key="props.allValuesKey"
        :replace-in-id="props.replaceInId"
        @change="
          (v: any) => {
            change(item, v, index)
          }
        "
      />
    </div>
    <div v-else>
      <!-- v-else-if="props.idKey === 'propertyId' && Object.values(props.items)?.[0]" -->
      <FormrowFRItemProperty
        v-for="item in sortedItems"
        :key="item.configId"
        :item="item"
        :id-key="props.idKey"
        :bool-type-key="props.boolTypeKey"
        :bool-type-value="props.boolTypeValue"
        :all-values-key="props.allValuesKey"
        :replace-in-id="props.replaceInId"
        @change="
          (v: any, vVal: any) => {
            change(item, v, vVal)
          }
        "
      />
    </div>
  </el-form>
</template>

<script setup lang="ts">
  import type { T_HostParameterEntry } from '~/types/APItypes'

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
  const sortedItems = computed(() => {
    const _sorteditems = JSON.parse(JSON.stringify(props.items))
    return _sorteditems.sort((a: any, b: any) => {
      return a[props.idKey].localeCompare(b[props.idKey])
    })
  })
  function change(item: any, v: any, index: number) {
    $emit('change-item', item, v, index)
  }
</script>
