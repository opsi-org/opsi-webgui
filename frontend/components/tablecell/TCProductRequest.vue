<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TooltipTTooltip
    :disabled="visibleRequest !== MIXED_VALUE && !visibleRequest?.includes('*')"
    :class="{ 'cursor-not-allowed': config.read_only }"
  >
    <template #tooltip>
      <!--
      visibleRequest {{ visibleRequest }} <br /> (may include change)
      originalCombinedValue {{ originalCombinedValue }} <br /> (without changes)
      -->
      <p v-if="visibleRequest.includes('*')">{{ originalCombinedValue }}</p>
      <span v-for="data in tooltipdata" :key="data.label" class="w-full !flex !justify-between">
        <p>{{ data.label }}</p>
        <p-tag :severity="VARIANTS[data.actionRequest] || 'info'" pt:root:class="m-0 p-0 min-w-28">
          {{ data.actionRequest }}
        </p-tag>
      </span>
    </template>
    <template #default>
      <p-select
        v-model="visibleRequest"
        :disabled="config.read_only"
        :class="{
          'min-w-[130px] w-[130px]': true,
          'max-w-[170px]': visibleRequest.includes('*'), // changed row
        }"
        :overlay-class="'tc-product-request-select-' + (modelRowitem?.productId || 'none')"
        :placeholder="title"
        :options="get_options"
        size="small"
        fluid
        @change="
  (e: any) => {
            emit(
              'save',
              modelRowitem,
              e.value,
            )
            //save(modelRowitem, e.value)
          }
        "
      >
        <template #value="slotProps">
          <p
            :class="
              '!inline ' +
              (visibleRequest?.includes('*')
                ? 'text-danger'
                : 'text-' + VARIANTS[visibleRequest || ''])
            "
          >
            {{ slotProps.value }}
          </p>
          <p v-if="visibleRequest?.includes('*')" class="inline">
            {{
              $t('textInBrackets', {
                //value: modelRowitem?.actionRequest || '',
                value: originalCombinedValue || modelRowitem?.actionRequest || '',
              })
            }}
          </p>
        </template>
      </p-select>
    </template>
  </TooltipTTooltip>
</template>

<script lang="tsx" setup>
  import type { PSeverity } from '~/types/LibComponentTypes'
  import type { IObjectString2String } from '~/types/tgeneral'
  import type { ITableRowItemProducts } from '~/types/ttable'

  import { useNotification } from '~/composables/mixins/useComponent'

  const $t = useI18n().t
  const config = storeConfigapp().config ?? { read_only: true }

  const { notifyWarning } = useNotification()
  const { changesProducts } = storeToRefs(storeChanges())
  const { selectionClients } = storeToRefs(storeSelections())
  const { productActionRequest } = storeToRefs(storeInternalData())

  const MIXED_VALUE = $t('mixed')
  const DEFAULT_OPTIONS = ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom']
  const VARIANTS: {
    [key: string]: PSeverity
  } = {
    always: 'secondary',
    setup: 'secondary',
    once: 'secondary',
    custom: 'secondary',
    uninstall: 'primary',
    none: 'contrast',
    [MIXED_VALUE]: 'warn',
    undefined: 'primary',
  }

  const selectedClients = ref<string[]>(selectionClients.value)
  // modelValue not required, cause column header is not for specific row.
  const modelRowitem = defineModel<ITableRowItemProducts>({ required: false })
  const emit = defineEmits(['save'])
  const _props = defineProps({
    title: { type: String, required: false, default: '' },
    rowIsSelected: { type: Boolean, default: undefined },
  })

  const get_options = computed((): Array<string> => {
    const options = [...(modelRowitem.value?.actions || DEFAULT_OPTIONS)]
    if (originalCombinedValue.value === MIXED_VALUE && !options.includes(MIXED_VALUE)) {
      options.push(MIXED_VALUE)
    }
    return options
  })

  const originalValues = computed<IObjectString2String>(() => {
    // clientId -> actionRequest
    // format origin backend values to { client: actionRequest}
    const _originalValues: IObjectString2String = {}
    selectedClients.value.forEach((item: any) => {
      const iitem = modelRowitem.value?.selectedClients?.indexOf(item)
      if (iitem != undefined && iitem >= 0) {
        _originalValues[item] =
          modelRowitem.value?.actionRequestDetails?.[iitem] ||
          modelRowitem.value?.actionRequest ||
          'none'
      } else {
        _originalValues[item] = 'none'
      }
    })
    return _originalValues
  })
  const changedValues = computed((): IObjectString2String => {
    // clientId -> actionRequest (from changes)
    // format changes to { client: actionRequest}
    const warnProducts: any[] = []
    const _changedValues: IObjectString2String = {}
    for (const clientId of selectedClients.value) {
      const pId: string = modelRowitem.value?.productId as string
      //_changedValues[clientId]
      if (changesProducts.value?.[clientId]?.[pId]) {
        if (
          modelRowitem.value?.actions?.includes(changesProducts.value[clientId][pId].actionRequest)
        ) {
          _changedValues[clientId] = changesProducts.value[clientId][pId].actionRequest
        } else if (modelRowitem.value?.actions) {
          console.warn(
            'TCProductRequest: actionRequest ',
            changesProducts.value[clientId][pId].actionRequest,
            ' not in allowed for product',
            modelRowitem.value?.productId,
            '(actions:',
            modelRowitem.value?.actions,
            ')'
          )
          warnProducts.push({
            clientId: clientId,
            productId: modelRowitem.value?.productId,
            actionRequest: changesProducts.value[clientId][pId].actionRequest,
          })
          notifyWarning({
            title: $t('warning') + ' ' + changesProducts.value[clientId][pId].actionRequest,
            message: 'Invalid actionRequest for product ' + modelRowitem.value?.productId,
          })

          storeChanges().delCProductByProductId([clientId], pId)
        }
      }
    }
    return _changedValues
  })

  const originalCombinedValue = computed((): string => {
    // actionRequest or mixed only consider originalvalues
    // Filtere nur die ausgewählten PCs und berücksichtige nur die PCs, die sowohl im aktuellen als auch im gewünschten Status vorhanden sind
    const currentValues = selectedClients.value
      .map((pc) => originalValues.value[pc])
      .filter(Boolean)
    // Bestimme das Zwischenergebnis (aktueller Status)
    let _originalCombinedValue = xorLike(currentValues)
    if (_originalCombinedValue === undefined) {
      _originalCombinedValue = 'none'
    }
    return _originalCombinedValue
  })
  const changedCombinedValue = computed((): string => {
    // actionRequest or mixed only consider changes
    const desiredValues = selectedClients.value.map((pc) => changedValues.value[pc]).filter(Boolean)
    // Bestimme das neue Zwischenergebnis (gewünschter Status)
    const changedCombinedValue = xorLike(desiredValues)
    if (changedCombinedValue === undefined) {
      return originalCombinedValue.value
    }
    return changedCombinedValue
  })

  const tooltipdata = computed(() => {
    // all selected clients and their original actionrequest
    const clientValuesArr = []
    for (const c in selectedClients.value.toSorted()) {
      const clientId = selectedClients.value[c]
      const val = {
        label: clientId,
        actionRequest: originalValues.value[clientId],
      }
      clientValuesArr.push(val)
    }
    return clientValuesArr
  })

  const visibleRequest = computed(() => {
    // Funktion zur Ermittlung des sichtbaren actionRequest-Werts
    // Abhängig von den ausgewählten Clients und den lokalen nicht gespeicherten Änderungen
    // Mögliche Werte <actionRequest (setup, uninstall,...)>, "mixed" oder "none"
    // Kann einen *-Stern enthalten, wenn sich der Wert geändert hat im vergleich zum backend Wert

    // Vergleich: Hat sich das aggregierte Zwischenergebnis verändert?
    const visualValueHasChanged = originalCombinedValue.value !== changedCombinedValue.value
    // Überprüfe, ob sich einzelne Werte zwischen dem aktuellen und gewünschten Status geändert haben
    const individualValueChanged: boolean = selectedClients.value.some(
      (pc) =>
        changedValues.value[pc] !== undefined &&
        originalValues.value[pc] !== changedValues.value[pc]
    )
    const undefinedChangedToNone: boolean =
      changedCombinedValue.value === 'none' && originalCombinedValue.value === 'none'

    // Wenn sich das Zwischenergebnis oder einzelne Werte geändert haben, markiere es mit einem *
    const result =
      visualValueHasChanged || (individualValueChanged && !undefinedChangedToNone)
        ? `${changedCombinedValue.value}*`
        : `${changedCombinedValue.value}`
    return result
  })
  setActionRequest()
  watch(() => visibleRequest, setActionRequest, { deep: true })

  function setActionRequest() {
    if (modelRowitem.value && visibleRequest.value && modelRowitem.value.productId) {
      if (!productActionRequest.value) {
        productActionRequest.value = {}
      }

      productActionRequest.value[modelRowitem.value?.productId] = visibleRequest.value
    }
  }
  function xorLike<T>(values: T[]): T | string | undefined {
    if (values.length === 0) {
      return undefined
    }
    // Überprüfen, ob alle Werte gleich sind
    const firstValue = values[0]
    const allEqual = values.every((value) => value === firstValue)

    // Wenn alle gleich sind, gib den gemeinsamen Wert zurück, sonst "mixed"
    return allEqual ? firstValue : MIXED_VALUE
  }
</script>

<style scoped>
  :deep(.el-icon.el-tree-node__expand-icon) {
    display: none !important;
  }
</style>
