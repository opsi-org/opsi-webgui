<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-form-item>
    <template #label>
      <TooltipTTooltip class="box-item">
        <template #default>
          <el-text class="truncate">
            <IconIConfigState :item="props.item">
              {{ transformId(props.item[props.idKey]) }}
            </IconIConfigState>
          </el-text>
        </template>

        <template #tooltip>
          <div class="min-w-48">
            <b>{{ props.item[props.idKey] }} <br /></b>
            {{ props.item.description }} <br />
            <br />
            <div v-if="props.item.value !== undefined">
              <b>{{ $t('form.config.value') }}</b>
              <pre>{{ props.item.vae }}</pre>
            </div>
            <div v-if="props.item.defaultValues !== undefined">
              <b>{{ $t('form.config.defaultvalue') }}</b>
              <pre>{{ props.item.defaultValues }} </pre>
            </div>
            <div v-if="props.item.objects !== undefined">
              <b>{{ $t('form.config.objectvalue') }}</b>
              <pre>{{ props.item.objects }} </pre>
            </div>
          </div>
        </template>
      </TooltipTTooltip>
    </template>
    <template #default>
      <el-checkbox
        v-if="props.item[props.boolTypeKey] === boolTypeValue"
        v-model="itemValue"
        :value="itemValue"
      />
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
        <template #default>
          <TooltipTTooltip
            v-for="pVal in props.item[props.allValuesKey]"
            class="box-item"
            :content="pVal"
            :key="pVal"
          >
            <el-option class="max-w-96" :key="pVal" :label="pVal" :value="pVal" />
          </TooltipTTooltip>
        </template>
        <template #header v-if="props.item.editable">
          <el-text> {{ $t('treeselect.searchOrAdd') }} </el-text>
        </template>
        <template #prefix v-if="props.item.editable">
          <TooltipTTooltip :content="$t('form.item.editable')">
            <el-text><IconIIcon :icon="icons.add" /></el-text>
          </TooltipTTooltip>
        </template>
      </el-select>
    </template>
  </el-form-item>
</template>

<script setup lang="ts">
  const $t = useI18n().t
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
  const loading = ref(true)
  const itemValue = ref(props.item.value)
  const setInitialValue = () => {
    /**
     * return the value/s which are visible initially
     * if there is no value, but objects, return the first object (if they are equal, otherwise return 'mixed')
     * if there is no value and no objects, throw an error
     */

    if (itemValue.value !== undefined) {
      loading.value = false
      return
    }
    if (
      itemValue.value === undefined &&
      props.item.objects &&
      Object.keys(props.item.objects).length > 0
    ) {
      const objectValueStrings: Array<string> = []
      if (props.item.multiValue) {
        const objectValues: Array<Array<any>> = Object.values(props.item.objects)

        objectValues.forEach((value: any) => {
          if (value.length > 0) {
            const sorted = [...value]
            sorted.sort()
            objectValueStrings.push(JSON.stringify(sorted))
          } else {
            objectValueStrings.push(JSON.stringify(value))
          }
        })

        if (objectValueStrings.every((v: string, i: number, a: string[]) => v === a[0])) {
          itemValue.value = Object.values(props.item.objects)[0]
          loading.value = false
          return
        }
        itemValue.value = 'mixed'
        loading.value = false
        return // mixed
        // multiValue end
      }

      const allEqual = Object.values(props.item.objects)?.every(
        (v: any, index: number, a: any[]) => v === a[0]
      )
      if (allEqual) {
        // all objects same value (usually only one object allowed)
        const objVals: Array<any> = Object.values(props.item.objects)
        const defVals: Array<any> = objVals[0]
        itemValue.value = defVals[0]
        loading.value = false
        return
      }
    }
    loading.value = false
    throw new Error('itemValue is undefined and no objects found', props.item)
  }
  setInitialValue()

  watch(
    () => props.item.value,
    () => {
      itemValue.value = props.item.value
    }
  )

  watch(
    () => itemValue.value,
    () => {
      $emit('change', itemValue.value)
    }
  )

  const transformId = (id: string) => {
    if (props.replaceInId) return id.replace(props.replaceInId, '')
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
