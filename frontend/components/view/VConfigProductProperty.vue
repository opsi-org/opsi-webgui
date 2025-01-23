<template>
  <div class="h-[50vh] overflow-y-auto">
    <el-form
      label-width="50%"
      :label-position="mq.isMobile.value ? 'top' : 'left'"
    >
      <el-form-item
        v-for="item in Object.values(props.properties)"
        :key="item.propertyId"
        :class="{ 'cursor-not-allowed': config.read_only }"
      >
        <template #label>
          <div class="flex w-full h-full justify-between items-center">
            <TooltipTTooltip>
              <template #tooltip>
                <div class="max-w-md">
                  <b>{{ item.description }}</b>
                  <p>{{ $t('form.config.defaultvalue') }} {{ item.default }}</p>
                  <div class="max-h-42 overflow-auto">
                    <p
                      v-if="item.depots"
                      :class="{
                        // italic: item.anyClientDifferentFromDepot,
                        bold: item.anyDepotDifferentFromDefault,
                      }"
                    >
                      {{ $t('form.config.objectvalue') }}
                    </p>
                    <pre class="text-xs">{{ item.depots }}</pre>
                  </div>
                  <div class="max-h-40 overflow-auto">
                    <p
                      v-if="item.clients"
                      :class="{
                        italic: item.anyClientDifferentFromDepot,
                      }"
                    >
                      {{ $t('form.config.objectvalue') }}
                    </p>
                    <pre class="text-xs">{{ item.clients }}</pre>
                  </div>
                </div>
              </template>
              <span
                :class="{
                  italic: item.anyClientDifferentFromDepot,
                  bold: item.anyDepotDifferentFromDefault,
                }"
              >
                {{ item.propertyId }}
              </span>
            </TooltipTTooltip>
            <p-badge
              v-if="
                itemValues[item.propertyId] !== undefined &&
                !arrayEqual(
                  itemValues[item.propertyId],
                  initialValues[item.propertyId],
                )
              "
              :title="$t('message.warning.unsavedChange')"
              severity="warn"
              :value="t_fixed('notOrigin')"
            />
          </div>
        </template>

        <div
          v-if="item.type === 'BoolProductProperty'"
          class="w-full justify-stretch"
        >
          <el-checkbox
            v-model="itemValues[item.propertyId]"
            :disabled="config.read_only"
            :indeterminate="itemValues[item.propertyId] === MIXED"
            @change="handleSelection(item, itemValues[item.propertyId])"
          />
          {{
            itemValues[item.propertyId] == MIXED
              ? itemValues[item.propertyId]
              : ''
          }}

          <!-- <p-badge
            v-if="
              itemValues[item.propertyId] !== initialValues[item.propertyId]
            "
            severity="warning"
            :value="t_fixed('notOrigin')"
          /> -->
        </div>
        <div
          v-else-if="
            ['password', 'secret'].some((marker) =>
              item.propertyId.includes(marker),
            )
          "
          class="w-full justify-stretch"
        >
          <el-input
            v-model="itemValues[item.propertyId]"
            :value="itemValues[item.propertyId]"
            show-password
            :disabled="config.read_only"
            @input="() => handleSelection(item, itemValues[item.propertyId])"
          />
        </div>
        <div v-else class="w-full justify-stretch">
          <SelectSSelect
            v-model:selection="itemValues[item.propertyId]"
            v-model:data="item.allValues"
            :editable="item.editable"
            :multi-selection="item.multiValue"
            :selected-options="itemValues[item.propertyId]"
            :marked-options="initialValues[item.propertyId]"
            @change="() => handleSelection(item, itemValues[item.propertyId])"
          />
          <!-- <p-tag
            v-if="
              itemValues[item.propertyId] !== undefined &&
              !arrayEqual(
                itemValues[item.propertyId],
                initialValues[item.propertyId],
              )
            "
            severity="danger"
            :value="t_fixed('notOrigin')"
          /> -->
        </div>
      </el-form-item>
    </el-form>
  </div>

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
  import type {
    T_ProductProperty,
    T_Product,
    tproducttypes,
  } from '~/types/APItypes'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useSaveProductProperties } from '~/composables/mixins/useSave'
  import { useStrings } from '~/composables/mixins/useStrings'
  import { onBeforeRouteLeave } from 'vue-router'
  import { isEqual } from 'lodash'

  const { notifyError } = useNotification()
  const config = storeConfigapp().config ?? { read_only: true }
  const $t = useI18n().t
  const mq = useMQ()
  const t_fixed = useStrings().t_fixed
  const dataSelection = storeSelections()
  const { selectionDepots, selectionClients } = storeToRefs(dataSelection)
  const MIXED = '<mixed>'
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

  const propertiesWithProducts = ['setup_after_install']

  async function fetchProducts(type: tproducttypes) {
    const { data, error } = await useApiGET<T_Product[]>(
      `/opsidata/depots/products?selectedDepots=[${selectionDepots.value}]&productType=${type}`,
    )
    if (error || !data.value) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    return data.value.map((item) => item.productId)
  }
  function getVisibleValue(
    property: Record<string, any[]>,
    selection: string[],
    item: any,
  ) {
    // values: {"nb-00013.acme.corp": [ false ], "nb-00023.acme.corp": [ true  ] }
    const objectValues = Object.values(property)
    if (property && objectValues.length > 0) {
      if (objectValues.length !== selection.length) {
        if (!item.allValues.includes(MIXED)) item.allValues.push(MIXED)
        return [MIXED]
      }

      const val = objectValues.some((v) => !isEqual(v, objectValues[0]))
        ? [MIXED]
        : objectValues[0]
      if (val[0] == MIXED) {
        if (!item.allValues.includes(MIXED)) item.allValues.push(MIXED)
      }
      return val
    }
    return []
  }
  function getInitialValue(item: any): any {
    if (item.clients && Object.keys(item.clients).length > 0) {
      // const v = Object.values(item.clients as Record<string, any[]>)[0]
      if (item.multiValue) {
        return getVisibleValue(item.clients, selectionClients.value, item)
      }
      return getVisibleValue(item.clients, selectionClients.value, item)[0]
    }
    if (item.depots && Object.keys(item.depots).length > 0) {
      // const v = Object.values(item.depots as Record<string, any[]>)[0]
      if (item.multiValue) {
        return getVisibleValue(item.depots, selectionDepots.value, item)
      }
      return getVisibleValue(item.depots, selectionDepots.value, item)[0]
    }
    // if (item.depots && Object.keys(item.depots).length > 0) {
    //   const v = Object.values(item.depots as Record<string, any[]>)[0]
    //   if (item.multiValue) {
    //     return v
    //   }
    //   return v[0]
    // }
    if (item.value !== undefined) return item.value
    throw new Error(
      'Initial value is undefined and no valid clients or depots found',
    )
  }

  function setUnsavedChanges() {
    // hasUnsavedChanges.value = Object.keys(itemValues.value).some(
    //   (key) => !isEqual(itemValues.value[key], initialValues.value[key]),
    // )
    hasUnsavedChanges.value = Object.keys(itemValues.value).some((key) => {
      if (itemValues.value[key] === undefined) return false
      if (isArray(itemValues.value[key]) && isArray(initialValues.value[key])) {
        if (initialValues.value[key] === itemValues.value[key]) return false
        // check arrays deeply (e.g. they have just another value order)
        return !arrayEqual(initialValues.value[key], itemValues.value[key])
      }
      return itemValues.value[key] !== initialValues.value[key]
    })
  }

  function handleSelection(item: any, value: any) {
    itemValues.value[item.propertyId] = value
    changeBuffer.value[item.propertyId] = value
    setUnsavedChanges()
  }

  async function initFormData() {
    for (const item of Object.values(props.properties)) {
      if (propertiesWithProducts.includes(item.propertyId)) {
        const productIdsL = (await fetchProducts('LocalbootProduct')) || []
        // If needed add Netboots const productIdsN = (await fetchProducts('NetbootProduct')) || []
        // item.allValues = productIdsN.concat(productIdsL).sort()
        item.allValues = productIdsL.sort()
      }
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
      const answer = window.confirm($t('message.warning.unsavedChanges'))
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

<style scoped lang="css">
  :deep(.el-form-item__label) {
    height: auto !important;
  }
</style>
