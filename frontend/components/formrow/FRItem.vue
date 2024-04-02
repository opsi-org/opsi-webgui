
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
          <IconIConfigState :item="props.item" >
            {{ transformId(props.item[props.idKey]) }}
          </IconIConfigState>
        </el-text>
      </template>

        <template #content>
          <div class="min-w-48">
            <b>{{props.item[props.idKey]}} <br /></b>
            {{props.item.description}} <br /> <br />
            <p v-if="props.item.value !== undefined"><b>Config Value/s:</b> <pre>{{ props.item.value }}</pre> </p>
            <p v-if="props.item.defaultValues !== undefined"><b>Default Value/s:</b>  <pre>{{ props.item.defaultValues }} </pre></p>
            <p v-if="props.item.objects !== undefined"><b>Object Value/s:</b> <pre>{{ props.item.objects }} </pre></p>

            <!-- <pre>
              {{ props.item }}
            </pre> -->
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
          <el-tooltip
            v-for="pVal in props.item[props.allValuesKey]"
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
  allValuesKey: { type: String, default: 'possibleValues' },
  replaceInId: { type: String, default: undefined },
})

const itemValue = ref(props.item.value)
const setInitialValue = () => {
  /**
  * return the value/s which are visible initially
  * if there is no value, but objects, return the first object (if they are equal, otherwise return 'mixed')
  * if there is no value and no objects, throw an error
  */

  if (itemValue.value !== undefined) return
  if (itemValue.value === undefined && props.item.objects && Object.keys(props.item.objects).length > 0) {
    const objectValueStrings: Array<string> = []
    if (props.item.multiValue) {
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

        itemValue.value = Object.values(props.item.objects)[0]
        return
      }
      itemValue.value = 'mixed'
      return // mixed
      // multiValue end
    }

    const allEqual = Object.values(props.item.objects)?.every((v: any, index: number, a: any[]) => v === a[0])
    if (allEqual){ // all objects same value (usually only one object allowed)
      const objVals: Array<any> = Object.values(props.item.objects)
      const defVals: Array<any> = objVals[0]
      itemValue.value = defVals[0]
      return
    }
  }
  throw new Error('itemValue is undefined and no objects found', props.item)
}
setInitialValue()

watch(()=>props.item.value, ()=>{
  itemValue.value = props.item.value
})

watch(()=>itemValue.value, ()=>{
  $emit('change', itemValue.value)
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