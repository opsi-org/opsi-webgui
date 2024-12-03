<template>
  <el-tooltip
    effect="light"
    :disabled="visibleRequest !== MIXED_VALUE && !visibleRequest?.includes('*')"
  >
    <template #content> <ThisJSXTooltipContent /> </template>

    <el-select
      v-model="visibleRequest"
      :disabled="config.read_only"
      class="min-w-[82px] w-[82px]"
    >
      <el-option
        v-for="a in get_options"
        :key="a"
        :label="a"
        :value="a"
        :data-testid="`DropdownDDProductRequest-Item-${a}`"
        @click="
          save(modelRowitem, a)
          visibleRequest = a
        "
      />
      <template #label="{ label }">
        <el-text
          :type="
            visibleRequest?.includes('*')
              ? 'danger'
              : VARIANTS[visibleRequest || '']
          "
        >
          {{ label }}
        </el-text>
        <el-text v-if="visibleRequest?.includes('*')">
          ({{ modelRowitem?.actionRequest || '' }})
        </el-text>
      </template>
    </el-select>
  </el-tooltip>
</template>

<script lang="tsx" setup>
  import type { IObjectString2String } from '~/types/tgeneral'
  import type { ITableRowItemProducts } from '~/types/ttable'

  const config = storeConfigapp().config ?? { read_only: true }
  const { changesProducts } = storeToRefs(storeChanges())
  const { selectionClients } = storeToRefs(storeSelections())

  const MIXED_VALUE = 'mixed'
  const DEFAULT_OPTIONS = [
    'none',
    'setup',
    'uninstall',
    'update',
    'once',
    'always',
    'custom',
  ]
  const VARIANTS: {
    [key: string]: '' | 'danger' | 'primary' | 'warning' | 'success' | 'info'
  } = {
    always: 'danger',
    setup: 'danger',
    once: 'danger',
    custom: 'danger',
    uninstall: 'primary',
    foo: 'primary',
    none: '',
    [MIXED_VALUE]: 'warning',
    undefined: 'primary',
  }

  const selectedClients = ref(selectionClients.value)
  // modelValue not required, cause column header is not for specific row.
  const modelRowitem = defineModel<ITableRowItemProducts>()

  const _props = defineProps({
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
    if (
      originalCombinedValue.value === MIXED_VALUE &&
      !options.includes(MIXED_VALUE)
    ) {
      options.push(MIXED_VALUE)
    }
    return options
  })

  const originalValues = computed((): IObjectString2String => {
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
    const desiredValues = selectedClients.value
      .map((pc) => changedValues.value[pc])
      .filter(Boolean)
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
    const visualValueHasChanged =
      originalCombinedValue.value !== changedCombinedValue.value
    // Überprüfe, ob sich einzelne Werte zwischen dem aktuellen und gewünschten Status geändert haben
    const individualValueChanged: boolean = selectedClients.value.some(
      (pc) =>
        changedValues.value[pc] !== undefined &&
        originalValues.value[pc] !== changedValues.value[pc],
    )
    const undefinedChangedToNone: boolean =
      changedCombinedValue.value === 'none' &&
      originalCombinedValue.value === 'none'

    // Wenn sich das Zwischenergebnis oder einzelne Werte geändert haben, markiere es mit einem *
    const result =
      visualValueHasChanged ||
      (individualValueChanged && !undefinedChangedToNone)
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

  function ThisJSXTooltipContentRow() {
    return {
      default: ({ data }: any) => {
        return (
          <span class="w-full !flex !justify-between !space-x-2">
            <el-text>{data.label}</el-text>
            <el-text type={VARIANTS[data.actionRequest] || 'info'}>
              {data.actionRequest}
            </el-text>
          </span>
        )
      },
    }
  }
  function ThisJSXTooltipContent() {
    return (
      <el-tree
        class="!min-w-60"
        data={tooltipdata}
        effect="dark"
        placement="left-start"
        v-slots={ThisJSXTooltipContentRow()}
      />
    )
  }
</script>

<style scoped>
  :deep(.el-icon.el-tree-node__expand-icon) {
    display: none !important;
  }
</style>
