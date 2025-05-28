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
        class="min-w-[82px] w-full"
        :placeholder="title"
        :options="get_options"
        size="small"
        fluid
        @change="
          (e: any) => {
            save(modelRowitem, e.value)
            visibleRequest = e.value
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
              $t('label.in_bracets', {
                value: modelRowitem?.actionRequest || '',
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

  const config = storeConfigapp().config ?? { read_only: true }
  const { changesProducts } = storeToRefs(storeChanges())
  const { selectionClients } = storeToRefs(storeSelections())

  const MIXED_VALUE = 'mixed'
  const DEFAULT_OPTIONS = ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom']
  const VARIANTS: {
    [key: string]: PSeverity
    // [key: string]: '' | 'danger' | 'primary' | 'warning' | 'success' | 'info'
  } = {
    always: 'danger',
    setup: 'danger',
    once: 'danger',
    custom: 'danger',
    uninstall: 'primary',
    foo: 'primary',
    none: 'secondary',
    [MIXED_VALUE]: 'warn',
    undefined: 'primary',
  }

  const selectedClients = ref<string[]>(selectionClients.value)
  // modelValue not required, cause column header is not for specific row.
  const modelRowitem = defineModel<ITableRowItemProducts>({ required: false })

  const _props = defineProps({
    title: { type: String, required: false, default: '' },
    rowIsSelected: { type: Boolean, default: undefined },
    save: {
      type: Function,
      default: () => {
        return () => {
          return {}
        }
      },
    },
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
    const _changedValues: IObjectString2String = {}
    changesProducts.value?.forEach((item: any) => {
      if (item.productId === modelRowitem.value?.productId) {
        _changedValues[item.clientId] = item.actionRequest
      }
    })
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

  // const tooltipdataTree = computed(() => {
  //   // all selected clients and their original actionrequest
  //   const clientValuesArr = []
  //   for (const c in selectedClients.value.toSorted()) {
  //     const clientId = selectedClients.value[c]
  //     const val = {
  //       key: clientId,
  //       label: clientId,
  //       actionRequest: originalValues.value[clientId],
  //     }
  //     clientValuesArr.push(val)
  //   }
  //   return clientValuesArr
  // })

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

  // function ThisJSXTooltipContentRow() {
  //   return {
  //     default: ({ data }: any) => {
  //       return (
  //         <span class="w-full !flex !justify-between !space-x-2">
  //           <el-text>{data.label}</el-text>
  //           <el-text type={VARIANTS[data.actionRequest] || 'info'}>
  //             {data.actionRequest}
  //           </el-text>
  //         </span>
  //       )
  //     },
  //   }
  // }
  // function ThisJSXTooltipContent() {
  //   return (
  //     <el-tree
  //       class="!min-w-60"
  //       data={tooltipdata}
  //       effect="dark"
  //       placement="left-start"
  //       v-slots={ThisJSXTooltipContentRow()}
  //     />
  //   )
  // }

  // onBeforeRouteLeave((to, from, next) => {
  //   if (hasUnsavedChanges.value) {
  //     const answer = window.confirm($t('message.warning.unsavedChanges'))
  //     if (answer) {
  //       next()
  //     } else {
  //       next(false)
  //     }
  //   } else {
  //     next()
  //   }
  // })
</script>

<style scoped>
  :deep(.el-icon.el-tree-node__expand-icon) {
    display: none !important;
  }
</style>
