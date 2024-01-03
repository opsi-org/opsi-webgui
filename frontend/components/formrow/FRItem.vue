
<template>
  <el-form-item>
    <template #label>
      <el-tooltip
        class="box-item"
        effect="dark"
        :show-after="1000"
        placement="top-start"
      >
      <template #default>
        <el-text class="truncate">
          <IconIConfigState v-if="props.item.objects" :item="props.item" >
            {{ transformId(props.item[props.idKey]) }}
          </IconIConfigState>
        </el-text>
      </template>

        <template #content>
          <div class="min-w-48">
            <b>{{props.item[props.idKey]}} <br /></b>
            {{props.item.description}} <br /> <br />
            <p><b>Default Values:</b>  <pre>{{ props.item.defaultValues }} </pre></p>
            <p v-if="props.item.value"><b>Current Value:</b> <pre>{{ props.item.value }}</pre> </p>
            <p v-if="props.item.objects"><b>Objects:</b> <pre>{{ props.item.objects }} </pre></p>
          </div>
        </template>
      </el-tooltip>
    </template>
  <!-- <el-text>{{ props.item[props.idKey] }}</el-text> -->
    <template #default>
      <!-- {{ itemValue }} -->
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
        tag-type=""
        >
        <!-- suffix-icon="el-icon-arrow-down" -->
        <!-- style="width: 240px" -->
        <template #default>
          <!-- <el-tooltip
            class="box-item"
            effect="dark"
            :content="pVal"
            :show-after="1000"
            placement="top-start"
            > -->
            <el-option
            v-for="pVal in props.item.possibleValues"
              class="max-w-96"
              :key="pVal"
              :label="pVal"
              :value="pVal"
              >
            </el-option>
          <!-- </el-tooltip> -->
        </template>
        <template #header v-if="props.item.editable">
          <el-text> {{ $t('treeselect.searchOrAdd') }} </el-text>
        </template>
        <template #prefix v-if="props.item.editable">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="'This config is editable. Press <Enter> or click on item to add and select'"
            placement="top-start"
          >
            <el-text><IconIIcon :icon="icons.add" /></el-text>
          </el-tooltip>
        </template>
      </el-select>
    </template>
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

const setInitialValue = () => {
  console.log('setInitialValue', props.item)
  if (itemValue.value !== undefined) return
  console.log('itemValue is undefined', props.item)
  if (itemValue.value === undefined && props.item.objects && Object.keys(props.item.objects).length > 0) {
    console.log('itemValue is undefined and objects found', props.item.objects)
    const objectValueStrings: Array<string> = []
    if (props.item.multiValue) {
      // itemValue.value = []
      // sort
      const objectValues: Array<Array<any>> = Object.values(props.item.objects)

      objectValues.forEach((value: any, index: number, wholearray: any[])=> {
        if (value.length > 0){
          const sorted = [...value]
          sorted.sort()
          objectValueStrings.push(JSON.stringify(sorted))
        } else {
          objectValueStrings.push(JSON.stringify(value))
        }
      })

      if (objectValueStrings.every((v: string, i:number, a: string[]) => v === a[0])) {
        // console.log('all objects same value,', objectValueStrings[0], props.item)

        itemValue.value = Object.values(props.item.objects)[0]
        console.log('itemValue2', itemValue.value, props.item)
        return
      }
      itemValue.value = 'mixed'
      console.log('itemValue2', itemValue.value, props.item)
      return // mixed
      // multiValue end
    }

    console.log('singlevalue ', props.item.objects)
    const allEqual = Object.values(props.item.objects)?.every((v: any, index: number, a: any[]) => v === a[0])
    console.log('allEqual', allEqual)
    if (allEqual){ // all objects same value (usually only one object allowed)
      const objVals: Array<any> = Object.values(props.item.objects)
      const defVals: Array<any> = objVals[0]
      itemValue.value = defVals[0]
      console.log('itemValue3', itemValue.value, props.item)
      return
    }
  }
  throw new Error('itemValue is undefined and no objects found', props.item)
}
const itemValue = ref(props.item.value)
setInitialValue()

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