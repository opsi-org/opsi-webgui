<template>
  <el-form
    class="h-[70vh] overflow-y-auto"
    label-width="50%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
  >
    <el-form-item
      v-for="item in Object.values(props.properties)"
      :key="item.propertyId"
      :label="item.propertyId"
    >
      <el-checkbox
        v-if="item.type === 'BoolProductProperty'"
        v-model="itemValues[item.propertyId]"
        :disabled="config.read_only"
        @change="handleSelection(item, itemValues[item.propertyId])"
      />
      <el-select
        v-else
        v-model="itemValues[item.propertyId]"
        filterable
        :allow-create="item.editable"
        :multiple="item.multiValue"
        collapse-tags
        :disabled="config.read_only"
        @change="handleSelection(item, itemValues[item.propertyId])"
      >
        <template #header v-if="item.editable">
          <el-text type="info">
            {{ $t('form.config.add_option') }}
          </el-text>
        </template>
        <el-option
          v-for="value in item.allValues"
          :key="String(value)"
          :label="String(value)"
          :value="value"
        />
      </el-select>
    </el-form-item>
  </el-form>

  <div
    class="button-container"
    style="display: flex; justify-content: flex-end"
  >
    <el-button
      v-if="Object.keys(props.properties).length > 0"
      :type="hasUnsavedChanges ? 'success' : ''"
      :disabled="!hasUnsavedChanges"
      @click="saveProductProperties"
    >
      {{ $t('button.save') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
  import { useSaveProductProperties } from '~/composables/mixins/useSave'
  import type { T_ProductProperty } from '~/types/APItypes'
  import { onBeforeRouteLeave } from 'vue-router'
  import { isEqual } from 'lodash'

  const config = storeConfigapp().config ?? { read_only: true }
  const $t = useI18n().t
  const mq = useMQ()
  const dataSelection = storeSelections()
  const { selectionDepots, selectionClients } = storeToRefs(dataSelection)

  const props = defineProps({
    properties: {
      type: Object as PropType<Record<string, T_ProductProperty>>,
      required: true,
    },
  })

  const itemValues = ref<{ [key: string]: any }>({})
  const initialValues = ref<{ [key: string]: any }>({})
  const hasUnsavedChanges = ref(false)
  const changeBuffer = ref<{ [key: string]: any }>({})

  function getInitialValue(item: any): any {
    if (item.clients && Object.keys(item.clients).length > 0) {
      return Object.values(item.clients as Record<string, any[]>)[0][0]
    }
    if (item.depots && Object.keys(item.depots).length > 0) {
      return Object.values(item.depots as Record<string, any[]>)[0][0]
    }
    if (item.value !== undefined) return item.value
    throw new Error(
      'Initial value is undefined and no valid clients or depots found',
    )
  }

  function setUnsavedChanges() {
    hasUnsavedChanges.value = Object.keys(itemValues.value).some(
      (key) => !isEqual(itemValues.value[key], initialValues.value[key]),
    )
  }

  function handleSelection(item: any, value: any) {
    itemValues.value[item.propertyId] = value
    changeBuffer.value[item.propertyId] = value
    setUnsavedChanges()
  }

  function initFormData() {
    for (const item of Object.values(props.properties)) {
      const initialValue = getInitialValue(item)
      itemValues.value[item.propertyId] = initialValue
      initialValues.value[item.propertyId] = initialValue
    }
    hasUnsavedChanges.value = false
  }

  async function saveProductProperties() {
    for (const item of Object.values(props.properties)) {
      const values = itemValues.value[item.propertyId]
      const originValue = initialValues.value[item.propertyId]

      const data: any = {
        properties: { [item.propertyId]: values },
      }
      if (selectionClients.value.length > 0) {
        data.clientIds = [...selectionClients.value]
      } else {
        data.depotIds = [...selectionDepots.value]
      }

      if (
        isEqual(originValue, values) ||
        (values === '' && originValue === undefined)
      ) {
        continue
      }

      await useSaveProductProperties(undefined, $t).saveProdProperties(
        item.productId,
        data as object,
        false,
        true,
      )
    }

    hasUnsavedChanges.value = false
    changeBuffer.value = {}
    initialValues.value = { ...itemValues.value }
  }

  watch(() => props.properties, initFormData, { immediate: true })

  onBeforeRouteLeave((to, from, next) => {
    if (hasUnsavedChanges.value) {
      const answer = window.confirm($t('message.warning.unsaved_changes'))
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  })
</script>
