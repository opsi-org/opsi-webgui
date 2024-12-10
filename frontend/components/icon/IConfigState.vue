<template>
  <el-text v-if="anyObjectDifferentFromDefault"
    ><i class="after:content-['*']"><slot name="default" /></i
  ></el-text>
  <el-text v-else> <slot name="default" /></el-text>

  <el-text
    v-if="
      props.item.anyObjDiff &&
      props.item.anyObjDiff !== anyObjectDifferentFromDefault
    "
  >
    {{ $t('message.error.title') }}
    <pre>
      {{ props.item }}
    </pre>
  </el-text>
</template>

<script setup lang="ts">
  const props = defineProps({
    item: { type: Object, required: true },
    defaultKey: { type: String, default: 'defaultValues' },
    currentKey: { type: String, default: 'value' },
    objectKey: { type: String, default: 'objects' },
    multiKey: { type: String, default: 'multiValue' },
    typeKey: { type: String, default: 'type' },
    boolTypeValue: { type: String, default: 'BoolConfig' },
  })
  const anyObjectDifferentFromDefault = computed(() => {
    if (!props.item[props.objectKey]) return false

    if (props.item[props.typeKey] === props.boolTypeValue) {
      const defVal = props.item[props.defaultKey][0] // false
      const objsVals: Array<any> = Object.values(props.item.objects)
      const objVal: boolean | string | number | undefined = objsVals[0]
      if (objVal === defVal) {
        return false
      }
      return true
    }

    const objectsValues: Array<Array<any>> = Object.values(
      props.item[props.objectKey],
    )
    const objectsValuesStrings: Array<string> = []
    objectsValues.forEach((value: any) => {
      if (value.length > 0) {
        const sorted = [...value]
        sorted.sort()
        objectsValuesStrings.push(JSON.stringify(sorted))
      } else {
        objectsValuesStrings.push(JSON.stringify(value))
      }
    })

    const defVal = [...props.item[props.defaultKey]]
    defVal.sort()

    if (
      objectsValuesStrings.every(
        (v: string, i: number, a: string[]) => v === a[0],
      ) && // allequal
      objectsValuesStrings[0] === JSON.stringify(defVal)
    ) {
      // same as defaultValue
      return false
    }
    return true
  })
</script>
